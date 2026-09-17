'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/storeContext';
import { 
  Plane, 
  ShoppingBag, 
  MessageCircle, 
  Search, 
  Menu, 
  X, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Compass, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface DubaiNavbarProps {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const DubaiNavbar: React.FC<DubaiNavbarProps> = ({
  onSelectCategory,
  selectedCategory = 'all',
  onSearch,
  searchQuery = ''
}) => {
  const { cart, setIsCartOpen, settings, generateWhatsAppGeneralLink } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavCategory = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    setMobileMenuOpen(false);
    const catalogEl = document.getElementById('dubai-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const personalShopperWhatsApp = () => {
    const phone = settings.whatsappNumber || '2250700000000';
    const text = encodeURIComponent(
      "Bonjour Service Personal Shopper Dubaï ! 🇦🇪\nJe recherche un article spécifique à Dubaï qui n'est pas sur votre catalogue. Pouvez-vous vérifier la disponibilité et le tarif cargo svp ?"
    );
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 shadow-2xl">
      {/* 1. Top VIP Gold Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 border-b border-amber-500/20 text-white text-[11px] sm:text-xs py-1.5 px-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-black text-amber-300 uppercase tracking-wider shrink-0">
              ✈️ Dubaï Direct :
            </span>
            <span className="text-slate-300 truncate">
              Vols Cargo chaque Mardi & Vendredi • Acheminement Abidjan sous 7 à 10j
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 shrink-0 text-slate-300">
            <span className="flex items-center gap-1 text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              100% Produits d'Origine Certifiée
            </span>
            <a 
              href={personalShopperWhatsApp()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              Conciergerie Dubaï VIP
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Luxury Header */}
      <div className={`bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-6 transition-all duration-300 ${
        isScrolled ? 'py-2.5' : 'py-3 sm:py-4'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand Logo & VIP Dubaï Badge */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-left group flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Plane className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                    {settings.storeName || 'IVOIRE DJASSA'}
                  </span>
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase">
                    Dubaï 🇦🇪
                  </span>
                </div>
                <p className="text-[10px] text-amber-300/80 font-medium tracking-wide uppercase">
                  Arrivages & Précommandes Directs
                </p>
              </div>
            </button>

            {/* Back to Abidjan Store Button */}
            <Link 
              href="/"
              className="hidden lg:flex items-center gap-1.5 ml-3 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-amber-500/40 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Boutique Abidjan (Stock 24h)</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch && onSearch(e.target.value)}
                placeholder="Rechercher un parfum, oud, montre, abaya de Dubaï..."
                className="w-full bg-slate-900/90 text-white placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:border-amber-500/60 focus:outline-hidden transition"
              />
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger (Mobile) */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
              aria-label="Recherche"
            >
              <Search className="w-4 h-4 text-amber-400" />
            </button>

            {/* WhatsApp Concierge VIP */}
            <a
              href={personalShopperWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Personal Shopper</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 transition shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Mon Panier</span>
              {cartItemsCount > 0 && (
                <span className="bg-slate-950 text-amber-400 text-[11px] font-black px-1.5 py-0.2 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Expanded */}
        {showSearchInput && (
          <div className="md:hidden mt-3 pt-3 border-t border-slate-800">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch && onSearch(e.target.value)}
                placeholder="Rechercher à Dubaï (Lattafa, Asad, Montre...)"
                className="w-full bg-slate-900 text-white placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 border border-amber-500/40 focus:outline-hidden"
                autoFocus
              />
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}
      </div>

      {/* 3. Luxury Category Bar (Desktop) */}
      <div className="hidden md:block bg-slate-950/80 border-b border-amber-500/10 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 text-xs font-medium">
            <button
              onClick={() => handleNavCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              ✨ Tous les Arrivages
            </button>
            <button
              onClick={() => handleNavCategory('parfum')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedCategory === 'parfum'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              🏺 Parfums & Ouds d'Orient
            </button>
            <button
              onClick={() => handleNavCategory('montre')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedCategory === 'montre'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              ⌚ Montres & Bijoux Or
            </button>
            <button
              onClick={() => handleNavCategory('mode')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedCategory === 'mode'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              🧕 Abayas & Soie de Médine
            </button>
            <button
              onClick={() => handleNavCategory('high-tech')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                selectedCategory === 'high-tech'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              📱 High-Tech DXB
            </button>
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => scrollToSection('dubai-flight-tracker')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Suivi Vol Cargo DXB ➔ ABJ</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => scrollToSection('dubai-how-it-works')}
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Comment ça marche ?</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-amber-500/20 px-4 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="p-3 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇦🇪</span>
              <div>
                <p className="text-xs font-black text-white">Espace Dubaï VIP</p>
                <p className="text-[10px] text-amber-300">Commandes & Imports d'Excellence</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-2.5 py-1 rounded-lg bg-slate-900 text-[11px] font-bold text-slate-300 border border-slate-800"
            >
              ← Boutique Abidjan
            </Link>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider px-2 mb-1">
              Catégories Dubaï
            </p>
            <button
              onClick={() => handleNavCategory('all')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800"
            >
              <span>✨ Tous les Arrivages Dubaï</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => handleNavCategory('parfum')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800"
            >
              <span>🏺 Parfums & Ouds d'Orient (Lattafa...)</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => handleNavCategory('montre')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800"
            >
              <span>⌚ Montres & Parures Dorées</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => handleNavCategory('mode')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800"
            >
              <span>🧕 Abayas Dubaï & Soie de Médine</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => handleNavCategory('high-tech')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800"
            >
              <span>📱 High-Tech Spécification DXB</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => scrollToSection('dubai-flight-tracker')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-950/30 border border-amber-500/30"
            >
              <span className="flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Suivi du Prochain Vol Cargo
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <a
              href={personalShopperWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-500/30"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Service Personal Shopper Dubaï
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
