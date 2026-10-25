import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginStep, setLoginStep] = useState('phone');
  const [vaults, setVaults] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const checkSdk = setInterval(() => {
      if (window.HashPay) {
        setSdkReady(true);
        clearInterval(checkSdk);
      }
    }, 500);

    const fetchVaults = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vaults"));
        const vaultData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVaults(vaultData);
      } catch (error) {
        console.error("Error fetching vaults: ", error);
      }
    };
    fetchVaults();

    return () => clearInterval(checkSdk);
  }, []);

  const triggerMpesa = async (amount) => {
    let formattedPhone = customerPhone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }
    if (!formattedPhone || formattedPhone.length < 10) {
      alert("Please enter a valid M-Pesa phone number first (e.g., 0712345678).");
      return;
    }

    setShowMpesaModal(true);

    try {
      const response = await fetch("https://api.hashback.co.ke/initiatestk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: import.meta.env.VITE_HASHPAY_API_KEY,
          account_id: import.meta.env.VITE_HASHPAY_ACCOUNT_ID,
          amount: amount,
          msisdn: formattedPhone,
          reference: "Thika Premium"
        })
      });

      const data = await response.json();
      console.log("STK Push Response:", data);

      if (data.success || response.ok) {
        alert("M-Pesa STK push sent! Check your phone for the PIN prompt.");
      } else {
        alert("Failed to initiate STK push: " + (data.message || "Please try again."));
      }
    } catch (error) {
      console.error("STK Push Error:", error);
      alert("An error occurred while connecting to HashPay.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-400">THIKA PREMIUM</h1>
        <p className="text-slate-400 mb-6 text-center">Unlock exclusive content instantly via M-Pesa.</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-slate-300">M-Pesa Phone Number</label>
          <input 
            type="text" 
            placeholder="0712345678" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button 
          onClick={() => triggerMpesa(100)}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-lg transition"
        >
          Pay KES 100 with M-Pesa
        </button>
      </div>
    </div>
  );
}