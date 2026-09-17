'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { ProductCard } from '@/components/ProductCard';
import { 
  Plane, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  MessageCircle, 
  Sparkles, 
  CheckCircle2, 
  Package, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Flame, 
  ArrowRight,
  Boxes,
  Truck,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const DubaiPreorderPage: React.FC = () => {
  const { 
    products, 
    categories, 
    settings, 
    formatPrice, 
    generateWhatsAppGeneralLink, 
    setSelectedProductId, 
    setCurrentView 
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Filter products that are designated as Dubai pre-orders (or tagged dubai)
  const dubaiProducts = useMemo(() => {
    return products.filter((p) => {
      const isDubai = Boolean(p.isDubaiPreorder) || 
        p.tags?.some((t) => t.toLowerCase().includes('dubai') || t.toLowerCase().includes('dubaï')) ||
        p.categoryName?.toLowerCase().includes('dubai') ||
        p.categoryName?.toLowerCase().includes('dubaï');
      return isDubai;
    });
  }, [products]);

  // If no products are marked as Dubai pre-order yet, we also include a fallback sample of featured luxury items
  const displayProducts = useMemo(() => {
    let list = dubaiProducts.length > 0 ? dubaiProducts : products.slice(0, 12);

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => 
        p.title.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [dubaiProducts, products, selectedCategory, searchQuery]);

  const dubaiCategories = useMemo(() => {
    const catIds = new Set(dubaiProducts.map((p) => p.categoryId));
    return categories.filter((c) => catIds.has(c.id));
  }, [dubaiProducts, categories]);

  const faqs = [
    {
      q: "Comment fonctionne la précommande d'articles de Dubaï ?",
      a: "C'est un service d'importation direct : vous choisissez vos articles certifiés d'origine Dubaï sur notre catalogue, vous validez et réglez votre commande en ligne (Wave, Orange Money, MTN, Moov). Notre équipe sur place à Dubaï achète immédiatement vos produits auprès des boutiques officielles et les embarque sur notre vol cargo hebdomadaire à destination d'Abidjan."
    },
    {
      q: "Quel est le délai de livraison exact à Abidjan ?",
      a: "Le délai moyen d'acheminement par fret aérien sécurisé est de 7 à 10 jours ouvrés à compter de la clôture du vol cargo. Dès l'atterrissage du colis à l'aéroport d'Abidjan, vous êtes notifié et notre coursier autonome vous livre directement à votre domicile ou bureau."
    },
    {
      q: "Pourquoi le paiement doit-il être effectué à la commande ?",
      a: "Contrairement aux articles déjà en stock à Abidjan, les articles de Dubaï sont achetés sur mesure spécialement pour vous. Le règlement d'avance garantit le blocage de votre article auprès des distributeurs officiels à Dubaï et le paiement immédiat du fret aérien international."
    },
    {
      q: "Les articles sont-ils 100% originaux et authentiques ?",
      a: "Absolument. Tous nos parfums orientaux (Lattafa, Ard Al Zaafaran, Armaf), nos montres, nos vêtements et nos appareils proviennent exclusivement des centres commerciaux et distributeurs agréés de Dubaï avec facture d'achat officielle."
    },
    {
      q: "Puis-je commander un article de Dubaï qui n'est pas sur le site ?",
      a: "Oui ! C'est notre service de Personal Shopping Dubaï sur mesure : contactez-nous directement sur WhatsApp avec la photo et la référence du produit souhaité. Nous vous envoyons un devis personnalisé en FCFA sous 2 heures."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP CARGO FLIGHT TICKER */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm py-2 px-3 shadow-lg border-b border-amber-400/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-black/20 text-slate-950">
              <Plane className="w-4 h-4 animate-pulse" />
            </span>
            <span>
              <strong>FRET AÉRIEN DUBAÏ ✈️ ABIDJAN :</strong> {settings?.dubaiNextFlightDate || 'Prochain vol cargo mardi & vendredi'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-extrabold uppercase bg-black/15 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Livraison garantie sous 7 à 10 jours ouvrés</span>
          </div>
        </div>
      </div>

      {/* 2. HERO PRESTIGE BANNER */}
      <section className="relative pt-10 pb-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-4">
            
            {/* Country Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider shadow-inner">
              <span className="text-base">🇦🇪</span>
              <span>IMPORTATION DIRECTE DUBAÏ • ÉMIRATS ARABES UNIS</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {settings?.dubaiPageTitle || 'Espace Dubaï VIP • Précommandes & Arrivages Directs'}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
              {settings?.dubaiPageSubtitle || 'Parfums orientaux de prestige (Lattafa, Ard Al Zaafaran), montres d\'exception, mode et accessoires certifiés 100% authentiques. Commandez, payez en ligne en toute sécurité et recevez votre colis à Abidjan par fret aérien express.'}
            </p>

            {/* Key Trust Highlights */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-bold">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>100% Produits Originaux</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Paiement Sécurisé (Wave, Orange, MTN)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>Livraison Domicile Abidjan (7-10j)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TRANSPARENT 3-STEP PROCESSUS */}
      <section className="py-8 sm:py-12 bg-slate-900/50 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Transparence Totale</span>
            <h2 className="text-xl sm:text-2xl font-black text-white">Comment se déroule votre précommande ?</h2>
            <p className="text-xs text-slate-400">Un suivi étape par étape avec notification WhatsApp à chaque avancée de votre colis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition shadow-lg space-y-3 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-lg border border-amber-500/30">
                1
              </div>
              <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition">
                Choix & Paiement Sécurisé en Ligne
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vous sélectionnez votre article et validez votre règlement par Mobile Money (Wave, Orange Money, MTN, Moov) ou Carte. Vous recevez immédiatement votre <strong>reçu officiel de précommande</strong> avec numéro de suivi.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition shadow-lg space-y-3 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-lg border border-amber-500/30">
                2
              </div>
              <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition">
                Achat à Dubaï & Fret Aérien Sécurisé
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Notre agent sur place achète vos articles auprès des boutiques officielles de Dubaï. Votre colis est scellé, inspecté et embarqué dans le prochain vol cargo aérien Dubaï ✈️ Abidjan.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition shadow-lg space-y-3 relative overflow-hidden group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-lg border border-amber-500/30">
                3
              </div>
              <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition">
                Arrivée à Abidjan & Livraison Express
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dès l'atterrissage à l'aéroport d'Abidjan (7 à 10 jours ouvrés), notre coursier dédié vous appelle pour convenir du lieu et de l'heure exacte de livraison à votre domicile ou bureau.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PRODUCT CATALOG & FILTERS */}
      <section className="py-8 sm:py-14 px-2 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-screen-2xl mx-auto">
        
        {/* Search & Categories Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Articles Disponibles en Précommande</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              Catalogue Officiel Import Dubaï
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher parfum, montre..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Tous les articles ({displayProducts.length})
          </button>

          {categories.map((cat) => {
            const count = dubaiProducts.length > 0 
              ? dubaiProducts.filter((p) => p.categoryId === cat.id).length
              : products.filter((p) => p.categoryId === cat.id).length;
            if (count === 0) return null;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${selectedCategory === cat.id ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3-COLUMN MOBILE GRID */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-6 gap-1.5 sm:gap-4 md:gap-5">
            {displayProducts.map((product) => {
              // Ensure product has the preorder flag if rendered here
              const productWithPreorder = {
                ...product,
                isDubaiPreorder: true,
                dubaiDeliveryDays: product.dubaiDeliveryDays || '7 à 10 jours ouvrés'
              };
              return <ProductCard key={product.id} product={productWithPreorder} />;
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">Aucun article ne correspond à votre recherche</h3>
            <p className="text-xs text-slate-400">
              Vous avez un article précis en tête que vous aimeriez importer de Dubaï ? Contactez notre agent direct sur WhatsApp !
            </p>
            <a
              href={generateWhatsAppGeneralLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Demande d'article spécial sur WhatsApp</span>
            </a>
          </div>
        )}

      </section>

      {/* 5. CUSTOM PERSONAL SHOPPING DUBAI BANNER */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-screen-2xl mx-auto">
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
              Service Personal Shopping Dubaï ✈️
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Vous cherchez un article introuvable à Abidjan ?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Envoyez-nous simplement la photo ou le lien de l'article sur WhatsApp (parfum de niche, baskets rares, abaya, montre, iPhone débloqué). Notre équipe à Dubaï vérifie le prix dans les centres commerciaux et vous donne le tarif tout compris livré à Abidjan.
            </p>
          </div>

          <a
            href={generateWhatsAppGeneralLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition shadow-xl hover:scale-105 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Envoyer ma photo sur WhatsApp</span>
          </a>

        </div>
      </section>

      {/* 6. INTERACTIVE PRE-ORDER FAQ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-1 mb-8">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Foire Aux Questions</span>
          <h2 className="text-xl sm:text-2xl font-black text-white">Questions fréquentes sur la Précommande Dubaï</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-amber-300 cursor-pointer transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
