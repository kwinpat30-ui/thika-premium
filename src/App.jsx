import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { 
  Send, Home, Compass, Crown, User, Smartphone, Play, Lock, 
  CheckCircle2, Flame, Shield, LogOut, CreditCard, Zap,
  Search, Filter, Phone, LockKeyhole, History,
  Loader2, MessageSquare
} from 'lucide-react';

// --- Reusable Toast Component ---
const Toast = ({ msg }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 backdrop-blur-sm text-black px-4 py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] text-sm font-bold flex items-center gap-2 w-[90%] max-w-sm border border-green-400 animate-in fade-in slide-in-from-top-5">
    <CheckCircle2 size={18} /> {msg}
  </div>
);

// --- Layout 1: Home / Explore Feed ---
const HomeLayout = ({ setActiveTab, vaults }) => {
  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      {/* Hero Banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden mx-4 mt-4 shadow-[0_0_15px_rgba(0,240,255,0.15)] group cursor-pointer" onClick={() => setActiveTab('vip')}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-black/40 to-transparent z-10"></div>
        <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop" alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute bottom-4 left-4 z-20">
          <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mb-2 inline-block">New Drop</span>
          <h2 className="text-xl font-black text-white leading-tight shadow-black drop-shadow-md">The Thika Expressway VIP Experience</h2>
        </div>
      </div>

      {/* Trending Categories / Firebase Vaults */}
      <div className="px-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Flame size={16} className="text-[#FFD700]"/> Live Content Vaults
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {vaults.length > 0 ? (
            vaults.map((vault) => (
              <div key={vault.id} onClick={() => setActiveTab('vip')} className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors">
                <img src={vault.img || "https://images.unsplash.com/photo-1570872626485-d8ffea69f463?q=80&w=600&auto=format&fit=crop"} alt={vault.title} className="w-full h-full object-cover blur-sm opacity-60 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-gray-500/50">
                    <Lock size={18} className="text-gray-300" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[9px] text-[#00F0FF] uppercase tracking-wider font-bold">VIP Vault</span>
                  <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{vault.title || "Exclusive Stream"}</h4>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500 text-xs">Loading secure vaults from database...</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Layout 4: Explore & Search ---
const ExploreLayout = ({ setActiveTab }) => {
  const categories = ["All", "Nightlife", "Vlogs", "Uncensored", "Music", "Events"];
  const [activeCat, setActiveCat] = useState("All");

  return (
    <div className="px-4 space-y-6 pb-24 animate-in fade-in">
      <div className="relative mt-4 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input 
          type="text" 
          placeholder="Search exclusive drops..." 
          className="w-full bg-[#12151c] text-white border border-gray-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#00F0FF]/50 transition-colors placeholder-gray-600 text-sm"
        />
        <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Filter size={18} className="text-[#00F0FF]" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all ${activeCat === cat ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-[#12151c] text-gray-400 border-gray-800 hover:border-gray-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} onClick={() => setActiveTab('vip')} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-900 border border-gray-800">
            <img src={`https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=400&auto=format&fit=crop&sig=${i}`} alt="Thumbnail" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500 blur-[2px]" />
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-gray-500/50">
              <Lock size={14} className="text-gray-300" />
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-2 pt-6">
              <h4 className="text-white font-bold text-xs leading-tight line-clamp-2">Locked Vault #{i}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Layout 5: Login / Authentication ---
const AuthLayout = ({ setActiveTab }) => {
  const [step, setStep] = useState('phone');

  return (
    <div className="px-6 flex flex-col justify-center min-h-[75vh] animate-in slide-in-from-bottom-10 fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#00F0FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00F0FF]/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <LockKeyhole size={32} className="text-[#00F0FF]" />
        </div>
        <h1 className="text-2xl font-black text-white">Access the Vault</h1>
        <p className="text-gray-400 text-sm mt-2">
          {step === 'phone' ? "Enter your phone number to login or subscribe via HashPay." : "Enter the 4-digit code sent to your phone."}
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone size={18} className="text-gray-500" />
            </div>
            <input 
              type="tel" 
              placeholder="0712 345 678" 
              className="w-full bg-[#12151c] text-white font-mono text-lg border border-gray-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00F0FF] transition-colors"
            />
          </div>
          <button onClick={() => setStep('otp')} className="w-full bg-[#00F0FF] text-black font-black py-4 rounded-xl hover:bg-[#00c4d1] transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            SEND CODE
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                className="w-14 h-14 bg-[#12151c] text-white text-center text-2xl font-black border border-gray-800 rounded-xl focus:outline-none focus:border-[#00F0FF] transition-colors"
                placeholder="-"
              />
            ))}
          </div>
          <button onClick={() => setActiveTab('home')} className="w-full bg-[#00F0FF] text-black font-black py-4 rounded-xl hover:bg-[#00c4d1] transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            VERIFY & ENTER
          </button>
          <button onClick={() => setStep('phone')} className="w-full text-center text-xs text-gray-500 hover:text-white transition-colors">
            Change Phone Number
          </button>
        </div>
      )}
    </div>
  );
};

// --- Layout 2: VIP Page with Bunny.net Video & M-Pesa ---
const VIPLayout = ({ customerPhone, setCustomerPhone, handlePayment }) => {
  const [position, setPosition] = useState({ top: '10%', left: '10%' });
  const [timeLeft, setTimeLeft] = useState("02:45:30");

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition({ 
        top: `${Math.floor(Math.random() * 70) + 10}%`, 
        left: `${Math.floor(Math.random() * 60) + 10}%` 
      });
    }, 4000);
    return () => clearInterval(moveInterval);
  }, []);

  return (
    <div className="px-4 space-y-6 pb-24 animate-in fade-in">
      <div className="pt-4 pb-2 border-b border-gray-800/50">
        <h1 className="text-2xl font-black text-white tracking-tight">Thika VIP Lounge</h1>
        <p className="text-sm text-gray-400 mt-1">Exclusive weekend drops and unreleased sets.</p>
      </div>

      {/* Live Bunny.net Video Player with Security Watermark Overlay */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-gray-800">
        <iframe 
          src="https://iframe.mediadelivery.net/embed/789594/88d804ba-1b4f-4443-b238-c2b87fde1e81" 
          loading="lazy" 
          style={{ border: 'none', position: 'absolute', top: 0, height: '100%', width: '100%' }} 
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
          allowFullScreen={true}
        ></iframe>

        {/* Anti-Sharing Watermark */}
        <div className="absolute z-20 text-white/20 font-mono text-xs tracking-widest pointer-events-none font-bold transition-all duration-1000 select-none" style={{ top: position.top, left: position.left }}>
          {customerPhone ? customerPhone : '+254 712 345 678'}
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="bg-[#12151c] border border-[#00F0FF]/30 rounded-xl p-5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-50"></div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
          <Lock size={12} className="text-[#00F0FF]"/> Next Exclusive Drop
        </h2>
        <div className="text-3xl font-black font-mono text-[#00F0FF] my-2">{timeLeft}</div>
      </div>

      {/* Phone Number Input for M-Pesa */}
      <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-5 space-y-3">
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">M-Pesa Phone Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone size={16} className="text-[#00F0FF]" />
          </div>
          <input 
            type="text" 
            placeholder="0712345678" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full bg-black text-white font-mono border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00F0FF]"
          />
        </div>
      </div>

      {/* Pricing Buttons */}
      <div className="space-y-4">
        <button onClick={() => handlePayment('24-Hour Pass', 50)} className="w-full bg-[#161b22] border border-[#00F0FF]/30 hover:border-[#00F0FF] rounded-2xl p-4 flex items-center justify-between group transition-all">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-[#00F0FF]/10 flex items-center justify-center"><Zap className="text-[#00F0FF]" size={18}/></div>
            <div><h3 className="text-white font-bold text-sm">24-Hour Pass</h3><p className="text-gray-400 text-[10px]">Instant 1-day access</p></div>
          </div>
          <div className="flex flex-col text-right"><span className="text-[#00F0FF] font-black">KES 50</span></div>
        </button>

        <button onClick={() => handlePayment('Monthly VIP', 500)} className="w-full bg-gradient-to-br from-green-600 to-green-800 border border-green-400 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(22,163,74,0.2)]">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Crown className="text-white" size={18}/></div>
            <div><h3 className="text-white font-bold text-sm">Monthly VIP</h3><p className="text-green-100/80 text-[10px]">Full archive access</p></div>
          </div>
          <div className="flex flex-col text-right"><span className="text-white font-black">KES 500</span></div>
        </button>
      </div>
    </div>
  );
};

// --- Layout 3: Profile & Settings ---
const ProfileLayout = ({ setActiveTab }) => {
  return (
    <div className="px-4 py-6 space-y-6 pb-24 animate-in fade-in">
      <div className="flex items-center gap-4 pb-6 border-b border-gray-800">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700">
          <User size={32} className="text-gray-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">+254 712 *** 678</h2>
          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border border-green-500/20">
            <CheckCircle2 size={10} /> VIP ACTIVE
          </span>
        </div>
      </div>

      <div className="bg-[#12151c] rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CreditCard size={16}/> Billing</h3>
          <span className="text-[10px] text-gray-500">Renews Next Month</span>
        </div>
        <div className="bg-black/50 p-4 rounded-xl border border-gray-800/50 flex justify-between items-center">
          <div>
            <div className="text-white font-bold">Monthly VIP</div>
            <div className="text-xs text-gray-500">KES 500 / month</div>
          </div>
          <button className="text-xs text-[#00F0FF] font-bold bg-[#00F0FF]/10 px-3 py-1.5 rounded-lg">Manage</button>
        </div>
      </div>

      <button onClick={() => setActiveTab('login')} className="w-full flex items-center justify-center gap-2 text-red-400 font-bold py-4 bg-red-500/5 rounded-xl border border-red-500/10 hover:bg-red-500/10 transition-colors">
        <LogOut size={18} /> Secure Logout
      </button>
    </div>
  );
};

// --- Main App Controller ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toastMsg, setToastMsg] = useState('');
  const [vaults, setVaults] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, price: 0, status: 'waiting' });

  useEffect(() => {
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
  }, []);

  const handlePayment = async (plan, price) => {
    let formattedPhone = customerPhone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }
    if (!formattedPhone || formattedPhone.length < 10) {
      setToastMsg("Please enter a valid M-Pesa phone number in the VIP tab!");
      setTimeout(() => setToastMsg(''), 4000);
      setActiveTab('vip');
      return;
    }

    setPaymentModal({ isOpen: true, price, status: 'waiting' });

    try {
      const response = await fetch("/.netlify/functions/stk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: price,
          msisdn: formattedPhone,
          reference: `Thika Premium - ${plan}`
        })
      });

      const data = await response.json();
      console.log("STK Response:", data);

      if (response.ok && (data.success || data.ResponseCode === "0" || data.ResponseCode === 0)) {
        setPaymentModal(prev => ({ ...prev, status: 'success' }));
        setTimeout(() => {
          setPaymentModal({ isOpen: false, price: 0, status: 'waiting' });
          setToastMsg(`STK push sent for ${plan}! Check your phone.`);
          setTimeout(() => setToastMsg(''), 4000);
        }, 2500);
      } else {
        setPaymentModal({ isOpen: false, price: 0, status: 'waiting' });
        setToastMsg("Failed: " + (data.message || data.error || "Please try again."));
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (error) {
      console.error("STK Push Error:", error);
      setPaymentModal({ isOpen: false, price: 0, status: 'waiting' });
      setToastMsg("Connection error connecting to payment gateway.");
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-gray-200 font-sans selection:bg-[#00F0FF] selection:text-black">
      
      {toastMsg && <Toast msg={toastMsg} />}

      {/* M-Pesa Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#12151c] border border-gray-800 rounded-2xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            {paymentModal.status === 'waiting' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/30">
                  <Loader2 size={32} className="text-green-500 animate-spin" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Sending STK Push</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Initiating payment prompt of <span className="text-white font-bold">KES {paymentModal.price}</span> to <span className="text-[#00F0FF] font-mono">{customerPhone}</span>.
                </p>
                <p className="text-xs text-gray-500 animate-pulse">Please check your phone for the PIN prompt...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/50">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">STK Push Sent!</h3>
                <p className="text-sm text-gray-400">Enter your M-Pesa PIN on your phone to complete.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-gray-800/80 px-4 py-3 flex justify-between items-center max-w-md mx-auto w-full">
        <div className="flex flex-col uppercase tracking-tighter font-black leading-none cursor-pointer" onClick={() => setActiveTab('home')}>
          <span className="text-[#00F0FF] text-lg">Thika</span>
          <span className="text-[#FFD700] text-xs tracking-[0.2em]">Premium</span>
        </div>
        <a href="https://t.me" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/40 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-[0_0_10px_rgba(0,136,204,0.2)]">
          <Send size={12} /> Telegram
        </a>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full">
        {activeTab === 'home' && <HomeLayout setActiveTab={setActiveTab} vaults={vaults} />}
        {activeTab === 'explore' && <ExploreLayout setActiveTab={setActiveTab} />}
        {activeTab === 'vip' && <VIPLayout customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} handlePayment={handlePayment} />}
        {activeTab === 'profile' && <ProfileLayout setActiveTab={setActiveTab} />}
        {activeTab === 'login' && <AuthLayout setActiveTab={setActiveTab} />}
      </main>

      {/* Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#0A0C10]/95 backdrop-blur-lg border-t border-gray-800/80 supports-[padding:max(0px)]:pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md mx-auto px-6 h-16 flex justify-between items-center">
          
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-14 transition-colors ${activeTab === 'home' ? 'text-white' : 'text-gray-600'}`}>
            <Home size={22} className={activeTab === 'home' ? 'stroke-2' : 'stroke-[1.5]'} />
            <span className="text-[9px] font-bold tracking-wide">Home</span>
          </button>

          <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center gap-1 w-14 transition-colors ${activeTab === 'explore' ? 'text-white' : 'text-gray-600'}`}>
            <Compass size={22} className={activeTab === 'explore' ? 'stroke-2' : 'stroke-[1.5]'} />
            <span className="text-[9px] font-bold tracking-wide">Explore</span>
          </button>

          <button onClick={() => setActiveTab('vip')} className={`flex flex-col items-center gap-1 w-14 transition-colors ${activeTab === 'vip' ? 'text-[#00F0FF]' : 'text-gray-600'}`}>
            <div className="relative">
              <Crown size={22} className={activeTab === 'vip' ? 'stroke-2 text-[#00F0FF]' : 'stroke-[1.5]'} />
              {activeTab === 'vip' && <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_5px_#FFD700]"></div>}
            </div>
            <span className="text-[9px] font-bold tracking-wide">VIP</span>
          </button>

          <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 w-14 transition-colors ${activeTab === 'profile' ? 'text-white' : 'text-gray-600'}`}>
            <User size={22} className={activeTab === 'profile' ? 'stroke-2' : 'stroke-[1.5]'} />
            <span className="text-[9px] font-bold tracking-wide">Account</span>
          </button>

        </div>
      </nav>
    </div>
  );
}