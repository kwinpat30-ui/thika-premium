export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const payload = await req.json();
    
    // Log the data to Netlify so we can see exactly what HashPay sends
    console.log("HashPay Webhook Received:", JSON.stringify(payload, null, 2));

    // Return a 200 OK status so HashPay knows the message was received
    return new Response(JSON.stringify({ status: "success", message: "Webhook received" }), {
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