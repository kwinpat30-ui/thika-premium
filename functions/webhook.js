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
    if (!signatureHeader) return new Response("Missing signature", { status: 401 });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.HASHPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signatureHeader.substring(7) !== expectedSignature) {
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    if (payload.event === 'payment.success') {
      console.log(`Payment successful from: ${payload.Msisdn}`);
      
      if (!db) {
         console.error("Cannot unlock database: Firebase failed to initialize.");
         return new Response("Database initialization error", { status: 500 });
      }

      // Extract the dynamic document ID sent from your frontend via HashPay
      // Check HashPay's documentation if they use a different name like 'externalId' or 'metadata'
      const targetVaultId = payload.reference || payload.metadata?.vaultId;

      if (!targetVaultId) {
        console.error("No reference ID found in payload. Cannot target a specific database document.");
        // Fallback to the hardcoded ID temporarily just in case the frontend isn't updated yet
        await db.collection('vaults').doc('QCVwrsVuEtlAQ3PMziVs').update({
          status: 'unlocked',
          paidBy: payload.Msisdn,
          unlockTime: FieldValue.serverTimestamp()
        });
      } else {
        // Unlock the specific dynamic document
        await db.collection('vaults').doc(targetVaultId).update({
          status: 'unlocked',
          paidBy: payload.Msisdn,
          unlockTime: FieldValue.serverTimestamp()
        });
        console.log(`Firestore document ${targetVaultId} updated to unlocked!`);
      }
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("Webhook failed", { status: 500 });
  }
};