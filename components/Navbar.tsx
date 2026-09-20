'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { normalizeHexColor } from '@/lib/siteTheme';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  ShieldCheck, 
  Menu, 
  X, 
  PhoneCall, 
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Flame,
  User,
  HelpCircle,
  Truck,
  Layers,
  Award,
  Zap,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Tag,
  Sun,
  Moon,
  Users,
  Bike
} from 'lucide-react';

export const Navbar = () => {
  const { 
    settings, 
    cartCount, 
    cartTotal,
    formatPrice, 
    setIsCartOpen, 
    wishlist, 
    currentView, 
    setCurrentView,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    products,
    setSelectedProductId,
    isAdminAuthenticated,
    generateWhatsAppGeneralLink,
    isDarkMode,
    toggleDarkMode,
    customer,
    openCustomerAuth,
    customerLogout,
    isSettingsLoaded
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoryMegaMenuOpen, setIsCategoryMegaMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const [logoImageError, setLogoImageError] = useState(false);

  // Check if custom image logo is present and valid
  const hasCustomLogoImage = Boolean(
    isSettingsLoaded &&
    settings.storeLogoUrl &&
    settings.storeLogoUrl.trim() !== '' &&
    !logoImageError
  );
  const headerColor = normalizeHexColor(settings.siteHeaderColor, '#ffffff');
  const searchResults = searchQuery.trim() === '' ? [] : products.filter(p => {
    if (p.isDubaiPreorder) return false;
    const matchCat = searchCategory === 'all' || p.categoryId === searchCategory;
    const q = searchQuery.toLowerCase();
    const matchText = p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q);
    return matchCat && matchText;
  }).slice(0, 6);

  const handleNavigate = (view: any, catId: string | null = null) => {
    setCurrentView(view);
    setSelectedCategoryFilter(catId);
    setIsMobileMenuOpen(false);
    setIsCategoryMegaMenuOpen(false);
    setIsSearchExpanded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCategory !== 'all') {
      setSelectedCategoryFilter(searchCategory);
    }
    setCurrentView('shop');
    setIsSearchExpanded(false);
  };

  // Keep the brand area stable while settings load, then show only the uploaded logo.
  const renderBrandLogo = (size: 'nav' | 'drawer' = 'nav') => {
    const isDrawer = size === 'drawer';
    const logoHeight = isDrawer ? 68 : 84;
    const logoFrameClass = isDrawer
      ? 'min-h-[72px] min-w-[220px] max-w-full'
      : 'min-h-[52px] min-w-[145px] sm:min-h-[68px] sm:min-w-[205px] lg:min-h-[88px] lg:min-w-[280px]';
    const logoImageClass = isDrawer
      ? 'max-h-[68px] max-w-[240px]'
      : 'max-h-[48px] max-w-[145px] sm:max-h-[64px] sm:max-w-[205px] lg:max-h-[84px] lg:max-w-[400px]';

    if (!isSettingsLoaded) {
      return (
        <div
          aria-hidden="true"
          className={`shrink-0 ${logoFrameClass}`}
        />
      );
    }

    if (hasCustomLogoImage) {
      return (
        <div
          className={`relative flex w-auto shrink-0 items-center justify-center ${logoFrameClass}`}
        >
          <img
            src={settings.storeLogoUrl}
            alt=""
            role="img"
            aria-label="Logo de la boutique"
            onError={() => setLogoImageError(true)}
            style={{
              height: `${Math.max(settings.storeLogoHeight || logoHeight, isDrawer ? 64 : 84)}px`,
            }}
            className={`w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${logoImageClass}`}
          />
        </div>
      );
    }

    // No fallback mark or store name: the branding area stays intentionally empty.
    return (
      <div aria-hidden="true" className={logoFrameClass} />
    );
  };

  return (
    <header
      className="site-header sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs transition-colors border-b border-slate-200 dark:border-slate-800"
      style={{ backgroundColor: headerColor }}
    >
      
      {/* 1. Top Mini Utility Bar */}
      <div className="bg-slate-100/90 dark:bg-slate-950/90 text-slate-700 dark:text-slate-300 text-xs sm:text-[12.5px] font-semibold border-b border-slate-200/80 dark:border-slate-800/80 hidden sm:block">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-8.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
              <Truck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Livraison express à domicile & Expédition 24h</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <a 
              href={generateWhatsAppGeneralLink()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 text-slate-700 dark:text-slate-300 transition font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/20" />
              <span>Assistance Client WhatsApp 7j/7</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <button 
              onClick={() => handleNavigate('delivery')} 
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              Garantie & Retours
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button 
              onClick={() => handleNavigate('faq')} 
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              Centre d'Aide
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header & Central Search Bar */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4 lg:gap-8">
          
          {/* Mobile Menu Trigger & Left Side on Mobile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Menu principal"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo / Brand Name Area */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => handleNavigate('home')}
              className="flex items-center gap-2.5 sm:gap-3.5 text-left group cursor-pointer select-none"
              aria-label="Retour à l'accueil"
            >
              {/* Branded Logo Image OR Vector Emblem */}
              {renderBrandLogo('nav')}
              
            </button>
          </div>

          {/* Central Search Bar (Desktop & Large screens) */}
          <div className="hidden lg:flex flex-1 max-w-2xl flex-col">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="flex w-full items-center rounded-full border-2 border-indigo-600/90 hover:border-indigo-600 bg-white dark:bg-slate-800/90 overflow-hidden shadow-xs hover:shadow-md transition-all focus-within:ring-4 focus-within:ring-indigo-500/20">
                
                {/* Category Dropdown inside Search */}
                <div className="bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 px-3.5 py-2 flex items-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="bg-transparent focus:outline-hidden cursor-pointer text-xs pr-1 dark:text-slate-200 font-bold"
                  >
                    <option value="all" className="dark:bg-slate-800">Toutes les catégories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="dark:bg-slate-800">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Text Input */}
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Que recherchez-vous ? (ex: Sneakers, Casque, Montre...)"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden bg-transparent"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Action Button */}
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Rechercher</span>
                </button>
              </div>

              {/* Instant Search Dropdown Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 mt-2 p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span>Produits correspondants ({searchResults.length})</span>
                    <span className="text-indigo-600 dark:text-indigo-400">Entrée pour voir tout</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {searchResults.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          setCurrentView('product-detail');
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 p-2 hover:bg-indigo-50/60 dark:hover:bg-slate-700/60 rounded-xl transition text-left cursor-pointer group border border-transparent hover:border-indigo-100 dark:hover:border-slate-600"
                      >
                        <img 
                          src={prod.images[0]} 
                          alt={prod.title} 
                          className="w-11 h-11 object-cover rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0 group-hover:scale-105 transition-transform" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{prod.title}</p>
                          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">{formatPrice(prod.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('shop');
                    }}
                    className="w-full text-center py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50/50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl mt-2 cursor-pointer transition flex items-center justify-center gap-1"
                  >
                    <span>Voir tous les résultats dans la boutique</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* User Action Badges (Dark Mode, Wishlist, WhatsApp Order, Cart, Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
              aria-label={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 transition-transform hover:rotate-45 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 transition-transform hover:-rotate-12 text-slate-700" />
              )}
            </button>

            {/* WhatsApp Quick Order Hub */}
            <a
              href={generateWhatsAppGeneralLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer group"
              title="Discuter directement avec le service client"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <MessageCircle className="w-4 h-4 fill-white" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-extrabold tracking-wider block leading-none">WhatsApp</span>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">Commander</span>
              </div>
            </a>

            {/* Wishlist Button */}
            <button
              onClick={() => setCurrentView('shop')}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Favoris"
              aria-label="Favoris"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger with Counter & Preview */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-500 transition shadow-sm cursor-pointer group"
              aria-label="Panier"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-indigo-300 dark:text-white group-hover:text-white transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 dark:bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 dark:border-slate-950 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[10px] text-slate-400 dark:text-indigo-200 group-hover:text-indigo-200 block leading-tight font-medium">Panier</span>
                <span className="text-xs font-bold">{cartTotal > 0 ? formatPrice(cartTotal) : '0 F'}</span>
              </div>
            </button>

            {/* Customer Account Button */}
            {customer ? (
              <button
                onClick={() => setCurrentView('compte')}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
                title="Mon Espace Client Privilège"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  {customer.fullName.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-[10px] text-slate-500 dark:text-indigo-300 block leading-tight">Bonjour</span>
                  <span className="text-xs font-black truncate max-w-[85px] block">{customer.fullName.split(' ')[0]}</span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => openCustomerAuth('login')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="Se connecter / Créer un compte"
              >
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden md:inline">Mon Compte</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchExpanded && (
          <form onSubmit={handleSearchSubmit} className="lg:hidden pt-3 animate-in slide-in-from-top duration-200">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher des articles..."
                autoFocus
                className="w-full pl-9 pr-9 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* 3. Category Navigation Bar (Desktop) */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:block">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 text-xs sm:text-[13px] font-extrabold text-slate-700 dark:text-slate-300">
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
              
              {/* Mega Categories Trigger */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsCategoryMegaMenuOpen(!isCategoryMegaMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer font-extrabold text-xs sm:text-[13px] shadow-xs hover:scale-105 active:scale-95"
                >
                  <Layers className="w-4 h-4" />
                  <span>Toutes les catégories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryMegaMenuOpen && (
                  <div 
                    onMouseLeave={() => setIsCategoryMegaMenuOpen(false)}
                    className="absolute top-full left-0 w-80 bg-white dark:bg-slate-800 rounded-b-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <button
                      onClick={() => handleNavigate('shop', null)}
                      className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between font-extrabold cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Tout le catalogue ({products.length} articles)</span>
                      </span>
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleNavigate('shop', cat.id)}
                        className="w-full text-left px-4 py-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-bold">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                          {products.filter(p => !p.isDubaiPreorder && p.categoryId === cat.id).length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* All Products Link */}
              <button
                onClick={() => handleNavigate('shop', null)}
                className={`shrink-0 px-4 py-2 rounded-xl transition cursor-pointer font-extrabold text-xs sm:text-[13px] whitespace-nowrap ${
                  currentView === 'shop' && !selectedCategoryFilter
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Tous les articles</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" />

              {/* Real Product Categories Only */}
              {categories.map((cat) => {
                const isSelected = selectedCategoryFilter === cat.id && currentView === 'shop';
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleNavigate('shop', cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-xl transition cursor-pointer font-bold text-xs sm:text-[13px] whitespace-nowrap ${
                      isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-black'
                        : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}

              {/* Espace Dubaï VIP Link */}
              {settings.dubaiPageEnabled !== false && (
                <a
                  href="/dubai"
                  className="shrink-0 ml-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer whitespace-nowrap border border-amber-400/40"
                >
                  <span>✈️</span>
                  <span>Espace Dubaï</span>
                  <span className="text-[9px] bg-black/30 px-1.5 py-0.2 rounded font-extrabold uppercase text-amber-200">
                    Précommandes
                  </span>
                </a>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 4. Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 bg-black/60 z-50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-5/6 max-w-sm h-full p-5 shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-slate-800">
            <div className="space-y-5">
              
              {/* Drawer Brand Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  {renderBrandLogo('drawer')}
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Theme Switcher */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isDarkMode ? 'Mode Sombre' : 'Mode Clair'}
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="px-3 py-1 bg-white dark:bg-slate-700 text-xs font-bold rounded-lg shadow-xs border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white cursor-pointer"
                >
                  Changer
                </button>
              </div>

              {/* Menu Navigation Links */}
              <div className="space-y-1">
                <button
                  onClick={() => handleNavigate('home')}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Accueil
                </button>
                <button
                  onClick={() => {
                    handleNavigate('home');
                    setTimeout(() => {
                      const flashSection = document.querySelector('section.bg-gradient-to-b');
                      if (flashSection) flashSection.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 fill-rose-600 dark:fill-rose-400 animate-bounce" />
                    <span>Ventes Flash & Super Deals</span>
                  </div>
                  <span className="px-1.5 py-0.2 text-[9px] bg-rose-600 text-white rounded-md font-black uppercase">Hot</span>
                </button>

                {/* Espace Dubaï VIP Mobile */}
                {settings.dubaiPageEnabled !== false && (
                  <a
                    href="/dubai"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-3 py-2.5 rounded-xl font-black text-amber-900 dark:text-amber-200 bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-transparent border border-amber-500/30 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">✈️</span>
                      <span>Espace Dubaï (Précommandes)</span>
                    </div>
                    <span className="px-1.5 py-0.2 text-[9px] bg-amber-500 text-slate-950 rounded-md font-black uppercase">VIP</span>
                  </a>
                )}

                <button
                  onClick={() => handleNavigate('shop')}
                  className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Catalogue Complet ({products.length} articles)
                </button>

                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">Catégories</p>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleNavigate('shop', cat.id)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 rounded-xl flex items-center justify-between transition cursor-pointer font-medium"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-slate-400 font-bold">
                        {products.filter(p => !p.isDubaiPreorder && p.categoryId === cat.id).length}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 space-y-1">
                  <button
                    onClick={() => handleNavigate('delivery')}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Livraison & Retours
                  </button>
                  <button
                    onClick={() => handleNavigate('faq')}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Foire Aux Questions (FAQ)
                  </button>
                  <button
                    onClick={() => handleNavigate('contact')}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Contact & Support WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {customer ? (
                <button
                  onClick={() => handleNavigate('compte')}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Mon Espace Client ({customer.fullName.split(' ')[0]})</span>
                </button>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); openCustomerAuth('login'); }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Connexion / Mon Compte</span>
                </button>
              )}

              <a
                href={generateWhatsAppGeneralLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Assistance WhatsApp 7j/7</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
