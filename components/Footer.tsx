'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { normalizeHexColor } from '@/lib/siteTheme';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Lock, 
  CreditCard,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Footer = () => {
  const { settings, isSettingsLoaded, setCurrentView, setSelectedCategoryFilter, categories, generateWhatsAppGeneralLink } = useStore();
  const footerColor = normalizeHexColor(settings.siteFooterColor, '#020617');

  return (
    <footer
      className="site-footer bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 pt-16 pb-12"
      style={{ backgroundColor: footerColor }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand Info (col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {isSettingsLoaded && settings.storeLogoUrl ? (
                <div className="flex min-h-[92px] w-full max-w-[410px] items-center justify-center sm:justify-start">
                  <img
                    src={settings.storeLogoUrl}
                    alt=""
                    role="img"
                    aria-label="Logo de la boutique"
                    style={{ height: `${Math.max(settings.storeLogoHeight || 84, 82)}px` }}
                    className="max-h-[84px] w-auto max-w-full object-contain"
                  />
                </div>
              ) : <div aria-hidden="true" className="min-h-[92px] w-full max-w-[410px]" />}
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.whatsappNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{settings.contactAddress}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-indigo-400 transition cursor-pointer">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentView('shop'); setSelectedCategoryFilter(null); }} className="hover:text-indigo-400 transition cursor-pointer">
                  Tous les Produits
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('faq')} className="hover:text-indigo-400 transition cursor-pointer">
                  Foire Aux Questions (FAQ)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('about')} className="hover:text-indigo-400 transition cursor-pointer">
                  À Propos de Nous
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('contact')} className="hover:text-indigo-400 transition cursor-pointer">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Rayons / Catégories */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Rayons Populaires</h4>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => {
                      setSelectedCategoryFilter(cat.id);
                      setCurrentView('shop');
                    }}
                    className="hover:text-indigo-400 transition text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Légal & Application Mobile */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Application Mobile</h4>
            
            {/* PWA App Promo Badge */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                  <img src={settings.pwaIconUrl || '/icons/icon-192x192.svg'} alt="App Icon" className="w-full h-full rounded-[10px]" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white">App Progressive PWA</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">● 100% Hors-Ligne & Rapide</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Installez l'application directement sur votre smartphone pour un accès en 1 clic.
              </p>
            </div>

            <ul className="space-y-2 pt-1">
              <li>
                <button onClick={() => setCurrentView('partenaire')} className="text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer flex items-center gap-1.5">
                  <span>🤝 Espace Partenaire / Affilié</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('delivery')} className="hover:text-indigo-400 transition cursor-pointer">
                  Livraison & Retours
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('terms')} className="hover:text-indigo-400 transition cursor-pointer">
                  Conditions d'Utilisation (CGU / CGV)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('privacy')} className="hover:text-indigo-400 transition cursor-pointer">
                  Politique de Confidentialité
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Quick Legal Links */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {settings.storeName}. Tous droits réservés.</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentView('terms')} className="hover:text-slate-300 transition cursor-pointer">
              Conditions d'Utilisation
            </button>
            <span>•</span>
            <button onClick={() => setCurrentView('privacy')} className="hover:text-slate-300 transition cursor-pointer">
              Confidentialité
            </button>
            <span>•</span>
            <span>Boutique certifiée WhatsApp Direct</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
