'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { ProductCard } from '@/components/ProductCard';
import { DubaiNavbar } from '@/components/DubaiNavbar';
import { DubaiJumiaHero } from '@/components/DubaiJumiaHero';
import { DubaiCategoryCircles } from '@/components/DubaiCategoryCircles';
import { DubaiFlashSaleBar } from '@/components/DubaiFlashSaleBar';
import { DubaiDuoBanners } from '@/components/DubaiDuoBanners';
import { DubaiShelfSection } from '@/components/DubaiShelfSection';
import { DubaiReassuranceRibbon } from '@/components/DubaiReassuranceRibbon';
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
  Quote,
  Layers,
  X
} from 'lucide-react';

export const DubaiPreorderPage: React.FC = () => {
  const { 
    products, 
    categories, 
    settings, 
    formatPrice, 
    setSelectedProductId, 
    setCurrentView 
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showSeoGuide, setShowSeoGuide] = useState<boolean>(false);

  // 1. STRICT FILTERING: Only items marked as isDubaiPreorder (NEVER regular store products)
  const dubaiProducts = useMemo(() => {
    return products.filter((p) => Boolean(p.isDubaiPreorder));
  }, [products]);

  // Themed Category Splitting for Jumia Shelves
  const perfumeProducts = useMemo(() => {
    return dubaiProducts.filter((p) => {
      const t = p.title.toLowerCase();
      const d = (p.description || '').toLowerCase();
      const c = (p.categoryName || '').toLowerCase();
      return t.includes('parfum') || t.includes('oud') || t.includes('khamrah') || t.includes('asad') || t.includes('lattafa') ||
             d.includes('parfum') || d.includes('oud') || c.includes('beauté') || c.includes('parfum') || p.categoryId === 'cat-beauty';
    });
  }, [dubaiProducts]);

  const watchProducts = useMemo(() => {
    return dubaiProducts.filter((p) => {
      const t = p.title.toLowerCase();
      const d = (p.description || '').toLowerCase();
      const c = (p.categoryName || '').toLowerCase();
      return t.includes('montre') || t.includes('gold') || t.includes('bijoux') || t.includes('parure') ||
             d.includes('montre') || d.includes('gold') || c.includes('montre') || p.categoryId === 'cat-watches';
    });
  }, [dubaiProducts]);

  const abayaProducts = useMemo(() => {
    return dubaiProducts.filter((p) => {
      const t = p.title.toLowerCase();
      const d = (p.description || '').toLowerCase();
      const c = (p.categoryName || '').toLowerCase();
      return t.includes('abaya') || t.includes('soie') || t.includes('robe') || t.includes('voile') ||
             d.includes('abaya') || d.includes('soie') || c.includes('mode') || p.categoryId === 'cat-fashion' || p.categoryId.includes('cat-0e460830');
    });
  }, [dubaiProducts]);

  const highTechProducts = useMemo(() => {
    return dubaiProducts.filter((p) => {
      const t = p.title.toLowerCase();
      const d = (p.description || '').toLowerCase();
      const c = (p.categoryName || '').toLowerCase();
      return t.includes('iphone') || t.includes('apple') || t.includes('tech') || t.includes('pro max') ||
             d.includes('iphone') || d.includes('apple') || c.includes('téléphone') || p.categoryId === 'cat-phones';
    });
  }, [dubaiProducts]);

  // Filter for the main general catalog section
  const displayProducts = useMemo(() => {
    let list = [...dubaiProducts];

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'parfum') {
        list = perfumeProducts;
      } else if (selectedCategory === 'montre') {
        list = watchProducts;
      } else if (selectedCategory === 'mode') {
        list = abayaProducts;
      } else if (selectedCategory === 'high-tech') {
        list = highTechProducts;
      } else if (selectedCategory === 'bakhoor') {
        list = list.filter((p) => p.title.toLowerCase().includes('bakhoor') || p.title.toLowerCase().includes('encens'));
      } else {
        list = list.filter((p) => p.categoryId === selectedCategory);
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => 
        p.title.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
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
  }, [dubaiProducts, selectedCategory, searchQuery, sortBy, perfumeProducts, watchProducts, abayaProducts, highTechProducts]);

  const handleShelfViewAll = (catKey: string) => {
    setSelectedCategory(catKey);
    const catalogEl = document.getElementById('dubai-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      
      {/* 1. Header & Navigation (Jumia E-Commerce Header with Dubaï Luxury Accent) */}
      <DubaiNavbar 
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* 2. JUMIA-STYLE 3-COLUMN HERO SECTION (Categories Left • Main Slider Center • Promo Cards Right) */}
      <DubaiJumiaHero 
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {/* 3. JUMIA-STYLE HORIZONTAL CATEGORY CIRCLE BUBBLES */}
      <DubaiCategoryCircles 
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {/* 4. JUMIA-STYLE "VENTES FLASH" BAR WITH DIGITAL TIMER & STOCK PROGRESS BARS */}
      <DubaiFlashSaleBar products={dubaiProducts} />

      {/* 5. JUMIA SHELF 1: PARFUMS & OUDS D'ORIENT */}
      {perfumeProducts.length > 0 && (
        <DubaiShelfSection
          title="Parfums & Ouds d'Exception"
          subtitle="Lattafa, Asad, Khamrah, Oud for Glory et fragrances orientales de Dubaï"
          icon="🏺"
          categoryKey="parfum"
          badgeText="Sillage 48h"
          products={perfumeProducts}
          onViewAll={handleShelfViewAll}
        />
      )}

      {/* 6. JUMIA-STYLE DUO PROMOTIONAL BANNERS */}
      <DubaiDuoBanners onSelectCategory={setSelectedCategory} />

      {/* 7. JUMIA SHELF 2: MONTRES & JOAILLERIE OR 24K */}
      {watchProducts.length > 0 && (
        <DubaiShelfSection
          title="Horlogerie Prestige & Gold Souk"
          subtitle="Montres automatiques squelette, parures dorées et finitions de luxe"
          icon="⌚"
          categoryKey="montre"
          badgeText="Gold Souk Deira"
          products={watchProducts}
          onViewAll={handleShelfViewAll}
        />
      )}

      {/* 8. JUMIA SHELF 3: ABAYAS & HAUTE COUTURE DUBAÏ */}
      {abayaProducts.length > 0 && (
        <DubaiShelfSection
          title="Abayas & Haute Couture Émiratie"
          subtitle="Soie de Médine, confections papillon et broderies faites main à Dubaï"
          icon="🧕"
          categoryKey="mode"
          badgeText="Soie de Médine"
          products={abayaProducts}
          onViewAll={handleShelfViewAll}
        />
      )}

      {/* 9. JUMIA SHELF 4: HIGH-TECH DXB & APPLE */}
      {highTechProducts.length > 0 && (
        <DubaiShelfSection
          title="High-Tech DXB & Apple"
          subtitle="iPhones versions internationales double SIM physique et électronique de pointe"
          icon="📱"
          categoryKey="high-tech"
          badgeText="Spéc. DXB"
          products={highTechProducts}
          onViewAll={handleShelfViewAll}
        />
      )}

      {/* 10. JUMIA-STYLE 4-PILLAR REASSURANCE STRIP */}
      <DubaiReassuranceRibbon />

      {/* 11. CATALOGUE OFFICIEL COMPLET & RECHERCHE AVANCÉE (#dubai-catalog) */}
      <section id="dubai-catalog" className="py-10 sm:py-14 bg-slate-950">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          
          {/* Catalog Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wide">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Catalogue Général des Précommandes</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Tous les Articles Importés de Dubaï ({displayProducts.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Sélectionnez vos articles pour le prochain vol cargo. Dédouanement et livraison garantis sous 7 à 10 jours ouvrés.
                </p>
              </div>

              {/* Sorting & Filter Controls */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">Trier :</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="featured" className="bg-slate-900 text-white">Populaires & Recommandés</option>
                    <option value="price-asc" className="bg-slate-900 text-white">Prix : Moins cher au plus cher</option>
                    <option value="price-desc" className="bg-slate-900 text-white">Prix : Plus cher au moins cher</option>
                    <option value="rating" className="bg-slate-900 text-white">Meilleures notes clients</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-800/80 scrollbar-none">
              {[
                { id: 'all', label: `Tous (${dubaiProducts.length})` },
                { id: 'parfum', label: "🏺 Parfums & Ouds" },
                { id: 'montre', label: '⌚ Montres 24K' },
                { id: 'mode', label: '🧕 Abayas & Soie' },
                { id: 'high-tech', label: '📱 High-Tech DXB' },
                { id: 'bakhoor', label: '🪵 Bakhoors Royaux' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === pill.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                      : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Effacer recherche</span>
                </button>
              )}
            </div>

          </div>

          {/* Product Grid (3 cards per row on mobile, 4-6 on desktop) */}
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
                  Aucun article trouvé pour cette sélection
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
                  <span>Demander un article sur WhatsApp</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 12. GUIDE DE CONFIANCE EN 3 ÉTAPES */}
      <section className="py-12 sm:py-16 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Step 1 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-base">
                1
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Sélection & Règlement Sécurisé
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Vous choisissez vos articles d'exception sur notre vitrine Dubaï et validez votre précommande en réglant par <strong>Wave, Orange Money, MTN, Moov</strong> ou Carte. Le paiement préalable bloque immédiatement votre lot pour le prochain vol cargo.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reçu & Confirmation instantanés</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-base">
                2
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Achat Officiel & Fret Aérien
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Notre équipe sur place à Dubaï achète votre article directement auprès des distributeurs agréés, effectue un <strong>contrôle qualité rigoureux</strong>, prend en photo votre colis et l'embarque dans notre conteneur aérien sécurisé.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Colis scellé avec photo WhatsApp</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-3 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-base">
                3
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Arrivée à Abidjan & Livraison
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                À l'atterrissage du vol cargo à Abidjan, le colis est dédouané par nos soins sans aucun frais caché supplémentaire. Notre coursier autonome vous livre directement en main propre sous <strong>7 à 10 jours ouvrés</strong>.
              </p>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Livraison partout à Abidjan & Intérieur</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 13. BANNIÈRE PERSONAL SHOPPER & CONCIERGERIE */}
      <section id="dubai-personal-shopper" className="py-10 sm:py-14 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Service Exclusif Sur-Mesure</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white">
                  Vous cherchez un article précis à Dubaï ?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Une montre rare, un parfum oriental introuvable, une abaya de couturier ou du matériel spécifique ? Notre acheteur dédié parcourt les souks et centres commerciaux de Dubaï pour vous.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-amber-300 font-medium">
                  <span>📸 Envoyez une photo sur WhatsApp</span>
                  <span>•</span>
                  <span>⚡ Devis tout inclus sous 2h</span>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <a
                  href={personalShopperWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Parler à notre acheteur Dubaï</span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 14. TÉMOIGNAGES CLIENTS ABIDJAN */}
      <section className="py-10 sm:py-14 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Retours d'Expérience
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-white">
              Ce que nos clients d'Abidjan en disent
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
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

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
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

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2.5">
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

      {/* 15. FAQ INTERACTIVE ACCORDÉON */}
      <section id="dubai-faq" className="py-12 sm:py-16 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 space-y-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              Questions Fréquentes
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Tout Savoir sur nos Précommandes Dubaï
            </h2>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900/60 border border-amber-500/20 rounded-2xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 16. JUMIA-STYLE SEO & INFORMATIVE MARKETPLACE BLOCK (Collapsible) */}
      <section className="py-8 bg-slate-950 border-t border-slate-900 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                À propos de l'Espace Dubaï VIP d'IvoirePro — Votre Pont Direct avec les Émirats
              </h4>
              <button
                onClick={() => setShowSeoGuide(!showSeoGuide)}
                className="text-[11px] font-bold text-amber-400 hover:underline"
              >
                {showSeoGuide ? 'Réduire ▲' : 'Lire la suite ▼'}
              </button>
            </div>

            <p className="leading-relaxed">
              L'Espace Dubaï VIP d'IvoirePro est la première plateforme e-commerce en Côte d'Ivoire dédiée à l'importation directe et à la précommande d'articles authentiques depuis Dubaï (Émirats Arabes Unis).
            </p>

            {showSeoGuide && (
              <div className="space-y-3 pt-2 border-t border-slate-800 text-slate-300 animate-in fade-in duration-200">
                <p>
                  <strong>Pourquoi précommander à Dubaï avec IvoirePro ?</strong><br />
                  Dubaï est le carrefour mondial des plus prestigieuses maisons de parfumerie orientale (Lattafa, Asad, Khamrah, Swiss Arabian, Armaf), du légendaire Gold Souk de Deira pour l'horlogerie et les bijoux en or 24K, et de la haute couture émiratie (abayas en véritable soie de Médine et tissus Nidha). Grâce à notre bureau d'achat permanent à Dubaï, vous bénéficiez des tarifs officiels des grossistes émiratis sans intermédiaire.
                </p>
                <p>
                  <strong>Logistique & Fret Aérien Régulier :</strong><br />
                  Chaque semaine, nos conteneurs aériens décollent de l'aéroport international de Dubaï (DXB) vers l'aéroport Félix Houphouët-Boigny d'Abidjan (ABJ). Les formalités douanières sont intégralement prises en charge par notre équipe logistique, vous assurant une livraison sécurisée à Abidjan sous 7 à 10 jours ouvrés sans frais imprévus.
                </p>
                <p>
                  <strong>Moyens de Paiement Disponibles :</strong><br />
                  Réglez vos précommandes en toute sérénité via Mobile Money (Wave, Orange Money, MTN Mobile Money, Moov Money) ou Carte Bancaire internationale.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 17. LUXURY DUBAI FOOTER */}
      <DubaiFooter />

    </div>
  );
};
