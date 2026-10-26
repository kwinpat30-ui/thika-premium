import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { db } from './firebase';
import { 
  Send, Home, Compass, Crown, User, Smartphone, Play, Lock, 
  CheckCircle2, Flame, Shield, LogOut, CreditCard, Zap,
  Search, Filter, Phone, History, PlusCircle, Trash2, LayoutDashboard,
  Loader2, MessageSquare, Menu, X, Star, Sparkles, Tv, Eye, Heart
} from 'lucide-react';

const auth = getAuth();
const OWNER_EMAIL = "kwinpat30@gmail.com"; // Secure Admin Owner Lock

// --- Reusable Toast Component ---
const Toast = ({ msg }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 backdrop-blur-sm text-black px-4 py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] text-sm font-bold flex items-center gap-2 w-[90%] max-w-sm border border-green-400 animate-in fade-in slide-in-from-top-5">
    <CheckCircle2 size={18} /> {msg}
  </div>
);

// --- Custom Silhouette Logo Component ---
const Logo = () => (
  <div className="flex items-center gap-3 cursor-pointer group">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFD700] via-[#12151c] to-[#00F0FF] p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
      <div className="w-full h-full bg-[#0A0C10] rounded-xl flex items-center justify-center overflow-hidden relative">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#FFD700] group-hover:scale-110 transition-transform duration-300" fill="currentColor">
          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2l5.4 3.4L12 11 6.6 7.6 12 4.2zM6 9.4l5 3.1v6.1l-5-3.1V9.4zm12 0v6.1l-5 3.1v-6.1l5-3.1z" />
        </svg>
      </div>
    </div>
    <div className="flex flex-col uppercase tracking-tighter font-black leading-none">
      <span className="text-[#00F0FF] text-sm md:text-base tracking-wider">Thika</span>
      <span className="text-[#FFD700] text-[9px] tracking-[0.25em]">Superhighway</span>
    </div>
  </div>
);

// --- 1. Professional Top Navigation Bar ---
const Header = ({ activeTab, setActiveTab, searchQuery, setSearchQuery, currentUser, handleLogout, isOwner }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0A0C10]/95 backdrop-blur-xl border-b border-gray-800/80 px-4 py-3 w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div onClick={() => setActiveTab('home')}>
          <Logo />
        </div>

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

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {isOwner && (
                <button 
                  onClick={() => setActiveTab('admin')} 
                  className={`text-xs font-bold px-3 py-2 rounded-full border transition-all flex items-center gap-1 ${activeTab === 'admin' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-gray-900 text-[#00F0FF] border-gray-800 hover:border-[#00F0FF]'}`}
                >
                  <LayoutDashboard size={14}/> Admin
                </button>
              )}
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-gray-900 border border-gray-800 px-3 py-2 rounded-full">
                <LogOut size={14}/> Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setActiveTab('login')} className="text-xs text-[#00F0FF] hover:underline hidden sm:block font-bold">
              Log in
            </button>
          )}
          <button 
            onClick={() => setActiveTab('vip')} 
            className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black px-5 py-2 rounded-full text-xs transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center gap-1.5"
          >
            <Crown size={14} /> Subscribe
          </button>
        </div>
      </div>

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

