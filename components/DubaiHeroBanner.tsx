'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Plane, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Award,
  CheckCircle2,
  Package
} from 'lucide-react';

export const DubaiHeroBanner: React.FC = () => {
  const { settings } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: '🇦🇪 SÉLECTION PRESTIGE DUBAÏ 2026',
      title: "Parfums & Ouds d'Exception",
      highlight: "Directement importés des Émirats",
      subtitle: "Lattafa, Maison Alhambra, Afnan et créations royales. Découvrez les fragrances orientales les plus prisées au monde, 100% authentiques et livrées chez vous à Abidjan.",
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1600&auto=format&fit=crop&q=85',
      tag: '🔥 Best-sellers mondiaux disponibles sur commande',
      primaryBtn: 'Découvrir les Parfums',
      action: 'parfum'
    },
    {
      badge: '💎 HAUTE HORLOGERIE & JOAILLERIE',
      title: "Montres & Parures Dorées",
      highlight: "Luxe & Éclat des Souks de Deira",
      subtitle: "Mouvements automatiques de précision, finitions or 24K et cadrans d'exception. Commandez vos pièces exclusives avec certificat et écrin de luxe.",
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=85',
      tag: '✨ Coffrets et parures pour réceptions & cadeaux',
      primaryBtn: 'Voir les Montres',
      action: 'montre'
    },
    {
      badge: '🧕 HAUTE COUTURE ÉMIRATIE',
      title: "Abayas & Soie de Médine",
      highlight: "Élégance & Raffinement Oriental",
      subtitle: "Tissus nobles infroissables, coupes papillon évasées et broderies artisanales faites main à Dubaï. Sublimez votre silhouette avec authenticité.",
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=85',
      tag: '🌸 Pièces exclusives livrées sous pochette scellée',
      primaryBtn: 'Explorer la Mode',
      action: 'mode'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToCatalog = () => {
    const el = document.getElementById('dubai-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const personalShopperWhatsApp = () => {
    const phone = settings.whatsappNumber || '2250700000000';
    const text = encodeURIComponent(
      "Bonjour Service Conciergerie Dubaï ! 🇦🇪\nJe souhaite commander un article précis à Dubaï. Pouvez-vous m'accompagner svp ?"
    );
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  const current = slides[currentSlide];

  return (
    <div className="relative overflow-hidden bg-slate-950 border-b border-amber-500/20 text-white">
      {/* Background with Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Slide Image Background */}
      <div 
        key={currentSlide}
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
        style={{ backgroundImage: `url('${current.image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24 min-h-[480px] sm:min-h-[540px] flex flex-col justify-center">
        
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wide shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{current.badge}</span>
          </div>

          {/* Title & Highlight */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {current.title}
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              {current.highlight}
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
            {current.subtitle}
          </p>

          {/* Key Trust Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 text-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Authentique Dubaï</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-200">
              <Plane className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Fret Aérien Sécurisé</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-200 col-span-2 sm:col-span-1">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Dédouanement Inclus</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={scrollToCatalog}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>{current.primaryBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={personalShopperWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-amber-500/40 text-xs sm:text-sm font-bold flex items-center gap-2 transition hover:border-amber-400 shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Personal Shopper (Sur-Mesure)</span>
            </a>
          </div>

        </div>

        {/* Carousel Slide Indicators & Arrows */}
        <div className="flex items-center justify-between pt-8 sm:pt-10 z-20">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 hover:border-amber-400 flex items-center justify-center text-slate-300 hover:text-white transition"
              aria-label="Slide précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 hover:border-amber-400 flex items-center justify-center text-slate-300 hover:text-white transition"
              aria-label="Slide suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
