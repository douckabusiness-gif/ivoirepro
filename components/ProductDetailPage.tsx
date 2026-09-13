'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { Product } from '@/lib/types';
import { 
  ArrowLeft, 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Minus, 
  Plus, 
  Sparkles, 
  Flame, 
  ChevronRight, 
  Copy, 
  CheckCheck, 
  CreditCard, 
  HelpCircle, 
  Package, 
  Clock, 
  MapPin, 
  Zap,
  Eye,
  Maximize2,
  Tag,
  ThumbsUp,
  MessageSquarePlus,
  Layers,
  Send
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { getEffectivePriceTiers, getUnitPriceForQuantity, getActiveTierIndex } from '@/lib/tierPricing';

export const ProductDetailPage = ({ initialProduct }: { initialProduct?: Product } = {}) => {
  const { 
    selectedProductId, 
    setSelectedProductId, 
    products, 
    categories,
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    generateWhatsAppProductLink,
    settings,
    setCurrentView,
    setSelectedCategoryFilter,
    setIsCheckoutOpen
  } = useStore();

  // Find product by selected ID or fallback to initialProduct or first product
  const product = (initialProduct && (!selectedProductId || selectedProductId === initialProduct.id))
    ? initialProduct
    : (products.find(p => p.id === selectedProductId) || initialProduct || products[0]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Options state
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedCity, setSelectedCity] = useState('Dakar');

  // UI state
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'shipping'>('desc');
  
  // Interactive reviews state
  const [userReviews, setUserReviews] = useState<Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
    helpfulCount: number;
  }>>([
    {
      id: 'rev-1',
      author: 'Mamadou Sow',
      rating: 5,
      date: 'Hier',
      comment: 'Article reçu en moins de 24h à Dakar ! La qualité est impressionnante, conforme aux photos. Commande passée par WhatsApp très fluide.',
      verified: true,
      helpfulCount: 14
    },
    {
      id: 'rev-2',
      author: 'Marième Diallo',
      rating: 5,
      date: 'Il y a 3 jours',
      comment: 'Super expérience d\'achat. Paiement Wave rapide et livraison sécurisée à domicile. Le packaging est soigné.',
      verified: true,
      helpfulCount: 9
    },
    {
      id: 'rev-3',
      author: 'Abdoulaye Kébé',
      rating: 4,
      date: 'Il y a 1 semaine',
      comment: 'Excellent rapport qualité-prix. Très bon produit et service client hyper réactif sur WhatsApp.',
      verified: true,
      helpfulCount: 6
    }
  ]);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Sync state when product changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Produit non trouvé</h2>
        <p className="text-sm text-slate-500 mb-6">L'article demandé n'est plus disponible ou a été déplacé.</p>
        <button
          onClick={() => setCurrentView('shop')}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm"
        >
          Retour au catalogue
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const discount = product.discountPercent || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null);

  // Wholesale tiered pricing (Volume discounts / Paliers dégressifs)
  const isTierPricingActive = Boolean(product.tierPricingEnabled);
  const tiers = getEffectivePriceTiers(product);
  const currentUnitPrice = isTierPricingActive ? getUnitPriceForQuantity(product, quantity) : product.price;
  const activeTierIdx = getActiveTierIndex(tiers, quantity);
  const totalPrice = currentUnitPrice * quantity;
  const originalTotalPrice = (product.originalPrice || product.price) * quantity;
  const totalSaved = originalTotalPrice - totalPrice;

  // Handle Add to Cart
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2200);
  };

  // Direct Buy Now (Immediate Checkout)
  const handleDirectBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setIsCheckoutOpen(true);
  };

  // Direct WhatsApp Order link with rich pre-filled message
  const handleWhatsAppOrder = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://www.ivoireci.com';
    const prodUrl = `${origin}/produit/${product.slug || product.id}`;
    const rawImg = product.images?.[0];
    const imgUrl = rawImg && !rawImg.startsWith('data:')
      ? (rawImg.startsWith('http') ? rawImg : `${origin}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
      : '';

    let customMsg = `Bonjour *${settings.storeName}* !\n\n`;
    customMsg += `Je souhaite commander cet article :\n`;
    customMsg += `🛍️ *Produit* : ${product.title}\n`;
    customMsg += `💰 *Prix unitaire* : ${formatPrice(currentUnitPrice)}\n`;
    customMsg += `📦 *Quantité* : ${quantity} unité(s)\n`;
    customMsg += `💵 *Montant Total* : *${formatPrice(totalPrice)}*\n`;
    
    if (selectedColor) {
      customMsg += `🎨 *Couleur choisie* : ${selectedColor}\n`;
    }
    if (selectedSize) {
      customMsg += `📏 *Taille / Pointure* : ${selectedSize}\n`;
    }
    customMsg += `📍 *Ville de livraison* : ${selectedCity}\n`;
    customMsg += `🔗 *Lien produit* : ${prodUrl}\n`;
    if (imgUrl) {
      customMsg += `🖼️ *Photo* : ${imgUrl}\n`;
    }
    customMsg += `\nPouvez-vous me confirmer la disponibilité et le délai d'expédition ? Merci !`;

    const url = generateWhatsAppProductLink(product, customMsg);
    window.open(url, '_blank');
  };

  // Copy product link to clipboard
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/?product=${product.id}`;
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Handle new review submission
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      date: "Aujourd'hui",
      comment: newReviewComment.trim(),
      verified: true,
      helpfulCount: 1
    };

    setUserReviews([newRev, ...userReviews]);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  // Related products from same category or random fallback
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.categoryId === product.categoryId || p.featured))
    .slice(0, 4);

  const category = categories.find(c => c.id === product.categoryId);

  return (
    <div
      data-analytics-product-id={product.id}
      data-analytics-product-title={product.title}
      className="bg-slate-100 min-h-screen pb-24 sm:pb-16"
    >
      
      {/* 1. Breadcrumbs & Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto scrollbar-none whitespace-nowrap">
            <button
              onClick={() => setCurrentView('home')}
              className="hover:text-indigo-600 font-medium transition cursor-pointer"
            >
              Accueil
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => {
                setSelectedCategoryFilter(null);
                setCurrentView('shop');
              }}
              className="hover:text-indigo-600 font-medium transition cursor-pointer"
            >
              Boutique
            </button>
            {category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(category.id);
                    setCurrentView('shop');
                  }}
                  className="hover:text-indigo-600 font-medium transition cursor-pointer text-slate-700 font-semibold"
                >
                  {category.name}
                </button>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {product.title}
            </span>
          </nav>

          <button
            onClick={() => setCurrentView('shop')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tous les articles</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 2. Main Product Showcase Grid (Gallery + Details + Buying Hub) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================================================================== */}
          {/* COLUMN LEFT: High-Res Interactive Gallery (5 cols) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs relative">
              
              {/* Main Featured Image with Zoom & Lightbox */}
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group cursor-zoom-in"
              >
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges on Gallery */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  {discount && (
                    <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>PROMO -{discount}%</span>
                    </span>
                  )}
                  {product.isFlashSale && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-md shadow-xs">
                      ⚡ VENTE FLASH
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-emerald-600 text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-xs">
                      NOUVEAU 2026
                    </span>
                  )}
                </div>

                {/* Top-Right Quick Action Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`p-2.5 rounded-xl backdrop-blur-md transition cursor-pointer shadow-md ${
                      inWishlist 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600'
                    }`}
                    title={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink();
                    }}
                    className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 backdrop-blur-md shadow-md transition cursor-pointer"
                    title="Copier le lien du produit"
                  >
                    {isCopied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-indigo-600 backdrop-blur-md shadow-md transition cursor-pointer"
                    title="Agrandir l'image"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Overlay Hint */}
                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[11px] text-slate-600 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-indigo-600" /> Cliquez pour agrandir
                  </span>
                  <span className="font-semibold text-slate-900">
                    Photo {activeImageIndex + 1}/{product.images.length}
                  </span>
                </div>
              </div>

              {/* Thumbnails Strip */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-1 scrollbar-none">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                        activeImageIndex === idx 
                          ? 'border-indigo-600 shadow-xs ring-2 ring-indigo-500/20 scale-105' 
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Logistics & Assurance Quick Badges */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-center">
                <div className="p-2 bg-slate-50 rounded-xl space-y-0.5">
                  <Truck className="w-4 h-4 text-indigo-600 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-900">Livraison 24h</p>
                  <p className="text-[9px] text-slate-500">Expédition directe</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl space-y-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-900">100% Vérifié</p>
                  <p className="text-[9px] text-slate-500">Conforme photos</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl space-y-0.5">
                  <RotateCcw className="w-4 h-4 text-sky-600 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-900">Retour 14 Jours</p>
                  <p className="text-[9px] text-slate-500">Échange facile</p>
                </div>
              </div>

            </div>
          </div>

          {/* ===================================================================== */}
          {/* COLUMN RIGHT: Product Details & Buying Control Hub (7 cols) */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Core Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
              
              {/* Category, Rating & SKU header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {product.categoryName}
                    </span>
                    {product.inStock ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        En Stock ({product.stockCount} dispos)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                        Rupture de stock
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[11px] text-slate-400 font-mono">
                    RÉF : #{product.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                {/* Main Product Title */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.title}
                </h1>

                {/* Rating score, reviews count and sold orders */}
                <div className="flex flex-wrap items-center gap-3 text-xs pt-1 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-slate-900">{product.rating}</span>
                  </div>

                  <span className="text-slate-300">•</span>

                  <button 
                    onClick={() => setActiveTab('reviews')} 
                    className="text-slate-600 hover:text-indigo-600 font-medium transition underline cursor-pointer"
                  >
                    {product.reviewCount} avis vérifiés
                  </button>

                  <span className="text-slate-300">•</span>

                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    +{(product.reviewCount || 12) * 14} commandes livrées
                  </span>
                </div>
              </div>

              {/* Wholesale Tiered Pricing Card (Prix Direct d'Approvisionnement) or Standard Price Box */}
              {isTierPricingActive ? (
                <div className="bg-[#0f172a] text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800/80 space-y-3.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        PRIX DIRECT D'APPROVISIONNEMENT
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-sky-400">
                          {formatPrice(currentUnitPrice)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm text-slate-400 font-medium">/ unité</span>
                      </div>
                    </div>

                    {totalSaved > 0 && (
                      <div className="text-right">
                        <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg inline-block">
                          Économie : {formatPrice(totalSaved)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3-Tier Interactive Pricing Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t border-slate-800/90 text-center">
                    {/* Tier 1: 1 - 4 pièces */}
                    <button
                      type="button"
                      onClick={() => setQuantity(1)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        activeTierIdx === 0
                          ? 'bg-[#1b253b] border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-[#111827]/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className={`text-[10px] sm:text-xs font-semibold ${activeTierIdx === 0 ? 'text-indigo-200 font-bold' : 'text-slate-300'}`}>
                        {tiers[0]?.minQty ?? 1}{tiers[0]?.maxQty ? ` - ${tiers[0].maxQty}` : '+'} pièces
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-white my-0.5 sm:my-1">
                        {formatPrice(tiers[0]?.price ?? product.price)}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                        {tiers[0]?.label || 'Prix détail'}
                      </p>
                    </button>

                    {/* Tier 2: 5 - 19 pièces */}
                    <button
                      type="button"
                      onClick={() => setQuantity(tiers[1]?.minQty ?? 5)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        activeTierIdx === 1
                          ? 'bg-[#1b253b] border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-[#111827]/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-[10px] sm:text-xs font-semibold text-amber-400">
                        {tiers[1]?.minQty ?? 5}{tiers[1]?.maxQty ? ` - ${tiers[1].maxQty}` : '+'} pièces
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-white my-0.5 sm:my-1">
                        {formatPrice(tiers[1]?.price ?? Math.round(product.price * 0.92))}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold">
                        {tiers[1]?.label || '-8% Remise'}
                      </p>
                    </button>

                    {/* Tier 3: 20+ pièces */}
                    <button
                      type="button"
                      onClick={() => setQuantity(tiers[2]?.minQty ?? 20)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        activeTierIdx === 2
                          ? 'bg-[#1b253b] border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-[#111827]/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-[10px] sm:text-xs font-semibold text-amber-400">
                        {tiers[2]?.minQty ?? 20}+ pièces
                      </p>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-white my-0.5 sm:my-1">
                        {formatPrice(tiers[2]?.price ?? Math.round(product.price * 0.85))}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-emerald-400 font-bold">
                        {tiers[2]?.label || '-15% Grossiste'}
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-md">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prix de vente</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-indigo-300">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">/ unité</span>
                    </div>
                  </div>
                  {discount && (
                    <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                      Économie : {formatPrice(product.originalPrice! - product.price)}
                    </span>
                  )}
                </div>
              )}

              {/* Variant Selector: Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Couleur disponible :</span>
                      <span className="text-indigo-600 font-bold">{selectedColor}</span>
                    </label>
                    <span className="text-[11px] text-slate-400">{product.colors.length} choix</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                          selectedColor === c 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-indigo-500/20' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-white/50 bg-indigo-500"></span>
                        <span>{c}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Selector: Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Taille / Format :</span>
                      <span className="text-indigo-600 font-bold">{selectedSize}</span>
                    </label>
                    <button 
                      onClick={() => setActiveTab('specs')}
                      className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                    >
                      Guide des tailles & dimensions
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-12 h-10 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center cursor-pointer ${
                          selectedSize === s 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-indigo-500/20' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Live Subtotal */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quantité :</label>
                    <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2.5 hover:bg-slate-100 text-slate-700 transition cursor-pointer disabled:opacity-30"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stockCount || 99}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 py-1 text-center font-black text-sm text-slate-900 focus:outline-hidden"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stockCount || 99, quantity + 1))}
                        className="p-2.5 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500">Sous-total ({quantity} art.) :</span>
                    <p className="text-lg font-black text-slate-900 leading-tight">
                      {formatPrice(totalPrice)}
                    </p>
                  </div>
                </div>

                {/* Free shipping alert progress */}
                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-1 border-t border-slate-200">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Livraison disponible partout à {selectedCity} et expédition dans tout le pays.</span>
                </div>
              </div>

              {/* Action Buttons: Add To Cart, Direct WhatsApp & Checkout */}
              <div className="space-y-2.5 pt-1">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Add to cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer ${
                      isAddedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-indigo-600 text-white disabled:bg-slate-200 disabled:text-slate-400'
                    }`}
                  >
                    {isAddedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Ajouter au Panier ({formatPrice(totalPrice)})</span>
                      </>
                    )}
                  </button>

                  {/* Immediate Online Checkout */}
                  <button
                    onClick={handleDirectBuyNow}
                    disabled={!product.inStock}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:bg-slate-200"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Acheter Maintenant</span>
                  </button>
                </div>

                {/* Big WhatsApp Direct Order Button */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>⚡ Commander Directement sur WhatsApp (Sans Créer de Compte)</span>
                </button>

              </div>

              {/* Destination Shipping Calculator Mini Widget */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Calculateur de Livraison :</span>
                  </span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-hidden"
                  >
                    <option value="Dakar">Dakar (Express 24h)</option>
                    <option value="Thiès">Thiès (24-48h)</option>
                    <option value="Saint-Louis">Saint-Louis (48h)</option>
                    <option value="Abidjan">Abidjan (24-48h)</option>
                    <option value="Bamako">Bamako (48-72h)</option>
                    <option value="Paris & Europe">Paris & Europe (3-5 jours)</option>
                    <option value="Autre Région">Autre Région / International</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Délai estimé pour {selectedCity} :</span>
                  <span className="font-bold text-slate-900">
                    {selectedCity === 'Dakar' ? 'Aujourd\'hui ou Demain' : '24 à 48 heures'}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. Tabbed Deep Content (Description, Technical Specs, Verified Reviews, Shipping) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('desc')}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'desc'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Description & Détails</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'specs'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Fiche Technique & Spécifications</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Avis Clients ({userReviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'shipping'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Livraison & Garantie</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-6 sm:p-8">
            
            {/* TAB 1: Description */}
            {activeTab === 'desc' && (
              <div className="space-y-6 max-w-4xl text-slate-700 leading-relaxed text-sm">
                <div>
                  <h3 className="text-base font-black text-slate-900 mb-2">
                    À Propos de : {product.title}
                  </h3>
                  <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Key Benefits Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Qualité Industrielle Certifiée</h4>
                      <p className="text-[11px] text-slate-500">Matériaux premium testés pour une durabilité maximale.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Prêt à l'Emploi</h4>
                      <p className="text-[11px] text-slate-500">Fourni avec tous ses accessoires d'origine.</p>
                    </div>
                  </div>
                </div>

                {/* Product Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Mots-clés :
                    </span>
                    {product.tags.map(t => (
                      <span key={t} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Specifications Table */}
            {activeTab === 'specs' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-base font-black text-slate-900">
                  Caractéristiques & Fiche Technique
                </h3>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-3 p-3 bg-slate-50 font-bold text-slate-900">
                    <div>Attribut</div>
                    <div className="col-span-2">Détails</div>
                  </div>
                  
                  <div className="grid grid-cols-3 p-3">
                    <span className="font-semibold text-slate-600">Catégorie</span>
                    <span className="col-span-2 text-slate-900 font-bold">{product.categoryName}</span>
                  </div>

                  <div className="grid grid-cols-3 p-3 bg-slate-50/50">
                    <span className="font-semibold text-slate-600">État du produit</span>
                    <span className="col-span-2 text-slate-900">Neuf sous blister d'origine</span>
                  </div>

                  <div className="grid grid-cols-3 p-3">
                    <span className="font-semibold text-slate-600">Garantie constructeur</span>
                    <span className="col-span-2 text-emerald-700 font-bold">12 Mois Pièces & Main d'Œuvre</span>
                  </div>

                  {product.specs && Object.entries(product.specs).map(([key, val], idx) => (
                    <div key={key} className={`grid grid-cols-3 p-3 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                      <span className="font-semibold text-slate-600">{key}</span>
                      <span className="col-span-2 text-slate-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Reviews & Add Review Form */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 max-w-4xl">
                
                {/* Rating Overview Banner */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="md:col-span-4 text-center flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                    <span className="text-4xl font-black text-slate-900">{product.rating}</span>
                    <div className="flex text-amber-400 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">Basé sur {product.reviewCount} évaluations</span>
                  </div>

                  <div className="md:col-span-8 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-slate-600">5 étoiles</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[88%]" />
                      </div>
                      <span className="w-8 text-right font-bold text-slate-700">88%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-12 text-slate-600">4 étoiles</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[10%]" />
                      </div>
                      <span className="w-8 text-right font-bold text-slate-700">10%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-12 text-slate-600">3 étoiles</span>
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[2%]" />
                      </div>
                      <span className="w-8 text-right font-bold text-slate-700">2%</span>
                    </div>
                  </div>
                </div>

                {/* Existing Reviews List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900">Avis Récents de Clients Vérifiés</h4>
                  {userReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{rev.author}</span>
                          {rev.verified && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Achat Vérifié
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{rev.date}</span>
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Review Interactive Form */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Laisser une Évaluation sur ce Produit
                    </h4>
                  </div>

                  {reviewSubmitted ? (
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Merci pour votre avis ! Il a été publié avec succès.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleAddReview} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Votre Nom & Prénom :</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Amadou Diallo"
                            value={newReviewAuthor}
                            onChange={(e) => setNewReviewAuthor(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-indigo-600"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Note Générale :</label>
                          <div className="flex items-center gap-1 py-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className="cursor-pointer"
                              >
                                <Star 
                                  className={`w-5 h-5 ${star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-slate-700 ml-2">{newReviewRating}/5 étoiles</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Votre Commentaire & Retour d'Expérience :</label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Partagez vos impressions sur la qualité, la conformité ou la rapidité de livraison..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:outline-hidden focus:border-indigo-600"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publier mon avis</span>
                      </button>
                    </form>
                  )}
                </div>

              </div>
            )}

            {/* TAB 4: Shipping & Returns */}
            {activeTab === 'shipping' && (
              <div className="space-y-4 max-w-3xl text-xs text-slate-600 leading-relaxed">
                <h3 className="text-base font-black text-slate-900">
                  Politique d'Expédition & Retours
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <p className="font-bold text-slate-900 mb-1">🚀 Expédition Express Sécurisée</p>
                    <p>Toutes les commandes sont emballées et remises à nos transporteurs sous 12 à 24 heures ouvrées. Suivi en direct disponible sur WhatsApp.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <p className="font-bold text-slate-900 mb-1">🔄 Garantie Échange ou Remboursement 14 Jours</p>
                    <p>Si l'article ne convient pas ou présente le moindre défaut, contactez simplement notre service client WhatsApp pour organiser un échange rapide.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <p className="font-bold text-slate-900 mb-1">💵 Modes de Paiement Flexibles</p>
                    <p>Nous acceptons Wave, Orange Money, Cartes Bancaires (Visa/Mastercard), Virement bancaire direct et le Paiement à la Livraison (selon la ville).</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. Related & Recommended Products Grid */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Sélection Similaire</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Produits Recommandés</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCategoryFilter(product.categoryId);
                  setCurrentView('shop');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Voir tout le rayon</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. Mobile Sticky Bottom Action Bar (Quick WhatsApp / Add to Cart) */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 z-40 shadow-2xl flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{product.title}</p>
          <p className="text-sm font-black text-slate-900">{formatPrice(totalPrice)}</p>
        </div>

        <button
          onClick={handleAddToCart}
          className="px-3.5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Panier</span>
        </button>

        <button
          onClick={handleWhatsAppOrder}
          className="px-3.5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white" />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 6. Lightbox Fullscreen Modal */}
      {/* ========================================================================= */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white text-xs font-bold mt-4">
              {product.title} • Photo {activeImageIndex + 1}/{product.images.length}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
