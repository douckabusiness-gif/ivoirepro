'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { Product } from '@/lib/types';
import { 
  ArrowLeft, 
  ShoppingBag, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Plane, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Minus, 
  Plus, 
  ChevronRight, 
  Copy, 
  CheckCheck, 
  CreditCard, 
  HelpCircle, 
  Package, 
  Zap, 
  Award,
  Smartphone,
  Info,
  RefreshCw,
  Share2,
  Lock
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export const DubaiProductDetailPage: React.FC = () => {
  const { 
    selectedProductId, 
    setSelectedProductId, 
    products, 
    formatPrice, 
    addToCart, 
    settings, 
    setCurrentView,
    setIsCheckoutOpen
  } = useStore();

  // Find the selected product or fallback to first dubai product or first overall
  const product = useMemo(() => {
    return products.find(p => p.id === selectedProductId) ||
           products.find(p => p.isDubaiPreorder) ||
           products[0];
  }, [products, selectedProductId]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant selections
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // Feedback states
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'process' | 'reviews' | 'guarantee'>('specs');

  // Customer reviews for Dubai phones
  const [reviews, setReviews] = useState([
    {
      id: 'rev-dxb-1',
      name: 'Koffi Jean-Luc B.',
      location: 'Abidjan (Cocody Ambassades)',
      date: 'Il y a 3 jours',
      rating: 5,
      phoneModel: 'iPhone 16 Pro Max 256GB Dual SIM',
      comment: 'Superbe expérience ! J\'ai reçu mon iPhone 16 Pro Max avec la vraie double SIM physique comme promis. Le colis est arrivé à Abidjan en 8 jours ouvrés, boîte scellée officielle avec facture. Je recommande à 100% !',
      verified: true
    },
    {
      id: 'rev-dxb-2',
      name: 'Dr. Aminata Touré',
      location: 'Abidjan (Marcory Zone 4)',
      date: 'Il y a 1 semaine',
      rating: 5,
      phoneModel: 'Samsung Galaxy S25 Ultra 512GB',
      comment: 'Le processeur Snapdragon est une bombe comparé aux versions européennes. Aucun problème de compatibilité avec ma puce Orange et MTN. Service conciergerie très réactif sur WhatsApp.',
      verified: true
    },
    {
      id: 'rev-dxb-3',
      name: 'Stéphane Kouassi',
      location: 'Abidjan (Plateau)',
      date: 'Il y a 2 semaines',
      rating: 5,
      phoneModel: 'Poco F6 Pro 512GB DXB Edition',
      comment: 'Reçu sous 9 jours. Rapport qualité prix imbattable, le chargeur 120W charge en 20 minutes chrono. Zéro taxe de douane surprise.',
      verified: true
    }
  ]);

  // Reset variant selections when product changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : undefined);
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-200">
        <Package className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-white mb-2">Article Dubaï introuvable</h2>
        <p className="text-sm text-slate-400 mb-6">Le modèle sélectionné n'est pas disponible pour ce vol cargo.</p>
        <button
          onClick={() => setCurrentView('home')}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition"
        >
          Retour à l'Espace Dubaï VIP
        </button>
      </div>
    );
  }

  // Calculate AED equivalent (approx 1 AED = ~168 FCFA)
  const aedPrice = Math.round(product.price / 168);
  const discount = product.discountPercent || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null);
  const savings = product.originalPrice ? (product.originalPrice - product.price) : Math.round(product.price * 0.12);

  // Specifications
  const specsEntries = product.specs ? Object.entries(product.specs) : [];

  // Related phones / Dubai products
  const relatedDubaiProducts = products
    .filter(p => Boolean(p.isDubaiPreorder) && p.id !== product.id)
    .slice(0, 6);

  // Add to cart handler
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2200);
  };

  // Direct checkout handler
  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setIsCheckoutOpen(true);
  };

  // WhatsApp concierge handler
  const handleWhatsAppOrder = () => {
    const phone = settings.whatsappNumber || '2250700000000';
    let msg = `Bonjour Service Conciergerie Dubaï ! 🇦🇪✈️\n\n`;
    msg += `Je souhaite réserver et précommander ce modèle officiel pour le prochain vol cargo :\n\n`;
    msg += `📱 *Modèle* : ${product.title}\n`;
    msg += `💰 *Prix en FCFA* : ${formatPrice(product.price * quantity)}\n`;
    msg += `🇦🇪 *Équivalent Émirats* : ≈ ${aedPrice * quantity} AED\n`;
    msg += `📦 *Quantité* : ${quantity} unité(s)\n`;
    if (selectedSize) msg += `💾 *Capacité / Stockage* : ${selectedSize}\n`;
    if (selectedColor) msg += `🎨 *Couleur choisie* : ${selectedColor}\n`;
    msg += `✈️ *Acheminement* : Fret aérien express vers Abidjan (7 à 10 jours ouvrés)\n\n`;
    msg += `Pouvez-vous me confirmer l'enregistrement de mon lot et les modalités de règlement ? Merci !`;

    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Copy link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-amber-500 selection:text-slate-950 pb-20 sm:pb-16">
      
      {/* 1. TOP VIP BANNER & NAVIGATION BAR */}
      <div className="border-b border-amber-500/20 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition group cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Retour à l'Espace Dubaï</span>
          </button>

          {/* Right badge */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Plane className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Vol Cargo Dubaï (DXB) ➔ Abidjan (ABJ)</span>
            </span>

            <button
              onClick={handleCopyLink}
              title="Partager ce produit"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            >
              {isCopied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* 2. BREADCRUMBS */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto scrollbar-none py-1">
          <button 
            onClick={() => setCurrentView('home')}
            className="hover:text-amber-400 transition whitespace-nowrap cursor-pointer"
          >
            Accueil Dubaï
          </button>
          <ChevronRight className="w-3 h-3 shrink-0 text-slate-600" />
          <span className="text-slate-400 whitespace-nowrap">
            {product.categoryName || 'Téléphones & Marques'}
          </span>
          <ChevronRight className="w-3 h-3 shrink-0 text-slate-600" />
          <span className="text-amber-300 font-bold truncate max-w-[200px] sm:max-w-md">
            {product.title}
          </span>
        </nav>
      </div>

      {/* 3. MAIN PRODUCT SHOWCASE (2 Columns) */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: GALLERY & BADGES (5 cols on lg) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Image Container */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/30 shadow-2xl shadow-amber-950/20 group">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />

              {/* UAE Origin Tag */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-amber-500/50 text-amber-300 font-black text-xs shadow-lg">
                  🇦🇪 Spécification Officielle UAE
                </span>
                {product.badgeText && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    {product.badgeText}
                  </span>
                )}
              </div>

              {/* Dual SIM physical highlight badge */}
              {product.description?.toLowerCase().includes('sim') && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-xl">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] leading-tight">
                      <strong className="text-emerald-300 block font-bold">Double SIM Physique nano+nano Dubaï</strong>
                      <span className="text-slate-300">Compatible tous réseaux Orange, MTN, Moov CI</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/30'
                        : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Reassurance Grid under images */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="text-[11px] font-bold text-white">100% Neuf & Scellé</div>
                <div className="text-[10px] text-slate-400">Boîte blister d'origine</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
                <Plane className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="text-[11px] font-bold text-white">Fret Aérien Sécurisé</div>
                <div className="text-[10px] text-slate-400">7 à 10 jours à Abidjan</div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
                <Award className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="text-[11px] font-bold text-white">Garantie 1 An</div>
                <div className="text-[10px] text-slate-400">Assistance internationale</div>
              </div>
            </div>

          </div>

          {/* RIGHT: DETAILS, SPECIFICATIONS & ORDER ACTIONS (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Brand Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
                <span>Édition Spéciale Dubaï (Émirats Arabes Unis)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {product.title}
              </h1>

              {/* Rating & Reviews Bar */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-black text-amber-300 ml-1">5.0</span>
                </div>
                <span className="text-xs text-slate-400">
                  {product.reviewCount || 36} avis vérifiés en Côte d'Ivoire
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Stock Dubaï Confirmé
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Prix de précommande tout compris (Fret + Douane) :
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-base text-slate-500 line-through font-medium">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {discount && (
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black">
                    -{discount}% économie vs magasin local
                  </span>
                )}
              </div>

              {/* AED Conversion Rate Note */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <span>🇦🇪 Équivalent officiel Dubaï :</span>
                  <span className="text-white font-mono font-black">≈ {aedPrice.toLocaleString()} AED</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Dirhams)</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Économie estimée : ~{formatPrice(savings)}
                </span>
              </div>
            </div>

            {/* UAE Dual SIM & Tech Highlights Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pourquoi commander la version Dubaï ?</span>
              </h3>
              
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Double SIM Physique (nano+nano)</strong> : Modèle officiel UAE avec deux vrais slots de puces physiques très recherchés à Abidjan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Débloqué Tout Opérateur</strong> : Compatible 5G/4G Orange, MTN et Moov CI sans aucune restriction d'opérateur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Garantie Officielle 1 An</strong> : Boîte scellée d'origine Apple / Samsung avec numéro de série vérifiable en ligne.</span>
                </li>
              </ul>
            </div>

            {/* VARIANT 1: STORAGE CAPACITY */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Capacité de Stockage :</span>
                  <span className="text-amber-400 font-black">{selectedSize || product.sizes[0]}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        selectedSize === size
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* VARIANT 2: COLOR SELECTION */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Couleur de finition :</span>
                  <span className="text-amber-400 font-black">{selectedColor || product.colors[0]}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
                        selectedColor === color
                          ? 'bg-amber-500/20 text-white border-amber-400 font-black ring-1 ring-amber-400'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{
                          backgroundColor: 
                            color.toLowerCase().includes('noir') ? '#1e293b' :
                            color.toLowerCase().includes('blanc') ? '#f8fafc' :
                            color.toLowerCase().includes('désert') ? '#d4a373' :
                            color.toLowerCase().includes('bleu') ? '#1e3a8a' :
                            color.toLowerCase().includes('gris') ? '#64748b' :
                            color.toLowerCase().includes('argent') ? '#cbd5e1' :
                            color.toLowerCase().includes('rose') ? '#f472b6' :
                            color.toLowerCase().includes('menthe') ? '#6ee7b7' : '#e2e8f0'
                        }}
                      />
                      <span>{color}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY & CARGO INFO */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-300">Quantité :</span>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-black text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 ml-auto">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Vol Cargo chaque Mardi & Vendredi</span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              
              {/* Main Preorder & Cart Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xl cursor-pointer ${
                    isAddedSuccess
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 active:scale-[0.98]'
                  }`}
                >
                  {isAddedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté au panier Dubaï !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Précommander cet article</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/30 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Régler (Wave / OM / MTN)</span>
                </button>
              </div>

              {/* Direct Concierge WhatsApp Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/40 hover:border-emerald-500 flex items-center justify-center gap-2 transition shadow-lg cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Commander via Conciergerie Dubaï (WhatsApp)</span>
              </button>

            </div>

            {/* Flight Timeline Card */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Truck className="w-4 h-4" />
                <span>Livraison & Logistique Abidjan</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Votre colis décolle de l'aéroport international de Dubaï (DXB). Le dédouanement à l'aéroport d'Abidjan (FHB) et la livraison finale à votre domicile sont <strong>intégralement pris en charge</strong> sous 7 à 10 jours ouvrés.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* 4. DETAILED TABS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
            {[
              { id: 'specs', label: '📋 Fiche Technique Complète', count: specsEntries.length },
              { id: 'process', label: '✈️ Processus d\'Achat & Fret', count: null },
              { id: 'reviews', label: `⭐ Avis Clients (${reviews.length})`, count: null },
              { id: 'guarantee', label: '🛡️ Douane & Garantie 1 An', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: TECHNICAL SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Spécifications de l'Édition Dubaï UAE</span>
              </h3>

              {specsEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {specsEntries.map(([key, value]) => (
                    <div key={key} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 flex justify-between items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">{key}</span>
                      <span className="font-bold text-slate-100 text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  {product.description}
                </p>
              )}

              {/* Full Description text */}
              <div className="pt-4 border-t border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                <h4 className="font-bold text-white text-sm">Description du produit :</h4>
                <p>{product.description}</p>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT PROCESS */}
          {activeTab === 'process' && (
            <div className="space-y-6">
              <h3 className="text-base font-black text-white">
                Circuit d'Importation & Traçabilité Dubaï
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white">Règlement Sécurisé</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Paiement préalable de la précommande par Wave, Orange Money, MTN ou Carte Bancaire pour réserver l'article à Dubaï.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white">Achat Officiel Dubaï</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Notre acheteur se rend dans la boutique agréée (Apple Store Dubai Mall ou Samsung Gulf) et vérifie le scellé d'usine.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white">Fret Aérien Sécurisé</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Embarquement sur notre vol cargo bi-hebdomadaire. Vous recevez la photo de votre colis et le numéro de suivi par WhatsApp.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    4
                  </div>
                  <h4 className="text-xs font-bold text-white">Livraison Abidjan</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dédouanement aéroport FHB pris en charge à 100%. Notre livreur vous remet le colis scellé en main propre sous 7 à 10 jours ouvrés.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">
                  Avis des acheteurs en Côte d'Ivoire ({reviews.length})
                </h3>
                <span className="text-xs text-amber-400 font-bold">100% Avis d'acheteurs vérifiés</span>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                          {rev.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{rev.name}</span>
                            <span className="text-[10px] text-emerald-400 font-normal">● Achat vérifié</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{rev.location} • {rev.date}</div>
                        </div>
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </div>

                    <div className="text-[10px] text-amber-400/80 font-medium">
                      Modèle précommandé : {rev.phoneModel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GUARANTEE & CUSTOMS */}
          {activeTab === 'guarantee' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <h3 className="text-base font-black text-white">
                Garantie Commerciale & Zéro Frais de Douane Surprise
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Dédouanement Intégralement Inclus</span>
                  </h4>
                  <p>
                    Le montant payé lors de votre commande est <strong>le prix final et définitif</strong>. Aucun frais de douane supplémentaire ne vous sera réclamé à l'aéroport d'Abidjan ou à la livraison.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Assurance Transport Aérien</span>
                  </h4>
                  <p>
                    Chaque colis voyage avec une assurance perte, casse et avarie. En cas de retard imprévu ou de dommage durant le vol, nous assurons le remplacement immédiat ou le remboursement total.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 5. SIMILAR DUBAI PREORDERS */}
      {relatedDubaiProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                Nos autres arrivages Émirats
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Complétez votre commande pour le prochain vol cargo
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {relatedDubaiProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* 6. MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-amber-500/30 p-3 shadow-2xl">
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Prix Dubaï :</div>
            <div className="text-base font-black text-amber-400 leading-tight">
              {formatPrice(product.price * quantity)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppOrder}
              className="p-2.5 rounded-xl bg-slate-800 border border-emerald-500/40 text-emerald-400 flex items-center justify-center transition"
              title="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <button
              onClick={handleAddToCart}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAddedSuccess ? 'Ajouté !' : 'Précommander'}</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
