'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Sparkles, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Star,
  Zap,
  Flame,
  ShieldCheck
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is already running in standalone PWA mode
    const isAppStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isAppStandalone);
    if (isAppStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if user dismissed the prompt recently (in the last 48 hours)
    const dismissedAt = localStorage.getItem('boutique_pwa_dismissed_at');
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 48) {
        return;
      }
    }

    // Capture beforeinstallprompt for Chrome / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay (3 seconds) for a smooth entrance
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not dismissed, show prompt after a short delay
    if (isIosDevice && !isAppStandalone) {
      setTimeout(() => setShowPrompt(true), 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback message if prompt is not available
      alert("Pour installer l'application : ouvrez le menu de votre navigateur et cliquez sur 'Ajouter à l'écran d'accueil' ou 'Installer'.");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('⚡ [PWA] User accepted the install prompt');
        setShowPrompt(false);
      } else {
        console.log('⚡ [PWA] User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('❌ [PWA] Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('boutique_pwa_dismissed_at', String(Date.now()));
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating PWA Install Bottom Bar / Floating Card */}
      <aside 
        aria-label="Installation de l'application"
        className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-6 fade-in duration-500"
      >
        <div className="bg-slate-950/95 text-white p-4 rounded-3xl border border-indigo-500/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition cursor-pointer"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 relative z-10">
            {/* App Icon */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-400 p-0.5 shadow-lg shrink-0 flex items-center justify-center">
              <img
                src="/api/pwa/icon"
                alt="Logo Application"
                className="w-full h-full rounded-[14px]"
              />
            </div>

            {/* App Details */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">App Officielle</span>
                <div className="flex items-center text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="text-[10px] font-bold text-slate-300 ml-0.5">4.9</span>
                </div>
              </div>

              <h3 className="font-extrabold text-sm text-white tracking-tight leading-tight mt-0.5">
                Installer l'App Boutique
              </h3>

              <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
                Accès ultra-rapide, alertes Ventes Flash et mode hors-ligne sans passer par le store !
              </p>
            </div>
          </div>

          {/* Benefits Tags */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] font-bold text-slate-300">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Gratuit
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-rose-400">
              <Flame className="w-3 h-3" /> Alertes Flash
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-400">
              <Zap className="w-3 h-3" /> Instantané
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3 relative z-10">
            <button
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition cursor-pointer text-center border border-slate-800"
            >
              Plus tard
            </button>
            <button
              onClick={handleInstallClick}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs transition cursor-pointer text-center shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
          </div>

        </div>
      </aside>

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-white space-y-4 animate-in slide-in-from-bottom-8 duration-300 relative">
            
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 p-0.5 flex items-center justify-center">
                <img src="/api/pwa/icon" alt="App Icon" className="w-full h-full rounded-[14px]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Installer sur iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Ajout en 2 clics sur Safari iOS</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold">1</div>
                <div>
                  <span>Appuyez sur le bouton <strong>Partager</strong></span>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded-md text-slate-200 ml-1.5 font-bold">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span> en bas de l'écran Safari.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold">2</div>
                <div>
                  <span>Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong></span>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded-md text-slate-200 ml-1.5 font-bold">
                    <PlusSquare className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold">3</div>
                <div>
                  <span>Appuyez sur <strong>Ajouter</strong> en haut à droite. L'icône de l'application apparaîtra instantanément sur votre écran d'accueil !</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
            >
              Compris, merci !
            </button>

          </div>
        </div>
      )}
    </>
  );
};
