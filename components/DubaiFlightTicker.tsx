'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Plane, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const DubaiFlightTicker: React.FC = () => {
  const { settings } = useStore();

  // Dynamic Countdown timer for the next batch closing
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return { days: 3, hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="dubai-flight-tracker" className="py-6 sm:py-8 bg-slate-900/90 border-b border-amber-500/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Flight Header & Route */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Vol Cargo Programmé • Fret Direct</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xl sm:text-2xl font-black text-amber-400">
                  DXB <span className="text-xs text-slate-400 font-normal block">Dubaï</span>
                </div>
                <div className="flex flex-col items-center px-2">
                  <div className="flex items-center gap-1 text-[11px] text-amber-300 font-mono">
                    <Plane className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Aérien Express</span>
                  </div>
                  <div className="w-24 sm:w-36 h-0.5 bg-gradient-to-r from-amber-500/40 via-amber-400 to-amber-500/40 mt-1" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  ABJ <span className="text-xs text-slate-400 font-normal block">Abidjan</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                {settings.dubaiNextFlightDate || "Vol Cargo chaque mardi & vendredi"} • Clôture des réservations 48h avant départ.
              </p>
            </div>

            {/* Countdown Box */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 sm:p-4 shrink-0 w-full lg:w-auto">
              <div className="text-[11px] font-black text-amber-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Temps restant pour le lot en cours :</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 min-w-[54px]">
                  <span className="text-base sm:text-xl font-black text-white">{timeLeft.days}</span>
                  <span className="block text-[9px] text-slate-400 uppercase font-sans">Jours</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 min-w-[54px]">
                  <span className="text-base sm:text-xl font-black text-amber-400">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase font-sans">Heures</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 min-w-[54px]">
                  <span className="text-base sm:text-xl font-black text-amber-400">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase font-sans">Min</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 min-w-[54px]">
                  <span className="text-base sm:text-xl font-black text-emerald-400">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase font-sans">Sec</span>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="space-y-1.5 text-xs text-slate-300 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6">
              <div className="flex items-center gap-2 text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Colis scellé & inspecté à Dubaï</span>
              </div>
              <div className="flex items-center gap-2 text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dédouanement sécurisé garanti</span>
              </div>
              <div className="flex items-center gap-2 text-white font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Photo de votre article envoyée sur WhatsApp</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
