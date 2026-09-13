'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/storeContext';
import { CartToastInfo } from '@/lib/types';
import { 
  CheckCircle2, 
  ShoppingBag, 
  X, 
  ArrowRight, 
  Truck, 
  Sparkles,
  Zap
} from 'lucide-react';

interface ToastItemProps {
  toast: CartToastInfo;
  onDismiss: (id: string) => void;
  formatPrice: (amount: number) => string;
  cartCount: number;
  cartSubtotal: number;
  freeShippingThreshold: number;
  onOpenCart: () => void;
  onCheckout: () => void;
}

const SingleToastItem: React.FC<ToastItemProps> = ({
  toast,
  onDismiss,
  formatPrice,
  cartCount,
  cartSubtotal,
  freeShippingThreshold,
  onOpenCart,
  onCheckout
}) => {
  const DURATION_MS = 4500;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef<number>(DURATION_MS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 40;
    timerRef.current = setInterval(() => {
      remainingTimeRef.current -= intervalMs;
      const pct = Math.max(0, (remainingTimeRef.current / DURATION_MS) * 100);
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onDismiss(toast.id);
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, toast.id, onDismiss]);

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const isFreeShippingUnlocked = cartSubtotal >= freeShippingThreshold;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
      className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/15 overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-600/50 p-4 sm:p-4.5 w-full max-w-sm sm:max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      {/* Top Header: Status & Dismiss */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </span>
          <span>Ajouté au panier avec succès !</span>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Product Content Row */}
      <div className="flex items-start gap-3.5 mb-3.5">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
          <img
            src={toast.product.images[0]}
            alt={toast.product.title}
            className="w-full h-full object-cover"
          />
          {toast.quantity > 1 && (
            <span className="absolute bottom-0 right-0 bg-indigo-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-tl-md">
              x{toast.quantity}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
            {toast.product.title}
          </h4>

          {/* Variants chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            {toast.selectedColor && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                Couleur : {toast.selectedColor}
              </span>
            )}
            {toast.selectedSize && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                Taille : {toast.selectedSize}
              </span>
            )}
            <span className="font-medium">
              Qté : <strong className="text-slate-900 dark:text-white font-black">{toast.quantity}</strong>
            </span>
          </div>

          {/* Price */}
          <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            {formatPrice(toast.product.price * toast.quantity)}
          </div>
        </div>
      </div>

      {/* Free Shipping incentive mini-badge */}
      {freeShippingThreshold > 0 && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
            <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            {isFreeShippingUnlocked ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                🎉 Livraison offerte activée !
              </span>
            ) : (
              <span className="truncate">
                Plus que <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{formatPrice(amountToFreeShipping)}</strong> pour la livraison gratuite
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            onDismiss(toast.id);
            onOpenCart();
          }}
          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Panier ({cartCount})</span>
        </button>

        <button
          onClick={() => {
            onDismiss(toast.id);
            onCheckout();
          }}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/20 transition cursor-pointer"
        >
          <span>Commander</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-Dismiss Countdown Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const CartToast: React.FC = () => {
  const { 
    cartToasts, 
    dismissCartToast, 
    formatPrice, 
    cartCount, 
    cartSubtotal, 
    settings,
    setIsCartOpen,
    setIsCheckoutOpen 
  } = useStore();

  if (!cartToasts || cartToasts.length === 0) return null;

  return (
    <aside 
      aria-label="Notifications du panier"
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 flex flex-col-reverse gap-2.5 max-w-[calc(100vw-1.5rem)] sm:max-w-md pointer-events-none"
    >
      {cartToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToastItem
            toast={toast}
            onDismiss={dismissCartToast}
            formatPrice={formatPrice}
            cartCount={cartCount}
            cartSubtotal={cartSubtotal}
            freeShippingThreshold={settings.freeShippingThreshold}
            onOpenCart={() => setIsCartOpen(true)}
            onCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      ))}
    </aside>
  );
};
