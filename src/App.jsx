import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { db, auth } from './firebase';
import { 
  Send, Home, Compass, Crown, User, Smartphone, Play, Lock, 
  CheckCircle2, Flame, Shield, LogOut, CreditCard, Zap,
  Search, Filter, Phone, History, PlusCircle, Trash2, LayoutDashboard,
  Loader2, MessageSquare, Menu, X, Star, Sparkles, Tv, Eye, Heart, Image as ImageIcon, Film, Maximize2
} from 'lucide-react';

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

// --- Top Navigation Bar ---
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
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setImgUrl(data.secure_url);
        setToastMsg("Cover thumbnail uploaded!");
      } else {
        throw new Error(data.error?.message || "Upload failed");
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
        setToastMsg(`Uploading gallery photo...`);
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
    if (!title || !imgUrl || mediaList.length === 0) {
      setToastMsg("Please provide a title, cover image, and at least one media item.");
      setTimeout(() => setToastMsg(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "vaults"), {
        title: title.trim(),
        price: Number(price),
        mediaCount: `${mediaList.length} items`,
        img: imgUrl.trim(),
        mediaList: mediaList, 
        status: 'locked',
        createdAt: new Date()
      });

      setVaults(prev => [...prev, { id: docRef.id, title, price: Number(price), mediaCount: `${mediaList.length} items`, img: imgUrl, mediaList, status: 'locked' }]);
      setTitle('');
      setImgUrl('');
      setMediaList([]);
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
          <p className="text-gray-400 text-xs mt-1">Publish immersive vaults with mixed videos and photo galleries.</p>
        </div>
        <button onClick={() => setActiveTab('home')} className="text-xs bg-gray-900 border border-gray-800 hover:text-white px-4 py-2 rounded-xl text-gray-300 font-bold">
          View Live Site →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle size={16} className="text-[#FFD700]" /> Publish Immersive Content Vault
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
                  value={`${mediaList.length} items loaded`} 
                  disabled
                  className="w-full bg-black/50 text-gray-400 font-mono text-xs border border-gray-800 rounded-xl py-2.5 px-4"
                />
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
              <div className="bg-black/50 border border-gray-800/80 p-4 rounded-xl text-center">
                <span className="text-2xl font-black text-[#FFD700]">KES {vaults.reduce((acc, v) => acc + Number(v.price || 50), 0)}</span>
                <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">Catalog Value</p>
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
                <th className="pb-3">Title</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Price</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {vaults.map((vault) => (
                <tr key={vault.id} className="hover:bg-black/30">
                  <td className="py-3"><img src={vault.img} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-800" /></td>
                  <td className="py-3 font-bold text-white">{vault.title}</td>
                  <td className="py-3 text-gray-400 font-mono">{vault.mediaList?.length || 1} items</td>
                  <td className="py-3 text-[#FFD700] font-mono">KES {vault.price || 50}</td>
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
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Flame size={16} className="text-[#FFD700]"/> Exclusive Content Vaults
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vaults.map((vault) => (
            <div 
              key={vault.id} 
              onClick={() => { setSelectedVaultId(vault.id); setSelectedCreator(vault); setActiveTab('vip'); }} 
              className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group bg-gray-900 border border-gray-800 hover:border-[#00F0FF]/50 transition-all shadow-lg"
            >
              <img src={vault.img} alt={vault.title} className="w-full h-full object-cover blur-[1px] opacity-70 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              <div className="absolute top-3 right-3">
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
                <h4 className="text-white font-bold text-sm leading-tight line-clamp-1">{vault.title}</h4>
                <div className="text-[10px] text-[#FFD700] font-mono mt-0.5">KES {vault.price || 50} access</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- VIP Layout with Interactive Grid & Zoom Modal ---
const VIPLayout = ({ activeVault, customerPhone, setCustomerPhone, handlePayment }) => {
  const [position, setPosition] = useState({ top: '15%', left: '15%' });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [timeLeft, setTimeLeft] = useState("02:45:30");
  const [activeModalItem, setActiveModalItem] = useState(null); 
  
  const isUnlocked = activeVault?.status === 'unlocked';
  const mediaList = activeVault?.mediaList || [{ type: 'video', urlOrId: '88d804ba-1b4f-4443-b238-c2b87fde1e81', thumb: activeVault?.img }];

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition({ top: `${Math.floor(Math.random() * 70) + 10}%`, left: `${Math.floor(Math.random() * 60) + 10}%` });
    }, 4000);
    const clockInterval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => { clearInterval(moveInterval); clearInterval(clockInterval); };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in">
      <div className="border-b border-gray-800/80 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">{activeVault?.title || 'Immersive Lounge'}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isUnlocked ? 'Access unlocked. Tap any media item to view in full screen.' : 'Unlock this full gallery & video archive instantly.'}
        </p>
      </div>

      {isUnlocked ? (
        <div className="space-y-6">
          {/* MEDIA GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mediaList.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveModalItem(item)}
                className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-800 group cursor-pointer hover:border-[#00F0FF] transition-all shadow-lg"
              >
                <img src={item.thumb || activeVault?.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-[#00F0FF] flex items-center gap-1">
                  {item.type === 'video' ? <Film size={12}/> : <ImageIcon size={12}/>}
                  {item.type.toUpperCase()}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Maximize2 size={24} className="text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* ZOOM MODAL LIGHTBOX */}
          {activeModalItem && (
            <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
              <button 
                onClick={() => setActiveModalItem(null)} 
                className="absolute top-6 right-6 bg-gray-900 border border-gray-700 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={20} />
              </button>

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

                {/* WATERMARK */}
                <div className="absolute z-20 text-white/25 font-mono text-xs tracking-widest pointer-events-none font-bold select-none bg-black/10 px-2 py-1 rounded backdrop-blur-[1px]" style={{ top: position.top, left: position.left }}>
                  {customerPhone || '+254 712 345 678'} &bull; {currentTime}
                </div>
              </div>

              {/* HORIZONTAL SCROLL REEL */}
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
          <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-gray-800 flex flex-col items-center justify-center">
            <Lock size={40} className="text-[#FFD700] mb-3 animate-pulse" />
            <span className="text-white font-black text-sm uppercase tracking-widest">Content Locked</span>
            <span className="text-gray-400 text-xs mt-1">Complete M-Pesa payment to reveal the {mediaList.length} items inside</span>
          </div>

          <div className="bg-[#12151c] border border-gray-800 rounded-2xl p-5 space-y-3">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">M-Pesa Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone size={16} className="text-[#00F0FF]" /></div>
              <input 
                type="text" 
                placeholder="0712345678" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-black text-white font-mono border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
          </div>

          <button onClick={() => handlePayment('Full Vault', activeVault?.price || 50)} className="w-full bg-[#FFD700] hover:bg-[#e6c200] text-black font-black rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center"><Zap size={18}/></div>
              <div><h3 className="font-black text-sm">Unlock Entire Vault</h3><p className="text-black/70 text-[10px]">{mediaList.length} mixed media items</p></div>
            </div>
            <div className="text-right"><span className="font-black text-lg">KES {activeVault?.price || 50}</span></div>
          </button>
        </>
      )}
    </div>
  );
};

// --- Fully Restored Creator Profile Layout ---
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
            <span className="text-xs text-gray-400 font-mono">{selectedCreator.mediaList?.length || 1} Media Items</span>
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

// --- Fully Restored Membership Layout ---
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

// --- Fully Restored Restore Layout ---
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

// --- Fully Restored Auth Layout ---
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
                    type="