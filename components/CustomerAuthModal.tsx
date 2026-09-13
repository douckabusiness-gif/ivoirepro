'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  User, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Gift, 
  Truck, 
  ArrowRight, 
  X, 
  RefreshCw,
  Zap,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomerAuthModal = () => {
  const { 
    isCustomerAuthModalOpen, 
    setIsCustomerAuthModalOpen, 
    customerAuthInitialMode, 
    customerLogin, 
    customerRegister 
  } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Dakar');
  const [regAddress, setRegAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isCustomerAuthModalOpen) {
      setAuthMode(customerAuthInitialMode || 'login');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isCustomerAuthModalOpen, customerAuthInitialMode]);

  if (!isCustomerAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await customerLogin(loginIdentifier, loginPassword);
    setIsLoading(false);

    if (res.success) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      setErrorMsg(res.error || 'Identifiants incorrects.');
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const res = await customerLogin('', '', true);
    setIsLoading(false);
    if (res.success) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } else {
      setErrorMsg(res.error || 'Erreur connexion démo.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await customerRegister({
      fullName: regFullName,
      phone: regPhone,
      email: regEmail || undefined,
      password: regPassword,
      city: regCity,
      address: regAddress || undefined,
    });

    setIsLoading(false);

    if (res.success) {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    } else {
      setErrorMsg(res.error || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full relative">
        
        {/* Close Button */}
        <button
          onClick={() => setIsCustomerAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition z-10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-amber-600 p-6 sm:p-7 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Espace Client Privilège
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {authMode === 'login' ? 'Bon retour parmi nous !' : 'Rejoignez le Club VIP'}
            </h2>
            <p className="text-xs text-indigo-100 leading-relaxed">
              {authMode === 'login' 
                ? 'Suivez vos colis en direct, retrouvez vos favoris et commandez en 1 clic.'
                : 'Profitez de +10 Points VIP offerts et de la livraison express prioritaire.'}
            </p>
          </div>

          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1.5 m-4 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            className={`py-2 text-xs font-black rounded-xl transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Se Connecter
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
            className={`py-2 text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Créer un Compte</span>
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full">
              +10 pts
            </span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 pt-2 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold animate-in fade-in duration-200">
              {errorMsg}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: CONNEXION / LOGIN */}
          {/* ========================================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Téléphone WhatsApp ou Email</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="ex: +221 77 123 45 67 ou email"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Mot de passe</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Accéder à mon Espace Client</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* 1-Click Demo Client Login */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Connexion Démo Client ⚡ (Moussa Diop)</span>
                </button>
              </div>

            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: INSCRIPTION / REGISTER */}
          {/* ========================================================================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Nom & Prénom</span>
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="ex: Awa Ndiaye"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Numéro de Téléphone (WhatsApp)</span>
                </label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+221 77 123 45 67"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email (facultatif)</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nom@mail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Ville / Quartier</span>
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Dakar, Almadies..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Créer un Mot de passe</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300 font-bold">
                <Gift className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Bonus immédiat : 10 Points VIP crédités sur votre compte !</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Créer mon Compte VIP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

            </form>
          )}

          {/* Reassurance Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Données 100% Sécurisées
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-indigo-500" /> Suivi Expédition 24h
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
