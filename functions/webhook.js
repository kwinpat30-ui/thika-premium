import crypto from 'crypto';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 1. Get the raw text body for hashing
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hashpay-signature');
    
    if (!signatureHeader) {
      console.error("Missing HashPay signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401 });
    }

    // 2. HashPay sends "sha256=<hash>", so we remove the first 7 characters
    const receivedSignature = signatureHeader.substring(7);
    const secret = process.env.HASHPAY_WEBHOOK_SECRET;

    // 3. Generate our own hash using the raw body and secret key
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // 4. Compare the hashes to verify authenticity
    if (receivedSignature !== expectedSignature) {
      console.error("Invalid webhook signature. Possible spoofing attempt.");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    // 5. If verified, parse the JSON payload
    const payload = JSON.parse(rawBody);
    console.log("Verified HashPay Webhook Received:", JSON.stringify(payload, null, 2));

    // 6. Connect to your database here to unlock the user's VIP access if payment is successful
    if (payload.event === 'payment.success') {
      console.log(`Payment successful for reference: ${payload.TransactionReference}`);
      console.log(`Unlock VIP access for phone number: ${payload.Msisdn}`);
      // TODO: Add your database update logic here (e.g., await grantVipAccess(payload.Msisdn); )
    }

    return new Response(JSON.stringify({ status: "success", message: "Webhook processed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};