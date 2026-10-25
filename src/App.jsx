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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-extrabold tracking-wider text-cyan-400">THIKA SUPERHIGHWAY PREMIUM</h1>
        <nav className="flex gap-4">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'home' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setActiveTab('vaults')} 
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'vaults' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            Vaults
          </button>
          <button 
            onClick={() => setActiveTab('premium')} 
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'premium' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            Go Premium
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {activeTab === 'home' && (
          <div className="space-y-8 py-12 text-center">
            <h2 className="text-4xl font-black text-white">Exclusive Content & Media Vaults</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Unlock unlimited access to high-definition streams and premium media channels instantly via secure M-Pesa payments.
            </p>
            <button 
              onClick={() => setActiveTab('premium')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl text-lg shadow-lg transition"
            >
              Unlock Access Now (KES 100)
            </button>
          </div>
        )}

        {activeTab === 'vaults' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-slate-800 pb-4">Available Vaults</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vaults.length > 0 ? (
                vaults.map(vault => (
                  <div key={vault.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">{vault.title || "Premium Vault"}</h3>
                    <p className="text-slate-400 text-sm mb-4">{vault.description || "Exclusive streaming content."}</p>
                    <button 
                      onClick={() => setActiveTab('premium')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold py-2 rounded-lg transition"
                    >
                      Access Vault
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 col-span-3 text-center py-8">Loading content vaults from database...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'premium' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl mt-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Upgrade to Premium</h2>
            <p className="text-slate-400 mb-6 text-center text-sm">Enter your M-Pesa phone number to receive the payment prompt.</p>
            
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
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg transition shadow-md"
            >
              Pay KES 100 with M-Pesa
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 text-center py-6 text-slate-500 text-sm">
        &copy; 2026 Thika Superhighway Premium. All rights reserved.
      </footer>
    </div>
  );
}