'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/storeContext';
import { 
  ShoppingBag, 
  Heart, 
  Eye, 
  MessageCircle, 
  Star, 
  Check, 
  Flame,
  ShieldCheck,
  Truck,
  Sparkles
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    formatPrice, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setQuickViewProduct, 
    setSelectedProductId, 
    setCurrentView,
    generateWhatsAppProductLink 
  } = useStore();

  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const inWishlist = isInWishlist(product.id);
  const discount = product.discountPercent || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  return (
    <div 
      onClick={handleCardClick}
      data-analytics-product-id={product.id}
      data-analytics-product-title={product.title}
      data-analytics-label={`Produit: ${product.title}`}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
    >
      {/* Image Area */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 flex flex-col gap-1 z-10">
          {product.badgeText ? (
            <span className="bg-slate-900 text-indigo-300 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
              {product.badgeText}
            </span>
          ) : discount ? (
            <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
              -{discount}%
            </span>
          ) : product.isNew ? (
            <span className="bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">
              NOUVEAU
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 sm:top-3 right-2.5 sm:right-3 p-2 rounded-xl backdrop-blur-md transition shadow-xs z-10 cursor-pointer ${
            inWishlist 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/80 hover:bg-white text-slate-600 hover:text-rose-500'
          }`}
          title={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Multi-Image Preview Indicators */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.images.slice(0, 4).map((_, imgIdx) => (
              <span
                key={imgIdx}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(imgIdx);
                }}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  currentImageIndex === imgIdx ? 'bg-indigo-600 scale-125' : 'bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick View Hover Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/85 hover:bg-slate-950 text-white text-xs font-bold rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:flex items-center gap-1.5 z-10 shadow-lg cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Aperçu</span>
        </button>
      </div>

      {/* Product Content Body */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between space-y-2.5">
        
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 px-2.5 py-0.5 rounded-md uppercase tracking-wider truncate">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-[15px] text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 leading-normal">
            {product.shortDescription || product.description}
          </p>

          {/* Alibaba MOQ & Verification Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
            <span className="font-semibold text-slate-700">MOQ: 1 pièce</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Qualité Certifiée</span>
            </span>
          </div>
        </div>

        {/* Price & Stock status */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-normal">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {product.inStock ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                En Stock ({product.stockCount})
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
                Épuisé
              </span>
            )}
          </div>

          {/* Action Buttons: Add To Cart & WhatsApp Order */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                isAdded 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-950 hover:bg-indigo-600 text-white disabled:bg-slate-200 disabled:text-slate-400'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté !</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>Panier</span>
                </>
              )}
            </button>

            <a
              href={generateWhatsAppProductLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs hover:scale-[1.02] active:scale-95"
              title="Commander directement sur WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
