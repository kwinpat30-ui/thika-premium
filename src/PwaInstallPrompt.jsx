import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PwaInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return; 

    if (isIosDevice) {
       const timer = setTimeout(() => setShowPrompt(true), 2000);
       return () => clearTimeout(timer);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    if (outcome === 'accepted') setShowPrompt(false);
    setInstallPromptEvent(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-[300] bg-[#12151c] border border-[#00F0FF]/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.2)]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#00F0FF]/50 shrink-0">
            <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Install Thika Premium</h4>
            <p className="text-gray-400 text-[10px]">Add to home screen for full-screen access</p>
          </div>
        </div>
        <button onClick={() => setShowPrompt(false)} className="text-gray-500 hover:text-white bg-black p-1 rounded-full">
          <X size={14} />
        </button>
      </div>
      
      {isIOS ? (
        <div className="bg-black/50 border border-gray-800 rounded-xl p-3 mt-3 text-xs text-gray-300">
          To install: Tap the <span className="font-bold text-white">Share</span> icon below, then scroll down and tap <span className="font-bold text-[#00F0FF]">Add to Home Screen</span>.
        </div>
      ) : (
        <button onClick={handleInstallClick} className="w-full mt-3 bg-[#00F0FF] text-black font-black py-2.5 rounded-xl text-xs hover:bg-cyan-400 transition-colors shadow-lg">
          Install App Now
        </button>
      )}
    </div>
  );
};

export default PwaInstallPrompt;