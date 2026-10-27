import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { db, auth } from './firebase';
import { 
  Send, Home, Compass, Crown, User, Smartphone, Play, Lock, 
  CheckCircle2, Flame, Shield, LogOut, CreditCard, Zap,
  Search, Filter, Phone, History, PlusCircle, Trash2, LayoutDashboard,
  Loader2, MessageSquare, Menu, X, Star, Sparkles, Tv, Eye, Heart, 
  Image as ImageIcon, Film, Maximize2, Bitcoin, Bookmark, Bell, Monitor, Settings, PlayCircle, Check
} from 'lucide-react';
import PwaInstallPrompt from './PwaInstallPrompt';
const OWNER_EMAIL = "kwinpat30@gmail.com"; 

// --- Reusable Toast Component ---
const Toast = ({ msg }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[150] bg-green-500/90 backdrop-blur-sm text-black px-4 py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] text-sm font-bold flex items-center gap-2 w-[90%] max-w-sm border border-green-400 animate-in fade-in slide-in-from-top-5">
    <CheckCircle2 size={18} /> {msg}
  </div>
);

// --- Custom Silhouette Logo Component ---
const Logo = () => (
  <div className="flex items-center gap-3 cursor-pointer group">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FFD700] via-[#12151c] to-[#00F0FF] p-[1px] shadow-[0_0_15px_rgba(0,240,255,0.3)]">
      <div className="w-full h-full bg-[#0A0C10] rounded-xl flex items-center justify-center overflow-hidden relative">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#FFD700] group-hover:scale-110 transition-transform duration-300" fill="currentColor">
          <path d="M12 2a2.5 2.5 0 00-2.5 2.5c0 1.15.77 2.12 1.83 2.42v.58c-2.8.6-4.33 3.1-4.33 6 0 2.2 1.2 4.6 2.5 6.5V22h5v-2c1.3-1.9 2.5-4.3 2.5-6.5 0-2.9-1.53-5.4-4.33-6v-.58c1.06-.3 1.83-1.27 1.83-2.42A2.5 2.5 0 0012 2z" />
        </svg>
      </div>
    </div>
    <div className="flex flex-col uppercase tracking-tighter font-black leading-none">
      <span className="text-[#00F0FF] text-sm md:text-base tracking-wider">Thika</span>
      <span className="text-[#FFD700] text-[9px] tracking-[0.25em]">Superhighway</span>
    </div>
  </div>
);

