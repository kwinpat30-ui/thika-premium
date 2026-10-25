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
    // Check if HashPay SDK is loaded, with a small polling interval if needed
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

  const triggerMpesa = (amount) => {
    let formattedPhone = customerPhone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }

    if (!formattedPhone || formattedPhone.length < 10) {
      alert("Please enter a valid M-Pesa phone number first (e.g., 0712345678).");
      return;
    }

    setShowMpesaModal(true);

    if (window.HashPay) {
      window.HashPay.pay({
        account: 'HP225567',
        amount: amount,
        reference: 'THIKA_VAULT',
        phone: formattedPhone,
        lockPhone: true,
        onSuccess: function (txn) {
          console.log("Payment successful!", txn);
          setShowMpesaModal(false);
          alert("Payment confirmed successfully! Vault unlocked.");
        },
        onCancel: function () {
          setShowMpesaModal(false);
          console.log("Payment cancelled by user.");
        }
      });
    } else {
      setShowMpesaModal(false);
      alert("Payment gateway is still connecting to HashPay. Please wait 3 seconds and try again.");
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-darkCharcoal text-white min-h-screen font-sans flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-neonCyan tracking-wider mb-8">THIKA PREMIUM</h1>
        <div className="bg-panelGray w-full max-w-md p-6 rounded-lg border border-gray-800">
          {loginStep === 'phone' ? (
            <>
              <h2 className="text-xl font-bold mb-2">Secure Login</h2>
              <p className="text-sm text-gray-400 mb-6">Enter your phone number to receive an access code.</p>
              <input type="tel" placeholder="07XX XXX XXX" className="w-full bg-darkCharcoal border border-gray-700 rounded p-3 mb-4 text-white focus:border-neonCyan outline-none" />
              <button onClick={() => setLoginStep('otp')} className="w-full bg-neonCyan text-black font-bold py-3 rounded-md hover:bg-cyan-400 transition">Send Code</button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Enter OTP</h2>
              <p className="text-sm text-gray-400 mb-6">We sent a 4-digit code to your number.</p>
              <div className="flex justify-between gap-2 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <input key={i} type="text" maxLength="1" className="w-14 h-14 text-center text-xl bg-darkCharcoal border border-gray-700 rounded focus:border-neonCyan outline-none" />
                ))}
              </div>
              <button onClick={handleLogin} className="w-full bg-neonCyan text-black font-bold py-3 rounded-md hover:bg-cyan-400 transition">Verify & Enter</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-darkCharcoal text-white min-h-screen font-sans pb-20">
      <header className="p-4 border-b border-panelGray sticky top-0 bg-darkCharcoal z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-neonCyan tracking-wider">THIKA PREMIUM</h1>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded font-mono ${sdkReady ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
            {sdkReady ? 'HashPay Connected' : 'Connecting Gateway...'}
          </span>
          <div className="w-8 h-8 bg-panelGray rounded-full flex items-center justify-center text-sm border border-neonCyan">VIP</div>
        </div>
      </header>

      <main className="p-4">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Trending Vaults</h2>
            <div className="grid grid-cols-2 gap-4">
              {vaults.length === 0 ? (
                <p className="text-gray-400 text-sm">Loading vaults...</p>
              ) : (
                vaults.map((vault) => (
                  <div key={vault.id} className="bg-panelGray rounded-lg h-40 flex flex-col justify-end p-3 relative overflow-hidden border border-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-0"></div>
                    <span className="relative z-10 font-bold text-sm">{vault.title}</span>
                    <span className="relative z-10 text-xs text-neonCyan">
                      {vault.status === 'locked' ? `Locked (KES ${vault.price})` : 'Unlocked'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="space-y-6">
            <input type="text" placeholder="Search vaults..." className="w-full bg-panelGray border border-gray-700 rounded-lg p-3 text-white focus:border-neonCyan outline-none" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Nightlife', 'Vlogs', 'Uncensored', 'Exclusive'].map(tag => (
                <span key={tag} className="bg-panelGray px-4 py-1 rounded-full text-sm whitespace-nowrap border border-gray-800">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-panelGray rounded-lg h-40 flex flex-col justify-end p-3 relative border border-gray-800">
                  <span className="font-bold text-sm">Vault {item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="space-y-6">
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-800 relative bg-black">
              <iframe 
                src="https://player.mediadelivery.net/play/789594/88d804ba-1b4f-4443-b238-c2b87fde1e81" 
                loading="lazy" 
                className="w-full h-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                allowFullScreen={true}
              ></iframe>
              <span className="absolute top-2 right-2 text-[10px] text-white/50 bg-black/50 px-2 py-1 rounded z-10 pointer-events-none">
                ID: {customerPhone ? `${customerPhone.slice(0, 4)}***${customerPhone.slice(-3)}` : '07XX***XXX'}
              </span>
            </div>
            
            <div className="bg-panelGray p-5 rounded-lg border border-neonCyan/30">
              <h2 className="text-xl font-bold mb-2">Unlock This Vault</h2>
              <p className="text-sm text-gray-400 mb-4">Enter your M-Pesa number to receive the STK push prompt instantly.</p>
              
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1">M-Pesa Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. 0712345678" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-darkCharcoal border border-gray-700 rounded p-3 text-white focus:border-neonCyan outline-none text-sm font-mono"
                />
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => triggerMpesa(50)} 
                  disabled={!sdkReady}
                  className={`w-full font-bold py-3 rounded-md transition ${sdkReady ? 'bg-neonCyan text-black hover:bg-cyan-400' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                  {sdkReady ? 'Pay KES 50 (24h Pass)' : 'Connecting to HashPay...'}
                </button>
                <button 
                  onClick={() => triggerMpesa(500)} 
                  disabled={!sdkReady}
                  className={`w-full font-bold py-3 rounded-md transition ${sdkReady ? 'bg-transparent border border-neonCyan text-neonCyan hover:bg-neonCyan/10' : 'border border-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                  {sdkReady ? 'Pay KES 500 (Monthly)' : 'Connecting to HashPay...'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">My Account</h2>
            <div className="bg-panelGray p-4 rounded-lg">
              <p className="text-sm text-gray-400">Active Number</p>
              <p className="text-lg font-mono">{customerPhone || 'Not Set'}</p>
            </div>
            <div className="bg-panelGray p-4 rounded-lg border border-red-500/30">
              <p className="text-sm text-red-400 font-bold mb-1">Active Session</p>
              <p className="text-xs text-gray-400">Device: Windows PC (Chrome)</p>
              <button className="mt-3 text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded">Revoke Access</button>
            </div>
            <button className="w-full bg-panelGray border border-gray-700 py-3 rounded-lg text-sm hover:bg-gray-800 transition">
              Contact Support (WhatsApp)
            </button>
            <button onClick={() => { setIsAuthenticated(false); setLoginStep('phone'); }} className="w-full bg-red-500/10 border border-red-500/30 text-red-500 py-3 rounded-lg text-sm hover:bg-red-500/20 transition">
              Secure Logout
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-panelGray border-t border-gray-800 flex justify-around p-4 pb-6 z-20">
        <button onClick={() => setActiveTab('home')} className={`font-bold ${activeTab === 'home' ? 'text-neonCyan' : 'text-gray-500'}`}>Home</button>
        <button onClick={() => setActiveTab('explore')} className={`font-bold ${activeTab === 'explore' ? 'text-neonCyan' : 'text-gray-500'}`}>Explore</button>
        <button onClick={() => setActiveTab('vip')} className={`font-bold ${activeTab === 'vip' ? 'text-neonCyan' : 'text-gray-500'}`}>VIP</button>
        <button onClick={() => setActiveTab('account')} className={`font-bold ${activeTab === 'account' ? 'text-neonCyan' : 'text-gray-500'}`}>Account</button>
      </nav>

      {showMpesaModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-neonCyan border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-bold mb-2">Waiting for M-Pesa</h3>
          <p className="text-gray-400">Please check your phone ({customerPhone}) and enter your PIN to confirm the payment. Do not close this page.</p>
        </div>
      )}
    </div>
  );
}
