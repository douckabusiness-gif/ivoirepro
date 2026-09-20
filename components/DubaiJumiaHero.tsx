'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import {
  Plane,
  Clock,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Package,
  Award,
  CheckCircle2,
  Flame,
  Star,
  ExternalLink
} from 'lucide-react';

interface DubaiJumiaHeroProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export const DubaiJumiaHero: React.FC<DubaiJumiaHeroProps> = ({
  onSelectCategory,
  selectedCategory
}) => {
  const { settings, products } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dynamic countdown for next cargo flight
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 36,
    seconds: 40
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

  const slides = [
    {
      id: 1,
      badge: '🇦🇪 IMPORTATION DIRECTE ÉMIRATS',
      title: "Parfums & Ouds d'Exception",
      highlight: "Lattafa, Khamrah, Asad & Alhambra",
      subtitle: "Les plus grandes créations orientales au tarif officiel de Dubaï. 100% originaux, livrés directement chez vous à Abidjan.",
      tag: '🔥 Arrivage Vol Cargo • Lots limités',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85',
      categoryTarget: 'parfum',
      primaryBtn: 'Découvrir les Parfums'
    },
    {
      id: 2,
      badge: '👑 GOLD SOUK DE DEIRA',
      title: "Montres & Parures Or 24K",
      highlight: "L'Éclat et la Précision de Dubaï",
      subtitle: "Chronographes squelette automatiques et parures dorées à l'or fin des bijouteries émiraties. Écrin et certificat d'origine.",
      tag: '✨ Haute Horlogerie & Coffrets Cadeaux',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=85',
      categoryTarget: 'montre',
      primaryBtn: 'Voir les Montres'
    },
    {
      id: 3,
      badge: '🧕 HAUTE COUTURE DUBAÏ',
      title: "Abayas & Soie de Médine",
      highlight: "Élégance & Tissus Nobles Khaleeji",
      subtitle: "Coupes papillon, tissus Nidha infroissables et broderies artisanales faites main à Dubaï avec voile assorti.",
      tag: '🌸 Collection Prestige 2026',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=85',
      categoryTarget: 'mode',
      primaryBtn: 'Explorer les Abayas'
    },
    {
      id: 4,
      badge: '📱 HIGH-TECH DUBAI MALL',
      title: "Apple & Gadgets Spéc. DXB",
      highlight: "Versions Internationales Dual SIM",
      subtitle: "iPhones avec double carte SIM physique, AirPods et électronique dernier cri importés avec garantie.",
      tag: '⚡ Expédition express sous 5 à 7 jours',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1600&auto=format&fit=crop&q=85',
      categoryTarget: 'high-tech',
      primaryBtn: 'Voir le High-Tech'
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const categoriesMenu = [
    { id: 'all', name: 'Tous les Arrivages', icon: '✨', badge: `${products.filter(p => p.isDubaiPreorder).length}` },
    { id: 'parfum', name: "Parfums & Ouds d'Orient", icon: '🏺', badge: 'Top Vente' },
    { id: 'montre', name: 'Montres & Bijoux Or 24K', icon: '⌚', badge: 'Gold Souk' },
    { id: 'mode', name: 'Abayas & Soie de Médine', icon: '🧕', badge: 'Couture' },
    { id: 'high-tech', name: 'High-Tech DXB & Apple', icon: '📱', badge: 'Dual SIM' },
    { id: 'bakhoor', name: 'Bakhoors & Encensoirs', icon: '🪵', badge: 'Khaleeji' }
  ];

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    const catalogEl = document.getElementById('dubai-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const personalShopperWhatsApp = () => {
    const phone = settings.whatsappNumber || '2250700000000';
    const text = encodeURIComponent(
      "Bonjour Service Conciergerie Dubaï ! 🇦🇪\nJe recherche un article introuvable à Abidjan. Pouvez-vous m'accompagner svp ?"
    );
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  const current = slides[currentSlide];

  return (
    <section className="bg-slate-950 py-3 sm:py-5 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        
        {/* ========================================================================= */}
        {/* JUMIA-STYLE 3-COLUMN HERO GRID (Desktop) / Full Width Slider (Mobile) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          
          {/* 1. LEFT COLUMN: Vertical Categories Sidebar (Jumia Style) */}
          <div className="hidden lg:flex lg:col-span-3 flex-col bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-2.5 shadow-xl justify-between">
            <div className="space-y-1">
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800/80 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Catégories Dubaï VIP
                </span>
                <span className="text-[10px] font-bold text-slate-500">100% DXB</span>
              </div>

              <div className="space-y-0.5">
                {categoriesMenu.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer group ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-800 text-slate-400 group-hover:text-amber-300'
                      }`}>
                        {cat.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quick Mini-Banner in Sidebar */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 p-2 rounded-xl bg-slate-950/60 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase">Achat Garanti Dubaï</p>
                  <p className="text-[9px] text-slate-400">Photos colis sur WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CENTER COLUMN: Main Dynamic Hero Slider (Jumia Style) */}
          <div className="lg:col-span-6 relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-slate-900 min-h-[300px] sm:min-h-[360px] md:min-h-[420px] flex flex-col justify-between shadow-2xl group">
            
            {/* Slide Background Image */}
            <div
              key={current.id}
              className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700 transform scale-105"
              style={{ backgroundImage: `url('${current.image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40 sm:bg-gradient-to-r sm:from-slate-950 sm:via-slate-950/75 sm:to-transparent" />
            </div>

            {/* Top Badge & Indicators */}
            <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {current.badge}
              </span>

              <div className="flex items-center gap-1 bg-slate-950/60 px-2 py-1 rounded-full backdrop-blur-md border border-slate-800">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                    }`}
                    aria-label={`Diapositive ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Middle Slide Content */}
            <div className="relative z-10 p-4 sm:p-6 space-y-2 sm:space-y-3 max-w-lg">
              <p className="text-[10px] sm:text-xs font-black text-amber-400 uppercase tracking-widest">
                {current.tag}
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                {current.title} <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                  {current.highlight}
                </span>
              </h2>
              <p className="text-xs text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                {current.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleCategoryClick(current.categoryTarget)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
                >
                  <span>{current.primaryBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href={personalShopperWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Personal Shopper</span>
                </a>
              </div>
            </div>

            {/* Slide Arrows */}
            <div className="absolute inset-y-0 left-2 flex items-center z-20 pointer-events-none">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-slate-800 opacity-0 group-hover:opacity-100 transition pointer-events-auto cursor-pointer"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center z-20 pointer-events-none">
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md border border-slate-800 opacity-0 group-hover:opacity-100 transition pointer-events-auto cursor-pointer"
                aria-label="Suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Progress Strip */}
            <div className="relative z-10 w-full bg-slate-950/80 border-t border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-indigo-400" />
                <span>Expédition Aérienne Dubaï ➔ Abidjan : <strong>7 à 10j ouvrés</strong></span>
              </span>
              <span className="text-amber-400 font-bold hidden sm:inline">
                Paiement Mobile Money Sécurisé
              </span>
            </div>

          </div>

          {/* 3. RIGHT COLUMN: Stacked Promotional Service Cards (Jumia Style) */}
          <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-3">
            
            {/* Promo Card 1: Live Cargo Flight Ticker */}
            <div className="flex-1 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Plane className="w-3 h-3 text-amber-400" /> Vol Cargo DXB ➔ ABJ
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-black text-amber-400">DXB (Dubaï)</span>
                  <Plane className="w-4 h-4 text-slate-400" />
                  <span className="text-base font-black text-white">ABJ (Abidjan)</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  {settings.dubaiNextFlightDate || "Vol Cargo chaque mardi & vendredi"}
                </p>
              </div>

              {/* Digital Countdown Boxes */}
              <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 text-center">
                <p className="text-[9.5px] uppercase font-bold text-slate-400 mb-1.5">Clôture des réservations dans :</p>
                <div className="grid grid-cols-4 gap-1 font-mono text-center">
                  <div className="bg-slate-900 rounded p-1">
                    <span className="block text-xs font-black text-white">{timeLeft.days}j</span>
                  </div>
                  <div className="bg-slate-900 rounded p-1">
                    <span className="block text-xs font-black text-amber-400">{String(timeLeft.hours).padStart(2, '0')}h</span>
                  </div>
                  <div className="bg-slate-900 rounded p-1">
                    <span className="block text-xs font-black text-amber-400">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  </div>
                  <div className="bg-slate-900 rounded p-1">
                    <span className="block text-xs font-black text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCategoryClick('all')}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Réserver ma place dans le vol</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Promo Card 2: Personal Shopper Concierge */}
            <div className="flex-1 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <MessageCircle className="w-3 h-3 text-emerald-400" /> Sur Devis WhatsApp
                  </span>
                  <span className="text-[10px] font-bold text-amber-400">⚡ Réponse en 2h</span>
                </div>

                <h3 className="text-xs font-black text-white leading-snug">
                  Personal Shopper Dubaï
                </h3>

                <p className="text-[11px] text-slate-300 leading-snug">
                  Envoyez la photo d'un parfum, montre, abaya ou bijou introuvable à Abidjan. Notre acheteur à Dubaï vous l'achète et l'expédie.
                </p>
              </div>

              <a
                href={personalShopperWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Demander un article sur WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
