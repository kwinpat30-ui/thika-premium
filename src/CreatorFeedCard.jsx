import React from 'react';

export default function CreatorFeedCard({ creator, vault, onUnlock, buttonText }) {
  return (
    <div className="bg-[#12161F] border border-gray-800 rounded-xl overflow-hidden shadow-xl mb-6 transition-all duration-300 hover:border-[#00F0FF]/50">
      
      {/* Top: Immersive Media-First Hook (16:9 Cover Thumbnail) */}
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        <img 
          src={vault.img || vault.coverImage || vault.thumbnail} 
          alt={vault.title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        
        {/* Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Floating Creator Avatar & Name Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-3 pointer-events-auto">
          <img 
            src={creator?.avatarUrl || "https://via.placeholder.com/150"} 
            alt={creator?.name || "Creator"}
            className="w-10 h-10 rounded-full border-2 border-[#00F0FF] object-cover shadow-md"
          />
          <div>
            <h4 className="text-white font-bold text-sm drop-shadow-md flex items-center gap-1">
              {creator?.name || "Verified Creator"}
              <span className="text-[#00F0FF] text-xs">✔</span>
            </h4>
            <span className="text-gray-300 text-xs drop-shadow-md font-mono">
              {vault.videoCount || 0} Videos • {vault.photoCount || 0} Photos
            </span>
          </div>
        </div>

        {/* Top-Right Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-[#FFD700]/30 px-3 py-1 rounded-full text-[#FFD700] text-xs font-semibold tracking-wide">
          PREMIUM VAULT
        </div>
      </div>

      {/* Bottom: Vault Info & Instant Action Bar */}
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold text-base mb-1">{vault.title}</h3>
          <p className="text-gray-400 text-xs line-clamp-1">{vault.description || "Exclusive content vault."}</p>
        </div>

        {/* Direct Checkout CTA */}
        <button 
          onClick={() => onUnlock && onUnlock(vault)}
          className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#e6c200] text-black font-black px-6 py-2.5 rounded-xl text-sm shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all flex items-center justify-center cursor-pointer"
        >
          {buttonText || "Subscribe"}
        </button>
      </div>
    </div>
  );
}