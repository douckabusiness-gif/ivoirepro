'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { DubaiPreorderPage } from '@/components/DubaiPreorderPage';
import { DubaiProductDetailPage } from '@/components/DubaiProductDetailPage';
import { 
  Plane, 
  Clock, 
  MessageCircle, 
  ArrowLeft, 
  ShoppingBag, 
  ShieldAlert, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const DubaiContainer: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    selectedProductId, 
    setSelectedProductId, 
    products, 
    settings 
  } = useStore();

  // Handle URL params if any (e.g. ?product=id or ?phone=id)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prodParam = params.get('product') || params.get('phone');
      if (prodParam) {
        const found = products.find(p => p.id === prodParam || p.slug === prodParam);
        if (found) {
          setSelectedProductId(found.id);
          setCurrentView('product-detail');
        }
      }
    }
  }, [products, setSelectedProductId, setCurrentView]);

  // 1. CHECK IF DUBAI PAGE IS DISABLED BY ADMIN
  const isDubaiEnabled = settings.dubaiPageEnabled !== false;

  if (!isDubaiEnabled) {
    const phone = settings.whatsappNumber || '2250700000000';
    const text = encodeURIComponent(
      "Bonjour Service Dubaï VIP ! 🇦🇪\nLa page de précommandes est actuellement en pause. Je souhaite commander un article en direct de Dubaï. Pouvez-vous m'assister ?"
    );
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full text-center space-y-6 relative z-10 bg-slate-900/80 border border-amber-500/30 p-6 sm:p-10 rounded-3xl shadow-2xl shadow-amber-950/30 backdrop-blur-md">
          
          {/* Top VIP Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider mx-auto">
            <Plane className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Espace Dubaï VIP 🇦🇪 • Pause Temporaire</span>
          </div>

          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto shadow-inner">
            ✈️
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Précommandes Dubaï Momentanément Suspendues
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Nos équipes effectuent actuellement la clôture des expéditions cargo et le réapprovisionnement des stocks aux Émirats Arabes Unis.
            </p>
          </div>

          {/* Cargo schedule notification */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
              <Clock className="w-4 h-4" />
              <span>Prochains Arrivages :</span>
            </div>
            <p className="text-slate-400">
              {settings.dubaiNextFlightDate || 'Vol Cargo chaque mardi & vendredi'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Voir la Boutique Locale d'Abidjan</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contacter sur WhatsApp</span>
            </a>
          </div>

          {/* Admin shortcut hint */}
          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Vous êtes administrateur ? </span>
            <a 
              href="/admin" 
              className="text-amber-400 hover:underline font-bold inline-flex items-center gap-1"
            >
              <span>Accéder à l'Admin pour réactiver la page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>
    );
  }

  // 2. DUBAI PAGE IS ACTIVE: Show Product Detail if selected, else Dubai Catalog
  if (currentView === 'product-detail') {
    return <DubaiProductDetailPage />;
  }

  return <DubaiPreorderPage />;
};
