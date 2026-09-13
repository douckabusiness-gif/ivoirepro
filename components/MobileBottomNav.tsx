'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Home, 
  Flame, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Heart,
  SlidersHorizontal,
  Sparkles,
  Users
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { 
    currentView, 
    setCurrentView, 
    cartCount, 
    setIsCartOpen,
    wishlist,
    setSelectedCategoryFilter,
    customer,
    openCustomerAuth
  } = useStore();

  const handleNavClick = (view: any) => {
    if (view === 'cart') {
      setIsCartOpen(true);
      return;
    }
    if (view === 'shop') {
      setSelectedCategoryFilter(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      view: 'home',
      badge: null
    },
    {
      id: 'flash',
      label: 'Flash',
      icon: Flame,
      view: 'home',
      badge: 'PROMO',
      action: () => {
        setCurrentView('home');
        setTimeout(() => {
          const flashElem = document.querySelector('section.bg-gradient-to-b');
          if (flashElem) {
            flashElem.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    },
    {
      id: 'shop',
      label: 'Catalogue',
      icon: ShoppingBag,
      view: 'shop',
      badge: null
    },
    {
      id: 'cart',
      label: 'Panier',
      icon: ShoppingCart,
      view: 'cart',
      badge: cartCount > 0 ? String(cartCount) : null,
      isCart: true
    },
    {
      id: 'compte',
      label: customer ? customer.fullName.split(' ')[0] : 'Compte',
      icon: User,
      view: 'compte',
      action: () => {
        if (customer) {
          setCurrentView('compte');
        } else {
          openCustomerAuth('login');
        }
      },
      badge: null
    }
  ];

  return (
    <nav 
      aria-label="Navigation mobile principale"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/90 shadow-2xl transition-colors pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = !item.isCart && (
            item.id === 'flash' 
              ? false 
              : currentView === item.view
          );

          return (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : handleNavClick(item.view)}
              className={`relative flex-1 flex flex-col items-center justify-center h-full py-1 transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold scale-105' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'}`} />

                {/* Badge (Cart Count or Promo) */}
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2.5 px-1.5 py-0.2 rounded-full text-[9px] font-black leading-tight shadow-md ${
                    item.id === 'flash'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : item.id === 'admin'
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                      : 'bg-indigo-600 text-white animate-bounce'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-black' : 'font-semibold'}`}>
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5 animate-in fade-in zoom-in duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
