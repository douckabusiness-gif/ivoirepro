'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/storeContext';
import { HeroSlideItem } from '@/lib/types';
import { 
  ArrowRight, 
  MessageCircle, 
  Sparkles, 
  ChevronLeft,
  ChevronRight,
  Headphones,
  Shirt,
  Watch,
  Grid,
  ShoppingBag,
  Smartphone,
  Laptop,
  Home,
  Baby,
  Dumbbell,
  Car
} from 'lucide-react';

const categoryIconMap: Record<string, React.ReactNode> = {
  Headphones: <Headphones className="w-4 h-4" />,
  Shirt: <Shirt className="w-4 h-4" />,
  Watch: <Watch className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Laptop: <Laptop className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Baby: <Baby className="w-4 h-4" />,
  Dumbbell: <Dumbbell className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
};

export const HeroBanner = () => {
  const { 
    settings, 
    categories, 
    setCurrentView, 
    setSelectedCategoryFilter, 
    selectedCategoryFilter,
    setSelectedSubcategoryFilter,
    setSelectedProductId,
    generateWhatsAppGeneralLink 
  } = useStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const heroThemeMap: Record<string, string> = {
    midnight: 'from-slate-950 via-indigo-950 to-slate-900',
    gold: 'from-slate-950 via-amber-950 to-slate-900',
    emerald: 'from-slate-950 via-emerald-950 to-slate-900',
    sunset: 'from-slate-950 via-rose-950 to-amber-950',
    dark: 'from-slate-950 via-slate-900 to-slate-950',
    custom: 'from-slate-950/90 via-slate-900/80 to-slate-950/90'
  };

  // Pure dynamic resolution: ONLY show what the user has configured in settings.heroSlidesList
  const userSlides: HeroSlideItem[] = Array.isArray(settings.heroSlidesList)
    ? settings.heroSlidesList.filter((s: HeroSlideItem) => s && s.enabled !== false)
    : [];

  const hasConfiguredSlides = userSlides.length > 0;

  // Auto-rotation timer
  useEffect(() => {
    if (userSlides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % userSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [userSlides.length, isHovered]);

  // Adjust active index if count changes
  useEffect(() => {
    if (activeSlide >= userSlides.length && userSlides.length > 0) {
      setActiveSlide(0);
    }
  }, [userSlides.length, activeSlide]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? userSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % userSlides.length);
  };

  const executeAction = (action?: string, link?: string, slideContext?: HeroSlideItem) => {
    if (action === 'whatsapp') {
      const customMsg = slideContext?.whatsappMessage || undefined;
      window.open(generateWhatsAppGeneralLink(customMsg), '_blank');
    } else if (action === 'product') {
      const prodId = slideContext?.targetProductId || link;
      if (prodId) {
        setSelectedProductId(prodId);
        setCurrentView('product-detail');
      } else {
        setCurrentView('shop');
      }
    } else if (action === 'category') {
      const catId = slideContext?.targetCategoryId || link;
      if (catId) {
        setSelectedCategoryFilter(catId);
        setSelectedSubcategoryFilter(null);
      }
      setCurrentView('shop');
    } else if (action === 'link' && link) {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        window.location.assign(link);
      }
    } else {
      setSelectedCategoryFilter(null);
      setSelectedSubcategoryFilter(null);
      setCurrentView('shop');
    }
  };

  return (
    <section className="py-3 sm:py-5" style={{ backgroundColor: 'var(--home-muted-color, #f8fafc)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        
        {/* ========================================================================= */}
        {/* PRO FULL-WIDTH / WIDESCREEN HERO CAROUSEL */}
        {/* ========================================================================= */}
        {hasConfiguredSlides ? (
          <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-full h-[360px] sm:h-[440px] md:h-[480px] lg:h-[520px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 group select-none transition-all"
          >
            {userSlides.map((slide, idx) => {
              const isActive = idx === activeSlide;
              const isGraphicMode = slide.displayMode === 'graphic' || (!slide.title && !slide.subtitle);
              const alignment = slide.textAlignment || 'left';
              const overlayPct = typeof slide.overlayOpacity === 'number' ? slide.overlayOpacity : 40;
              const themeGradient = heroThemeMap[slide.theme || 'midnight'] || heroThemeMap.midnight;

              return (
                <div
                  key={slide.id || idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                  }`}
                >
                  {/* MODE 1: PURE GRAPHIC BANNER (Canva / Designer poster ready to click) */}
                  {isGraphicMode ? (
                    <div 
                      onClick={() => executeAction(slide.linkAction || slide.buttonAction, slide.linkUrl || slide.buttonLink, slide)}
                      className="w-full h-full relative cursor-pointer group/slide"
                    >
                      <img
                        src={slide.image}
                        alt={slide.title || 'Bannière Promotionnelle'}
                        className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover/slide:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/slide:bg-black/5 transition-colors" />
                    </div>
                  ) : (
                    /* MODE 2: COMPOSED PRO BANNER (Image + Texts + Buttons) */
                    <div className={`relative w-full h-full bg-gradient-to-br ${themeGradient} text-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden`}>
                      
                      {/* Background Image with configurable dark overlay */}
                      <div className="absolute inset-0 z-0">
                        <img
                          src={slide.image}
                          alt={slide.title || 'Bannière'}
                          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
                        />
                        {/* Custom overlay darkness for text contrast */}
                        <div 
                          className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
                          style={{ opacity: overlayPct / 100 }}
                        />
                        {/* Soft directional gradient for luxury typography readability */}
                        <div className={`absolute inset-0 ${
                          alignment === 'center'
                            ? 'bg-radial from-transparent via-slate-950/40 to-slate-950/80'
                            : alignment === 'right'
                              ? 'bg-gradient-to-l from-slate-950/90 via-slate-950/50 to-transparent'
                              : 'bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent'
                        }`} />
                      </div>

                      {/* Top Tag / Promo Badge */}
                      <div className={`relative z-10 flex ${
                        alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'
                      }`}>
                        {slide.badge && (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black tracking-wider uppercase shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>{slide.badge}</span>
                          </div>
                        )}
                      </div>

                      {/* Main Center Content */}
                      <div className={`relative z-10 max-w-2xl space-y-3 sm:space-y-4 ${
                        alignment === 'center' ? 'mx-auto text-center' : alignment === 'right' ? 'ml-auto text-right' : 'mr-auto text-left'
                      }`}>
                        {slide.title && (
                          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                            {slide.title}
                            {slide.highlight && (
                              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-200 to-amber-200">
                                {slide.highlight}
                              </span>
                            )}
                          </h1>
                        )}

                        {slide.subtitle && (
                          <p className="text-xs sm:text-sm md:text-base text-slate-200 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl">
                            {slide.subtitle}
                          </p>
                        )}

                        {/* CTA Buttons */}
                        <div className={`flex flex-wrap items-center gap-3 pt-2 ${
                          alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-start'
                        }`}>
                          {slide.buttonText && (
                            <button
                              type="button"
                              onClick={() => executeAction(slide.buttonAction, slide.buttonLink, slide)}
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl flex items-center gap-2 transition cursor-pointer hover:scale-105 active:scale-95"
                            >
                              <span>{slide.buttonText}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {slide.secondaryButtonText && (
                            <button
                              type="button"
                              onClick={() => executeAction(slide.secondaryButtonAction || 'whatsapp', slide.secondaryButtonLink, slide)}
                              className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-md border border-white/30 flex items-center gap-2 transition cursor-pointer hover:scale-105 active:scale-95"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                              <span>{slide.secondaryButtonText}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Footer Info Tag */}
                      <div className={`relative z-10 flex items-center ${
                        alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : 'justify-between'
                      } text-xs`}>
                        {(slide.promoDiscount || slide.tag) && (
                          <span className="bg-rose-600 text-white font-black px-3 py-1 rounded-full text-[11px] tracking-wide uppercase shadow-md">
                            {slide.promoDiscount || slide.tag}
                          </span>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}

            {/* Left & Right Navigation Arrows (only if > 1 slide) */}
            {userSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg hover:scale-110 active:scale-90"
                  aria-label="Diapositive précédente"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg hover:scale-110 active:scale-90"
                  aria-label="Diapositive suivante"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Sleek Bottom Pagination Indicator Pills */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {userSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activeSlide === i 
                          ? 'w-7 bg-white shadow-xs' 
                          : 'w-2 bg-white/40 hover:bg-white/75'
                      }`}
                      aria-label={`Aller au slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

          </div>
        ) : (
          /* CLEAN MINIMAL WELCOME WHEN NO BANNERS ARE CREATED YET (NO FAKE HARDCODED SLIDES) */
          <div className="relative w-full rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings.storeName || 'Bienvenue dans notre Boutique'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {settings.storeName || 'Notre Collection Exclusive'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto font-light">
              {settings.storeSlogan || 'Découvrez nos articles de qualité sélectionnés avec soin et profitez de la livraison rapide à domicile.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => { setSelectedCategoryFilter(null); setCurrentView('shop'); }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                Explorer le Catalogue
              </button>
              <a
                href={generateWhatsAppGeneralLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm backdrop-blur-md border border-white/20 flex items-center gap-2 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SLEEK HORIZONTAL CATEGORY NAVIGATION BAR (AIRBNB / SHOPIFY STYLE) */}
        {/* ========================================================================= */}
        {categories && categories.length > 0 && (
          <div className="relative pt-1">
            <div 
              ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth select-none"
            >
              {/* "Tous les rayons" Pill */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryFilter(null);
                  setSelectedSubcategoryFilter(null);
                  setCurrentView('shop');
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 border ${
                  selectedCategoryFilter === null
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Tous les Rayons</span>
              </button>

              {/* Dynamic Categories */}
              {categories.map((cat) => {
                const isSelected = selectedCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter(cat.id);
                      setSelectedSubcategoryFilter(null);
                      setCurrentView('shop');
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={isSelected ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}>
                      {categoryIconMap[cat.iconName || ''] || <Grid className="w-3.5 h-3.5" />}
                    </span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
