'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/storeContext';
import { 
  X, 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Minus, 
  Plus, 
  Share2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { getEffectivePriceTiers, getUnitPriceForQuantity, getActiveTierIndex } from '@/lib/tierPricing';

interface ProductDetailModalProps {
  product?: Product | null;
  onClose?: () => void;
  isFullPageView?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product: propProduct, 
  onClose: propOnClose,
  isFullPageView = false
}) => {
  const { 
    quickViewProduct,
    setQuickViewProduct,
    setSelectedProductId,
    products,
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    generateWhatsAppProductLink,
    settings,
    setCurrentView 
  } = useStore();

  const product = propProduct !== undefined ? propProduct : quickViewProduct;
  const onClose = propOnClose || (() => setQuickViewProduct(null));

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const discount = product.discountPercent || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null);

  const isTierPricingActive = Boolean(product.tierPricingEnabled);
  const tiers = getEffectivePriceTiers(product);
  const currentUnitPrice = isTierPricingActive ? getUnitPriceForQuantity(product, quantity) : product.price;
  const activeTierIdx = getActiveTierIndex(tiers, quantity);
  const totalPrice = currentUnitPrice * quantity;
  const originalTotalPrice = (product.originalPrice || product.price) * quantity;
  const totalSaved = originalTotalPrice - totalPrice;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2000);
  };

  const handleWhatsAppOrder = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://www.ivoireci.com';
    const prodUrl = `${origin}/produit/${product.slug || product.id}`;
    const rawImg = product.images?.[0];
    const imgUrl = rawImg && !rawImg.startsWith('data:')
      ? (rawImg.startsWith('http') ? rawImg : `${origin}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
      : '';

    let customText = `Bonjour ${settings.storeName} !\n\nJe souhaite passer commande pour cet article :\n👉 *${product.title}*\n💰 Prix unitaire : *${formatPrice(currentUnitPrice)}*\n📦 Quantité : *${quantity}*\n💵 Total : *${formatPrice(totalPrice)}*`;
    if (selectedColor) customText += `\n🎨 Couleur : *${selectedColor}*`;
    if (selectedSize) customText += `\n📏 Taille/Pointure : *${selectedSize}*`;
    customText += `\n🔗 Lien produit : ${prodUrl}`;
    if (imgUrl) {
      customText += `\n🖼️ Photo : ${imgUrl}`;
    }
    customText += `\n\nPouvez-vous me confirmer la disponibilité et le délai de livraison ? Merci !`;

    const url = generateWhatsAppProductLink(product, customText);
    window.open(url, '_blank');
  };

  const content = (
    <div
      data-analytics-product-id={product.id}
      data-analytics-product-title={product.title}
      className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 max-w-5xl w-full mx-auto relative flex flex-col my-auto max-h-[92vh]"
    >
      
      {/* Header bar for Modal */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          {isFullPageView ? (
            <button 
              onClick={() => setCurrentView('shop')}
              className="flex items-center gap-1.5 text-slate-900 hover:text-indigo-600 font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Retour à la boutique
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span>Aperçu Rapide</span>
              <button
                onClick={() => {
                  onClose();
                  setSelectedProductId(product.id);
                  setCurrentView('product-detail');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Fiche complète</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              inWishlist 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600'
            }`}
            title="Favoris"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Gallery Column (md:col-span-6) */}
          <div className="md:col-span-6 space-y-4">
            {/* Active Big Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              {discount && (
                <div className="absolute top-3 left-3 bg-indigo-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                  PROMO -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-indigo-600 shadow-sm ring-2 ring-indigo-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust highlights under gallery */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="space-y-1">
                <Truck className="w-4 h-4 text-indigo-600 mx-auto" />
                <p className="text-[10px] font-bold text-slate-800">Livraison 24-48h</p>
              </div>
              <div className="space-y-1 border-x border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                <p className="text-[10px] font-bold text-slate-800">100% Authentique</p>
              </div>
              <div className="space-y-1">
                <RotateCcw className="w-4 h-4 text-sky-600 mx-auto" />
                <p className="text-[10px] font-bold text-slate-800">Retour 14 Jours</p>
              </div>
            </div>
          </div>

          {/* Details & Action Column (md:col-span-6) */}
          <div className="md:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
                  {product.categoryName}
                </span>
                {product.inStock ? (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    En Stock ({product.stockCount} dispos)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                    Rupture temporaire
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-900">{product.rating}</span>
                <span className="text-slate-400">({product.reviewCount} évaluations vérifiées)</span>
              </div>
            </div>

            {/* Price Box / Wholesale Tiered Pricing */}
            {isTierPricingActive ? (
              <div className="bg-[#0f172a] text-white rounded-2xl p-4 shadow-lg border border-slate-800 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      PRIX DIRECT D'APPROVISIONNEMENT
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-sky-400">
                        {formatPrice(currentUnitPrice)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-medium">/ unité</span>
                    </div>
                  </div>

                  {totalSaved > 0 && (
                    <div className="text-right">
                      <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-lg inline-block">
                        Économie : {formatPrice(totalSaved)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3-Tier Interactive Pricing Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-800 text-center">
                  {/* Tier 1: 1 - 4 pièces */}
                  <button
                    type="button"
                    onClick={() => setQuantity(1)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      activeTierIdx === 0
                        ? 'bg-[#1b253b] border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-[#111827]/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className={`text-[10px] font-semibold ${activeTierIdx === 0 ? 'text-indigo-200 font-bold' : 'text-slate-300'}`}>
                      {tiers[0]?.minQty ?? 1}{tiers[0]?.maxQty ? ` - ${tiers[0].maxQty}` : '+'} pièces
                    </p>
                    <p className="text-xs sm:text-sm font-black text-white my-0.5">
                      {formatPrice(tiers[0]?.price ?? product.price)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">
                      {tiers[0]?.label || 'Prix détail'}
                    </p>
                  </button>

                  {/* Tier 2: 5 - 19 pièces */}
                  <button
                    type="button"
                    onClick={() => setQuantity(tiers[1]?.minQty ?? 5)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      activeTierIdx === 1
                        ? 'bg-[#1b253b] border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-[#111827]/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-[10px] font-semibold text-amber-400">
                      {tiers[1]?.minQty ?? 5}{tiers[1]?.maxQty ? ` - ${tiers[1].maxQty}` : '+'} pièces
                    </p>
                    <p className="text-xs sm:text-sm font-black text-white my-0.5">
                      {formatPrice(tiers[1]?.price ?? Math.round(product.price * 0.92))}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-bold">
                      {tiers[1]?.label || '-8% Remise'}
                    </p>
                  </button>

                  {/* Tier 3: 20+ pièces */}
                  <button
                    type="button"
                    onClick={() => setQuantity(tiers[2]?.minQty ?? 20)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      activeTierIdx === 2
                        ? 'bg-[#1b253b] border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-[#111827]/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-[10px] font-semibold text-amber-400">
                      {tiers[2]?.minQty ?? 20}+ pièces
                    </p>
                    <p className="text-xs sm:text-sm font-black text-white my-0.5">
                      {formatPrice(tiers[2]?.price ?? Math.round(product.price * 0.85))}
                    </p>
                    <p className="text-[9px] text-emerald-400 font-bold">
                      {tiers[2]?.label || '-15% Grossiste'}
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Prix TTC Spécial</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-indigo-300">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {discount && (
                  <div className="text-right">
                    <span className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg">
                      Économisez {formatPrice(product.originalPrice! - product.price)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Options: Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Couleur : <span className="text-indigo-600 font-normal">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        selectedColor === c 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Options: Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Taille / Pointure : <span className="text-indigo-600 font-normal">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-10 rounded-xl text-xs font-bold border transition flex items-center justify-center cursor-pointer ${
                        selectedSize === s 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center gap-4 pt-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quantité :</label>
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-2 text-sm font-black text-slate-900 min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockCount || 99, quantity + 1))}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-slate-500">
                Total : <strong className="text-slate-900">{formatPrice(totalPrice)}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                  isAddedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 disabled:bg-slate-200 disabled:text-slate-400'
                }`}
              >
                {isAddedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Produit ajouté au panier !</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Ajouter au Panier ({formatPrice(product.price * quantity)})</span>
                  </>
                )}
              </button>

              {/* Direct WhatsApp Ordering */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2.5 shadow-sm transition cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>⚡ Commander Immédiatement sur WhatsApp</span>
              </button>
            </div>

          </div>

        </div>

        {/* Tabs: Description, Specs, Reviews */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('desc')}
              className={`text-sm font-bold pb-2 transition cursor-pointer ${
                activeTab === 'desc' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Description Complète
            </button>
            {product.specs && (
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm font-bold pb-2 transition cursor-pointer ${
                  activeTab === 'specs' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Caractéristiques Techniques
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-bold pb-2 transition cursor-pointer ${
                activeTab === 'reviews' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Avis Clients ({product.reviewCount})
            </button>
          </div>

          <div className="pt-4 text-sm text-slate-600 leading-relaxed">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p className="whitespace-pre-line">{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {product.tags.map(t => (
                      <span key={t} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && product.specs && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-700">{key}</span>
                    <span className="text-slate-600 text-right">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-center">
                    <div className="text-3xl font-black text-slate-900">{product.rating}</div>
                    <div className="flex text-amber-400 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-700 border-l border-slate-200 pl-4">
                    <p className="font-bold">98% de clients satisfaits</p>
                    <p className="text-slate-500">Basé sur {product.reviewCount} avis authentiques après commande.</p>
                  </div>
                </div>

                {/* Sample feedback items */}
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Mamadou S. (Client vérifié)</span>
                      <span className="text-slate-400">Il y a 2 jours</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">
                      "Article reçu en moins de 24h à Dakar ! La qualité est impressionnante, conforme aux photos. Commande passée par WhatsApp très fluide."
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Marième D. (Client vérifié)</span>
                      <span className="text-slate-400">Il y a 5 jours</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">
                      "Super expérience d'achat. Paiement Wave rapide et livraison sécurisée. Je recommande vivement cette boutique."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );

  if (isFullPageView) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {content}
    </div>
  );
};
