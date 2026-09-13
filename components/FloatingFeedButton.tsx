'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { Play, Sparkles, Flame, Film, X } from 'lucide-react';

export const FloatingFeedButton: React.FC = () => {
  const { openFeed, isFeedOpen, settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-hide tooltip after 8 seconds, or keep it dismissable
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Hide button if feed modal is already open or disabled in admin
  if (settings?.tiktokFeedEnabled === false || isFeedOpen) return null;

  return (
    <aside 
      aria-label="Mode Feed Shopping" 
      className="fixed bottom-20 sm:bottom-6 left-3.5 sm:left-6 z-40 flex flex-col items-start select-none"
    >
      {/* Floating Micro-Tooltip */}
      {showTooltip && (
        <div className="relative mb-2 ml-1 px-3 py-1.5 bg-slate-900/95 dark:bg-black/95 text-white text-[11px] font-bold rounded-2xl shadow-xl border border-rose-500/40 backdrop-blur-md animate-bounce flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span>Feed Shopping • Swipez les pépites !</span>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-white/60 hover:text-white p-0.5 ml-1 transition"
            aria-label="Fermer l'infobulle"
          >
            <X className="w-3 h-3" />
          </button>
          {/* Tooltip triangle tail pointing down */}
          <div className="absolute -bottom-1 left-5 w-2 h-2 bg-slate-900 dark:bg-black rotate-45 border-r border-b border-rose-500/40"></div>
        </div>
      )}

      {/* Main Floating Pill Button */}
      <button
        type="button"
        onClick={() => openFeed()}
        className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-slate-950/90 text-white shadow-2xl border border-white/20 hover:border-transparent transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md overflow-hidden"
        style={{
          boxShadow: '0 10px 30px -5px rgba(244, 63, 94, 0.45), 0 0 15px 2px rgba(6, 182, 212, 0.35)'
        }}
        aria-label="Ouvrir le Feed Shopping vertical"
      >
        {/* Animated Gradient Glow Border on Hover */}
        <span className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-r from-cyan-400 via-rose-500 to-indigo-500 -z-10 opacity-70 group-hover:opacity-100 transition-opacity animate-gradient-x" />

        {/* Ambient Dark Background fill inside border */}
        <span className="absolute inset-[1.5px] rounded-full bg-slate-950/95 -z-5" />

        {/* Animated Icon Avatar */}
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform duration-300">
          <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white/30" />
          <Play className="w-2.5 h-2.5 fill-white text-white absolute inset-0 m-auto translate-x-0.5" />
          
          {/* Pulsating Ping Ring */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white" />
          </span>
        </div>

        {/* Text Labels */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] sm:text-xs font-black tracking-wide text-white uppercase flex items-center gap-1">
              Feed Shopping
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/90 text-white shadow-xs animate-pulse">
              HOT
            </span>
          </div>
          <span className="text-[10px] text-slate-300 hidden sm:inline-block font-medium">
            Swipe vertical express
          </span>
        </div>

        {/* Subtle Shimmer Overlay */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      </button>
    </aside>
  );
};
