import React from 'react';

export default function CreatorFeedCard({ creator, vault, onUnlock }) {
  return (
    <div className="bg-[#12161F] border border-gray-800 rounded-xl overflow-hidden shadow-xl mb-6 transition-all duration-300 hover:border-yellow-500/50">
      
      {/* Top: Immersive Media-First Hook (16:9 Cover Thumbnail) */}
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        <img 
          src={vault.coverImage || vault.thumbnail} 
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
            className="w-10 h-10 rounded-full border-2 border-yellow-400 object-cover shadow-md"
          />
          <div>
            <h4 className="text-white font-bold text-sm drop-shadow-md flex items-center gap-1">
              {creator?.name || "Verified Creator"}
              <span className="text-blue-400 text-xs">✔</span>
            </h4>
            <span className="text-gray-300 text-xs drop-shadow-md">
              {vault.secureVideosCount || 0} Videos • {vault.photosCount || 0} Photos
            </span>
          </div>
        </div>

        {/* Top-Right Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-yellow-500/30 px-3 py-1 rounded-full text-yellow-400 text-xs font-semibold tracking-wide">
          PREMIUM VAULT
        </div>
      </div>

      {/* Bottom: Vault Info & Instant M-Pesa Pricing Action Bar */}
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-semibold text-base mb-1">{vault.title}</h3>
          <p className="text-gray-400 text-xs line-clamp-1">{vault.description || "Exclusive content vault."}</p>
        </div>

        {/* Direct Checkout CTA */}
        <button 
          onClick={() => onUnlock && onUnlock(vault)}
          className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-5 py-2.5 rounded-lg text-sm shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Unlock Access</span>
          <span className="bg-gray-950/10 px-2 py-0.5 rounded text-xs">
            KES {vault.price || "150"}
          </span>
        </button>
      </div>
    </div>
  );
}