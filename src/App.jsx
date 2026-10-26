import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { 
  Send, Home, Compass, Crown, User, Smartphone, Play, Lock, 
  CheckCircle2, Flame, Shield, LogOut, CreditCard, Zap,
  Search, Filter, Phone, History,
  Loader2, MessageSquare, Menu, X, Star, Sparkles, Tv, Eye, Heart
} from 'lucide-react';

// --- Reusable Toast Component ---
const Toast = ({ msg }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 backdrop-blur-sm text-black px-4 py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] text-sm font-bold flex items-center gap-2 w-[90%] max-w-sm border border-green-400 animate-in fade-in slide-in-from-top-5">
    <CheckCircle2 size={18} /> {msg}
  </div>
);

// --- 1. Professional Top Navigation Bar ---
const Header = ({ activeTab, setActiveTab, searchQuery, setSearchQuery }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0A0C10]/95 backdrop-blur-xl border-b border-gray-800/80 px-4 py-3 w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFD700] to-[#00F0FF] flex items-center justify-center font-black text-black text-lg">
            T
          </div>
          <div className="flex flex-col uppercase tracking-tighter font-black leading-none">
            <span className="text-[#00F0FF] text-base">Thika</span>
            <span className="text-[#FFD700] text-[10px] tracking-[0.2em]">Expressway</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, creators, tags..." 
            className="w-full bg-[#12151c] text-white text-xs border border-gray-800 rounded-full py-2 pl-9 pr-4 focus:outline-none focus:border-[#00F0FF] transition-colors"
          />
        </div>

        {/* Subscribe CTA Button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('vip')} 
            className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black px-5 py-2 rounded-full text-xs transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center gap-1.5"
          >
            <Crown size={14} /> Subscribe
          </button>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="max-w-6xl mx-auto flex overflow-x-auto gap-6 pt-3 pb-1 border-t border-gray-800/50 mt-3 text-xs font-bold scrollbar-none">
        {[
          { id: 'home', label: 'Featured' },
          { id: 'creators', label: 'Creators' },
          { id: 'trending', label: 'Trending' },
          { id: 'latest', label: 'Latest' },
          { id: 'popular', label: 'Most Popular' },
          { id: 'toprated', label: 'Top Rated' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${activeTab === tab.id ? 'text-[#00F0FF] border-[#00F0FF]' : 'text-gray-400 border-transparent hover:text-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};

// --- 2. Creator Feed / Vault Grid Layout ---
const HomeLayout = ({ setActiveTab, vaults, setSelectedVaultId, setSelectedCreator }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-in fade-in">
      
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.15)] group cursor-pointer" onClick={() => setActiveTab('vip')}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-black/40 to-transparent z-10"></div>
        <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop" alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute bottom-6 left-6 z-20 space-y-2">
          <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider inline-block">Featured Drop</span>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">The Ultimate Expressway VIP Experience</h2>
          <p className="text-gray-300 text-xs md:text-sm max-w-xl line-clamp-2">Get unrestricted access to unreleased weekend sets, live streams, and high-definition creator archives.</p>
        </div>
      </div>

      {/* Grid of Vaults */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Flame size={16} className="text-[#FFD700]"/> Exclusive Content Vaults
          </h3>
          <span className="text-xs text-[#00F0FF] cursor-pointer hover:underline" onClick={() => setActiveTab('trending')}>View all</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vaults.length > 0 ? (
            vaults.map((vault) => (
              <div 
                key={vault.id} 
                onClick={() => {
                  setSelectedVaultId(vault.id);
                  setSelectedCreator(vault);
                  setActiveTab('vip');
                }} 
                className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group bg-gray-900 border border-gray-800 hover:border-[#00F0FF]/50 transition-all shadow-lg"
              >
                <img src={vault.img || "https://images.unsplash.com/photo-1570872626485-d8ffea69f463?q=80&w=600&auto=format&fit=crop"} alt={vault.title} className="w-full h-full object-cover blur-[1px] opacity-70 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute top-3 left-3 flex gap-1">
                  <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-md">
                    HD
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded text-gray-300 border border-gray-700">
                    {vault.mediaCount || '15 media'}
                  </span>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80 group-hover:scale-110 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-gray-500/50">
                    <Lock size={18} className="text-[#FFD700]" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[9px] text-[#00F0FF] uppercase tracking-wider font-bold">VIP Creator</span>
                  <h4 className="text-white font-bold text-sm leading-tight line-clamp-1">{vault.title || "Exclusive Stream"}</h4>
                  <div className="text-[10px] text-gray-400 mt-0.5 flex justify-between items-center">
                    <span>KES {vault.price || 50} access</span>
                    <span className="text-[#FFD700] flex items-center gap-1"><Star size={10} fill="#FFD700"/> 4.9</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 text-xs">Loading secure vaults from database...</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- VIP Player & Watermark Layout ---
const VIPLayout = ({ activeVault, customerPhone, setCustomerPhone, handlePayment }) => {
  const [position, setPosition] = useState({ top: '15%', left: '15%' });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [timeLeft, setTimeLeft] = useState("02:45:30");
  
  const isUnlocked = activeVault?.status === 'unlocked';

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition({ 
        top: `${Math.floor(Math.random() * 70) + 10}%`, 
        left: `${Math.floor(Math.random() * 60) + 10}%` 
      });
    }, 4000);

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-in fade-in">
      <div className="border-b border-gray-800/80 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">{activeVault?.title || 'Thika VIP Lounge'}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isUnlocked ? 'You have active premium access to this content stream.' : 'Unlock exclusive weekend drops and unreleased high-def sets instantly.'}
        </p>
      </div>

      {isUnlocked ? (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.9)] border border-gray-800">
          <iframe 
            src="https://iframe.mediadelivery.net/embed/789594/88d804ba-1b4f-4443-b238-c2b87fde1e81" 
            loading="lazy" 
            style={{ border: 'none', position: 'absolute', top: 0, height: '100%', width: '100%' }} 
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
            allowFullScreen={true}
          ></iframe>
          <div className="absolute z-20 text-white/25 font-mono text-xs tracking-widest pointer-events-none font-bold select-none bg-black/10 px-2 py-1 rounded backdrop-blur-[1px]" style={{ top: position.top, left: position.left }}>
            {customerPhone ? customerPhone : '+254 712 345 678'} • {currentTime}
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-gray-800 flex flex-col items-center justify-center">
            <Lock size={40} className="text-[#FFD700] mb-3 animate-pulse" />
            <span className="text-white font-black text-sm uppercase tracking-widest">Content Locked</span>
            <span className="text-gray-400 text-xs mt-1">Complete M-Pesa payment below to reveal stream</span>
          </div>

          <div className="bg-[#12151c] border border-[#00F0FF]/30 rounded-xl p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-50"></div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
              <Lock size={12} className="text-[#00F0FF]"/> Limited Access Timer
            </h2>
            <div className="text-3xl font-black font-mono text-[#00F0FF] my-2">{timeLeft}</div>
          </div>

          <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-5 space-y-3">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">M-Pesa Phone Number (Auto-saved)</label>
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

          <div className="space-y-4">
            <button onClick={() => handlePayment('24-Hour Pass', activeVault?.price || 50)} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center"><Zap size={18}/></div>
                <div><h3 className="font-black text-sm">Instant 24-Hour Pass</h3><p className="text-black/70 text-[10px]">Unlocks this vault immediately</p></div>
              </div>
              <div className="text-right"><span className="font-black text-lg">KES {activeVault?.price || 50}</span></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// --- Creator Profile Layout ---
const CreatorProfileLayout = ({ selectedCreator, setActiveTab, setSelectedVaultId }) => {
  if (!selectedCreator) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        <p>No creator selected.</p>
        <button onClick={() => setActiveTab('home')} className="mt-4 text-[#00F0FF] font-bold text-xs">Return to Feed</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in">
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <img src={selectedCreator.img} alt={selectedCreator.title} className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 z-0" />
        
        <div className="relative z-20 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#00F0FF]/50 shrink-0 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
          <img src={selectedCreator.img} alt={selectedCreator.title} className="w-full h-full object-cover" />
        </div>

        <div className="relative z-20 text-center md:text-left space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Verified Creator</span>
            <span className="text-xs text-gray-400 font-mono">24 Media Uploads</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">{selectedCreator.title}</h1>
          <p className="text-gray-300 text-xs max-w-lg leading-relaxed">Exclusive performer and content creator. Subscribe to unlock full archive streams, weekend drops, and private clips.</p>
          
          <div className="pt-2 flex justify-center md:justify-start gap-3">
            <button onClick={() => { setSelectedVaultId(selectedCreator.id); setActiveTab('vip'); }} className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg">
              Unlock Vault (KES {selectedCreator.price || 50})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Membership / Account Benefits View ---
const MembershipLayout = ({ setActiveTab }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">Membership</h1>
        <p className="text-gray-400 text-xs max-w-md mx-auto">
          A free account keeps your subscriptions safe and works on every device. Paying never needs one.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { icon: <Smartphone className="text-[#00F0FF]" size={20}/>, title: "Your subscriptions on every device", desc: "Sign in on a phone, a tablet or a computer and keep watching. No codes to type." },
          { icon: <Star className="text-[#FFD700]" size={20}/>, title: "Follow models and save favourites", desc: "Keep the creators and videos you like in one place." },
          { icon: <History className="text-green-400" size={20}/>, title: "Watch history", desc: "Pick up where you left off." },
          { icon: <Crown className="text-purple-400" size={20}/>, title: "Lifetime subscriptions", desc: "A lifetime subscription is kept on your account, so it is never lost with a device." }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#12151c] border border-gray-800 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-gray-800 shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="text-white font-bold text-xs">{item.title}</h3>
              <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4">
        <button onClick={() => setActiveTab('signup')} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]">
          Create a free account
        </button>
        <button onClick={() => setActiveTab('login')} className="w-full bg-[#12151c] hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-xs border border-gray-800 transition-colors">
          Log in
        </button>
      </div>
    </div>
  );
};

// --- Restore Access Page ---
const RestoreLayout = ({ setActiveTab, setToastMsg }) => {
  const [phone, setPhone] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestore = (e) => {
    e.preventDefault();
    if (!phone || !mpesaCode) {
      setToastMsg("Please provide both your phone number and payment code.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToastMsg("Access code verified! Restoring VIP session...");
      setTimeout(() => {
        setToastMsg('');
        setActiveTab('vip');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">Restore access</h1>
        <p className="text-gray-400 text-xs">Enter your M-Pesa transaction receipt code to recover your active session.</p>
      </div>

      <form onSubmit={handleRestore} className="space-y-4 bg-[#12151c] border border-gray-800 rounded-2xl p-6">
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Phone number you paid with</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712 345 678" 
            className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Payment code</label>
          <input 
            type="text" 
            value={mpesaCode}
            onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
            placeholder="E.G. SJK3ABC12D" 
            className="w-full bg-black text-white font-mono uppercase text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all disabled:opacity-50">
          {loading ? "VERIFYING RECEIPT..." : "Restore access"}
        </button>
      </form>

      <div className="text-center">
        <button onClick={() => setActiveTab('membership')} className="text-xs text-gray-400 hover:text-white">
          Back to <span className="text-[#00F0FF] font-bold">Membership</span>
        </button>
      </div>
    </div>
  );
};

// --- Auth Layout ---
const AuthLayout = ({ setActiveTab, setToastMsg, isLoginMode }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoginMode && !isAdult) {
      setToastMsg("You must confirm you are 18 or older to register.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToastMsg(isLoginMode ? "Login successful!" : "Account created successfully!");
      setTimeout(() => {
        setToastMsg('');
        setActiveTab('home');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">{isLoginMode ? 'Welcome back' : 'Create an account'}</h1>
        <p className="text-gray-400 text-xs">Secure your creator subscriptions across all your devices.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#12151c] border border-gray-800 rounded-2xl p-6">
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Phone or Email</label>
          <input 
            type="text" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="0712 345 678 or email@domain.com" 
            className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" 
            className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]"
          />
        </div>

        {!isLoginMode && (
          <div className="flex items-start gap-3 pt-2">
            <input 
              type="checkbox" 
              id="ageCheck" 
              checked={isAdult}
              onChange={(e) => setIsAdult(e.target.checked)}
              className="mt-1 w-4 h-4 rounded bg-black border-gray-800 text-[#00F0FF] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="ageCheck" className="text-[11px] text-gray-400 cursor-pointer leading-relaxed">
              I am 18 or older and accept the <span className="text-[#00F0FF] underline">Terms</span> and <span className="text-[#00F0FF] underline">Privacy Policy</span>.
            </label>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all disabled:opacity-50">
          {loading ? "PROCESSING..." : (isLoginMode ? 'Log in' : 'Create account')}
        </button>
      </form>

      <div className="text-center">
        <button onClick={() => setActiveTab(isLoginMode ? 'signup' : 'login')} className="text-xs text-gray-400 hover:text-white">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <span className="text-[#00F0FF] font-bold">{isLoginMode ? 'Sign up' : 'Log in'}</span>
        </button>
      </div>
    </div>
  );
};

// --- Dynamic Legal & Takedown Policy Layout ---
const PolicyLayout = ({ activeTab, setActiveTab }) => {
  const getPolicyContent = () => {
    switch (activeTab) {
      case 'terms':
        return {
          title: "Terms of Service",
          content: "Welcome to Thika Expressway VIP. By accessing or subscribing to content on our platform, you agree to these terms. All purchases made via M-Pesa are final. Content is protected by digital rights management and anti-piracy tracking. Unauthorized downloading, screen recording, or redistribution will result in immediate account termination and permanent device blacklisting."
        };
      case 'privacy':
        return {
          title: "Privacy Policy",
          content: "We value your privacy. We only collect necessary transaction data (such as your M-Pesa phone number) required to process payments and verify active subscriptions. We never sell, rent, or share your personal data with third-party marketers."
        };
      case 'cookies':
        return {
          title: "Cookies Policy",
          content: "We use essential cookies and local storage tokens (such as your saved M-Pesa number session) to ensure seamless video playback, authentication, and secure access across your devices."
        };
      case 'disclaimer':
        return {
          title: "Age Disclaimer",
          content: "This website contains adult and mature entertainment content. All users, subscribers, and performers must be 18 years of age or older (or the legal age of majority in their jurisdiction). By entering the site, you certify that you meet this age requirement."
        };
      case 'takedown':
        return {
          title: "Content and Takedown Policy",
          content: "Thika Expressway respects the intellectual property and privacy rights of all creators and individuals. If you believe your copyrighted work or personal media has been posted on our platform without authorization, we will review and remove it expeditiously."
        };
      default:
        return {
          title: "Support & Legal Information",
          content: "For any inquiries, please contact our support team."
        };
    }
  };

  const policy = getPolicyContent();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in text-gray-300 text-xs leading-relaxed">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-black text-white">{policy.title}</h1>
        <p className="text-gray-500 text-[11px] mt-1">Last updated: October 2026</p>
      </div>

      <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-4">
        <p>{policy.content}</p>

        {activeTab === 'takedown' && (
          <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
            <h3 className="font-bold text-white text-sm">How to Report a Takedown</h3>
            <p>To submit a valid takedown notice, please send a message or email containing:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li>Direct URL link(s) to the specific content on our site.</li>
              <li>Proof of copyright ownership or identity authorization.</li>
              <li>Your official contact information (Email or Telegram handle).</li>
            </ul>
          </div>
        )}

        {/* Support Contact Box with @mr_exposes Telegram Handle */}
        <div className="mt-8 pt-6 border-t border-gray-800 bg-black/40 p-4 rounded-xl border border-gray-800/80 space-y-2">
          <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-[#00F0FF]">Official Support Channels</h4>
          <p className="text-gray-400 text-[11px]">Need immediate assistance or content removal? Reach out directly:</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a 
              href="https://t.me/mr_exposes" 
              target="_blank" 
              rel="noreferrer" 
              className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              Telegram: @mr_exposes
            </a>
            <a 
              href="mailto:support@thikasuperhighwaypremium.com" 
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button onClick={() => setActiveTab('home')} className="text-xs text-[#00F0FF] font-bold hover:underline">
          ← Return to Home Feed
        </button>
      </div>
    </div>
  );
};

// --- Footer with Connected Policy Links ---
const Footer = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#05070a] border-t border-gray-800/80 px-4 py-8 mt-16 text-xs text-gray-500 space-y-6 max-w-6xl mx-auto w-full rounded-t-2xl">
      <p className="text-[11px] leading-relaxed text-gray-400 max-w-2xl">
        Thika Expressway brings you exclusive videos and photos from the creators you follow, with new content added all the time. Subscribe for full access, or create a free account to keep your access on every device.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h4 className="font-bold text-gray-300 mb-3 uppercase tracking-wider text-[10px]">Information</h4>
          <ul className="space-y-2 text-[11px]">
            <li><button onClick={() => setActiveTab('terms')} className="hover:text-[#00F0FF] transition-colors">Terms of Service</button></li>
            <li><button onClick={() => setActiveTab('privacy')} className="hover:text-[#00F0FF] transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => setActiveTab('cookies')} className="hover:text-[#00F0FF] transition-colors">Cookies</button></li>
            <li><button onClick={() => setActiveTab('disclaimer')} className="hover:text-[#00F0FF] transition-colors">Age Disclaimer</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-300 mb-3 uppercase tracking-wider text-[10px]">Support & Help</h4>
          <ul className="space-y-2 text-[11px]">
            <li><button onClick={() => setActiveTab('restore')} className="hover:text-[#00F0FF] transition-colors text-[#00F0FF] font-bold">Restore access</button></li>
            <li><button onClick={() => setActiveTab('membership')} className="hover:text-[#00F0FF] transition-colors">Membership Perks</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-300 mb-3 uppercase tracking-wider text-[10px]">Content removal</h4>
          <ul className="space-y-2 text-[11px]">
            <li><button onClick={() => setActiveTab('takedown')} className="hover:text-[#00F0FF] transition-colors">Content and Takedown Policy</button></li>
            <li><button onClick={() => setActiveTab('takedown')} className="hover:text-[#00F0FF] transition-colors">Report a takedown</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-300 mb-3 uppercase tracking-wider text-[10px]">Discover</h4>
          <ul className="space-y-2 text-[11px]">
            <li><button onClick={() => setActiveTab('home')} className="hover:text-[#00F0FF] transition-colors">Creators</button></li>
            <li><button onClick={() => setActiveTab('trending')} className="hover:text-[#00F0FF] transition-colors">Trending</button></li>
            <li><button onClick={() => setActiveTab('latest')} className="hover:text-[#00F0FF] transition-colors">Latest</button></li>
          </ul>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-900/80 text-[10px] text-center text-gray-600">
        © 2026 Thika Expressway VIP. All rights reserved.
      </div>
    </footer>
  );
};

// --- Main App Controller ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toastMsg, setToastMsg] = useState('');
  const [vaults, setVaults] = useState([]);
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('thika_customer_phone') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, price: 0, status: 'waiting' });
  
  const [selectedVaultId, setSelectedVaultId] = useState('QCVwrsVuEtlAQ3PMziVs');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [activeVault, setActiveVault] = useState(null);

  useEffect(() => {
    if (customerPhone) {
      localStorage.setItem('thika_customer_phone', customerPhone);
    }
  }, [customerPhone]);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vaults"));
        const vaultData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVaults(vaultData);
        if (vaultData.length > 0) setSelectedCreator(vaultData[0]);
      } catch (error) {
        console.error("Error fetching vaults: ", error);
      }
    };
    fetchVaults();
  }, []);

  useEffect(() => {
    if (!selectedVaultId) return;
    const vaultRef = doc(db, 'vaults', selectedVaultId);
    const unsubscribe = onSnapshot(vaultRef, (docSnap) => {
      if (docSnap.exists()) {
        setActiveVault({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsubscribe();
  }, [selectedVaultId]);

  const handlePayment = async (plan, price) => {
    let formattedPhone = customerPhone.trim();
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
    if (!formattedPhone || formattedPhone.length < 10) {
      setToastMsg("Please enter a valid M-Pesa phone number!");
      setTimeout(() => setToastMsg(''), 4000);
      setActiveTab('vip');
      return;
    }

    setPaymentModal({ isOpen: true, price, status: 'waiting' });

    try {
      const response = await fetch("/.netlify/functions/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, msisdn: formattedPhone, reference: selectedVaultId })
      });

      const data = await response.json();
      if (response.ok && (data.success || data.ResponseCode === "0" || data.ResponseCode === 0)) {
        setPaymentModal(prev => ({ ...prev, status: 'success' }));
        setTimeout(() => {
          setPaymentModal({ isOpen: false, price: 0, status: 'waiting' });
          setToastMsg(`STK push sent! Check your phone.`);
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
      setToastMsg("Connection error to payment gateway.");
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-gray-200 font-sans selection:bg-[#00F0FF] selection:text-black flex flex-col justify-between">
      
      {toastMsg && <Toast msg={toastMsg} />}

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#12151c] border border-gray-800 rounded-2xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-2xl">
            {paymentModal.status === 'waiting' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/30">
                  <Loader2 size={32} className="text-green-500 animate-spin" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Sending STK Push</h3>
                <p className="text-sm text-gray-400 mb-4">Prompting <span className="text-[#00F0FF] font-mono">{customerPhone}</span> for KES {paymentModal.price}.</p>
                <p className="text-xs text-gray-500 animate-pulse">Check your phone for the M-Pesa PIN prompt...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/50">
                  <CheckCircle2 size={32} className="text-green-500" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">STK Push Sent!</h3>
                <p className="text-sm text-gray-400">Enter your PIN to complete the unlock.</p>
              </>
            )}
          </div>
        </div>
      )}

      <div>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main>
          {(activeTab === 'home' || activeTab === 'trending' || activeTab === 'latest' || activeTab === 'popular' || activeTab === 'toprated') && (
            <HomeLayout setActiveTab={setActiveTab} vaults={vaults} setSelectedVaultId={setSelectedVaultId} setSelectedCreator={setSelectedCreator} />
          )}
          {activeTab === 'creators' && <CreatorProfileLayout selectedCreator={selectedCreator} setActiveTab={setActiveTab} setSelectedVaultId={setSelectedVaultId} />}
          {activeTab === 'vip' && <VIPLayout activeVault={activeVault} customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} handlePayment={handlePayment} />}
          {activeTab === 'membership' && <MembershipLayout setActiveTab={setActiveTab} />}
          {activeTab === 'restore' && <RestoreLayout setActiveTab={setActiveTab} setToastMsg={setToastMsg} />}
          {activeTab === 'signup' && <AuthLayout setActiveTab={setActiveTab} setToastMsg={setToastMsg} isLoginMode={false} />}
          {activeTab === 'login' && <AuthLayout setActiveTab={setActiveTab} setToastMsg={setToastMsg} isLoginMode={true} />}
          
          {/* Policy & Takedown Routes */}
          {['terms', 'privacy', 'cookies', 'disclaimer', 'takedown'].includes(activeTab) && (
            <PolicyLayout activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}