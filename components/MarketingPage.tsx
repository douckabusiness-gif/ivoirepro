'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  Sparkles, 
  Tag, 
  Gift, 
  Users, 
  Zap, 
  Copy, 
  Check, 
  Flame, 
  ShoppingBag, 
  MessageCircle, 
  ArrowRight, 
  Percent, 
  Truck, 
  Crown, 
  ShieldCheck, 
  Clock, 
  Share2, 
  Send, 
  Wand2, 
  ExternalLink,
  ChevronRight,
  BadgePercent,
  Video,
  ImageIcon
} from 'lucide-react';
import { MarketingStudio } from '@/components/MarketingStudio';

export const MarketingPage = () => {
  const { 
    settings, 
    products, 
    setCurrentView, 
    setSelectedProductId, 
    formatPrice, 
    generateWhatsAppGeneralLink, 
    addToCart, 
    setIsCartOpen 
  } = useStore();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [aiCampaignTopic, setAiCampaignTopic] = useState('Nouvelle collection de montres & parfums');
  const [aiGeneratedCopy, setAiGeneratedCopy] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [vipForm, setVipForm] = useState({ phone: '', name: '' });
  const [vipSuccess, setVipSuccess] = useState(false);

  const promoCoupons = [
    {
      code: 'BIENVENUE5',
      discount: '-5%',
      badge: 'NOUVEAU CLIENT',
      title: 'Offre Spéciale de Bienvenue',
      description: 'Valable sur votre toute première commande sans minimum d\'achat.',
      minSpend: 'Dès 1 FCFA',
      color: 'from-pink-500 to-rose-600',
      bgLight: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800/60'
    },
    {
      code: 'VIP10',
      discount: '-10%',
      badge: 'MEILLEURE OFFRE',
      title: 'Remise Privilège Panier',
      description: 'Profitez de 10% de réduction immédiate dès 30 000 FCFA d\'achats.',
      minSpend: 'Dès 30 000 FCFA',
      color: 'from-purple-500 to-indigo-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60'
    },
    {
      code: 'EXPRESS221',
      discount: 'GRATUIT',
      badge: 'LIVRAISON OFFERTE',
      title: 'Livraison Express Gratuite',
      description: 'Livraison standard offerte à Dakar et dans toutes les régions du Sénégal.',
      minSpend: 'Dès 25 000 FCFA',
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
    },
    {
      code: 'DUOFLASH',
      discount: '-15%',
      badge: 'PACK DUO',
      title: 'Offre Pack 2 Articles',
      description: 'Économisez 15% supplémentaires lorsque vous commandez 2 articles ou plus.',
      minSpend: 'Pour 2 articles achetés',
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Curated Marketing Bundles
  const bundles = [
    {
      id: 'bundle-prestige',
      title: 'Pack Prestige & Horlogerie',
      badge: 'PACK ÉCONOMIE -25%',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      items: ['Montre Chronographe Royal Gold', 'Extrait de Parfum Oud Impérial (100ml)'],
      originalPrice: 121000,
      bundlePrice: 95000,
      savings: 26000,
      gradient: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'bundle-tech',
      title: 'Pack High-Tech Nomade',
      badge: 'PACK PERFORMANCE -30%',
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      items: ['Smartwatch Horizon Fit Ultra AMOLED', 'Enceinte Bluetooth SoundWave 360° Max'],
      originalPrice: 71500,
      bundlePrice: 54000,
      savings: 17500,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'bundle-style',
      title: 'Pack Look Urbain & Solaire',
      badge: 'PACK TENDANCE -28%',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      items: ['Sneakers Velocity Runner Limited', 'Lunettes de Soleil Aviateur Titanium'],
      originalPrice: 64500,
      bundlePrice: 48000,
      savings: 16500,
      gradient: 'from-rose-500 to-pink-600'
    }
  ];

  const handleOrderBundleWhatsApp = (bundle: typeof bundles[0]) => {
    const message = `Bonjour ${settings.storeName} !\n\nJe souhaite profiter de l'offre spéciale marketing :\n📦 *${bundle.title}*\n🎁 Articles inclus :\n${bundle.items.map(i => `• ${i}`).join('\n')}\n💰 *Prix Pack Spécial :* ${formatPrice(bundle.bundlePrice)} (Économie : ${formatPrice(bundle.savings)})\n\nMerci de me réserver ce pack avec livraison rapide !`;
    window.open(generateWhatsAppGeneralLink(message), '_blank');
  };

  const handleShareReferral = () => {
    const storeUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eliteboutique.com';
    const text = `Découvre la boutique ${settings.storeName} ! Profite de 5% de réduction sur ta 1ère commande avec le code *BIENVENUE5* sur les montres, sneakers et high-tech :\n👉 ${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleGenerateAiCampaign = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const generatedText = `🔥 *VENTE PRIVÉE EXCLUSIVE CHEZ ${settings.storeName.toUpperCase()} !*\n\n` +
        `✨ Offre spéciale sur : *${aiCampaignTopic}*\n\n` +
        `Profitez dès maintenant de remises exceptionnelles jusqu'à *-35%* et de la *Livraison Express 24h* offerte dès 50 000 FCFA !\n\n` +
        `🎁 Utilisez le code promo : *VIP10* pour 10% de réduction immédiate.\n` +
        `💳 Paiements acceptés : Wave, Orange Money et Paiement à la Livraison.\n\n` +
        `👉 Commandez vite en direct sur WhatsApp avant rupture de stock !`;
      setAiGeneratedCopy(generatedText);
      setIsGeneratingAi(false);
    }, 800);
  };

  const handleVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipForm.phone.trim()) return;
    setVipSuccess(true);
    setTimeout(() => {
      const msg = `Bonjour ${settings.storeName}, je m'inscris au Club Privilège VIP !\n👤 Nom : ${vipForm.name || 'Client VIP'}\n📞 Tél : ${vipForm.phone}\n\nMerci de m'ajouter aux alertes des ventes privées exclusives.`;
      window.open(generateWhatsAppGeneralLink(msg), '_blank');
      setVipSuccess(false);
      setVipForm({ phone: '', name: '' });
    }, 1500);
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-screen-2xl mx-auto space-y-12 animate-in fade-in duration-200">
      
      {/* 1. HERO MARKETING BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-8 sm:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>ESPACE MARKETING & AVANTAGES EXCLUSIFS 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Multipliez Vos Avantages & Économisez en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400">Franc CFA</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Bienvenue dans le centre marketing officiel de <strong>{settings.storeName}</strong>. Retrouvez ici tous les codes promotionnels actifs, nos packs d'articles à prix réduits, le programme de parrainage WhatsApp et notre Club Privilège VIP.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const couponsSection = document.getElementById('section-coupons');
                couponsSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              <span>Voir les Codes Promos</span>
            </button>

            <button
              onClick={() => {
                const bundlesSection = document.getElementById('section-bundles');
                bundlesSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Packs & Bundles Économiques</span>
            </button>
          </div>
        </div>

        {/* Floating Quick Stats */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
            <p className="text-xl sm:text-2xl font-black text-amber-400">4 Codes</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Promos Actifs</p>
          </div>
          <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
            <p className="text-xl sm:text-2xl font-black text-pink-400">Jusqu'à -35%</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Remises Directes</p>
          </div>
          <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
            <p className="text-xl sm:text-2xl font-black text-emerald-400">5 000 FCFA</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Par Ami Parrainé</p>
          </div>
          <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
            <p className="text-xl sm:text-2xl font-black text-cyan-400">Gratuite</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Dès 50 000 FCFA</p>
          </div>
        </div>
      </section>

      {/* 2. CREATIVE AD STUDIO (AFFICHES HD & VIDÉOS PUB) */}
      <section id="section-studio">
        <MarketingStudio />
      </section>

      {/* 3. SECTION: CODES PROMOTIONNELS & COUPONS INTERACTIFS */}
      <section id="section-coupons" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BadgePercent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Codes Promotionnels Actifs à Copier
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Cliquez sur un code pour le copier et collez-le lors de votre commande ou indiquez-le sur WhatsApp.
            </p>
          </div>
          
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tous les codes sont testés & valides</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {promoCoupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            return (
              <div 
                key={coupon.code}
                className={`p-6 rounded-3xl border transition shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 ${coupon.bgLight}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {coupon.badge}
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {coupon.discount}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{coupon.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {coupon.description}
                    </p>
                  </div>

                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Conditions : <span className="text-indigo-600 dark:text-indigo-400">{coupon.minSpend}</span>
                  </p>
                </div>

                {/* Copy Button Box */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(coupon.code)}
                    className={`w-full py-3 px-4 rounded-2xl font-mono text-xs font-black flex items-center justify-between transition cursor-pointer shadow-xs ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    <span>{coupon.code}</span>
                    <span className="flex items-center gap-1 font-sans text-[11px]">
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SECTION: PACKS MARKETING GROUPÉS & BUNDLES */}
      <section id="section-bundles" className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Packs Promotionnels & Ventes Groupées
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Achetez deux articles complémentaires ensemble et réalisez d'importantes économies en FCFA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Bundle Header Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={bundle.image}
                    alt={bundle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded-full shadow-md">
                      {bundle.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {bundle.title}
                    </h3>
                    <div className="mt-2 space-y-1">
                      {bundle.items.map((it, idx) => (
                        <p key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{it}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Prix séparé :</span>
                      <span className="line-through font-bold">{formatPrice(bundle.originalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Prix Pack :</span>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatPrice(bundle.bundlePrice)}</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold text-right">
                      Économie immédiate : {formatPrice(bundle.savings)} !
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => handleOrderBundleWhatsApp(bundle)}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Commander le Pack sur WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECTION: PROGRAMME DE PARRAINAGE WHATSAPP */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white border border-indigo-500/30 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase rounded-full tracking-wider">
              PROGRAMME DE PARRAINAGE 🎁
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Invitez un Proche sur WhatsApp & Gagnez <span className="text-amber-300">5 000 FCFA</span> de Bon d'Achat !
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Faites découvrir {settings.storeName} à vos amis. Votre ami reçoit <strong>5% de réduction</strong> de bienvenue et vous recevez un <strong>bon d'achat de 5 000 FCFA</strong> dès sa première commande finalisée.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleShareReferral}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl flex items-center gap-2.5 shadow-xl shadow-emerald-900/30 transition transform hover:scale-105 cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
              <span>Partager sur WhatsApp Maintenant</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-800/80 text-xs">
          <div className="p-4 bg-indigo-950/60 rounded-2xl border border-indigo-800/60 space-y-1">
            <span className="text-lg">1️⃣</span>
            <p className="font-black text-white">Partagez votre recommandation</p>
            <p className="text-slate-400 text-[11px]">Envoyez l'invitation à vos contacts en 1 clic.</p>
          </div>
          <div className="p-4 bg-indigo-950/60 rounded-2xl border border-indigo-800/60 space-y-1">
            <span className="text-lg">2️⃣</span>
            <p className="font-black text-white">Votre ami commande</p>
            <p className="text-slate-400 text-[11px]">Il bénéficie de 5% de bienvenue avec BIENVENUE5.</p>
          </div>
          <div className="p-4 bg-indigo-950/60 rounded-2xl border border-indigo-800/60 space-y-1">
            <span className="text-lg">3️⃣</span>
            <p className="font-black text-white">Vous recevez 5 000 FCFA</p>
            <p className="text-slate-400 text-[11px]">Utilisable directement sur tout notre catalogue.</p>
          </div>
        </div>
      </section>

      {/* 5. SECTION: PROGRAMME CLUB PRIVILÈGE VIP */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Club Privilège & Programme de Fidélité
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Chaque achat dans notre boutique vous rapporte des points fidélité et vous fait monter de palier VIP.
          </p>
        </div>

        {/* 4 VIP Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              tier: 'BRONZE',
              spend: 'Dès 1er Achat',
              perk: '5% en points fidélité',
              color: 'from-amber-700 to-amber-900',
              badge: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
            },
            {
              tier: 'ARGENT',
              spend: 'Dès 100 000 FCFA',
              perk: '-5% permanent + Cadeau surprise',
              color: 'from-slate-400 to-slate-600',
              badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
            },
            {
              tier: 'OR',
              spend: 'Dès 250 000 FCFA',
              perk: '-10% permanent + Livraison gratuite',
              color: 'from-amber-400 to-yellow-600',
              badge: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300'
            },
            {
              tier: 'PLATINE',
              spend: 'Dès 500 000 FCFA',
              perk: '-15% permanent + Conseiller Dédié VIP',
              color: 'from-purple-500 to-indigo-700',
              badge: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
            }
          ].map((t) => (
            <div
              key={t.tier}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${t.badge}`}>
                  Niveau {t.tier}
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white">{t.spend}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {t.perk}
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
            </div>
          ))}
        </div>

      </section>

      {/* 6. SECTION: GÉNÉRATEUR IA DE CAMPAGNES & PITCH COMMERCIAL (OUTIL MARKETING) */}
      <section className="bg-slate-900 rounded-3xl border border-indigo-500/30 p-8 sm:p-10 shadow-lg text-white space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Générateur IA de Pitchs Promotionnels & Messages WhatsApp
            </h3>
            <p className="text-xs text-slate-400">
              Testez la rédaction marketing automatisée propulsée par notre Agent IA (Aïda - Merchandiser).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300">Sujet ou Produit de la Campagne Promotionnelle :</label>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={aiCampaignTopic}
              onChange={(e) => setAiCampaignTopic(e.target.value)}
              placeholder="Ex: Vente flash sneakers -30% pour le week-end..."
              className="flex-1 w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleGenerateAiCampaign}
              disabled={isGeneratingAi || !aiCampaignTopic.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isGeneratingAi ? 'Génération...' : 'Générer le Message'}</span>
            </button>
          </div>
        </div>

        {aiGeneratedCopy && (
          <div className="p-5 bg-slate-950 rounded-2xl border border-indigo-500/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>Message Marketing Prêt à Diffuser :</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(aiGeneratedCopy);
                  alert('Message marketing copié dans le presse-papier !');
                }}
                className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copier le texte</span>
              </button>
            </div>
            <pre className="font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed font-medium bg-slate-900 p-4 rounded-xl border border-slate-800">
              {aiGeneratedCopy}
            </pre>
          </div>
        )}
      </section>

      {/* 7. SECTION: INSCRIPTION CLUB VIP & ALERTES FLASH */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 border border-slate-800 text-center text-white space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Accès Avant-Première</span>
          <h3 className="text-2xl sm:text-3xl font-black">Ne Ratez Plus Aucune Vente Flash</h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Rejoignez notre canal VIP WhatsApp et recevez les codes promos exclusifs 1 heure avant tout le monde.
          </p>
        </div>

        <form onSubmit={handleVipSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={vipForm.phone}
            onChange={(e) => setVipForm({ ...vipForm, phone: e.target.value })}
            placeholder="Votre numéro WhatsApp (ex: 77 123 45 67)"
            required
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={vipSuccess}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {vipSuccess ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            <span>{vipSuccess ? 'Inscrit !' : 'Rejoindre le VIP'}</span>
          </button>
        </form>
      </section>

    </div>
  );
};
