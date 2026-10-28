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
    
    // For local testing safety, you can bypass signature check if needed, but keep it for production
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
    
    // Check for success event (adjust based on HashPay's exact success status event name)
    if (payload.event === 'payment.success' || payload.Status === 'Success' || payload.status === 'success') {
      const phone = payload.Msisdn || payload.phone || payload.msisdn;
      const amount = payload.Amount || payload.amount || 50;
      const mpesaCode = payload.MpesaReceiptNumber || payload.mpesaCode || payload.receipt;
      
      // Look for the vault ID across multiple possible payload fields sent by HashPay
      const targetVaultId = payload.reference || payload.externalId || payload.accountReference || payload.metadata?.vaultId;

      if (!db) {
         console.error("Cannot unlock database: Firebase failed to initialize.");
         return new Response("Database initialization error", { status: 500 });
      }

      // 1. Save the transaction to Firestore so you have a billing ledger
      await db.collection('transactions').add({
        phone: phone || 'Unknown',
        amount: Number(amount),
        mpesaCode: mpesaCode || 'TEST_RECEIPT',
        vaultId: targetVaultId || 'Unknown',
        createdAt: FieldValue.serverTimestamp()
      });

      if (!targetVaultId) {
        console.error("No reference ID found in payload.");
      } else {
        // 2. Unlock the specific dynamic Firestore vault document automatically!
        await db.collection('vaults').doc(targetVaultId).update({
          status: 'unlocked',
          paidBy: phone,
          unlockTime: FieldValue.serverTimestamp()
        });
        console.log(`Successfully unlocked vault: ${targetVaultId}`);
      }
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("Webhook failed", { status: 500 });
  }
};