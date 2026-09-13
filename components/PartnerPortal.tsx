'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '@/lib/storeContext';
import { Partner, PartnerPayout, Order, Product } from '@/lib/types';
import { 
  Store, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Users, 
  MousePointerClick, 
  ShoppingBag, 
  Copy, 
  Check, 
  Share2, 
  MessageCircle, 
  ExternalLink, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Settings, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  QrCode, 
  Link as LinkIcon, 
  Wallet, 
  RefreshCw,
  Send,
  Eye,
  User,
  Phone,
  Mail,
  Lock,
  ChevronRight,
  Flame,
  Zap,
  Target,
  Image as ImageIcon,
  Sliders,
  Award,
  Smartphone,
  Download,
  Share,
  FileText,
  BadgeCheck,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PartnerPortal = () => {
  const { products, settings, formatPrice, setCurrentView, isDarkMode } = useStore();

  // Auth & Session state
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form states - Auth
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regPayoutMethod, setRegPayoutMethod] = useState<'wave' | 'orange_money' | 'bank'>('wave');
  const [regPayoutPhone, setRegPayoutPhone] = useState('');

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Active subtab inside dashboard
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'ads' | 'sales' | 'payouts' | 'profile'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Ad Studio state
  const [adFormat, setAdFormat] = useState<'story' | 'square' | 'script' | 'flyer'>('story');
  const [adAngle, setAdAngle] = useState<'flash' | 'vip' | 'trust' | 'delivery'>('flash');
  const [selectedProductForAd, setSelectedProductForAd] = useState<Product | null>(null);
  const [adCustomDiscount, setAdCustomDiscount] = useState<string>('Offre Spéciale Flash');
  const [isAdCopied, setIsAdCopied] = useState(false);
  const [isAdLinkCopied, setIsAdLinkCopied] = useState(false);

  // Link Generator state
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  // Payout request modal & state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState<string>('wave');
  const [payoutTarget, setPayoutTarget] = useState<string>('');
  const [payoutNote, setPayoutNote] = useState<string>('');
  const [payoutError, setPayoutError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Profile update state
  const [profileStoreName, setProfileStoreName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePayoutPhone, setProfilePayoutPhone] = useState('');
  const [profilePayoutMethod, setProfilePayoutMethod] = useState('wave');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Fetch partner profile session on mount
  const fetchPartnerSession = async () => {
    try {
      setIsLoadingSession(true);
      const res = await fetch('/api/partners/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.partner) {
          setPartner(data.partner);
          setProfileStoreName(data.partner.storeName || '');
          setProfileBio(data.partner.bio || '');
          setProfilePayoutPhone(data.partner.payoutPhone || data.partner.phone || '');
          setProfilePayoutMethod(data.partner.payoutMethod || 'wave');
          setPayoutTarget(data.partner.payoutPhone || data.partner.phone || '');
          setPayoutMethod(data.partner.payoutMethod || 'wave');
        }
      }
    } catch (err) {
      console.warn('Partner session fetch error:', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchPartnerSession();
  }, []);

  // Initialize first product for Ad studio when products load
  useEffect(() => {
    if (products && products.length > 0 && !selectedProductForAd) {
      setSelectedProductForAd(products[0]);
    }
  }, [products, selectedProductForAd]);

  // Handle Demo Partner Login (1-click)
  const handleDemoLogin = async () => {
    setIsSubmittingAuth(true);
    setAuthError('');
    try {
      const res = await fetch('/api/partners/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPartner(data.partner);
        setProfileStoreName(data.partner.storeName || '');
        setProfileBio(data.partner.bio || '');
        setProfilePayoutPhone(data.partner.payoutPhone || data.partner.phone || '');
        setPayoutTarget(data.partner.payoutPhone || data.partner.phone || '');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        setAuthError(data.error || 'Impossible de charger la session démo');
      }
    } catch (err: any) {
      setAuthError('Erreur réseau');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Pre-fill demo data for register
  const handleFillDemoRegister = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setRegName(`Mariama Diallo`);
    setRegEmail(`mariama.ambassadrice${randomNum}@gmail.com`);
    setRegPhone(`+221 77 ${randomNum} 45 67`);
    setRegPassword(`pass1234`);
    setRegStoreName(`Mariama Chic Style`);
    setRegBio(`Passionnée de mode & beauté à Dakar. Retrouvez ici mes coups de cœur avec livraison rapide !`);
    setRegPayoutMethod('wave');
    setRegPayoutPhone(`+221 77 ${randomNum} 45 67`);
  };

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError('');
    try {
      const res = await fetch('/api/partners/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPartner(data.partner);
        setProfileStoreName(data.partner.storeName || '');
        setProfileBio(data.partner.bio || '');
        setProfilePayoutPhone(data.partner.payoutPhone || data.partner.phone || '');
        setPayoutTarget(data.partner.payoutPhone || data.partner.phone || '');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } else {
        setAuthError(data.error || 'Identifiants invalides');
      }
    } catch (err: any) {
      setAuthError('Erreur de connexion');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Register Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          storeName: regStoreName,
          bio: regBio,
          payoutMethod: regPayoutMethod,
          payoutPhone: regPayoutPhone || regPhone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPartner(data.partner);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } else {
        setAuthError(data.error || "Erreur lors de l'inscription");
      }
    } catch (err: any) {
      setAuthError('Erreur de communication avec le serveur');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/partners/logout', { method: 'POST' });
      setPartner(null);
      setDashboardTab('overview');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      const res = await fetch('/api/partners/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: profileStoreName,
          bio: profileBio,
          payoutPhone: profilePayoutPhone,
          payoutMethod: profilePayoutMethod,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPartner(data.partner);
        setProfileSuccessMsg('Profil et vitrine mis à jour avec succès !');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Submit Payout Request
  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    setIsSubmittingPayout(true);
    setPayoutError('');
    setPayoutSuccess('');

    try {
      const res = await fetch('/api/partners/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          payoutMethod,
          payoutTarget,
          note: payoutNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPayoutSuccess(data.message || 'Demande de retrait transmise avec succès !');
        setPartner(data.partner);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
        setTimeout(() => {
          setIsPayoutModalOpen(false);
          setPayoutSuccess('');
          setPayoutAmount(0);
        }, 2500);
      } else {
        setPayoutError(data.error || 'Erreur lors de la demande de retrait');
      }
    } catch (err) {
      setPayoutError('Erreur réseau');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  // Helper: Copy text with temporary check animation
  const copyToClipboard = (text: string, typeKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkType(typeKey);
    setTimeout(() => {
      setCopiedLinkType(null);
    }, 2500);
  };

  // Generate Base URLs
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const partnerSlug = partner?.slug || 'mon-espace';
  const partnerStoreLink = `${origin}/p/${partnerSlug}`;
  const partnerHomeRefLink = `${origin}/?ref=${partnerSlug}`;

  // Top 3 highest-earning products calculation
  const topLucrativeProducts = useMemo(() => {
    if (!products || products.length === 0 || !partner) return [];
    return [...products]
      .sort((a, b) => {
        const commA = (a.price * partner.commissionRate) / 100;
        const commB = (b.price * partner.commissionRate) / 100;
        return commB - commA;
      })
      .slice(0, 3);
  }, [products, partner]);

  // Dynamic Ad Copy Generator
  const generatedAdCopy = useMemo(() => {
    if (!partner) return { title: '', hook: '', fullText: '', link: '', qrUrl: '' };

    const prod = selectedProductForAd;
    const prodName = prod ? prod.title : 'Nos Meilleures Ventes & Nouveautés';
    const prodPrice = prod ? formatPrice(prod.price) : 'Dès 9 900 FCFA';
    const originalPrice = prod && prod.originalPrice ? formatPrice(prod.originalPrice) : null;
    const storeName = partner.storeName || partner.name;

    const adLink = prod 
      ? `${origin}/?ref=${partner.slug}&prod=${prod.id}&utm_source=ad_${adFormat}`
      : `${origin}/p/${partner.slug}?utm_source=ad_${adFormat}`;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(adLink)}&bgcolor=ffffff&color=4f46e5&margin=1`;

    let hook = '';
    let bullets = '';

    if (adAngle === 'flash') {
      hook = `⚡ VENTE FLASH EXCLUSIVE — Stocks Ultra Limités à Dakar !`;
      bullets = `🔥 Prix Choc : ${prodPrice} ${originalPrice ? `(au lieu de ${originalPrice})` : ''}\n📦 Livraison Express 24h & Paiement à la réception\n💎 Produit 100% Neuf & Garanti Satisfait`;
    } else if (adAngle === 'vip') {
      hook = `✨ Ma Sélection Coup de Cœur chez ${settings.storeName} !`;
      bullets = `🌟 Élégance & Finition Haute Qualité\n💎 Disponible immédiatement au meilleur tarif : ${prodPrice}\n🚀 Livraison rapide à domicile partout au Sénégal`;
    } else if (adAngle === 'trust') {
      hook = `🤝 Recommandé par ${storeName} — Commandez en toute sécurité !`;
      bullets = `🔒 Paiement sécurisé Wave / Orange Money / Espèces à la livraison\n⭐ 100% de clients satisfaits\n📦 Essayez avant de payer à la réception`;
    } else {
      hook = `🚚 Livraison Rapide 24H & Paiement à la Réception à Dakar !`;
      bullets = `⚡ Commandez aujourd'hui, recevez chez vous demain\n💵 Aucun paiement à l'avance demandé\n🛒 Tarif promotionnel exclusif : ${prodPrice}`;
    }

    const fullText = `${hook}\n\n👉 *${prodName}*\n\n${bullets}\n\n👇 *Cliquez ici pour commander directement via ma vitrine officielle :*\n🔗 ${adLink}\n\n_Bénéficiez du service client prioritaire 7j/7 !_`;

    return {
      title: prodName,
      hook,
      price: prodPrice,
      originalPrice,
      bullets,
      fullText,
      link: adLink,
      qrUrl
    };
  }, [partner, selectedProductForAd, adAngle, adFormat, origin, formatPrice, settings.storeName]);

  // Loading spinner during initial session check
  if (isLoadingSession) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider animate-pulse">
          Chargement de votre Espace Partenaire...
        </p>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: AUTHENTICATION (LOGIN / REGISTER)
  // ==========================================
  if (!partner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-extrabold shadow-xs">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Programme Ambassadeurs & Micro-Franchises</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Devenez Partenaire & Touchez <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-amber-500">10% à 20%</span> sur Chaque Vente
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Rejoignez notre réseau officiel d'ambassadeurs. Obtenez votre vitrine digitale personnalisée, vos outils publicitaires 1-clic et recevez vos commissions directement par <strong>Wave</strong> ou <strong>Orange Money</strong>.
          </p>
        </div>

        {/* Auth Box Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-w-lg mx-auto">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-1.5 gap-1.5">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-3 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Se Connecter</span>
            </button>

            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-3 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                authMode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Créer mon Compte</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {authError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Quick Demo Test Login Button */}
            <div className="p-3 bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-amber-950/30 dark:to-indigo-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-[11px] font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Test Rapide en 1-Clic</span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Compte ambassadeur démo actif avec statistiques & solde débloqué
                </p>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmittingAuth}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                Connexion Démo ⚡
              </button>
            </div>

            {/* FORM 1: LOGIN */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Adresse Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="partenaire@test.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mot de passe</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingAuth ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Accéder à mon Espace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM 2: REGISTER */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleFillDemoRegister}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    ✨ Remplir automatiquement
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Votre Nom Complet</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ex: Fatou Ndiaye"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Téléphone WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email de Connexion</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mot de passe</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nom de votre Vitrine / Enseigne
                  </label>
                  <input
                    type="text"
                    required
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    placeholder="Ex: Fatou Chic Collection"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Ce nom sera affiché sur votre bannière de recommandation et dans votre lien personnalisé.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mode de Réception des Gains</label>
                    <select
                      value={regPayoutMethod}
                      onChange={(e: any) => setRegPayoutMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="wave">Wave Mobile</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="bank">Virement Bancaire</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numéro pour vos Virements</label>
                    <input
                      type="tel"
                      value={regPayoutPhone}
                      onChange={(e) => setRegPayoutPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {isSubmittingAuth ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Valider mon Inscription Partenaire</span>
                      <Sparkles className="w-4 h-4 text-amber-200" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

        {/* Benefits Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mx-auto text-indigo-600">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Vitrine & Bannière VIP</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vos visiteurs voient votre vitrine officielle avec votre photo, votre bio et un bandeau rassurant.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mx-auto text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Studio Pub 1-Clic</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Générez instantanément des bannières Story / Post avec QR code et des textes WhatsApp persuasifs.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center mx-auto text-amber-600">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Paiements Wave & OM</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Retraits instantanés dès {formatPrice(settings.minPayoutAmount || 5000)} avec historique transparent.
            </p>
          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: PENDING VALIDATION SCREEN
  // ==========================================
  if (partner.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/60 rounded-3xl flex items-center justify-center mx-auto text-amber-600 border border-amber-300 dark:border-amber-800 shadow-lg animate-pulse">
          <Clock className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <span>Statut : En cours d'examen</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Votre compte est en attente de validation
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Bonjour <strong>{partner.name}</strong> ! Votre candidature pour le programme de partenariat de <strong>{settings.storeName}</strong> a bien été reçue.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-left space-y-4 max-w-lg mx-auto">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Étapes de validation :</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Inscription enregistrée</p>
                <p className="text-[11px] text-slate-500">Vos coordonnées et votre vitrine ({partner.storeName}) ont été sauvegardées.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-spin">
                ●
              </div>
              <div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Revue par l'administrateur</p>
                <p className="text-[11px] text-slate-500">L'administrateur valide votre compte pour vous attribuer vos liens d'affiliation actifs.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Déblocage du tableau de bord</p>
                <p className="text-[11px] text-slate-500">Vos liens de parrainage et vos commissions ({partner.commissionRate}%) seront immédiatement opérationnels.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={fetchPartnerSession}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser le statut</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ACTIVE ULTRA-PRO PARTNER DASHBOARD WITH SIDEBAR
  // ==========================================
  const totalSalesCount = partner.orders?.length || 0;
  const totalTurnover = partner.orders?.reduce((acc, o) => acc + o.totalAmount, 0) || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* ========================================================================= */}
      {/* 1. SIDEBAR (MENU LATÉRAL GAUCHE) */}
      {/* ========================================================================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Header: Brand & Partner Identity */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-500/20">
                {(partner.storeName || partner.name || 'P').charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-sm text-white truncate tracking-tight">
                  {partner.storeName || partner.name}
                </h2>
                <span className="text-[10px] font-black text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" />
                  Ambassadeur VIP
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Mini Partner Status Pill */}
          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Compte Actif
            </span>
            <span className="font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              {partner.commissionRate}% comm.
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          
          {/* Section 1: Navigation Principale */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Menu Principal
            </p>

            <button
              onClick={() => { setDashboardTab('overview'); setIsMobileSidebarOpen(false); }}
              className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-black flex items-center justify-between transition cursor-pointer ${
                dashboardTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>Tableau de Bord</span>
              </div>
            </button>

            <button
              onClick={() => { setDashboardTab('ads'); setIsMobileSidebarOpen(false); }}
              className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-black flex items-center justify-between transition cursor-pointer relative ${
                dashboardTab === 'ads'
                  ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Studio Pub 1-Clic</span>
              </div>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full">
                NOUVEAU
              </span>
            </button>
          </div>

          {/* Section 2: Performances & Ventes */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Performances & Gains
            </p>

            <button
              onClick={() => { setDashboardTab('sales'); setIsMobileSidebarOpen(false); }}
              className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-black flex items-center justify-between transition cursor-pointer ${
                dashboardTab === 'sales'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Mes Ventes</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-indigo-300 text-[10px] font-black rounded-full border border-slate-700">
                {totalSalesCount}
              </span>
            </button>

            <button
              onClick={() => { setDashboardTab('payouts'); setIsMobileSidebarOpen(false); }}
              className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-black flex items-center justify-between transition cursor-pointer ${
                dashboardTab === 'payouts'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4" />
                <span>Retraits Wave / OM</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-emerald-300 text-[10px] font-black rounded-full border border-slate-700">
                {partner.payouts?.length || 0}
              </span>
            </button>
          </div>

          {/* Section 3: Vitrine & Liens */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Paramètres Vitrine
            </p>

            <button
              onClick={() => { setDashboardTab('profile'); setIsMobileSidebarOpen(false); }}
              className={`w-full py-2.5 px-3.5 rounded-2xl text-xs font-black flex items-center justify-between transition cursor-pointer ${
                dashboardTab === 'profile'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" />
                <span>Personnaliser ma Vitrine</span>
              </div>
            </button>

            <a
              href={partnerStoreLink}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Voir ma Vitrine</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>

        </div>

        {/* Sidebar Footer: Wallet Summary Card & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/60">
          
          {/* Quick Balance Box */}
          <div className="p-3 bg-gradient-to-br from-indigo-900/60 to-slate-900 border border-indigo-800/50 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
              <span>SOLDE DISPONIBLE</span>
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-base font-black text-white">
              {formatPrice(partner.pendingBalance)}
            </p>
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>Retirer mes Gains</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{partner.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{partner.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* 2. ZONE PRINCIPALE DE CONTENU (MAIN CONTENT) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              ☰
            </button>

            {/* Breadcrumb Info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold hidden sm:inline">Espace Partenaire</span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-black text-slate-200 capitalize">
                {dashboardTab === 'overview' && '📊 Tableau de Bord & Liens'}
                {dashboardTab === 'ads' && '🎨 Studio Pub 1-Clic'}
                {dashboardTab === 'sales' && '🛒 Historique des Ventes'}
                {dashboardTab === 'payouts' && '💳 Retraits Wave / OM'}
                {dashboardTab === 'profile' && '⚙️ Personnaliser ma Vitrine'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDashboardTab('ads')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Créer une Pub</span>
            </button>

            <a
              href={partnerStoreLink}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Ma Vitrine</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>

        </header>

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Ambassadeur Certifié
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                    {partner.commissionRate}% Commission
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {partner.storeName || partner.name}
                </h1>
                <p className="text-xs text-slate-300">
                  Partagez vos liens et créez des pubs 1-clic pour maximiser vos gains Wave & Orange Money.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Demander un Retrait</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Metric 1: Clics */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Visites / Clics</span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600">
                  <MousePointerClick className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {partner.clicksCount.toLocaleString('fr-FR')}
              </div>
              <p className="text-[11px] text-slate-500">Visiteurs référés via vos liens</p>
            </div>

            {/* Metric 2: Commandes */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Commandes</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalSalesCount}
              </div>
              <p className="text-[11px] text-slate-500">
                {totalSalesCount > 0 && partner.clicksCount > 0 
                  ? `Taux de conversion : ${((totalSalesCount / partner.clicksCount) * 100).toFixed(1)}%` 
                  : 'Ventes générées au total'}
              </p>
            </div>

            {/* Metric 3: Total Commissions */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Commissions Totales</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {formatPrice(partner.totalEarnings)}
              </div>
              <p className="text-[11px] text-slate-500">Gains cumulés historiques</p>
            </div>

            {/* Metric 4: Solde Disponible */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-2 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-indigo-950/20">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Solde Retirable</span>
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-300">
                {formatPrice(partner.pendingBalance)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Déjà retiré : {formatPrice(partner.paidBalance)}</span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW & FAST LINKS */}
          {/* ========================================================================= */}
          {dashboardTab === 'overview' && (
            <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Links Section (col-span-2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Box 1: Lien Principal de la Boutique */}
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">Votre Lien Principal de Boutique</h3>
                      <p className="text-xs text-slate-500">Dirige vers l'ensemble du catalogue avec votre bandeau ambassadeur</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black rounded-full">
                    Actif 🟢
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    readOnly
                    value={partnerStoreLink}
                    className="flex-1 bg-transparent px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyToClipboard(partnerStoreLink, 'main_store')}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedLinkType === 'main_store' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLinkType === 'main_store' ? 'Copié !' : 'Copier'}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`✨ Découvrez ma boutique officielle ${partner.storeName || partner.name} avec livraison rapide 24h & paiement à la réception partout au Sénégal :\n👉 ${partnerStoreLink}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      title="Partager sur WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar Column (col-span-1) */}
            <div className="space-y-6">
              
              {/* Box: Top Produits les Plus Rémunérateurs */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">Top Produits Lucratifs</h3>
                    <p className="text-[11px] text-slate-500">Les plus fortes commissions par vente</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {topLucrativeProducts.map((prod, idx) => {
                    const commissionPerSale = (prod.price * partner.commissionRate) / 100;
                    return (
                      <div 
                        key={prod.id} 
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-indigo-400 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={prod.images[0] || '/favicon.svg'} 
                            alt={prod.title} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.title}</p>
                            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                              +{formatPrice(commissionPerSale)} / vente
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProductForAd(prod);
                            setDashboardTab('ads');
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shrink-0 transition cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <span>Pub 1-Clic</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box: QR Code Vitrine Rapide */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-indigo-600">
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">QR Code Vitrine</span>
                </div>
                
                <div className="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(partnerStoreLink)}&bgcolor=ffffff&color=4f46e5&margin=1`}
                    alt="QR Code Partenaire"
                    className="w-32 h-32 mx-auto rounded-lg"
                  />
                </div>

                <p className="text-[11px] text-slate-500">
                  Idéal pour insérer sur vos stories WhatsApp, flyers ou cartes de visite.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDIO PUB & MARKETING 1-CLIC */}
      {/* ========================================================================= */}
      {dashboardTab === 'ads' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Générateur Automatique de Publicités & Bannières</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Studio Pub Partenaire 1-Clic
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Sélectionnez un produit ou une offre, choisissez votre format (Story WhatsApp, Post Carré ou Script DM) et obtenez un visuel percutant avec votre lien et QR Code intégrés !
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Taux de commission appliqué :</span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                {partner.commissionRate}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Controls & Configuration Column (col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Step 1: Format Selector */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Format de Publicité</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAdFormat('story')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      adFormat === 'story'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs">Story / Statut</p>
                      <p className="text-[10px] opacity-75 font-normal">WhatsApp & Insta (9:16)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdFormat('square')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      adFormat === 'square'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs">Post Carré</p>
                      <p className="text-[10px] opacity-75 font-normal">Facebook / Feed (1:1)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdFormat('script')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      adFormat === 'script'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs">Script Texte DM</p>
                      <p className="text-[10px] opacity-75 font-normal">Messages & Groupes</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdFormat('flyer')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      adFormat === 'flyer'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs">Coupon & QR</p>
                      <p className="text-[10px] opacity-75 font-normal">Flyer Flashable</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Product Selector */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Choisir le Produit</span>
                  </span>
                  {selectedProductForAd && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      Commission : +{formatPrice((selectedProductForAd.price * partner.commissionRate) / 100)}
                    </span>
                  )}
                </label>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {products.map((prod) => {
                    const isSelected = selectedProductForAd?.id === prod.id;
                    const comm = (prod.price * partner.commissionRate) / 100;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => setSelectedProductForAd(prod)}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={prod.images[0] || '/favicon.svg'}
                            alt={prod.title}
                            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.title}</p>
                            <p className="text-[10px] text-slate-500">{formatPrice(prod.price)}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-emerald-600'
                        }`}>
                          +{formatPrice(comm)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Advertising Angle & Tone */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Angle Marketing & Ton de la Pub</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'flash', label: '⚡ Vente Flash & Urgence', desc: 'Stocks limités / Prix promo' },
                    { id: 'vip', label: '💎 Sélection VIP & Luxe', desc: 'Tendance & Haute qualité' },
                    { id: 'trust', label: '🤝 Recommandation & Avis', desc: 'Confiance & Coup de cœur' },
                    { id: 'delivery', label: '🚚 Paiement à Réception', desc: 'Livraison express 24h' },
                  ].map((angle) => (
                    <button
                      key={angle.id}
                      type="button"
                      onClick={() => setAdAngle(angle.id as any)}
                      className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                        adAngle === angle.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <p className="text-xs">{angle.label}</p>
                      <p className="text-[9px] opacity-75">{angle.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Interactive Ad Preview Canvas (col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
                
                {/* Header Preview bar */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Aperçu Publicitaire en Direct ({adFormat.toUpperCase()})
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
                    Lien Affilié & QR Intégrés
                  </span>
                </div>

                {/* AD PREVIEW CONTAINER */}
                <div className="flex justify-center">
                  
                  {/* FORMAT 1: STORY (9:16 VERTICAL) */}
                  {adFormat === 'story' && (
                    <div className="w-full max-w-xs aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 text-white relative shadow-2xl border-4 border-slate-800 flex flex-col justify-between p-5 select-none">
                      
                      {/* Background Product Image with Gradient Overlay */}
                      {selectedProductForAd && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-700"
                          style={{ backgroundImage: `url(${selectedProductForAd.images[0] || '/favicon.svg'})` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50 pointer-events-none" />

                      {/* Story Top Badges */}
                      <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="px-2.5 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                            ⭐ Recommandé par {partner.storeName || partner.name}
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-black animate-pulse">
                            VENTE FLASH
                          </span>
                        </div>

                        <div className="inline-block px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-lg">
                          {generatedAdCopy.hook}
                        </div>
                      </div>

                      {/* Story Center: Product Card Showcase */}
                      <div className="relative z-10 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center space-y-2">
                        {selectedProductForAd && (
                          <img
                            src={selectedProductForAd.images[0] || '/favicon.svg'}
                            alt={selectedProductForAd.title}
                            className="w-28 h-28 mx-auto rounded-xl object-cover shadow-lg border border-white/20"
                          />
                        )}
                        <h4 className="font-black text-sm text-white line-clamp-1">
                          {selectedProductForAd?.title || 'Sélection Tendance'}
                        </h4>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl font-black text-amber-400">
                            {generatedAdCopy.price}
                          </span>
                          {generatedAdCopy.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {generatedAdCopy.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Story Bottom: Dynamic QR Code & Swipe Up CTA */}
                      <div className="relative z-10 space-y-3 pt-2">
                        <div className="p-2.5 bg-white/95 rounded-2xl flex items-center justify-between gap-2 shadow-xl">
                          <img
                            src={generatedAdCopy.qrUrl}
                            alt="QR Code Affilié"
                            className="w-14 h-14 rounded-lg shrink-0"
                          />
                          <div className="text-left text-slate-900 pr-1">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">📱 Scannez pour Acheter</p>
                            <p className="text-[9px] font-semibold text-slate-600">Paiement Wave/OM à la réception • Livraison 24h</p>
                          </div>
                        </div>

                        <div className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                          <span>Commander sur ma Boutique</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* FORMAT 2: SQUARE POST (1:1) */}
                  {adFormat === 'square' && (
                    <div className="w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-slate-950 text-white relative shadow-2xl border-4 border-slate-800 flex flex-col justify-between p-5 select-none">
                      {selectedProductForAd && (
                        <div 
                          className="absolute inset-0 bg-cover bg-center opacity-30"
                          style={{ backgroundImage: `url(${selectedProductForAd.images[0] || '/favicon.svg'})` }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95" />

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                            ★
                          </div>
                          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                            {partner.storeName || partner.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                          OFFRE LIMITÉE
                        </span>
                      </div>

                      <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                        {selectedProductForAd && (
                          <img
                            src={selectedProductForAd.images[0] || '/favicon.svg'}
                            alt={selectedProductForAd.title}
                            className="w-20 h-20 rounded-xl object-cover border border-white/20 shrink-0 shadow-md"
                          />
                        )}
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-black text-sm text-white truncate">{selectedProductForAd?.title}</h4>
                          <p className="text-lg font-black text-amber-400">{generatedAdCopy.price}</p>
                          <p className="text-[10px] text-emerald-300 font-bold">✓ Livraison 24h & Paiement à réception</p>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center justify-between gap-3 bg-white p-2.5 rounded-2xl text-slate-900">
                        <img
                          src={generatedAdCopy.qrUrl}
                          alt="QR Code Affilié"
                          className="w-12 h-12 rounded-md shrink-0"
                        />
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-[11px] font-black text-indigo-700">Scannez ou cliquez sur le lien</p>
                          <p className="text-[9px] text-slate-500 font-medium">Boutique officielle vérifiée</p>
                        </div>
                        <div className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shrink-0">
                          Acheter 👉
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORMAT 3: TEXT SCRIPT (COPYWRITING READY) */}
                  {adFormat === 'script' && (
                    <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 text-left space-y-4 font-sans text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-500 flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-emerald-500" />
                          <span>Texte WhatsApp & DM prêt à envoyer</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          Haute Conversion
                        </span>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium leading-relaxed shadow-xs">
                        {generatedAdCopy.fullText}
                      </div>
                    </div>
                  )}

                  {/* FORMAT 4: FLYER & COUPON */}
                  {adFormat === 'flyer' && (
                    <div className="w-full max-w-sm bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-400/30 text-center space-y-4">
                      <div className="space-y-1">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300">
                          BON D'ACHAT AMBASSADEUR
                        </span>
                        <h3 className="text-xl font-black text-white">{partner.storeName || partner.name}</h3>
                        <p className="text-[11px] text-indigo-100">Profitez du tarif préférentiel & livraison express</p>
                      </div>

                      <div className="p-4 bg-white rounded-2xl shadow-xl inline-block">
                        <img
                          src={generatedAdCopy.qrUrl}
                          alt="QR Code Flyer"
                          className="w-36 h-36 mx-auto rounded-lg"
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-black text-amber-300">SCANNEZ LE QR CODE AVEC VOTRE SMARTPHONE</p>
                        <p className="text-[10px] text-indigo-200">Ouverture directe de la boutique • Paiement à la livraison</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* 1-CLICK ACTION BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* WhatsApp Direct Share */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(generatedAdCopy.fullText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Partager sur WhatsApp</span>
                  </a>

                  {/* Copy Full Ad Text */}
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(generatedAdCopy.fullText, 'ad_text');
                      setIsAdCopied(true);
                      setTimeout(() => setIsAdCopied(false), 2500);
                    }}
                    className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAdCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isAdCopied ? 'Texte Copié !' : 'Copier le Texte de la Pub'}</span>
                  </button>

                  {/* Copy Direct Ad URL */}
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(generatedAdCopy.link, 'ad_link');
                      setIsAdLinkCopied(true);
                      setTimeout(() => setIsAdLinkCopied(false), 2500);
                    }}
                    className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAdLinkCopied ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    <span>{isAdLinkCopied ? 'Lien Copié !' : 'Copier le Lien Affilié'}</span>
                  </button>

                  {/* Open Direct Landing Link */}
                  <button
                    type="button"
                    onClick={() => window.open(generatedAdCopy.link, '_blank')}
                    className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Tester le Lien en Direct</span>
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MES VENTES & COMMISSIONS */}
      {/* ========================================================================= */}
      {dashboardTab === 'sales' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Historique de vos Ventes</h3>
              <p className="text-xs text-slate-500">Toutes les commandes générées grâce à vos liens de recommandation</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Chiffre d'Affaires Référé :</span>
              <span className="font-black text-slate-900 dark:text-white text-sm">{formatPrice(totalTurnover)}</span>
            </div>
          </div>

          {(!partner.orders || partner.orders.length === 0) ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Aucune commande générée pour l'instant</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Partagez votre lien de boutique ou utilisez le Studio Pub 1-Clic pour réaliser votre première vente !
              </p>
              <button
                onClick={() => setDashboardTab('ads')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Créer une Pub maintenant
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Réf. Commande</th>
                    <th className="px-6 py-3.5">Client & Ville</th>
                    <th className="px-6 py-3.5">Montant Total</th>
                    <th className="px-6 py-3.5">Votre Commission</th>
                    <th className="px-6 py-3.5">Statut Livraison</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {partner.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{order.customerName}</p>
                        <p className="text-[11px] text-slate-500">{order.customerCity || 'Dakar'}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-emerald-600 dark:text-emerald-400">
                          +{formatPrice(order.partnerCommission || (order.totalAmount * partner.commissionRate) / 100)}
                        </p>
                        {order.partnerCommissionCredited ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span>✓</span>
                            <span>Crédité sur solde</span>
                          </span>
                        ) : order.orderStatus === 'cancelled' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-500">
                            <span>✕</span>
                            <span>Non crédité</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500">
                            <span>⏳</span>
                            <span>En attente de livraison</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {order.orderStatus === 'delivered' ? 'Livré & Validé ✓' : order.orderStatus === 'cancelled' ? 'Annulé' : 'En livraison'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RETRAITS & GAINS WAVE / ORANGE MONEY */}
      {/* ========================================================================= */}
      {dashboardTab === 'payouts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Gestion des Retraits Mobile Money</h3>
              <p className="text-xs text-slate-500">
                Solde disponible pour virement : <strong className="text-indigo-600 dark:text-indigo-400 font-black">{formatPrice(partner.pendingBalance)}</strong> (Seuil min. {formatPrice(settings.minPayoutAmount || 5000)})
              </p>
            </div>
            
            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Demander un Nouveau Retrait</span>
            </button>
          </div>

          {/* Payouts Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Historique de vos Demandes de Retrait</h4>
            </div>

            {(!partner.payouts || partner.payouts.length === 0) ? (
              <div className="p-12 text-center space-y-2">
                <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Aucune demande de retrait effectuée</p>
                <p className="text-[11px] text-slate-500">Dès 5 000 FCFA de commissions, vous pouvez demander un virement Wave ou Orange Money.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Montant</th>
                      <th className="px-6 py-3.5">Moyen</th>
                      <th className="px-6 py-3.5">Numéro Réception</th>
                      <th className="px-6 py-3.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {partner.payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(payout.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                          {formatPrice(payout.amount)}
                        </td>
                        <td className="px-6 py-4 capitalize font-semibold text-slate-700 dark:text-slate-300">
                          {payout.payoutMethod === 'wave' ? '🌊 Wave' : payout.payoutMethod === 'orange_money' ? '🍊 Orange Money' : '🏦 Virement'}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                          {payout.payoutTarget}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            payout.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : payout.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {payout.status === 'completed' ? '✓ Virement Effectué' : payout.status === 'rejected' ? 'Refusé' : 'En cours de traitement'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PERSONNALISATION VITRINE & COORDONNÉES */}
      {/* ========================================================================= */}
      {dashboardTab === 'profile' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Personnaliser votre Vitrine & Coordonnées</h3>
            <p className="text-xs text-slate-500">Configurez le nom affiché sur votre vitrine publique et vos numéros de virement</p>
          </div>

          {profileSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nom de votre Vitrine / Enseigne</label>
              <input
                type="text"
                value={profileStoreName}
                onChange={(e) => setProfileStoreName(e.target.value)}
                placeholder="Ex: Fatou Chic Selection"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phrase d'accroche / Bio</label>
              <textarea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Ex: Bienvenue sur ma sélection officielle de coups de cœur mode & beauté !"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Moyen de Retrait par Défaut</label>
                <select
                  value={profilePayoutMethod}
                  onChange={(e) => setProfilePayoutMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="wave">Wave Mobile</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="bank">Virement Bancaire</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numéro pour vos Virements</label>
                <input
                  type="tel"
                  value={profilePayoutPhone}
                  onChange={(e) => setProfilePayoutPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sauvegarder les Modifications</span>}
            </button>
          </form>
        </div>
      )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DEMANDE DE RETRAIT / WITHDRAWAL */}
      {/* ========================================================================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Demande de Retrait</h3>
                  <p className="text-xs text-slate-500">Transférez vos gains vers votre compte</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {payoutError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold">
                {payoutError}
              </div>
            )}

            {payoutSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{payoutSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayout} className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Solde disponible :</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  {formatPrice(partner.pendingBalance)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Montant du Retrait (FCFA)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={settings.minPayoutAmount || 5000}
                    max={partner.pendingBalance}
                    value={payoutAmount || ''}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    placeholder={`Min. ${settings.minPayoutAmount || 5000}`}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(partner.pendingBalance)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Moyen de Paiement</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="wave">🌊 Wave Mobile Money</option>
                  <option value="orange_money">🍊 Orange Money</option>
                  <option value="bank">🏦 Virement Bancaire</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Numéro de Téléphone Récepteur
                </label>
                <input
                  type="text"
                  required
                  value={payoutTarget}
                  onChange={(e) => setPayoutTarget(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingPayout || partner.pendingBalance < (settings.minPayoutAmount || 5000)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSubmittingPayout ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Confirmer la Demande de Virement</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
