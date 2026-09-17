'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { ProductCard } from '@/components/ProductCard';
import { DubaiNavbar } from '@/components/DubaiNavbar';
import { DubaiHeroBanner } from '@/components/DubaiHeroBanner';
import { DubaiFlightTicker } from '@/components/DubaiFlightTicker';
import { DubaiFooter } from '@/components/DubaiFooter';
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
  ExternalLink,
  SlidersHorizontal,
  Star,
  Quote
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
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // 1. STRICT FILTERING: Only items marked as isDubaiPreorder (NEVER regular store products)
  const dubaiProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.isDubaiPreorder));
  }, [products]);

  // 2. Filter by category & search query
  const displayProducts = useMemo(() => {
    let list = [...dubaiProducts];

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'parfum') {
        list = list.filter((p) => 
          p.categoryId === 'cat-beauty' || 
          p.title.toLowerCase().includes('parfum') || 
          p.title.toLowerCase().includes('oud') ||
          p.tags?.some(t => t.toLowerCase().includes('parfum') || t.toLowerCase().includes('oud'))
        );
      } else if (selectedCategory === 'montre') {
        list = list.filter((p) => 
          p.categoryId === 'cat-watches' || 
          p.title.toLowerCase().includes('montre') ||
          p.tags?.some(t => t.toLowerCase().includes('montre'))
        );
      } else if (selectedCategory === 'mode') {
        list = list.filter((p) => 
          p.categoryId === 'cat-fashion' || 
          p.title.toLowerCase().includes('abaya') || 
          p.title.toLowerCase().includes('robe') ||
          p.tags?.some(t => t.toLowerCase().includes('abaya') || t.toLowerCase().includes('mode'))
        );
      } else if (selectedCategory === 'high-tech') {
        list = list.filter((p) => 
          p.categoryId === 'cat-phones' || 
          p.categoryId === 'cat-computers' || 
          p.categoryId === 'cat-electronics' ||
          p.tags?.some(t => t.toLowerCase().includes('tech') || t.toLowerCase().includes('iphone'))
        );
      } else {
        list = list.filter((p) => p.categoryId === selectedCategory);
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => 
        p.title.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });

    return list;
  }, [dubaiProducts, selectedCategory, searchQuery, sortBy]);

  // Flash / Featured pre-orders
  const dubaiFlashProducts = useMemo(() => {
    return dubaiProducts.filter(p => p.isFlashSale || (p.discountPercent && p.discountPercent > 0)).slice(0, 6);
  }, [dubaiProducts]);

  const personalShopperWhatsApp = () => {
    const phone = settings.whatsappNumber || '2250700000000';
    const text = encodeURIComponent(
      "Bonjour Service Conciergerie Dubaï ! 🇦🇪\nJe recherche un article introuvable à Abidjan (parfum, montre, abaya ou high-tech). Voici ma demande spécifique :"
    );
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  const faqs = [
    {
      q: "Comment fonctionne la précommande d'articles en direct de Dubaï ?",
      a: "C'est un service d'importation prestige : vous choisissez vos articles certifiés d'origine Dubaï sur notre catalogue, vous validez et réglez votre commande en ligne (Wave, Orange Money, MTN, Moov ou Carte). Notre équipe permanente sur place à Dubaï achète immédiatement vos produits auprès des distributeurs officiels et les embarque sur notre vol cargo hebdomadaire à destination d'Abidjan."
    },
    {
      q: "Quel est le délai exact de livraison à Abidjan ?",
      a: "Le délai moyen d'acheminement par fret aérien sécurisé est de 7 à 10 jours ouvrés à compter de la clôture du vol cargo. Dès l'atterrissage du colis à l'aéroport d'Abidjan (FHB), votre colis est dédouané et notre livreur autonome vous livre directement à votre domicile ou bureau."
    },
    {
      q: "Pourquoi le paiement doit-il être effectué à la commande ?",
      a: "Contrairement aux articles déjà en stock à Abidjan, les articles de Dubaï sont achetés sur mesure spécialement pour vous aux Émirats. Le règlement d'avance garantit le blocage immédiat de votre article à Dubaï et le règlement du fret aérien international."
    },
    {
      q: "Les articles sont-ils 100% originaux et authentiques ?",
      a: "Absolument. Tous les parfums (Lattafa, Maison Alhambra, Afnan), montres, abayas et high-tech sont achetés directement dans les boutiques officielles et distributeurs agréés de Dubaï (Deira, Mall of the Emirates, Dubai Mall). Aucun intermédiaire n'intervient."
    },
    {
      q: "Puis-je commander un produit qui n'est pas sur votre catalogue ?",
      a: "Oui ! C'est notre service exclusif 'Personal Shopper Dubaï'. Il vous suffit de cliquer sur le bouton WhatsApp, de nous envoyer la photo ou le nom exact de l'article souhaité, et notre acheteur sur place vous donnera le prix total tout compris (achat + fret + livraison à Abidjan) en moins de 2 heures."
    },
    {
      q: "Que se passe-t-il si mon colis est endommagé pendant le transport ?",
      a: "Tous nos envois cargo bénéficient d'une assurance transport intégrale. Si un flacon ou un article arrivait endommagé, nous procédons immédiatement au remboursement intégral ou à un nouvel envoi sans aucun frais supplémentaire pour vous."
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. Dedicated Luxury Dubaï Navbar */}
      <DubaiNavbar 
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* 2. Prestige Dubai Hero Carousel */}
      <DubaiHeroBanner />

      {/* 3. Live Flight & Air Cargo Ticker (DXB ➔ ABJ) */}
      <DubaiFlightTicker />

      {/* 4. Visual Dubai Categories Showcase */}
      <section className="py-10 sm:py-14 bg-slate-950 border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Les Trésors des Émirats</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              Explorez nos Rayons Spécial Dubaï
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Des collections sélectionnées sur place auprès des plus prestigieuses maisons de Dubaï.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            
            {/* Category Card 1 */}
            <button
              onClick={() => { setSelectedCategory('parfum'); const el = document.getElementById('dubai-catalog'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/60 p-4 sm:p-6 text-left transition hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <span className="text-2xl">🏺</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition">
                Parfums & Ouds
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Lattafa, Maison Alhambra, Afnan et extraits d'Orient.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                Explorer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </button>

            {/* Category Card 2 */}
            <button
              onClick={() => { setSelectedCategory('montre'); const el = document.getElementById('dubai-catalog'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/60 p-4 sm:p-6 text-left transition hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <span className="text-2xl">⌚</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition">
                Montres & Bijoux Or
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Mouvements automatiques et finitions or 24K des Souks de Deira.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                Explorer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </button>

            {/* Category Card 3 */}
            <button
              onClick={() => { setSelectedCategory('mode'); const el = document.getElementById('dubai-catalog'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/60 p-4 sm:p-6 text-left transition hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <span className="text-2xl">🧕</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition">
                Abayas & Soie
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Soie de Médine, coupes papillon et broderies de prestige.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                Explorer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </button>

            {/* Category Card 4 */}
            <button
              onClick={() => { setSelectedCategory('high-tech'); const el = document.getElementById('dubai-catalog'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900/60 p-4 sm:p-6 text-left transition hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition">
                High-Tech Spéc. DXB
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                iPhones Dual SIM physique et matériel électronique certifié.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                Explorer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
              </span>
            </button>

          </div>
        </div>
      </section>

      {/* 5. Ventes Flash & Exclusivités du Vol Cargo (si articles en promotion) */}
      {dubaiFlashProducts.length > 0 && (
        <section className="py-8 sm:py-12 bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-white">
                    🔥 Exclusivités & Offres Vol Cargo
                  </h3>
                  <p className="text-xs text-amber-300">
                    Tarifs réduits limités aux places disponibles dans le prochain conteneur aérien
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4">
              {dubaiFlashProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Catalogue Complet Dubaï (#dubai-catalog) */}
      <section id="dubai-catalog" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wide">
                <Plane className="w-3.5 h-3.5" />
                <span>Catalogue Officiel Précommandes Dubaï</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white">
                Articles Disponibles à l'Importation
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Paiement en ligne sécurisé • Expédition aérienne garantie sous 7 à 10 jours ouvrés à Abidjan.
              </p>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-3 shrink-0">
              <label className="text-xs text-slate-400 font-medium">Trier par :</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-amber-500/30 text-white text-xs rounded-xl px-3 py-2 focus:outline-hidden focus:border-amber-400 cursor-pointer"
              >
                <option value="featured">Populaires & Recommandés</option>
                <option value="price-asc">Prix : Moins cher au plus cher</option>
                <option value="price-desc">Prix : Plus cher au moins cher</option>
                <option value="rating">Meilleures notes clients</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Tous les Articles ({dubaiProducts.length})
            </button>
            <button
              onClick={() => setSelectedCategory('parfum')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'parfum'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              🏺 Parfums & Ouds d'Orient
            </button>
            <button
              onClick={() => setSelectedCategory('montre')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'montre'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              ⌚ Montres & Bijoux de Luxe
            </button>
            <button
              onClick={() => setSelectedCategory('mode')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'mode'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              🧕 Abayas Dubaï & Soie
            </button>
            <button
              onClick={() => setSelectedCategory('high-tech')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'high-tech'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              📱 High-Tech DXB
            </button>
          </div>

          {/* Product Grid (3 cards per row on mobile) */}
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-4">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-3xl">
                ✈️
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Aucun article trouvé dans cette sélection
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {searchQuery 
                    ? `Aucun résultat pour "${searchQuery}". Essayez avec d'autres mots-clés ou utilisez notre service Personal Shopper.`
                    : "Les articles pour ce rayon sont en cours de mise en ligne pour le prochain vol cargo."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  Voir tous les arrivages Dubaï
                </button>
                <a
                  href={personalShopperWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Demander un article spécifique</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 7. Comment Fonctionne la Précommande (3 Étapes de Confiance) */}
      <section id="dubai-how-it-works" className="py-14 sm:py-20 bg-slate-900/70 border-y border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Processus 100% Transparent
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              Comment Commander à Dubaï en 3 Étapes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Un circuit logistique direct et maîtrisé pour vous garantir authenticité et tranquillité d'esprit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Step 1 */}
            <div className="relative bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-lg">
                1
              </div>
              <h3 className="text-base font-black text-white">
                Sélection & Règlement Sécurisé
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vous choisissez vos articles d'exception sur notre vitrine Dubaï et validez votre précommande en réglant par <strong>Wave, Orange Money, MTN, Moov</strong> ou Carte. Le paiement préalable réserve immédiatement votre lot pour le prochain vol cargo.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reçu & Confirmation instantanés</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-lg">
                2
              </div>
              <h3 className="text-base font-black text-white">
                Achat Officiel & Fret Aérien
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Notre équipe sur place à Dubaï achète votre article directement auprès des distributeurs agréés, effectue un <strong>contrôle qualité rigoureux</strong>, prend en photo votre colis et l'embarque dans notre conteneur aérien sécurisé.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Colis scellé avec photo WhatsApp</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-lg">
                3
              </div>
              <h3 className="text-base font-black text-white">
                Arrivée à Abidjan & Livraison
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                À l'atterrissage du vol cargo à Abidjan, le colis est dédouané par nos soins sans aucun frais caché supplémentaire. Notre coursier autonome vous livre directement en main propre sous <strong>7 à 10 jours ouvrés</strong>.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Livraison partout à Abidjan & Intérieur</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Service Personal Shopper & Conciergerie */}
      <section className="py-12 sm:py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Service Exclusif Sur-Mesure</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-white">
                  Vous cherchez un article précis à Dubaï ?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Une montre rare, un parfum oriental introuvable, une abaya de couturier ou du matériel spécifique ? Notre acheteur dédié parcourt les centres commerciaux de Dubaï pour vous.
                </p>
                <div className="flex items-center gap-4 pt-2 text-xs text-amber-300">
                  <span>📸 Envoyez une simple photo</span>
                  <span>•</span>
                  <span>⚡ Devis tout inclus sous 2h</span>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <a
                  href={personalShopperWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Parler à un Personal Shopper Dubaï</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 9. Témoignages & Déballages Réels */}
      <section className="py-12 sm:py-16 bg-slate-900/40 border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Retours d'Expérience
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Ce que nos clients d'Abidjan en disent
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "J'ai précommandé le parfum Lattafa Khamrah. Reçu à Cocody Angré 8 jours après le départ du vol cargo. Le flacon était intact avec le sceau d'origine. Fragrance incroyable !"
              </p>
              <div className="pt-2 border-t border-slate-900">
                <p className="text-xs font-bold text-white">Mme Aïcha Touré</p>
                <p className="text-[10px] text-amber-400">Cocody Angré, Abidjan</p>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Très impressionné par le professionnalisme. L'équipe m'a envoyé une photo de ma montre dorée directement depuis Dubaï avant l'embarquement. Livraison rapide à Marcory."
              </p>
              <div className="pt-2 border-t border-slate-900">
                <p className="text-xs font-bold text-white">M. Stéphane Konan</p>
                <p className="text-[10px] text-amber-400">Marcory Zone 4, Abidjan</p>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "L'abaya en soie de Médine est magnifique, le tissu est d'une grande douceur et bien cousu. Je repasserai commande pour les fêtes sans hésiter !"
              </p>
              <div className="pt-2 border-t border-slate-900">
                <p className="text-xs font-bold text-white">Fatoumata C.</p>
                <p className="text-[10px] text-amber-400">Plateau, Abidjan</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. FAQ Interactive (#dubai-faq) */}
      <section id="dubai-faq" className="py-14 sm:py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Questions Fréquentes
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              Tout Savoir sur nos Précommandes Dubaï
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900/60 border border-amber-500/20 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. Dedicated Dubai Luxury Footer */}
      <DubaiFooter />

    </div>
  );
};
