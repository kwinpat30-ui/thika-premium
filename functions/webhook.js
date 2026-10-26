import crypto from 'crypto';
import admin from 'firebase-admin';

// Initialize Firebase Admin safely
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

const db = admin.firestore();

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
      
      await db.collection('vaults').doc('QCVwrsVuEtlAQ3PMziVs').update({
        status: 'unlocked',
        paidBy: payload.Msisdn,
        unlockTime: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log("Firestore updated to unlocked!");
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response("Webhook failed", { status: 500 });
  }
};