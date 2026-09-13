'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { Product } from '@/lib/types';
import { 
  X, 
  Heart, 
  ShoppingCart, 
  MessageCircle, 
  Share2,
  ChevronUp, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Sparkles, 
  Check, 
  Flame, 
  Eye,
  ShoppingBag,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Helper to convert images to high-definition vertical 9:16 portrait
function toVerticalFeedImage(url: string): string {
  if (!url) return url;
  if (url.includes('images.unsplash.com')) {
    let clean = url;
    if (clean.includes('w=')) {
      clean = clean.replace(/w=\d+/, 'w=1080&h=1920');
    } else {
      clean += '&w=1080&h=1920';
    }
    if (clean.includes('fit=')) {
      clean = clean.replace(/fit=[^&]+/, 'fit=crop&crop=center');
    } else {
      clean += '&fit=crop&crop=center';
    }
    return clean;
  }
  return url;
}

export const TikTokFeedModal: React.FC = () => {
  const { 
    isFeedOpen, 
    setIsFeedOpen, 
    feedActiveProductId, 
    products, 
    formatPrice, 
    addToCart, 
    isInWishlist, 
    toggleWishlist, 
    setQuickViewProduct,
    setIsCartOpen, 
    cartCount,
    settings,
    generateWhatsAppProductLink
  } = useStore();

  const [feedFilter, setFeedFilter] = useState<'all' | 'flash'>('all');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [expandedDescIds, setExpandedDescIds] = useState<Record<string, boolean>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [heartAnimId, setHeartAnimId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const closeFeed = useCallback(() => {
    setIsFeedOpen(false);
    window.setTimeout(() => {
      document.querySelector<HTMLElement>('[aria-label="Ouvrir le Feed Shopping vertical"]')?.focus();
    }, 0);
  }, [setIsFeedOpen]);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filtered feed products
  const feedProducts = useMemo(() => {
    const list = products.filter(p => p.inStock);
    return feedFilter === 'flash'
      ? list.filter(p => p.isFlashSale || (p.discountPercent && p.discountPercent > 0))
      : list;
  }, [products, feedFilter]);

  // Active image index helper
  const getProductImgIndex = (productId: string) => activeImageIndexes[productId] || 0;
  const setProductImgIndex = (productId: string, idx: number) => {
    setActiveImageIndexes(prev => ({ ...prev, [productId]: idx }));
  };

  // Scroll to active index programmatically
  const scrollToSlide = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    const clientHeight = scrollContainerRef.current.clientHeight;
    scrollContainerRef.current.scrollTo({
      top: index * clientHeight,
      behavior: 'smooth'
    });
  }, []);

  const goToNext = useCallback(() => {
    if (feedProducts.length === 0) return;
    if (activeIndex < feedProducts.length - 1) {
      scrollToSlide(activeIndex + 1);
    } else {
      scrollToSlide(0);
    }
  }, [activeIndex, feedProducts.length, scrollToSlide]);

  const goToPrev = useCallback(() => {
    if (feedProducts.length === 0) return;
    if (activeIndex > 0) {
      scrollToSlide(activeIndex - 1);
    } else {
      scrollToSlide(feedProducts.length - 1);
    }
  }, [activeIndex, feedProducts.length, scrollToSlide]);

  // Listen to native scroll events to update active index
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const scrollTop = scrollContainerRef.current.scrollTop;
    const clientHeight = scrollContainerRef.current.clientHeight;
    if (clientHeight === 0) return;
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex >= 0 && newIndex < feedProducts.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  }, [feedProducts.length, activeIndex]);

  // Keep keyboard focus inside the feed and restore it after closing.
  useEffect(() => {
    if (!isFeedOpen) return;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = '';
      previouslyFocusedRef.current = null;
    };
  }, [isFeedOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isFeedOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFeed();
      } else if (e.key === 'Tab') {
        const dialog = document.querySelector('[aria-label="Feed shopping vertical"]');
        if (!(dialog instanceof HTMLElement)) return;
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )).filter(element => element.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFeedOpen, goToNext, goToPrev, closeFeed]);

  // Open modal and position on requested product
  useEffect(() => {
    if (isFeedOpen) {
      if (feedActiveProductId && scrollContainerRef.current) {
        const foundIdx = feedProducts.findIndex(p => p.id === feedActiveProductId);
        if (foundIdx >= 0) {
          setActiveIndex(foundIdx);
          setTimeout(() => {
            if (scrollContainerRef.current) {
              const clientHeight = scrollContainerRef.current.clientHeight;
              scrollContainerRef.current.scrollTop = foundIdx * clientHeight;
            }
          }, 60);
        }
      }
    } else {
      setDrawerProduct(null);
    }
  }, [isFeedOpen, feedActiveProductId, feedProducts]);

  // Double tap to like
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = (product: Product, timestamp: number) => {
    if (timestamp - lastTapRef.current < 300) {
      if (!isInWishlist(product.id)) {
        toggleWishlist(product.id);
      }
      triggerHeartAnim(product.id);
    }
    lastTapRef.current = timestamp;
  };

  const triggerHeartAnim = (productId: string) => {
    setHeartAnimId(productId);
    setTimeout(() => setHeartAnimId(null), 850);
  };

  // WhatsApp link generator
  const getWhatsAppLink = (product: Product) => {
    const message = `Bonjour ! Je souhaite commander le produit vu sur votre Feed Shopping : "${product.title}" (Prix: ${formatPrice(product.price)}). Est-il disponible immédiatement ?`;
    return generateWhatsAppProductLink(product, message);
  };

  // Share handler
  const handleShare = async (product: Product) => {
    const shareData = {
      title: product.title,
      text: `Découvre ${product.title} à ${formatPrice(product.price)} sur notre boutique !`,
      url: typeof window !== 'undefined'
        ? `${window.location.origin}/produit/${encodeURIComponent(product.slug || product.id)}`
        : ''
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  // Confirm Quick Add
  const handleConfirmAddToCart = (product: Product) => {
    const color = selectedColors[product.id] || product.colors?.[0] || undefined;
    const size = selectedSizes[product.id] || product.sizes?.[0] || undefined;
    addToCart(product, 1, color, size, false);
    setDrawerProduct(null);
  };

  if (!isFeedOpen || settings?.tiktokFeedEnabled === false) return null;

  const currentProduct = feedProducts[activeIndex] || feedProducts[0];
  const currentImage = currentProduct?.images?.[0] || '/placeholder.png';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 sm:bg-slate-950/90 backdrop-blur-xl flex items-center justify-center overflow-hidden select-none animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Feed shopping vertical"
    >
      {/* Dynamic Ambient Background Blur (Desktop only) */}
      <div 
        className="hidden md:block absolute inset-0 -z-10 bg-cover bg-center filter blur-3xl opacity-40 scale-125 transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: `url(${toVerticalFeedImage(currentImage)})` }}
      />

      {/* Main Feed Container (Vertical 9:16 ratio on desktop, Fullscreen 100dvh on mobile) */}
      <div className="relative w-full h-[100dvh] md:w-[430px] md:h-[92vh] md:max-h-[880px] md:rounded-[36px] bg-black overflow-hidden shadow-2xl md:border md:border-white/15 flex flex-col justify-between">
        
        {/* FIXED HEADER: Top Bar (Close, Tabs, Photo Mode, Cart) */}
        <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-3.5 pt-3.5 sm:pt-4 pointer-events-none">
          {/* Close Button */}
          <button
            type="button"
            ref={closeButtonRef}
            onClick={closeFeed}
            className="pointer-events-auto p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
            title="Quitter le Feed (Echap)"
            aria-label="Fermer le feed"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Tabs: "Pour Vous" & "Promos" */}
          <div className="pointer-events-auto flex items-center gap-1 p-1 bg-black/55 backdrop-blur-md border border-white/15 rounded-full shadow-lg">
            <button
              type="button"
              onClick={() => {
                setFeedFilter('all');
                setActiveIndex(0);
                scrollToSlide(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                feedFilter === 'all' 
                  ? 'bg-white text-black shadow-sm font-black' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Pour Vous
            </button>
            <button
              type="button"
              onClick={() => {
                setFeedFilter('flash');
                setActiveIndex(0);
                scrollToSlide(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                feedFilter === 'flash' 
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm font-black' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Promos</span>
            </button>
          </div>

          {/* Right Header Actions: Fit Mode & Cart */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Format toggle: Full Cover vs Contain */}
            <button
              type="button"
              onClick={() => setFitMode(fitMode === 'cover' ? 'contain' : 'cover')}
              className="p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
              title={fitMode === 'cover' ? 'Ajuster la photo entière' : 'Plein écran immersif'}
              aria-label="Mode d'affichage photo"
            >
              {fitMode === 'cover' ? <Minimize2 className="w-4 h-4 text-cyan-300" /> : <Maximize2 className="w-4 h-4 text-rose-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsFeedOpen(false);
                setIsCartOpen(true);
              }}
              className="relative p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
              title="Ouvrir le panier"
              aria-label="Mon Panier"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* PROGRESS COUNTER */}
        {feedProducts.length > 0 && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-25 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/15 shadow-xs">
              {activeIndex + 1} / {feedProducts.length}
            </span>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {feedProducts.length > 0
            ? `Produit ${activeIndex + 1} sur ${feedProducts.length} : ${currentProduct.title}`
            : 'Aucune promotion disponible actuellement.'}
        </p>

        {/* NATIVE VERTICAL SNAP SCROLL CONTAINER */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full h-full overflow-y-scroll snap-y snap-mandatory overscroll-y-contain no-scrollbar scroll-smooth"
          style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          {feedProducts.length === 0 ? (
            <div className="flex h-full items-center justify-center px-8 text-center">
              <div className="max-w-xs space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-amber-300">
                  <Flame className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-black text-white">Aucune promotion disponible</h2>
                <p className="text-sm text-white/70">Revenez bientôt ou parcourez tous nos produits disponibles.</p>
                <button
                  type="button"
                  onClick={() => {
                    setFeedFilter('all');
                    setActiveIndex(0);
                  }}
                  className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-white/90"
                >
                  Voir tous les produits
                </button>
              </div>
            </div>
          ) : feedProducts.map((product, index) => {
            const isLiked = isInWishlist(product.id);
            const images = product.images && product.images.length > 0 ? product.images : ['/placeholder.png'];
            const imgIdx = Math.min(getProductImgIndex(product.id), images.length - 1);
            const currentProductImg = images[imgIdx] || images[0];
            const isDescExpanded = !!expandedDescIds[product.id];
            const verticalSrc = toVerticalFeedImage(currentProductImg);

            return (
              <div 
                key={product.id}
                ref={(el) => { slideRefs.current[index] = el; }}
                className="relative w-full h-[100dvh] md:h-[92vh] md:max-h-[880px] snap-start snap-always shrink-0 overflow-hidden flex flex-col justify-between"
              >
                {/* 1. BACKGROUND BLUR (Fills empty areas if in contain mode) */}
                {fitMode === 'contain' && (
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                    <img 
                      src={verticalSrc} 
                      alt=""
                      className="w-full h-full object-cover filter blur-3xl opacity-40 scale-125 brightness-50"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90" />
                  </div>
                )}

                {/* 2. FULL VERTICAL IMMERSIVE PHOTO PRESENTATION (LIKE TIKTOK REELS) */}
                <div 
                  className="absolute inset-0 z-10 overflow-hidden cursor-pointer flex items-center justify-center"
                  onClick={(event) => handleDoubleTap(product, event.timeStamp)}
                >
                  <img 
                    src={fitMode === 'cover' ? verticalSrc : currentProductImg} 
                    alt={product.title}
                    className={`w-full h-full select-none pointer-events-none transition-all duration-500 ${
                      fitMode === 'cover' 
                        ? 'object-cover object-center animate-kenburns' 
                        : 'object-contain object-center p-2 pt-14 pb-28 max-h-[85vh]'
                    }`}
                    style={fitMode === 'contain' ? { filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.9))' } : undefined}
                    loading={index < 3 ? 'eager' : 'lazy'}
                  />

                  {/* Gradient Shadows for contrast & legibility */}
                  <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

                  {/* Multiple image arrows & indicators if product has multiple photos */}
                  {images.length > 1 && (
                    <>
                      {/* Prev Photo Arrow */}
                      {imgIdx > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductImgIndex(product.id, imgIdx - 1);
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xl z-25 active:scale-90"
                          aria-label="Photo précédente"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}

                      {/* Next Photo Arrow */}
                      {imgIdx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductImgIndex(product.id, imgIdx + 1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition cursor-pointer shadow-xl z-25 active:scale-90"
                          aria-label="Photo suivante"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      {/* Top Photo Indicators */}
                      <div className="absolute top-16 left-4 right-4 z-20 flex items-center gap-1 pointer-events-none">
                        {images.map((_, dotIdx) => (
                          <div 
                            key={dotIdx} 
                            className={`h-1 rounded-full transition-all ${
                              dotIdx === imgIdx ? 'flex-1 bg-white shadow-xs' : 'w-3 bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Double Tap Heart Burst Animation */}
                  {heartAnimId === product.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <div className="animate-ping duration-700">
                        <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.95)]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Empty spacer to keep top bar clear */}
                <div className="h-20 shrink-0 pointer-events-none" />

                {/* 3. BOTTOM OVERLAY: Product Details & Right Action Rail */}
                <div className="relative z-20 flex items-end justify-between px-3.5 sm:px-4 pb-4 pt-4 pointer-events-auto">
                  
                  {/* LEFT DETAILS: Badges, Title, Price, Description, Buy CTA */}
                  <div className="flex-1 pr-14 text-left max-w-[84%]">
                    {/* Badges */}
                    <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
                      {product.discountPercent && product.discountPercent > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>-{product.discountPercent}% OFF</span>
                        </span>
                      ) : null}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-md border border-white/10">
                        {product.categoryName || 'Boutique'}
                      </span>

                      {product.stockCount <= 5 && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600/90 text-white uppercase tracking-wider animate-pulse">
                          Plus que {product.stockCount} en stock !
                        </span>
                      )}
                    </div>

                    {/* Product Title */}
                    <h2 className="text-white text-base sm:text-lg font-black leading-tight drop-shadow-md line-clamp-2">
                      {product.title}
                    </h2>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-emerald-400 text-xl font-black tracking-tight drop-shadow-md">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-white/60 text-xs line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Description preview */}
                    <div className="mt-1 text-xs text-white/90 font-medium">
                      <p className={isDescExpanded ? 'text-white/95' : 'line-clamp-2 text-white/80'}>
                        {product.shortDescription || product.description}
                      </p>
                      {(product.description.length > 80 || product.shortDescription) && (
                        <button
                          type="button"
                          onClick={() => setExpandedDescIds(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                          className="text-cyan-300 font-bold hover:underline text-[11px] mt-0.5 cursor-pointer"
                        >
                          {isDescExpanded ? 'Moins ▴' : 'Plus ▾'}
                        </button>
                      )}
                    </div>

                    {/* CTA Actions */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDrawerProduct(product)}
                        className="flex-1 py-2.5 px-3.5 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Ajouter au Panier</span>
                      </button>

                      <a
                        href={getWhatsAppLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
                        title="Commander directement sur WhatsApp"
                        aria-label="Commander sur WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </a>
                    </div>
                  </div>

                  {/* RIGHT ACTION SIDEBAR (TIKTOK STYLE) */}
                  <aside aria-label="Actions rapides" className="absolute right-2 sm:right-3 bottom-4 z-30 flex flex-col items-center gap-3.5">
                    {/* Store Logo Avatar */}
                    <div className="relative group flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-lg bg-white/10 backdrop-blur-md flex items-center justify-center">
                        {settings.storeLogoUrl ? (
                          <img src={settings.storeLogoUrl} alt={settings.storeName} className="w-full h-full object-cover" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-amber-300" />
                        )}
                      </div>
                      <span className="absolute -bottom-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-white shadow-xs">
                        ✓
                      </span>
                    </div>

                    {/* Like / Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleWishlist(product.id);
                        triggerHeartAnim(product.id);
                      }}
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                      aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <div className={`p-3 rounded-full backdrop-blur-md border transition-all duration-300 group-hover:scale-110 active:scale-90 ${
                        isLiked 
                          ? 'bg-rose-500/30 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/40' 
                          : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                      }`}>
                        <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-rose-500 stroke-rose-500 scale-110' : ''}`} />
                      </div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md">Favoris</span>
                    </button>

                    {/* Quick Add To Cart Button */}
                    <button
                      type="button"
                      onClick={() => setDrawerProduct(product)}
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                      aria-label="Acheter ou configurer le produit"
                    >
                      <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 active:scale-90 shadow-lg">
                        <ShoppingCart className="w-5 h-5 text-amber-300" />
                      </div>
                      <span className="text-[10px] font-bold text-white drop-shadow-md">
                        Panier
                      </span>
                    </button>

                    {/* WhatsApp Direct Order Button */}
                    <a
                      href={getWhatsAppLink(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                      aria-label="Commander ce produit sur WhatsApp"
                    >
                      <div className="p-3 rounded-full bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/40 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 active:scale-90 shadow-lg shadow-emerald-600/30">
                        <MessageCircle className="w-5 h-5 fill-white" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 drop-shadow-md">
                        WhatsApp
                      </span>
                    </a>

                  </aside>
                </div>

              </div>
            );
          })}
        </div>

        {/* DESKTOP SIDE NAVIGATION CHEVRONS */}
        <div className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 flex-col gap-3 z-30">
          <button
            type="button"
            onClick={goToPrev}
            className="p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95"
            title="Produit précédent (Flèche haut ↑)"
            aria-label="Produit précédent"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl hover:scale-110 active:scale-95"
            title="Produit suivant (Flèche bas ↓)"
            aria-label="Produit suivant"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* IN-FEED QUICK BUY DRAWER */}
        {drawerProduct && (
          <div 
            className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/98 border-t border-white/20 backdrop-blur-2xl p-4 sm:p-5 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img 
                  src={drawerProduct.images?.[0] || '/placeholder.png'} 
                  alt={drawerProduct.title} 
                  className="w-14 h-14 rounded-xl object-contain bg-black/40 border border-white/15"
                />
                <div>
                  <h4 className="text-white text-xs sm:text-sm font-bold line-clamp-1">
                    {drawerProduct.title}
                  </h4>
                  <p className="text-emerald-400 font-black text-sm mt-0.5">
                    {formatPrice(drawerProduct.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(drawerProduct)}
                  className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Voir la fiche détaillée du produit"
                  title="Voir la fiche détaillée"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(drawerProduct)}
                  className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Partager ce produit"
                  title="Partager ce produit"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerProduct(null)}
                  className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Fermer"
                  title="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Colors Selector if available */}
            {drawerProduct.colors && drawerProduct.colors.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-white/70 mb-1.5">Couleur :</p>
                <div className="flex flex-wrap gap-1.5">
                  {drawerProduct.colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColors(prev => ({ ...prev, [drawerProduct.id]: color }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        (selectedColors[drawerProduct.id] || drawerProduct.colors?.[0]) === color
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Selector if available */}
            {drawerProduct.sizes && drawerProduct.sizes.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-bold text-white/70 mb-1.5">Taille / Pointure :</p>
                <div className="flex flex-wrap gap-1.5">
                  {drawerProduct.sizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSizes(prev => ({ ...prev, [drawerProduct.id]: size }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        (selectedSizes[drawerProduct.id] || drawerProduct.sizes?.[0]) === size
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm CTA */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleConfirmAddToCart(drawerProduct)}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Confirmer l'ajout au Panier</span>
              </button>
            </div>
          </div>
        )}

        {/* SHARE TOAST NOTIFICATION */}
        {showShareToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 border border-emerald-500/40 text-white text-xs font-bold rounded-full shadow-2xl backdrop-blur-md flex items-center gap-1.5 animate-in zoom-in-95 duration-150">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Lien copié dans le presse-papier !</span>
          </div>
        )}

      </div>
    </div>
  );
};
