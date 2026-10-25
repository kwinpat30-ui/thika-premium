import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

// This is your secure backend route that talks to HashPay
app.post('/api/pay', async (req, res) => {
    const { amount, phone } = req.body;

    try {
        const response = await fetch('https://api.hashpay.co.ke/v1/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer h26325FoKCVpl' // Your secret key stays safe on the server!
            },
            body: JSON.stringify({
                customer_phone: phone,
                amount: amount,
                currency: "KES",
                reference: "VAULT_UNLOCK",
                callback_url: "https://thika-premium.com/webhook" // We will build this next
            })
        });

        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Payment failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Secure payment server running on http://localhost:${PORT}`);
});
