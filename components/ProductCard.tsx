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
  ShieldCheck
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
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    addToCart(product, 1, defaultColor, defaultSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setCurrentView('product-detail');
  };

  // Wholesale / Tier price calculation if enabled
  const wholesalePrice = product.tierPricingEnabled 
    ? Math.round(product.price * 0.85)
    : null;

  return (
    <div 
      onClick={handleCardClick}
      data-analytics-product-id={product.id}
      data-analytics-product-title={product.title}
      data-analytics-label={`Produit: ${product.title}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative select-none"
    >
      {/* 1. Zone Image Premium */}
      <div className="relative aspect-square w-full bg-slate-50 dark:bg-slate-950/60 overflow-hidden">
        <img
          src={product.images[currentImageIndex] || product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Badges Overlay (Haut Gauche) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isFlashSale ? (
            <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <Flame className="w-2.5 h-2.5 fill-white animate-pulse" />
              <span>Flash</span>
            </span>
          ) : discount ? (
            <span className="bg-rose-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
              -{discount}%
            </span>
          ) : product.badgeText ? (
            <span className="bg-indigo-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
              {product.badgeText}
            </span>
          ) : product.isNew ? (
            <span className="bg-emerald-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
              NOUVEAU
            </span>
          ) : null}
        </div>

        {/* Bouton Favoris / Wishlist (Haut Droite) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-xs z-10 cursor-pointer ${
            inWishlist 
              ? 'bg-rose-500 text-white shadow-rose-500/30' 
              : 'bg-white/85 dark:bg-slate-900/80 text-slate-500 hover:text-rose-500 hover:bg-white'
          }`}
          title={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Badge Variantes (Bas Gauche sur l'image style Alibaba) */}
        {((product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0)) && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded-md bg-slate-950/75 backdrop-blur-sm text-white text-[9px] font-bold border border-white/10 flex items-center gap-1 shadow-2xs">
              {product.colors && product.colors.length > 0 && (
                <span>{product.colors.length} col.</span>
              )}
              {product.colors && product.colors.length > 0 && product.sizes && product.sizes.length > 0 && (
                <span>•</span>
              )}
              {product.sizes && product.sizes.length > 0 && (
                <span>{product.sizes.length} tailles</span>
              )}
            </span>
          </div>
        )}

        {/* Multi-Image Preview Indicators Desktop */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 hidden sm:flex justify-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Aperçu rapide desktop */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          className="absolute bottom-3 right-2 px-2.5 py-1 bg-slate-900/85 hover:bg-slate-950 text-white text-[11px] font-bold rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hidden sm:flex items-center gap-1 z-10 shadow-md cursor-pointer"
        >
          <Eye className="w-3 h-3" />
          <span>Aperçu</span>
        </button>
      </div>

      {/* 2. Contenu Texte & Infos (Inspiré Alibaba, ultra-propre et aéré) */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between gap-2">
        
        <div className="space-y-1">
          
          {/* Ligne Catégorie & Note Étoile */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold uppercase tracking-wider truncate max-w-[105px]">
              {product.categoryName}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{product.rating || 4.9}</span>
              <span className="text-slate-400 font-normal text-[9px]">({product.reviewCount || 12})</span>
            </div>
          </div>

          {/* Titre Produit (2 lignes clampées nettes style Alibaba) */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Bloc Prix Principal & Remise */}
          <div className="pt-0.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through font-normal">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Mention Prix de gros si activé */}
            {wholesalePrice && (
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                <span>Dès {formatPrice(wholesalePrice)} en gros</span>
              </p>
            )}
          </div>

          {/* Badges de Confiance & Réachat style Alibaba */}
          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
            <span className="text-indigo-600 dark:text-indigo-400 font-black bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" />
              <span>Certifié</span>
            </span>
            <span>•</span>
            {product.inStock ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" />
                <span>En stock</span>
              </span>
            ) : (
              <span className="text-rose-500 font-bold">Épuisé</span>
            )}
            <span>•</span>
            <span className="truncate">Livraison 24h</span>
          </div>

        </div>

        {/* 3. Boutons d'Action Compacts & Ergonomiques Mobile */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70 flex items-center gap-1.5">
          {/* Bouton WhatsApp direct */}
          <a
            href={generateWhatsAppProductLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-1.5 sm:py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 transition shadow-xs hover:scale-[1.02] active:scale-95 cursor-pointer truncate"
            title="Commander directement sur WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          {/* Bouton Panier Rapide */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-xl flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-600 dark:hover:text-white'
            }`}
            title="Ajouter au panier"
          >
            {isAdded ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
