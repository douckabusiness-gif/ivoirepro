'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed top-14 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
      {isOffline ? (
        <div className="pointer-events-auto bg-slate-950/95 text-rose-300 border border-rose-500/40 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs font-bold max-w-md">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <WifiOff className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-white font-extrabold">Mode Hors-Ligne Activé</p>
            <p className="text-slate-400 text-[11px]">Vos données en cache et votre panier sont conservés.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="p-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-xl transition cursor-pointer shrink-0"
            title="Réessayer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : showReconnected ? (
        <div className="pointer-events-auto bg-emerald-950/95 text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Wifi className="w-3.5 h-3.5" />
          </div>
          <span>Connexion rétablie ! L'application est synchronisée.</span>
        </div>
      ) : null}
    </div>
  );
};