// --- Admin Dashboard Layout ---
const AdminLayout = ({ vaults, setVaults, setToastMsg, setActiveTab, setSelectedVaultId }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('50');
  const [mediaCount, setMediaCount] = useState('15 media');
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateVault = async (e) => {
    e.preventDefault();
    if (!title || !imgUrl) {
      setToastMsg("Please provide a title and thumbnail image URL.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "vaults"), {
        title: title.trim(),
        price: Number(price),
        mediaCount: mediaCount.trim(),
        img: imgUrl.trim(),
        status: 'locked',
        createdAt: new Date()
      });

      setVaults(prev => [...prev, { id: docRef.id, title, price: Number(price), mediaCount, img: imgUrl, status: 'locked' }]);
      setTitle('');
      setImgUrl('');
      setToastMsg("New content vault published successfully!");
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      console.error("Error adding vault:", error);
      setToastMsg("Error publishing vault: " + error.message);
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVault = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vault?")) return;
    try {
      await deleteDoc(doc(db, "vaults", id));
      setVaults(prev => prev.filter(v => v.id !== id));
      setToastMsg("Vault deleted successfully.");
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      setToastMsg("Error deleting vault.");
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      <div className="border-b border-gray-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <LayoutDashboard className="text-[#00F0FF]" /> Admin Control Center
          </h1>
          <p className="text-gray-400 text-xs mt-1">Publish content vaults, manage pricing, and monitor site activity.</p>
        </div>
        <button onClick={() => setActiveTab('home')} className="text-xs bg-gray-900 border border-gray-800 hover:text-white px-4 py-2 rounded-xl text-gray-300 font-bold">
          View Live Site →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle size={16} className="text-[#FFD700]" /> Publish New Content Vault
          </h3>

          <form onSubmit={handleCreateVault} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Vault / Creator Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="E.G. Nairobi Nightclub VIP Set" 
                className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Price (KES)</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Media Count</label>
                <input 
                  type="text" 
                  value={mediaCount} 
                  onChange={(e) => setMediaCount(e.target.value)} 
                  placeholder="15 media" 
                  className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Thumbnail Image URL</label>
              <input 
                type="text" 
                value={imgUrl} 
                onChange={(e) => setImgUrl(e.target.value)} 
                placeholder="https://images.unsplash.com/..." 
                className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg disabled:opacity-50">
              {loading ? "PUBLISHING..." : "Publish Vault Live"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Overview</h3>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-black/50 border border-gray-800/80 p-4 rounded-xl text-center">
                <span className="text-2xl font-black text-[#00F0FF]">{vaults.length}</span>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">Active Vaults</p>
              </div>
              <div className="bg-black/50 border border-gray-800/80 p-4 rounded-xl text-center">
                <span className="text-2xl font-black text-[#FFD700]">KES {vaults.reduce((acc, v) => acc + Number(v.price || 50), 0)}</span>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">Catalog Value</p>
              </div>
            </div>
          </div>

          <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Support Contact</h3>
            <p className="text-xs text-gray-300">Telegram Handle: <span className="text-[#00F0FF] font-mono font-bold">@mr_exposes</span></p>
            <p className="text-xs text-gray-300">Owner Email: <span className="text-[#FFD700] font-mono">{OWNER_EMAIL}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manage Published Content Vaults</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-gray-800 text-gray-500 uppercase text-[10px]">
              <tr>
                <th className="pb-3">Thumbnail</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Media</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {vaults.map((vault) => (
                <tr key={vault.id} className="hover:bg-black/30">
                  <td className="py-3">
                    <img src={vault.img || "https://images.unsplash.com/photo-1570872626485-d8ffea69f463?q=80&w=200&auto=format&fit=crop"} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-800" />
                  </td>
                  <td className="py-3 font-bold text-white">{vault.title}</td>
                  <td className="py-3 text-[#FFD700] font-mono">KES {vault.price || 50}</td>
                  <td className="py-3 text-gray-400">{vault.mediaCount || '15 media'}</td>
                  <td className="py-3 text-right space-x-2">
                    <button onClick={() => { setSelectedVaultId(vault.id); setActiveTab('vip'); }} className="text-[#00F0FF] hover:underline px-2 py-1 font-bold">View</button>
                    <button onClick={() => handleDeleteVault(vault.id)} className="text-red-400 hover:text-red-300 p-1 rounded"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Home Layout ---
const HomeLayout = ({ setActiveTab, vaults, setSelectedVaultId, setSelectedCreator }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-in fade-in">
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.15)] group cursor-pointer" onClick={() => setActiveTab('vip')}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-black/40 to-transparent z-10"></div>
        <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop" alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute bottom-6 left-6 z-20 space-y-2">
          <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider inline-block">Featured Drop</span>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">The Ultimate Superhighway Premium Experience</h2>
          <p className="text-gray-300 text-xs md:text-sm max-w-xl line-clamp-2">Get unrestricted access to unreleased weekend sets, live streams, and high-definition creator archives.</p>
        </div>
      </div>

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
                  <span className="text-[9px] text-[#00F0FF] uppercase tracking-wider font-bold">Premium Creator</span>
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

// --- VIP Layout ---
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
        <h1 className="text-2xl font-black text-white tracking-tight">{activeVault?.title || 'Thika Superhighway Premium Lounge'}</h1>
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

// --- Membership Layout ---
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

// --- Restore Layout ---
const RestoreLayout = ({ setActiveTab, setToastMsg }) => {
  const [phone, setPhone] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!phone || !mpesaCode) {
      setToastMsg("Please provide both your phone number and payment code.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "transactions"), 
        where("mpesaCode", "==", mpesaCode.trim().toUpperCase()),
        where("phone", "==", phone.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setToastMsg("Access code verified! Restoring session...");
        setTimeout(() => {
          setToastMsg('');
          setActiveTab('vip');
        }, 2000);
      } else {
        setToastMsg("No matching transaction found. Check code & phone.");
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (error) {
      console.error("Restore error:", error);
      setToastMsg("Error verifying transaction. Try again.");
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setLoading(false);
    }
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
  const [method, setMethod] = useState('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone-input');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isAdult, setIsAdult] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (method === 'phone' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
      } catch (e) {
        console.error("Recaptcha error:", e);
      }
    }
  }, [method]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!isLoginMode && !isAdult) {
      setToastMsg("You must confirm you are 18 or older to register.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    if (!email || !password) {
      setToastMsg("Please fill in all fields.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    setLoading(true);
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        setToastMsg("Login successful!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setToastMsg("Account created successfully!");
      }
      setTimeout(() => {
        setToastMsg('');
        setActiveTab('home');
      }, 1500);
    } catch (error) {
      setToastMsg("Error: " + error.message);
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isLoginMode && !isAdult) {
      setToastMsg("You must confirm you are 18 or older to register.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) formattedPhone = '+254' + formattedPhone.slice(1);
    if (!formattedPhone.startsWith('+')) formattedPhone = '+' + formattedPhone;

    if (formattedPhone.length < 10) {
      setToastMsg("Please enter a valid phone number.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp-input');
      setToastMsg("Verification code sent via SMS!");
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      console.error("SMS error:", error);
      setToastMsg("Failed to send SMS: " + error.message);
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setToastMsg("Enter the 6-digit verification code.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setToastMsg("Phone authentication successful!");
      setTimeout(() => {
        setToastMsg('');
        setActiveTab('home');
      }, 1500);
    } catch (error) {
      setToastMsg("Invalid verification code.");
      setTimeout(() => setToastMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">{isLoginMode ? 'Welcome back' : 'Create an account'}</h1>
        <p className="text-gray-400 text-xs">Secure your creator subscriptions across all your devices.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-[#12151c] p-1.5 rounded-xl border border-gray-800">
        <button 
          type="button" 
          onClick={() => { setMethod('phone'); setStep('phone-input'); }}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-[#00F0FF] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          📱 Phone (SMS OTP)
        </button>
        <button 
          type="button" 
          onClick={() => setMethod('email')}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${method === 'email' ? 'bg-[#00F0FF] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          ✉️ Email & Password
        </button>
      </div>

      {method === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4 bg-[#12151c] border border-gray-800 rounded-2xl p-6">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
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
                id="ageCheckEmail" 
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
                className="mt-1 w-4 h-4 rounded bg-black border-gray-800 text-[#00F0FF] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="ageCheckEmail" className="text-[11px] text-gray-400 cursor-pointer leading-relaxed">
                I am 18 or older and accept the <span className="text-[#00F0FF] underline">Terms</span> and <span className="text-[#00F0FF] underline">Privacy Policy</span>.
              </label>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all disabled:opacity-50">
            {loading ? "PROCESSING..." : (isLoginMode ? 'Log in with Email' : 'Create account')}
          </button>
        </form>
      ) : (
        <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-4">
          {step === 'phone-input' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-[#00F0FF]" />
                  </div>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712 345 678" 
                    className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              {!isLoginMode && (
                <div className="flex items-start gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="ageCheckPhone" 
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded bg-black border-gray-800 text-[#00F0FF] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="ageCheckPhone" className="text-[11px] text-gray-400 cursor-pointer leading-relaxed">
                    I am 18 or older and accept the <span className="text-[#00F0FF] underline">Terms</span> and <span className="text-[#00F0FF] underline">Privacy Policy</span>.
                  </label>
                </div>
              )}

              <div id="recaptcha-container"></div>

              <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all disabled:opacity-50">
                {loading ? "SENDING CODE..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Enter 6-Digit OTP Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  maxLength={6}
                  className="w-full bg-black text-white font-mono text-center tracking-widest text-lg border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all disabled:opacity-50">
                {loading ? "VERIFYING..." : "Verify Code & Login"}
              </button>

              <button 
                type="button" 
                onClick={() => setStep('phone-input')}
                className="w-full text-center text-xs text-gray-400 hover:text-white pt-2"
              >
                ← Change Phone Number
              </button>
            </form>
          )}
        </div>
      )}

      <div className="text-center">
        <button onClick={() => setActiveTab(isLoginMode ? 'signup' : 'login')} className="text-xs text-gray-400 hover:text-white">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <span className="text-[#00F0FF] font-bold">{isLoginMode ? 'Sign up' : 'Log in'}</span>
        </button>
      </div>
    </div>
  );
};

// --- Policy Layout ---
const PolicyLayout = ({ activeTab, setActiveTab }) => {
  const getPolicyContent = () => {
    switch (activeTab) {
      case 'terms':
        return {
          title: "Terms of Service",
          content: "Welcome to Thika Superhighway Premium. By accessing or subscribing to content on our platform, you agree to these terms. All purchases made via M-Pesa are final. Content is protected by digital rights management and anti-piracy tracking. Unauthorized downloading, screen recording, or redistribution will result in immediate account termination and permanent device blacklisting."
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
          content: "Thika Superhighway Premium respects the intellectual property and privacy rights of all creators and individuals. If you believe your copyrighted work or personal media has been posted on our platform without authorization, we will review and remove it expeditiously."
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

// --- Footer ---
const Footer = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#05070a] border-t border-gray-800/80 px-4 py-8 mt-16 text-xs text-gray-500 space-y-6 max-w-6xl mx-auto w-full rounded-t-2xl">
      <p className="text-[11px] leading-relaxed text-gray-400 max-w-2xl">
        Thika Superhighway Premium brings you exclusive videos and photos from the creators you follow, with new content added all the time. Subscribe for full access, or create a free account to keep your access on every device.
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
        © 2026 Thika Superhighway Premium. All rights reserved.
      </div>
    </footer>
  );
};

// --- Main App Controller ---
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toastMsg, setToastMsg] = useState('');
  const [vaults, setVaults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('thika_customer_phone') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, price: 0, status: 'waiting' });
  
  const [selectedVaultId, setSelectedVaultId] = useState('QCVwrsVuEtlAQ3PMziVs');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [activeVault, setActiveVault] = useState(null);

  const isOwner = currentUser && currentUser.email === OWNER_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToastMsg("Logged out successfully");
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        <Header activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUser={currentUser} handleLogout={handleLogout} isOwner={isOwner} />
        
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
          
          {/* Secured Admin Dashboard Route */}
          {activeTab === 'admin' && isOwner && (
            <AdminLayout vaults={vaults} setVaults={setVaults} setToastMsg={setToastMsg} setActiveTab={setActiveTab} setSelectedVaultId={setSelectedVaultId} />
          )}

          {['terms', 'privacy', 'cookies', 'disclaimer', 'takedown'].includes(activeTab) && (
            <PolicyLayout activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}