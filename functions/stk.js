export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    // Functions 2.0 uses Web API req.json() instead of JSON.parse(event.body)
    const body = await req.json();
    const { amount, msisdn, reference } = body;
    
    const response = await fetch("https://api.hashback.co.ke/initiatestk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: process.env.HASHPAY_API_KEY,
        account_id: process.env.HASHPAY_ACCOUNT_ID,
        amount: amount,
        msisdn: msisdn,
        reference: reference || "Thika Premium"
      })
    });
    
    const data = await response.json();
    
    // Functions 2.0 requires standard Response objects
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};