// --- Mobile Slide-Out Menu ---
const MobileMenu = ({ isOpen, setIsOpen, setActiveTab, currentUser, handleLogout, isOwner }) => {
  if (!isOpen) return null;
  
  const handleNav = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex animate-in fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      <div className="relative w-72 h-full bg-[#0A0C10] border-r border-gray-800 p-6 flex flex-col shadow-2xl animate-in slide-in-from-left">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <span className="text-white font-black text-lg">Menu</span>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white bg-gray-900 p-1.5 rounded-full"><X size={18}/></button>
        </div>
        
        <div className="flex flex-col gap-5 text-sm font-bold text-gray-300">
          {isOwner && (
            <button onClick={() => handleNav('admin')} className="flex items-center gap-3 text-[#00F0FF] hover:underline transition-colors bg-[#00F0FF]/10 p-3 rounded-xl border border-[#00F0FF]/30">
              <LayoutDashboard size={20}/> Admin Control Center
            </button>
          )}

          {!currentUser ? (
            <>
              <button onClick={() => handleNav('signup')} className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors"><User size={20} className="text-gray-500"/> Create account</button>
              <button onClick={() => handleNav('login')} className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors"><LogOut size={20} className="text-gray-500"/> Log in</button>
            </>
          ) : (
            <>
              <button onClick={() => handleNav('account')} className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors text-[#00F0FF]"><User size={20}/> My Account</button>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-3 hover:text-red-400 transition-colors"><LogOut size={20} className="text-gray-500"/> Log out</button>
            </>
          )}
          
          <button onClick={() => handleNav('restore')} className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors"><History size={20} className="text-gray-500"/> Restore access</button>
          <button onClick={() => handleNav('creators')} className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors"><Star size={20} className="text-gray-500"/> Creators</button>
          <a href="https://t.me/mr_exposes" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors"><Send size={20} className="text-[#00F0FF]"/> Telegram channel</a>
          <button onClick={() => handleNav('membership')} className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors"><Crown size={20} className="text-[#FFD700]"/> Membership Perks</button>
          <button onClick={() => handleNav('takedown')} className="flex items-center gap-3 hover:text-[#00F0FF] transition-colors"><Shield size={20} className="text-gray-500"/> Get help / Support</button>
        </div>
      </div>
    </div>
  );
};

// --- Mobile Bottom Navigation Bar ---
const BottomNav = ({ activeTab, setActiveTab, setIsMobileMenuOpen, currentUser }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0C10]/95 backdrop-blur-xl border-t border-gray-800 pb-2">
      <div className="flex justify-around items-center h-16">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'home' ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Home size={22} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => setActiveTab('creators')} className={`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'creators' ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Compass size={22} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Explore</span>
        </button>
        <button onClick={() => setActiveTab('membership')} className={`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'membership' ? 'text-[#FFD700]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Crown size={22} className={activeTab === 'membership' ? 'text-[#FFD700]' : ''} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Subscribe</span>
        </button>
        <button onClick={() => currentUser ? setActiveTab('account') : setIsMobileMenuOpen(true)} className={`flex flex-col items-center gap-1 w-1/4 ${activeTab === 'account' ? 'text-[#00F0FF]' : 'text-gray-500 hover:text-gray-300'}`}>
          <User size={22} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Account</span>
        </button>
      </div>
    </div>
  );
};

// --- Top Navigation Bar ---
const Header = ({ activeTab, setActiveTab, searchQuery, setSearchQuery, currentUser, handleLogout, isOwner, setIsMobileMenuOpen }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0A0C10]/95 backdrop-blur-xl border-b border-gray-800/80 px-4 py-3 w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-300 hover:text-white p-1">
            <Menu size={24} />
          </button>
          <div onClick={() => setActiveTab('home')}><Logo /></div>
        </div>

        <div className="hidden md:flex relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search videos, creators, tags..." className="w-full bg-[#12151c] text-white text-xs border border-gray-800 rounded-full py-2 pl-9 pr-4 focus:outline-none focus:border-[#00F0FF] transition-colors" />
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="hidden md:flex items-center gap-2">
              {isOwner && (
                <button onClick={() => setActiveTab('admin')} className={`text-xs font-bold px-3 py-2 rounded-full border transition-all flex items-center gap-1 ${activeTab === 'admin' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-gray-900 text-[#00F0FF] border-gray-800 hover:border-[#00F0FF]'}`}>
                  <LayoutDashboard size={14}/> Admin
                </button>
              )}
              <button onClick={() => setActiveTab('account')} className={`text-xs font-bold px-3 py-2 rounded-full border transition-all flex items-center gap-1 ${activeTab === 'account' ? 'bg-[#00F0FF] text-black border-[#00F0FF]' : 'bg-gray-900 text-white border-gray-800 hover:border-gray-600'}`}>
                <User size={14}/> Account
              </button>
            </div>
          ) : (
            <button onClick={() => setActiveTab('login')} className="text-xs text-[#00F0FF] hover:underline hidden sm:block font-bold">Log in</button>
          )}
          <button onClick={() => setActiveTab('membership')} className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black px-5 py-2 rounded-full text-xs transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] flex items-center gap-1.5">
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
          { id: 'popular', label: 'Most Popular' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${activeTab === tab.id ? 'text-[#00F0FF] border-[#00F0FF]' : 'text-gray-400 border-transparent hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};

// --- User Account Dashboard ---
const AccountLayout = ({ currentUser, customerPhone, setCustomerPhone, handleLogout, setActiveTab, setSelectedVaultId, setSelectedCreator, setToastMsg }) => {
  const [subTab, setSubTab] = useState('subscriptions');
  const [bookmarks, setBookmarks] = useState(() => JSON.parse(localStorage.getItem('thika_bookmarks') || '[]'));
  const [followedCreators, setFollowedCreators] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "follows"), where("userId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFollowedCreators(list);
    });
    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    setActiveTab('login');
    return null;
  }

  const handleUpdatePhone = () => {
    localStorage.setItem('thika_customer_phone', customerPhone);
    setToastMsg("M-Pesa phone number updated!");
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 shrink-0 space-y-2 flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none border-b md:border-b-0 border-gray-800">
        <div className="hidden md:block mb-6 px-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00F0FF] to-blue-600 flex items-center justify-center text-xl font-black text-white mb-3">
            {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : <User />}
          </div>
          <h2 className="text-white font-bold truncate">{currentUser.email || currentUser.phoneNumber || 'User'}</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Premium Member</p>
        </div>

        {[
          { id: 'subscriptions', icon: <Crown size={16}/>, label: 'My Vaults' },
          { id: 'following', icon: <Heart size={16}/>, label: 'Following' },
          { id: 'bookmarks', icon: <Bookmark size={16}/>, label: 'Bookmarks' },
          { id: 'history', icon: <PlayCircle size={16}/>, label: 'History' },
          { id: 'billing', icon: <CreditCard size={16}/>, label: 'Billing & Tiers' },
          { id: 'settings', icon: <Settings size={16}/>, label: 'Settings & Security' },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setSubTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all text-sm font-bold w-full ${subTab === item.id ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20' : 'text-gray-400 hover:text-white hover:bg-gray-900 border border-transparent'}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
        
        <div className="hidden md:block pt-8 px-4">
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={14}/> Sign Out Securely
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        {subTab === 'subscriptions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><Crown className="text-[#FFD700]"/> Unlocked Vaults</h3>
            <p className="text-xs text-gray-400 pb-4 border-b border-gray-800">Content you have full or sneak-peek access to.</p>
            
            <div className="bg-[#12151c] border border-gray-800 border-dashed rounded-2xl p-10 text-center space-y-3">
              <Compass size={32} className="text-gray-600 mx-auto" />
              <p className="text-sm font-bold text-gray-300">No active subscriptions yet</p>
              <button onClick={() => setActiveTab('home')} className="text-xs text-[#00F0FF] hover:underline font-bold">Explore Premium Vaults</button>
            </div>
          </div>
        )}

        {subTab === 'bookmarks' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><Bookmark className="text-[#00F0FF]"/> Saved Media</h3>
            <p className="text-xs text-gray-400 pb-4 border-b border-gray-800">Your personal curated gallery of favorite photos and videos.</p>
            
            {bookmarks.length === 0 ? (
              <div className="bg-[#12151c] border border-gray-800 border-dashed rounded-2xl p-10 text-center space-y-3">
                <Bookmark size={32} className="text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">No bookmarks saved</p>
                <p className="text-xs text-gray-500">Click the bookmark icon in the media player to save items here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {bookmarks.map((item, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-800 group">
                    <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-[#00F0FF] flex items-center gap-1 border border-gray-800">
                      {item.type === 'video' ? <Film size={12}/> : <ImageIcon size={12}/>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {subTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><PlayCircle className="text-green-400"/> Continue Watching</h3>
            <p className="text-xs text-gray-400 pb-4 border-b border-gray-800">Jump right back into your recently viewed streams.</p>
            <div className="bg-[#12151c] border border-gray-800 border-dashed rounded-2xl p-10 text-center">
              <p className="text-sm font-bold text-gray-300">Your history is currently clear.</p>
            </div>
          </div>
        )}

        {subTab === 'following' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2"><Heart className="text-red-400"/> Followed Creators</h3>
            <p className="text-xs text-gray-400 pb-4 border-b border-gray-800">Creators you have followed for quick access.</p>
            
            {followedCreators.length === 0 ? (
              <div className="bg-[#12151c] border border-gray-800 border-dashed rounded-2xl p-10 text-center space-y-3">
                <Heart size={32} className="text-gray-600 mx-auto" />
                <p className="text-sm font-bold text-gray-300">You are not following any creators yet.</p>
                <button onClick={() => setActiveTab('creators')} className="text-xs text-[#00F0FF] hover:underline font-bold">Discover Creators</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {followedCreators.map((creator) => (
                  <div 
                    key={creator.id} 
                    onClick={() => { setSelectedVaultId(creator.creatorId); setSelectedCreator(creator); setActiveTab('vip'); }}
                    className="bg-[#12151c] border border-gray-800 rounded-xl p-4 text-center cursor-pointer hover:border-[#00F0FF] transition-all space-y-2 shadow-lg"
                  >
                    <img src={creator.img} alt={creator.title} className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[#00F0FF]/50" />
                    <h4 className="text-white font-bold text-xs truncate">{creator.title}</h4>
                    <span className="text-[10px] text-[#00F0FF] font-bold">View Vault →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {subTab === 'billing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2"><CreditCard className="text-gray-300"/> Billing Ledger</h3>
              <p className="text-xs text-gray-400 pb-4 border-b border-gray-800">A record of your M-Pesa transactions and receipt codes.</p>
            </div>
            
            <div className="overflow-x-auto bg-[#12151c] border border-gray-800 rounded-xl">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900 border-b border-gray-800 text-gray-500 uppercase text-[10px]">
                  <tr><th className="p-4">Date</th><th className="p-4">Vault / Tier</th><th className="p-4">Receipt Code</th><th className="p-4 text-right">Amount</th></tr>
                </thead>
                <tbody>
                  <tr><td colSpan="4" className="p-6 text-center text-gray-500 italic">No transactions found.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {subTab === 'settings' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2"><Settings className="text-gray-300"/> Account Configuration</h3>
              
              <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-4">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Default M-Pesa Number</label>
                <p className="text-[10px] text-gray-500 mb-2">Used for faster checkouts and receipt recovery.</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={16} className="text-[#00F0FF]" /></div>
                    <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0712345678" className="w-full bg-black text-white font-mono border border-gray-700 rounded-xl py-2.5 pl-10 pr-3 text-sm focus:border-[#00F0FF] focus:outline-none" />
                  </div>
                  <button onClick={handleUpdatePhone} className="bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors">Save</button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2"><Monitor className="text-gray-300"/> Active Devices</h3>
              <p className="text-xs text-gray-400 pb-4 border-b border-gray-800">Manage devices currently logged into your account to prevent unauthorized sharing.</p>
              
              <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-4 divide-y divide-gray-800/60">
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <Smartphone size={20} className="text-[#00F0FF]" />
                    <div>
                      <p className="text-sm text-white font-bold">Current Device</p>
                      <p className="text-[10px] text-green-400 uppercase tracking-wider">Active Now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:hidden pt-4 pb-12 border-t border-gray-800">
              <button onClick={handleLogout} className="w-full flex justify-center items-center gap-2 bg-gray-900 border border-gray-800 text-sm font-bold text-red-400 hover:bg-gray-800 py-4 rounded-xl transition-colors">
                <LogOut size={16}/> Sign Out Securely
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Admin Dashboard ---
const AdminLayout = ({ vaults, setVaults, setToastMsg, setActiveTab, setSelectedVaultId }) => {
  const [creatorName, setCreatorName] = useState('');
  const [title, setTitle] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [sneakPeekPrice, setSneakPeekPrice] = useState('50');
  const [lifetimePrice, setLifetimePrice] = useState('150');
  const [globalPrice, setGlobalPrice] = useState('1500');
  const [imgUrl, setImgUrl] = useState('');
  const [mediaList, setMediaList] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [isImageUploading, setIsImageUploading] = useState(false);
  const CLOUDINARY_CLOUD_NAME = "dfw62f3ry"; 
  const CLOUDINARY_UPLOAD_PRESET = "thika_preset"; 

  const [isUploading, setIsUploading] = useState(false);
  const BUNNY_LIBRARY_ID = "789594";
  const BUNNY_API_KEY = "b04bfe12-c288-49c6-b90e1efb5008-874a-4003";

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImageUploading(true);
    setToastMsg("Uploading cover thumbnail...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setImgUrl(data.secure_url);
        setToastMsg("Cover thumbnail uploaded!");
      }
    } catch (error) {
      setToastMsg("Error uploading image: " + error.message);
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleMediaUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (type === 'video') {
      setIsUploading(true);
      for (const file of files) {
        setToastMsg(`Uploading video ${file.name} to Bunny.net...`);
        try {
          const createRes = await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`, {
            method: 'POST',
            headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ title: file.name })
          });
          const createData = await createRes.json();
          const videoId = createData.guid;

          await fetch(`https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
            method: 'PUT',
            headers: { 'AccessKey': BUNNY_API_KEY },
            body: file
          });

          setMediaList(prev => [...prev, { type: 'video', urlOrId: videoId, thumb: imgUrl || "https://images.unsplash.com/photo-1570872626485-d8ffea69f463?q=80&w=600&auto=format&fit=crop" }]);
        } catch (err) {
          console.error(err);
        }
      }
      setIsUploading(false);
      setToastMsg("Videos added successfully!");
    } else if (type === 'image') {
      setIsImageUploading(true);
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
          const data = await res.json();
          if (data.secure_url) {
            setMediaList(prev => [...prev, { type: 'image', urlOrId: data.secure_url, thumb: data.secure_url }]);
          }
        } catch (err) {
          console.error(err);
        }
      }
      setIsImageUploading(false);
      setToastMsg("Gallery photos added successfully!");
    }
  };

  const handleCreateVault = async (e) => {
    e.preventDefault();
    if (!creatorName || !title || !imgUrl || mediaList.length === 0) {
      setToastMsg("Provide a creator name, vault title, cover image, and media.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "vaults"), {
        creatorName: creatorName.trim(),
        title: title.trim(),
        isFeatured: isFeatured,
        pricing: { sneakPeek: Number(sneakPeekPrice), lifetime: Number(lifetimePrice), global: Number(globalPrice) },
        mediaCount: `${mediaList.length} items`,
        img: imgUrl.trim(),
        mediaList: mediaList, 
        status: 'locked',
        createdAt: new Date()
      });
      setVaults(prev => [...prev, { 
        id: docRef.id, creatorName, title, isFeatured,
        pricing: { sneakPeek: Number(sneakPeekPrice), lifetime: Number(lifetimePrice), global: Number(globalPrice) }, 
        mediaCount: `${mediaList.length} items`, img: imgUrl, mediaList, status: 'locked' 
      }]);
      setCreatorName(''); setTitle(''); setIsFeatured(false); setImgUrl(''); setMediaList([]);
      setToastMsg("New immersive vault published successfully!");
      setTimeout(() => setToastMsg(''), 3000);
    } catch (error) {
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
          <p className="text-gray-400 text-xs mt-1">Publish vaults with creator names, tiered pricing & mixed media.</p>
        </div>
        <button onClick={() => setActiveTab('home')} className="text-xs bg-gray-900 border border-gray-800 hover:text-white px-4 py-2 rounded-xl text-gray-300 font-bold">
          View Live Site →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle size={16} className="text-[#FFD700]" /> Publish Immersive Vault
          </h3>

          <form onSubmit={handleCreateVault} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Creator Name</label>
                <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="E.G. Nairobi Vixen" className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#00F0FF]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Vault Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.G. Rooftop VIP Set" className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#00F0FF]" />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/40 border border-gray-800 p-3 rounded-xl">
              <input type="checkbox" id="featuredToggle" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded bg-black border-gray-800 text-[#00F0FF] focus:ring-0 cursor-pointer" />
              <label htmlFor="featuredToggle" className="text-xs text-gray-300 font-bold cursor-pointer select-none">
                🌟 Feature this vault as the Homepage Hero Drop
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sneak Peek (KES)</label>
                <input type="number" value={sneakPeekPrice} onChange={(e) => setSneakPeekPrice(e.target.value)} className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-2 px-2 focus:outline-none focus:border-[#FFD700]"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lifetime (KES)</label>
                <input type="number" value={lifetimePrice} onChange={(e) => setLifetimePrice(e.target.value)} className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-2 px-2 focus:outline-none focus:border-[#FFD700]"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Global Pass (KES)</label>
                <input type="number" value={globalPrice} onChange={(e) => setGlobalPrice(e.target.value)} className="w-full bg-black text-[#00F0FF] font-mono text-xs border border-gray-800 rounded-xl py-2 px-2 focus:outline-none focus:border-[#00F0FF]"/>
              </div>
            </div>

            <div className="p-3 border border-gray-700 rounded-xl bg-black/50">
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1 flex items-center gap-1">
                <ImageIcon size={14} className="text-[#00F0FF]" /> Cover Thumbnail Image
              </label>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#00F0FF]/10 file:text-[#00F0FF]" />
              {imgUrl && <p className="text-[10px] text-green-400 mt-1">Cover set successfully!</p>}
            </div>

            <div className="p-3 border border-gray-700 rounded-xl bg-black/50">
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1 flex items-center gap-1">
                <Film size={14} className="text-[#00F0FF]" /> Add Secure Videos (Bunny.net)
              </label>
              <input type="file" accept="video/*" multiple onChange={(e) => handleMediaUpload(e, 'video')} disabled={isUploading} className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#FFD700]/10 file:text-[#FFD700]" />
              {isUploading && <p className="text-[10px] text-[#FFD700] animate-pulse mt-1">Uploading videos...</p>}
            </div>

            <div className="p-3 border border-gray-700 rounded-xl bg-black/50">
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1 flex items-center gap-1">
                <ImageIcon size={14} className="text-green-400" /> Add Gallery Photos (Cloudinary)
              </label>
              <input type="file" accept="image/*" multiple onChange={(e) => handleMediaUpload(e, 'image')} disabled={isImageUploading} className="w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-green-500/10 file:text-green-400" />
              {isImageUploading && <p className="text-[10px] text-green-400 animate-pulse mt-1">Uploading photos...</p>}
            </div>

            <div className="text-xs text-gray-400 font-mono bg-black p-3 rounded-xl border border-gray-800">
              Total items queued in this vault: <span className="text-[#FFD700] font-bold">{mediaList.length}</span>
            </div>

            <button type="submit" disabled={loading || isUploading || isImageUploading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg disabled:opacity-50">
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
            </div>
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
                <th className="pb-3">Creator / Title</th>
                <th className="pb-3">Featured</th>
                <th className="pb-3">Items</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {vaults.map((vault) => (
                <tr key={vault.id} className="hover:bg-black/30">
                  <td className="py-3"><img src={vault.img} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-800" /></td>
                  <td className="py-3">
                    <div className="font-bold text-white">{vault.creatorName || 'Creator'}</div>
                    <div className="text-[10px] text-gray-400">{vault.title}</div>
                  </td>
                  <td className="py-3">
                    {vault.isFeatured ? <span className="bg-[#FFD700]/20 text-[#FFD700] text-[10px] px-2 py-0.5 rounded font-bold">Featured</span> : <span className="text-gray-500 text-[10px]">Standard</span>}
                  </td>
                  <td className="py-3 text-gray-400 font-mono">{vault.mediaList?.length || 1} items</td>
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

// --- Home Layout / Tab Sorting Logic with Dynamic Featured Hero ---
const HomeLayout = ({ activeTab, setActiveTab, vaults, setSelectedVaultId, setSelectedCreator }) => {
  let displayedVaults = [...vaults];

  if (activeTab === 'latest') {
    displayedVaults.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } else if (activeTab === 'trending' || activeTab === 'popular') {
    displayedVaults.reverse();
  }

  const featuredDrop = vaults.find(v => v.isFeatured) || vaults[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-in fade-in">
      {activeTab === 'home' && featuredDrop && (
        <div 
          className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.15)] group cursor-pointer" 
          onClick={() => { setSelectedVaultId(featuredDrop.id); setSelectedCreator(featuredDrop); setActiveTab('vip'); }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-black/40 to-transparent z-10"></div>
          <img src={featuredDrop.img} alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute bottom-6 left-6 z-20 space-y-2">
            <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider inline-block">Featured Drop</span>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">{featuredDrop.creatorName ? `${featuredDrop.creatorName} — ` : ''}{featuredDrop.title}</h2>
            <p className="text-gray-300 text-xs md:text-sm max-w-xl line-clamp-2">Get unrestricted access to unreleased private sets, live streams, and high-definition creator archives.</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Flame size={16} className="text-[#FFD700]"/> {activeTab === 'latest' ? 'Latest Releases' : activeTab === 'trending' ? 'Trending Content' : activeTab === 'popular' ? 'Most Popular Vaults' : 'Exclusive Content Vaults'}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayedVaults.map((vault) => {
            const pricing = vault.pricing || { sneakPeek: vault.price || 50, lifetime: 150, global: 1500 };
            return (
              <div 
                key={vault.id} 
                onClick={() => { setSelectedVaultId(vault.id); setSelectedCreator(vault); setActiveTab('vip'); }} 
                className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group bg-gray-900 border border-gray-800 hover:border-[#00F0FF]/50 transition-all shadow-lg"
              >
                <img src={vault.img} alt={vault.title} className="w-full h-full object-cover blur-[1px] opacity-70 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div className="absolute top-3 right-3 flex gap-1">
                  {vault.isFeatured && <span className="bg-[#FFD700] text-black text-[9px] font-black px-1.5 py-0.5 rounded">FEATURED</span>}
                  <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded text-gray-300 border border-gray-700">
                    {vault.mediaList?.length || 1} items
                  </span>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-gray-500/50">
                    <Lock size={18} className="text-[#FFD700]" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[10px] text-[#00F0FF] font-bold uppercase tracking-wider">{vault.creatorName || 'Verified Creator'}</div>
                  <h4 className="text-white font-bold text-sm leading-tight line-clamp-1">{vault.title}</h4>
                  <div className="text-[10px] text-[#FFD700] font-mono mt-0.5">From KES {pricing.sneakPeek}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Creator Directory Layout ---
const CreatorDirectoryLayout = ({ vaults, setSelectedVaultId, setSelectedCreator, setActiveTab }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Star className="text-[#FFD700]" /> Verified Creators & Performers
        </h1>
        <p className="text-gray-400 text-xs mt-1">Explore exclusive creator channels and browse their private content archives.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {vaults.map((vault) => (
          <div 
            key={vault.id} 
            onClick={() => { setSelectedVaultId(vault.id); setSelectedCreator(vault); setActiveTab('vip'); }}
            className="bg-[#12151c] border border-gray-800 hover:border-[#00F0FF] rounded-2xl p-5 text-center cursor-pointer transition-all space-y-3 group shadow-lg"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-[#00F0FF]/50 shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:scale-105 transition-transform">
              <img src={vault.img} alt={vault.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm truncate">{vault.creatorName || vault.title}</h3>
              <p className="text-[10px] text-gray-400 mt-1 font-mono">{vault.mediaList?.length || 1} Media Items</p>
            </div>
            <button className="w-full bg-gray-900 border border-gray-800 group-hover:bg-[#00F0FF] group-hover:text-black group-hover:border-[#00F0FF] text-[#00F0FF] font-bold py-2 rounded-xl text-xs transition-colors">
              View Vault →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- VIP Layout ---
const VIPLayout = ({ activeVault, customerPhone, setCustomerPhone, handlePayment, setActiveTab, setToastMsg }) => {
  const [position, setPosition] = useState({ top: '15%', left: '15%' });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activeModalItem, setActiveModalItem] = useState(null); 
  const [checkoutStep, setCheckoutStep] = useState(0); 
  const [selectedTierPrice, setSelectedTierPrice] = useState(0);
  
  const isUnlocked = activeVault?.status === 'unlocked';
  const mediaList = activeVault?.mediaList || [{ type: 'video', urlOrId: '88d804ba-1b4f-4443-b238-c2b87fde1e81', thumb: activeVault?.img }];
  const pricing = activeVault?.pricing || { sneakPeek: activeVault?.price || 50, lifetime: 150, global: 1500 };

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition({ top: `${Math.floor(Math.random() * 70) + 10}%`, left: `${Math.floor(Math.random() * 60) + 10}%` });
    }, 4000);
    const clockInterval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => { clearInterval(moveInterval); clearInterval(clockInterval); };
  }, []);

  const saveBookmark = (item) => {
    const existing = JSON.parse(localStorage.getItem('thika_bookmarks') || '[]');
    if (!existing.some(b => b.urlOrId === item.urlOrId)) {
      const updated = [...existing, item];
      localStorage.setItem('thika_bookmarks', JSON.stringify(updated));
      setToastMsg("Saved to Bookmarks!");
    } else {
      setToastMsg("Already in Bookmarks.");
    }
    setTimeout(() => setToastMsg(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in">
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <img src={activeVault?.img || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop"} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 z-0" />
        
        <div className="relative z-20 w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-[#00F0FF]/50 shrink-0 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <img src={activeVault?.img || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop"} alt={activeVault?.title} className="w-full h-full object-cover" />
        </div>

        <div className="relative z-20 text-center md:text-left space-y-2 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {isUnlocked ? 'Unlocked Access' : (activeVault?.creatorName || 'Exclusive Creator')}
            </span>
            <span className="bg-black/60 text-gray-300 border border-gray-700 text-[10px] font-bold px-3 py-1 rounded-full font-mono">
              {mediaList.length} Items Included
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{activeVault?.title || 'Thika Superhighway Premium Lounge'}</h1>
          <p className="text-gray-300 text-xs max-w-lg leading-relaxed">
            {isUnlocked ? 'Explore the full mixed-media archive below. Tap any item to launch the immersive player.' : `Unlock this complete collection of ${mediaList.length} high-definition videos and photo sets instantly.`}
          </p>
        </div>
      </div>

      {isUnlocked ? (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={16} className="text-[#FFD700]" /> Unlocked Media Gallery
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaList.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveModalItem(item)}
                className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-800 group cursor-pointer hover:border-[#00F0FF] transition-all shadow-lg"
              >
                <img src={item.thumb || activeVault?.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-[#00F0FF] flex items-center gap-1 border border-gray-800">
                  {item.type === 'video' ? <Film size={12}/> : <ImageIcon size={12}/>}
                  {item.type.toUpperCase()}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Maximize2 size={24} className="text-white" />
                </div>
              </div>
            ))}
          </div>

          {activeModalItem && (
            <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in">
              <div className="absolute top-6 right-6 flex items-center gap-3 z-30">
                <button onClick={() => saveBookmark(activeModalItem)} className="bg-gray-900 border border-gray-700 text-white p-3 rounded-full hover:bg-gray-800 transition-colors shadow-lg">
                  <Bookmark size={20} />
                </button>
                <button onClick={() => setActiveModalItem(null)} className="bg-gray-900 border border-gray-700 text-white p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800 relative shadow-[0_0_50px_rgba(0,240,255,0.2)]">
                {activeModalItem.type === 'video' ? (
                  <iframe 
                    src={`https://iframe.mediadelivery.net/embed/789594/${activeModalItem.urlOrId}?autoplay=true`} 
                    loading="lazy" 
                    style={{ border: 'none', position: 'absolute', top: 0, height: '100%', width: '100%' }} 
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                    allowFullScreen
                  />
                ) : (
                  <img src={activeModalItem.urlOrId} alt="" className="w-full h-full object-contain" />
                )}

                <div className="absolute z-20 text-white/25 font-mono text-xs tracking-widest pointer-events-none font-bold select-none bg-black/10 px-2 py-1 rounded backdrop-blur-[1px]" style={{ top: position.top, left: position.left }}>
                  {customerPhone || '+254 712 345 678'} &bull; {currentTime}
                </div>
              </div>

              <div className="w-full max-w-3xl mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {mediaList.map((m, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveModalItem(m)}
                    className={`w-20 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer border-2 transition-all ${activeModalItem.urlOrId === m.urlOrId ? 'border-[#00F0FF] scale-105' : 'border-gray-800 opacity-60'}`}
                  >
                    <img src={m.thumb} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {checkoutStep === 0 && (
            <div className="bg-[#12151c] rounded-2xl border border-gray-800 p-8 text-center max-w-sm mx-auto mt-6 shadow-2xl animate-in fade-in">
              <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                <Lock className="text-[#FFD700]" size={28} />
              </div>
              <h3 className="text-white font-bold mb-1 text-lg">Subscribe to see {activeVault?.creatorName || activeVault?.title || 'content'}</h3>
              <p className="text-gray-400 text-xs mb-6">{mediaList.length} media items unlock when you subscribe</p>
              <button onClick={() => { setCheckoutStep(1); setSelectedTierPrice(pricing.sneakPeek); }} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <Lock size={14} className="inline mr-2 -mt-1"/> Subscribe (From KES {pricing.sneakPeek})
              </button>
            </div>
          )}

          {checkoutStep > 0 && (
            <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4">
              <div className="bg-[#12151c] w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl border-t sm:border border-gray-800 p-5 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 shadow-2xl">
                
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-800/80">
                  <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                    {checkoutStep === 1 ? <Lock size={16} className="text-[#FFD700]"/> : <button onClick={()=>setCheckoutStep(1)} className="text-gray-400 hover:text-white">←</button>}
                    {checkoutStep === 1 ? `Subscribe to ${activeVault?.creatorName || 'Vault'}` : 'Paying with M-Pesa'}
                  </h3>
                  <button onClick={()=>setCheckoutStep(0)} className="text-gray-400 hover:text-white p-1 bg-gray-900 rounded-full"><X size={18}/></button>
                </div>

                {checkoutStep === 1 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 text-center mb-4 uppercase tracking-widest font-bold">Select Payment Method</p>
                    
                    <button onClick={()=>setCheckoutStep(2)} className="w-full flex justify-between items-center p-3.5 rounded-xl border border-gray-700 bg-black hover:border-[#00F0FF] hover:bg-gray-900 transition-all shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white text-[10px] font-black px-1.5 py-1 rounded">M-PESA</div>
                        <span className="text-sm font-bold text-white">M-Pesa</span>
                      </div>
                      <span className="text-xs text-[#FFD700] font-bold">KES <span className="ml-1 text-gray-400">{'>'}</span></span>
                    </button>
                    
                    <div className="w-full flex justify-between items-center p-3.5 rounded-xl border border-gray-800 bg-black/40 opacity-40 cursor-not-allowed">
                      <div className="flex items-center gap-3"><Shield size={18} className="text-blue-400"/><span className="text-sm font-bold text-white">Remitly</span></div>
                      <span className="text-xs text-gray-400 font-bold">USD {'>'}</span>
                    </div>
                    <div className="w-full flex justify-between items-center p-3.5 rounded-xl border border-gray-800 bg-black/40 opacity-40 cursor-not-allowed">
                      <div className="flex items-center gap-3"><Bitcoin size={18} className="text-[#FFD700]"/><span className="text-sm font-bold text-white">Crypto (USDT/BTC)</span></div>
                      <span className="text-xs text-gray-400 font-bold">USD {'>'}</span>
                    </div>

                    <div className="pt-4 text-center text-xs text-gray-400">
                      Already paid? <button onClick={()=>{ setCheckoutStep(0); setActiveTab('restore'); }} className="text-[#00F0FF] font-bold hover:underline">Restore access</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold mb-2">Select Access Tier</p>
                    
                    <button onClick={()=>setSelectedTierPrice(pricing.sneakPeek)} className={`w-full text-left p-3.5 rounded-xl border transition-all ${selectedTierPrice === pricing.sneakPeek ? 'border-[#FFD700] bg-[#FFD700]/10 shadow-[0_0_10px_rgba(255,215,0,0.1)]' : 'border-gray-800 bg-black'}`}>
                      <div className="flex justify-between items-center"><span className="text-sm text-white font-bold">Sneak Peek (24 hrs)</span><span className="text-[#FFD700] font-bold text-sm">KES {pricing.sneakPeek}</span></div>
                    </button>
                    
                    <button onClick={()=>setSelectedTierPrice(pricing.lifetime)} className={`w-full text-left p-3.5 rounded-xl border transition-all ${selectedTierPrice === pricing.lifetime ? 'border-[#FFD700] bg-[#FFD700]/10 shadow-[0_0_10px_rgba(255,215,0,0.1)]' : 'border-gray-800 bg-black'}`}>
                      <div className="flex justify-between items-center"><span className="text-sm text-white font-bold">Unlock Full Vault (Lifetime)</span><span className="text-[#FFD700] font-bold text-sm">KES {pricing.lifetime}</span></div>
                    </button>
                    
                    <button onClick={()=>setSelectedTierPrice(pricing.global)} className={`w-full text-left p-3.5 rounded-xl border transition-all ${selectedTierPrice === pricing.global ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'border-gray-800 bg-black'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white font-bold">Global All-Access (Monthly)</span>
                        <span className="text-[#00F0FF] font-bold text-sm">KES {pricing.global}</span>
                      </div>
                    </button>

                    <div className="pt-3 pb-1 border-t border-gray-800/80 mt-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Your M-Pesa Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={16} className="text-[#00F0FF]" /></div>
                        <input type="text" value={customerPhone} onChange={(e)=>setCustomerPhone(e.target.value)} placeholder="0712345678" className="w-full bg-black text-white font-mono border border-gray-700 rounded-xl py-3 pl-10 pr-3 text-sm focus:border-[#00F0FF] focus:outline-none" />
                      </div>
                    </div>

                    <button onClick={() => { setCheckoutStep(0); handlePayment('Selected Tier', selectedTierPrice || pricing.sneakPeek); }} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl mt-2 transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                      Pay KES {selectedTierPrice || pricing.sneakPeek} Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- Creator Profile Layout ---
const CreatorProfileLayout = ({ selectedCreator, currentUser, setActiveTab, setSelectedVaultId, setToastMsg }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!currentUser || !selectedCreator?.id) return;
    const checkFollow = async () => {
      const q = query(collection(db, "follows"), where("userId", "==", currentUser.uid), where("creatorId", "==", selectedCreator.id));
      const snap = await getDocs(q);
      setIsFollowing(!snap.empty);
    };
    checkFollow();
  }, [currentUser, selectedCreator]);

  if (!selectedCreator) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        <p>No creator selected.</p>
        <button onClick={() => setActiveTab('home')} className="mt-4 text-[#00F0FF] font-bold text-xs">Return to Feed</button>
      </div>
    );
  }

  const pricing = selectedCreator.pricing || { sneakPeek: selectedCreator.price || 50 };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      setToastMsg("Please log in to follow creators.");
      setTimeout(() => setToastMsg(''), 3000);
      setActiveTab('login');
      return;
    }

    try {
      const q = query(collection(db, "follows"), where("userId", "==", currentUser.uid), where("creatorId", "==", selectedCreator.id));
      const snap = await getDocs(q);

      if (!snap.empty) {
        for (const d of snap.docs) {
          await deleteDoc(doc(db, "follows", d.id));
        }
        setIsFollowing(false);
        setToastMsg("Removed from favourites.");
      } else {
        await addDoc(collection(db, "follows"), {
          userId: currentUser.uid,
          creatorId: selectedCreator.id,
          title: selectedCreator.creatorName || selectedCreator.title,
          img: selectedCreator.img,
          createdAt: new Date()
        });
        setIsFollowing(true);
        setToastMsg("Added to your favourites!");
      }
      setTimeout(() => setToastMsg(''), 2000);
    } catch (error) {
      setToastMsg("Error updating favorites.");
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-in fade-in">
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_25px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <img src={selectedCreator.img} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 z-0" />
        
        <div className="relative z-20 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-[#00F0FF]/50 shrink-0 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
          <img src={selectedCreator.img} alt={selectedCreator.title} className="w-full h-full object-cover" />
        </div>

        <div className="relative z-20 text-center md:text-left space-y-3 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">Verified Creator</span>
            <span className="text-xs text-gray-400 font-mono">{selectedCreator.mediaList?.length || 1} Media Items</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">{selectedCreator.creatorName || selectedCreator.title}</h1>
          <p className="text-gray-300 text-xs max-w-lg leading-relaxed">Exclusive performer and content creator. Subscribe to unlock full archive streams, weekend drops, and private clips.</p>
          
          <div className="pt-2 flex justify-center md:justify-start gap-3">
            <button onClick={handleToggleFollow} className={`border font-bold px-6 py-3 rounded-xl text-xs transition-colors flex items-center gap-2 ${isFollowing ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/40' : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-white'}`}>
              <Heart size={14} className={isFollowing ? 'fill-[#00F0FF]' : ''}/> {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button onClick={() => { setSelectedVaultId(selectedCreator.id); setActiveTab('vip'); }} className="bg-[#FFD700] hover:bg-[#e6c200] text-black font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2">
              <Lock size={14}/> Subscribe (KES {pricing.sneakPeek})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Smart Membership Layout ---
const MembershipLayout = ({ setActiveTab, currentUser }) => {
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
        {!currentUser ? (
          <>
            <button onClick={() => setActiveTab('signup')} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]">
              Create a free account
            </button>
            <button onClick={() => setActiveTab('login')} className="w-full bg-[#12151c] hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-xs border border-gray-800 transition-colors">
              Log in
            </button>
          </>
        ) : (
          <button onClick={() => setActiveTab('home')} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]">
            Explore Premium Vaults
          </button>
        )}
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
      const q = query(collection(db, "transactions"), where("mpesaCode", "==", mpesaCode.trim().toUpperCase()), where("phone", "==", phone.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setToastMsg("Access code verified! Restoring session...");
        setTimeout(() => { setToastMsg(''); setActiveTab('vip'); }, 2000);
      } else {
        setToastMsg("No matching transaction found. Check code & phone.");
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (error) {
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
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Payment code</label>
          <input type="text" value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value.toUpperCase())} placeholder="E.G. SJK3ABC12D" className="w-full bg-black text-white font-mono uppercase text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all disabled:opacity-50">
          {loading ? "VERIFYING RECEIPT..." : "Restore access"}
        </button>
      </form>

      <div className="text-center">
        <button onClick={() => setActiveTab('membership')} className="text-xs text-gray-400 hover:text-white">Back to <span className="text-[#00F0FF] font-bold">Membership</span></button>
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
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: () => {} });
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
      setTimeout(() => { setToastMsg(''); setActiveTab('home'); }, 1500);
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
      setTimeout(() => { setToastMsg(''); setActiveTab('home'); }, 1500);
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
        <button type="button" onClick={() => { setMethod('phone'); setStep('phone-input'); }} className={`py-2 text-xs font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-[#00F0FF] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>📱 Phone (SMS OTP)</button>
        <button type="button" onClick={() => setMethod('email')} className={`py-2 text-xs font-bold rounded-lg transition-all ${method === 'email' ? 'bg-[#00F0FF] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>✉️ Email & Password</button>
      </div>

      {method === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4 bg-[#12151c] border border-gray-800 rounded-2xl p-6">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-black text-white text-xs border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]" />
          </div>
          {!isLoginMode && (
            <div className="flex items-start gap-3 pt-2">
              <input type="checkbox" id="ageCheckEmail" checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} className="mt-1 w-4 h-4 rounded bg-black border-gray-800 text-[#00F0FF] focus:ring-0 cursor-pointer" />
              <label htmlFor="ageCheckEmail" className="text-[11px] text-gray-400 cursor-pointer leading-relaxed">I am 18 or older and accept the <span className="text-[#00F0FF] underline">Terms</span> and <span className="text-[#00F0FF] underline">Privacy Policy</span>.</label>
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={16} className="text-[#00F0FF]" /></div>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" className="w-full bg-black text-white font-mono text-xs border border-gray-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#00F0FF]" />
                </div>
              </div>
              {!isLoginMode && (
                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" id="ageCheckPhone" checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} className="mt-1 w-4 h-4 rounded bg-black border-gray-800 text-[#00F0FF] focus:ring-0 cursor-pointer" />
                  <label htmlFor="ageCheckPhone" className="text-[11px] text-gray-400 cursor-pointer leading-relaxed">I am 18 or older and accept the <span className="text-[#00F0FF] underline">Terms</span> and <span className="text-[#00F0FF] underline">Privacy Policy</span>.</label>
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
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} className="w-full bg-black text-white font-mono text-center tracking-widest text-lg border border-gray-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#00F0FF]" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black py-4 rounded-xl text-xs transition-all disabled:opacity-50">
                {loading ? "VERIFYING..." : "Verify Code & Login"}
              </button>
              <button type="button" onClick={() => setStep('phone-input')} className="w-full text-center text-xs text-gray-400 hover:text-white pt-2">← Change Phone Number</button>
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
        return { title: "Terms of Service", content: "Welcome to Thika Superhighway Premium. By accessing or subscribing to content on our platform, you agree to these terms. All purchases made via M-Pesa are final. Content is protected by digital rights management and anti-piracy tracking." };
      case 'privacy':
        return { title: "Privacy Policy", content: "We value your privacy. We only collect necessary transaction data (such as your M-Pesa phone number) required to process payments and verify active subscriptions." };
      case 'cookies':
        return { title: "Cookies Policy", content: "We use essential cookies and local storage tokens to ensure seamless video playback, authentication, and secure access across your devices." };
      case 'disclaimer':
        return { title: "Age Disclaimer", content: "This website contains adult and mature entertainment content. All users, subscribers, and performers must be 18 years of age or older." };
      case 'takedown':
        return { title: "Content and Takedown Policy", content: "Thika Superhighway Premium respects intellectual property and privacy rights. If you believe your copyrighted work or personal media has been posted without authorization, we will remove it expeditiously." };
      default:
        return { title: "Support & Legal Information", content: "For any inquiries, please contact our support team." };
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
        <div className="mt-8 pt-6 border-t border-gray-800 bg-black/40 p-4 rounded-xl border border-gray-800/80 space-y-2">
          <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-[#00F0FF]">Official Support Channels</h4>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a href="https://t.me/mr_exposes" target="_blank" rel="noreferrer" className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">Telegram: @mr_exposes</a>
            <a href="mailto:support@thikasuperhighwaypremium.com" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">Email Support</a>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button onClick={() => setActiveTab('home')} className="text-xs text-[#00F0FF] font-bold hover:underline">← Return to Home Feed</button>
      </div>
    </div>
  );
};

// --- Footer ---
const Footer = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#05070a] border-t border-gray-800/80 px-4 py-8 mt-16 pb-24 md:pb-8 text-xs text-gray-500 space-y-6 max-w-6xl mx-auto w-full rounded-t-2xl">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [vaults, setVaults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('thika_customer_phone') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, price: 0, status: 'waiting' });
  
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [activeVault, setActiveVault] = useState(null);

  const isOwner = currentUser && currentUser.email === OWNER_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setToastMsg("Logged out successfully");
    setTimeout(() => {
      setToastMsg('');
      setActiveTab('home');
    }, 2000);
  };

  useEffect(() => {
    if (customerPhone) localStorage.setItem('thika_customer_phone', customerPhone);
  }, [customerPhone]);

  useEffect(() => {
    const fetchVaults = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "vaults"));
        const vaultData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVaults(vaultData);
        if (vaultData.length > 0 && !selectedVaultId) setSelectedVaultId(vaultData[0].id);
      } catch (error) {
        console.error("Error fetching vaults:", error);
      }
    };
    fetchVaults();
  }, []);

  useEffect(() => {
    if (!selectedVaultId) return;
    const vaultRef = doc(db, 'vaults', selectedVaultId);
    const unsubscribe = onSnapshot(vaultRef, (docSnap) => {
      if (docSnap.exists()) setActiveVault({ id: docSnap.id, ...docSnap.data() });
    });
    return () => unsubscribe();
  }, [selectedVaultId]);

  const handlePayment = async (plan, price) => {
    let formattedPhone = customerPhone.trim();
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
    if (!formattedPhone || formattedPhone.length < 10) {
      setToastMsg("Enter a valid M-Pesa phone number!");
      setTimeout(() => setToastMsg(''), 3000);
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
          setToastMsg("STK push sent! Check your phone.");
          setTimeout(() => setToastMsg(''), 3000);
        }, 2000);
      } else {
        setPaymentModal({ isOpen: false, price: 0, status: 'waiting' });
        setToastMsg("Payment failed: " + (data.message || "Try again."));
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (error) {
      setPaymentModal({ isOpen: false, price: 0, status: 'waiting' });
      setToastMsg("Connection error.");
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-gray-200 font-sans selection:bg-[#00F0FF] selection:text-black flex flex-col justify-between pb-12 md:pb-0">
      {toastMsg && <Toast msg={toastMsg} />}
      
      <MobileMenu isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} setActiveTab={setActiveTab} currentUser={currentUser} handleLogout={handleLogout} isOwner={isOwner} />

      {paymentModal.isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#12151c] border border-gray-800 rounded-2xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-2xl">
            <Loader2 size={32} className="text-green-500 animate-spin mb-4" />
            <h3 className="text-lg font-black text-white mb-2">Prompting M-Pesa</h3>
            <p className="text-sm text-gray-400">Check <span className="text-[#00F0FF] font-mono">{customerPhone}</span> for KES {paymentModal.price}.</p>
          </div>
        </div>
      )}

      <div>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUser={currentUser} handleLogout={handleLogout} isOwner={isOwner} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        <main>
          {['home', 'trending', 'latest', 'popular', 'toprated'].includes(activeTab) && (
            <HomeLayout activeTab={activeTab} setActiveTab={setActiveTab} vaults={vaults} setSelectedVaultId={setSelectedVaultId} setSelectedCreator={setSelectedCreator} />
          )}
          {activeTab === 'creators' && (
            <CreatorDirectoryLayout vaults={vaults} setSelectedVaultId={setSelectedVaultId} setSelectedCreator={setSelectedCreator} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'account' && <AccountLayout currentUser={currentUser} customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} handleLogout={handleLogout} setActiveTab={setActiveTab} setSelectedVaultId={setSelectedVaultId} setSelectedCreator={setSelectedCreator} setToastMsg={setToastMsg} />}
          {activeTab === 'profile' && <CreatorProfileLayout selectedCreator={selectedCreator} currentUser={currentUser} setActiveTab={setActiveTab} setSelectedVaultId={setSelectedVaultId} setToastMsg={setToastMsg} />}
          {activeTab === 'vip' && <VIPLayout activeVault={activeVault} customerPhone={customerPhone} setCustomerPhone={setCustomerPhone} handlePayment={handlePayment} setActiveTab={setActiveTab} setToastMsg={setToastMsg} />}
          {activeTab === 'admin' && isOwner && <AdminLayout vaults={vaults} setVaults={setVaults} setToastMsg={setToastMsg} setActiveTab={setActiveTab} setSelectedVaultId={setSelectedVaultId} />}
          {activeTab === 'membership' && <MembershipLayout setActiveTab={setActiveTab} currentUser={currentUser} />}
          {activeTab === 'restore' && <RestoreLayout setActiveTab={setActiveTab} setToastMsg={setToastMsg} />}
          {activeTab === 'signup' && <AuthLayout setActiveTab={setActiveTab} setToastMsg={setToastMsg} isLoginMode={false} />}
          {activeTab === 'login' && <AuthLayout setActiveTab={setActiveTab} setToastMsg={setToastMsg} isLoginMode={true} />}
          {['terms', 'privacy', 'cookies', 'disclaimer', 'takedown'].includes(activeTab) && PolicyLayout({ activeTab, setActiveTab })}
        </main>
      </div>

      <Footer setActiveTab={setActiveTab} />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} setIsMobileMenuOpen={setIsMobileMenuOpen} currentUser={currentUser} />
      <PwaInstallPrompt />
    </div>
  );
}