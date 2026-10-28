import crypto from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

const cleanPrivateKey = rawPrivateKey 
  ? rawPrivateKey.replace(/\\n/g, '\n').replace(/"/g, '').trim()
  : undefined;

if (!getApps().length) {
  if (!projectId || !clientEmail || !cleanPrivateKey) {
    console.error("CRITICAL: Missing Firebase Environment Variables in Netlify!");
  } else {
    initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: cleanPrivateKey,
      }),
    });
  }
}

const db = getApps().length > 0 ? getFirestore() : null;

export default async (req, context) => {
  if (req.method !== 'POST') return new Response("Method Not Allowed", { status: 405 });

  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hashpay-signature');
    
    if (signatureHeader && process.env.HASHPAY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.HASHPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      if (signatureHeader.substring(7) !== expectedSignature) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log("Webhook Payload Received:", JSON.stringify(payload));
    
    // Check for success event
    if (payload.event === 'payment.success' || payload.Status === 'Success' || payload.status === 'success' || payload.ResultCode === 0) {
      const phone = payload.Msisdn || payload.phone || payload.msisdn || payload.PhoneNumber;
      const amount = payload.Amount || payload.amount || 50;
      const mpesaCode = payload.MpesaReceiptNumber || payload.mpesaCode || payload.receipt || payload.ReceiptNumber;
      
      // Look for the vault ID across multiple possible payload fields sent by HashPay
      let targetVaultId = payload.reference || 
                            payload.externalId || 
                            payload.accountReference || 
                            payload.metadata?.vaultId || 
                            payload.Data?.reference;

      if (!db) {
         console.error("Cannot unlock database: Firebase failed to initialize.");
         return new Response("Database initialization error", { status: 500 });
      }

      // If reference is still missing, fetch the most recent vault as a fallback so it always unlocks
      if (!targetVaultId || targetVaultId === 'Unknown' || targetVaultId === 'Thika Premium') {
        console.log("Reference ID missing in payload. Fetching latest active vault as fallback...");
        const vaultsSnap = await db.collection('vaults').orderBy('createdAt', 'desc').limit(1).get();
        if (!vaultsSnap.empty) {
          targetVaultId = vaultsSnap.docs[0].id;
          console.log(`Fallback target vault ID selected: ${targetVaultId}`);
        }
      }

      // 1. Save the transaction to Firestore billing ledger
      await db.collection('transactions').add({
        phone: phone || 'Unknown',
        amount: Number(amount),
        mpesaCode: mpesaCode || 'TEST_RECEIPT',
        vaultId: targetVaultId || 'Unknown',
        createdAt: FieldValue.serverTimestamp()
      });

      if (!targetVaultId) {
        console.error("No valid vault ID could be determined.");
      } else {
        // 2. Automatically unlock the specific Firestore vault document!
        await db.collection('vaults').doc(targetVaultId).update({
          status: 'unlocked',
          paidBy: phone || 'Customer',
          unlockTime: FieldValue.serverTimestamp()
        });
        console.log(`Successfully auto-unlocked vault: ${targetVaultId}`);
      }
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("Webhook failed", { status: 500 });
  }
};