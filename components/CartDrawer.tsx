'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  MessageCircle, 
  Truck, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { getUnitPriceForQuantity } from '@/lib/tierPricing';

export const CartDrawer = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    cartCount, 
    cartSubtotal, 
    cartShippingFee, 
    cartTotal, 
    formatPrice, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    setIsCheckoutOpen,
    generateWhatsAppGeneralLink,
    settings,
    setCurrentView 
  } = useStore();

  if (!isCartOpen) return null;

  // Free shipping threshold calculations
  const threshold = settings.freeShippingThreshold || 50000;
  const isFreeShippingUnlocked = cartSubtotal >= threshold;
  const amountToFreeShipping = Math.max(0, threshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / threshold) * 100));

  const handleWhatsAppCartOrder = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (settings.seoCanonicalUrl?.replace(/\/+$/, '') || 'https://www.ivoireci.com');

    const itemsList = cart.map((item, idx) => {
      const prodUrl = `${origin}/produit/${item.product.slug || item.product.id}`;
      const rawImg = item.product.images?.[0];
      const imgUrl = rawImg && !rawImg.startsWith('data:')
        ? (rawImg.startsWith('http') ? rawImg : `${origin}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
        : '';

      let itemText = `  ${idx + 1}. 🛍️ *${item.product.title}* (Qté: ${item.quantity}`;
      if (item.selectedColor) itemText += ` | Coul: ${item.selectedColor}`;
      if (item.selectedSize) itemText += ` | Taille: ${item.selectedSize}`;
      itemText += `) - ${formatPrice(item.product.price * item.quantity)}`;
      itemText += `\n     🔗 Lien : ${prodUrl}`;
      if (imgUrl) {
        itemText += `\n     🖼️ Photo : ${imgUrl}`;
      }
      return itemText;
    }).join('\n\n');

    const msg = `Bonjour ${settings.storeName} !\n\nJe souhaite valider ma commande avec les articles suivants :\n\n🛒 *Mon Panier :*\n${itemsList}\n\n💵 *Sous-total :* ${formatPrice(cartSubtotal)}\n🚚 *Livraison :* ${cartShippingFee === 0 ? 'GRATUITE (Offerte)' : formatPrice(cartShippingFee)}\n💰 *TOTAL :* *${formatPrice(cartTotal)}*\n\nPouvez-vous m'indiquer la procédure pour valider ma livraison ? Merci !`;

    const url = generateWhatsAppGeneralLink(msg);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800 transition-colors">
          
          {/* Drawer Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Mon Panier
                </h2>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {cartCount} article{cartCount > 1 ? 's' : ''} sélectionné{cartCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Free Shipping Progress Bar */}
          {cart.length > 0 && (
            <div className={`px-5 py-3.5 border-b transition-colors ${
              isFreeShippingUnlocked 
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60' 
                : 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50'
            }`}>
              {/* Header Status & Remaining Amount */}
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isFreeShippingUnlocked 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}>
                    {isFreeShippingUnlocked ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    {isFreeShippingUnlocked ? (
                      <span className="text-emerald-800 dark:text-emerald-300 font-black flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Livraison Express Gratuite Débloquée !
                      </span>
                    ) : (
                      <span className="text-slate-800 dark:text-slate-200">
                        Plus que <strong className="text-indigo-700 dark:text-indigo-400 font-extrabold text-sm">{formatPrice(amountToFreeShipping)}</strong> pour la livraison offerte !
                      </span>
                    )}
                  </div>
                </div>

                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                  isFreeShippingUnlocked 
                    ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300'
                }`}>
                  {freeShippingProgress}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="relative w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                    isFreeShippingUnlocked 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm' 
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                  }`} 
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>

              {/* Threshold Milestone Footer */}
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1.5">
                <span>0 FCFA</span>
                <div className="flex items-center gap-1">
                  <Gift className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  <span>Objectif : <strong>{formatPrice(threshold)}</strong> (Livraison 0 FCFA)</span>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900 dark:text-white">Votre panier est vide</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Découvrez nos articles tendances et ajoutez vos coups de cœur dès maintenant !
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('shop');
                  }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  Explorer la boutique
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Articles dans le panier ({cartCount})
                  </span>
                  <button 
                    onClick={clearCart}
                    className="text-xs text-rose-500 dark:text-rose-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Vider le panier</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div 
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                      className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700 transition"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-18 h-18 object-cover rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.product.title}
                          </h4>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.selectedColor && `Coul: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ' • '}
                              {item.selectedSize && `Taille: ${item.selectedSize}`}
                            </p>
                          )}
                          {(() => {
                            const unitPrice = getUnitPriceForQuantity(item.product, item.quantity);
                            const hasVolumeDiscount = item.product.tierPricingEnabled && unitPrice < item.product.price;
                            return (
                              <div className="flex items-baseline gap-1.5 pt-0.5">
                                <p className={`text-xs font-black ${hasVolumeDiscount ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                  {formatPrice(unitPrice)}
                                </p>
                                {hasVolumeDiscount && (
                                  <>
                                    <span className="text-[10px] text-slate-400 line-through">
                                      {formatPrice(item.product.price)}
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded">
                                      Remise volume
                                    </span>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                              aria-label="Diminuer la quantité"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-900 dark:text-white min-w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                              aria-label="Augmenter la quantité"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer & Checkout Controls */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              
              {/* Financial Recap */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Sous-total articles</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Frais de livraison</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {cartShippingFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Offerte (0 FCFA)</span>
                    ) : (
                      formatPrice(cartShippingFee)
                    )}
                  </span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white">
                  <span>Total à régler</span>
                  <span className="text-base text-indigo-600 dark:text-indigo-400">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <span>Valider la Commande & Payer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Direct WhatsApp invoice order */}
                <button
                  onClick={handleWhatsAppCartOrder}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>⚡ Commander ce Panier sur WhatsApp</span>
                </button>
              </div>

              {/* Security Tag */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Paiements & Coordonnées 100% Sécurisés</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

