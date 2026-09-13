'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { StoreSettings, InGridBannerItem } from '@/lib/types';
import { 
  Sparkles, 
  Flame, 
  Gift, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  ArrowRight, 
  Zap, 
  Tag, 
  ExternalLink
} from 'lucide-react';

interface InGridPromoBannerProps {
  bannerType?: 'primary' | 'secondary';
  bannerItem?: InGridBannerItem;
  customSettings?: Partial<StoreSettings>;
  isPreview?: boolean;
}

export const InGridPromoBanner: React.FC<InGridPromoBannerProps> = ({
  bannerType = 'primary',
  bannerItem,
  customSettings,
  isPreview = false
}) => {
  const { 
    settings: globalSettings, 
    setCurrentView, 
    setSelectedCategoryFilter,
    setSelectedProductId,
    openCustomerAuth 
  } = useStore();

  const settings = { ...globalSettings, ...customSettings };

  const isPrimary = bannerType === 'primary';
  const isEnabled = bannerItem
    ? bannerItem.enabled !== false
    : isPrimary 
      ? settings.inGridBannerEnabled !== false 
      : Boolean(settings.inGridBannerSecondaryEnabled);

  if (!isEnabled && !isPreview) return null;

  const isGraphic = bannerItem?.displayMode === 'graphic';
  const title = bannerItem?.title || (isPrimary ? settings.inGridBannerTitle : settings.inGridBannerSecondaryTitle) || 'Offre Spéciale';
  const subtitle = bannerItem?.subtitle || (isPrimary ? settings.inGridBannerSubtitle : settings.inGridBannerSecondarySubtitle) || '';
  const badge = bannerItem?.badge || (isPrimary ? settings.inGridBannerBadge : settings.inGridBannerSecondaryBadge) || '⚡ PROMO';
  const buttonText = bannerItem?.buttonText || (isPrimary ? settings.inGridBannerButtonText : settings.inGridBannerSecondaryButtonText) || 'En Profiter';
  const action = bannerItem?.buttonAction || (isPrimary ? settings.inGridBannerButtonAction : settings.inGridBannerSecondaryButtonAction) || 'shop';
  const theme = bannerItem?.theme || (isPrimary ? settings.inGridBannerTheme : settings.inGridBannerSecondaryTheme) || 'gold';
  const imageUrl = bannerItem ? bannerItem.imageUrl : isPrimary ? settings.inGridBannerImageUrl : settings.inGridBannerSecondaryImageUrl;

  // Theme styling configurations
  const themeStyles = {
    gold: {
      wrapper: 'from-slate-950 via-amber-950/70 to-slate-900 border-amber-500/30 shadow-amber-500/10',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badgeIcon: <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />,
      button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-amber-500/20',
      accentGlow: 'bg-amber-500/10',
      tagText: 'text-amber-400'
    },
    midnight: {
      wrapper: 'from-slate-950 via-indigo-950/80 to-purple-950/60 border-indigo-500/30 shadow-indigo-500/10',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      badgeIcon: <Sparkles className="w-3.5 h-3.5 text-indigo-400" />,
      button: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black shadow-indigo-500/20',
      accentGlow: 'bg-indigo-500/10',
      tagText: 'text-indigo-400'
    },
    emerald: {
      wrapper: 'from-slate-950 via-emerald-950/70 to-slate-900 border-emerald-500/30 shadow-emerald-500/10',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badgeIcon: <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />,
      button: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black shadow-emerald-500/20',
      accentGlow: 'bg-emerald-500/10',
      tagText: 'text-emerald-400'
    },
    sunset: {
      wrapper: 'from-slate-950 via-rose-950/70 to-amber-950/60 border-rose-500/30 shadow-rose-500/10',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      badgeIcon: <Gift className="w-3.5 h-3.5 text-rose-400" />,
      button: 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black shadow-rose-500/20',
      accentGlow: 'bg-rose-500/10',
      tagText: 'text-rose-400'
    },
    dark: {
      wrapper: 'from-slate-900 via-slate-800 to-slate-950 border-slate-700 shadow-slate-900/40',
      badge: 'bg-slate-700/60 text-slate-200 border-slate-600',
      badgeIcon: <Tag className="w-3.5 h-3.5 text-slate-300" />,
      button: 'bg-white hover:bg-slate-100 text-slate-950 font-black shadow-white/10',
      accentGlow: 'bg-white/5',
      tagText: 'text-slate-300'
    },
    custom: {
      wrapper: 'from-slate-950/90 via-slate-900/90 to-slate-950/90 border-slate-700 backdrop-blur-md',
      badge: 'bg-white/20 text-white border-white/30 backdrop-blur-md',
      badgeIcon: <Sparkles className="w-3.5 h-3.5 text-white" />,
      button: 'bg-white hover:bg-slate-100 text-slate-950 font-black shadow-lg',
      accentGlow: 'bg-indigo-500/10',
      tagText: 'text-white'
    }
  };

  const currentTheme = themeStyles[theme as keyof typeof themeStyles] || themeStyles.gold;

  const handleAction = () => {
    if (isPreview) return;

    const linkTarget = bannerItem?.buttonLink || settings.inGridBannerButtonLink || '';

    if (action === 'flash') {
      setCurrentView('shop');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } else if (action === 'vip') {
      openCustomerAuth('register');
    } else if (action === 'whatsapp') {
      const cleanPhone = (settings.whatsappNumber || '225078901234').replace(/[^0-9]/g, '');
      const msg = bannerItem?.whatsappMessage || `Bonjour ${settings.storeName} ! J'ai vu votre offre "${title}" et je souhaite en savoir plus.`;
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else if (action === 'product') {
      const prodId = bannerItem?.targetProductId || linkTarget;
      if (prodId) {
        setSelectedProductId(prodId);
        setCurrentView('product-detail');
      } else {
        setCurrentView('shop');
      }
    } else if (action === 'category') {
      const catId = bannerItem?.targetCategoryId || linkTarget;
      if (catId) {
        setSelectedCategoryFilter(catId);
      }
      setCurrentView('shop');
    } else if (action === 'link' && linkTarget) {
      if (linkTarget.startsWith('http')) {
        window.open(linkTarget, '_blank');
      } else {
        window.location.href = linkTarget;
      }
    } else {
      setCurrentView('shop');
    }
  };

  // Pure Graphic Mode
  if (isGraphic && imageUrl) {
    return (
      <div 
        onClick={handleAction}
        className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 cursor-pointer group transition-all"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border bg-gradient-to-r ${currentTheme.wrapper} text-white shadow-xl transition-all duration-300`}>
      
      {/* Background Cover Image */}
      {imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Decorative radial glows */}
      <div className={`absolute -right-12 -bottom-12 w-64 h-64 rounded-full blur-3xl pointer-events-none ${currentTheme.accentGlow}`} />
      <div className={`absolute -left-12 -top-12 w-64 h-64 rounded-full blur-3xl pointer-events-none ${currentTheme.accentGlow}`} />

      {/* Main Container Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
        
        {/* Left / Center Info */}
        <div className="space-y-3 sm:space-y-4 max-w-2xl">
          
          {/* Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            {badge && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-xs ${currentTheme.badge}`}>
                {currentTheme.badgeIcon}
                <span>{badge}</span>
              </span>
            )}

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-300 font-semibold bg-black/30 px-2.5 py-0.5 rounded-full border border-white/10">
              <Truck className="w-3 h-3 text-emerald-400" />
              {settings.estimatedDeliveryDays || 'Livraison Express Garantie'}
            </span>
          </div>

          {/* Punchy Title */}
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          )}

          {/* Quick Perks Icons */}
          <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Authentique
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-indigo-400" /> Support WhatsApp 7j/7
            </span>
          </div>

        </div>

        {/* Right Action CTA Button */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
          <button
            type="button"
            onClick={handleAction}
            className={`px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm tracking-wide transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 shadow-lg ${currentTheme.button}`}
          >
            {action === 'whatsapp' ? (
              <MessageCircle className="w-4 h-4 fill-current" />
            ) : action === 'vip' ? (
              <Gift className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
