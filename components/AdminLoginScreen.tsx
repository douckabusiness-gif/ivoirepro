'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { 
    settings, 
    loginAdmin, 
    loginAsDemoAdmin, 
    setCurrentView 
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const demoModeAvailable = process.env.NODE_ENV !== 'production';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre adresse email et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await loginAdmin(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Identifiants incorrects. Vérifiez votre email et mot de passe.');
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const success = await loginAsDemoAdmin();
      if (!success) {
        setErrorMessage('Le mode démo est indisponible sur cette installation.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Erreur lors de la connexion démo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Top Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block">
              {settings.storeName || 'Boutique E-Commerce'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Console d'Administration Sécurisée
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentView('home')}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Retour Boutique</span>
        </button>
      </header>

      {/* Main Login Card Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Card Title & Icon */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-600/20 mb-2 ring-4 ring-indigo-500/10">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Connexion Administration
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Identifiez-vous pour accéder au tableau de bord, aux commandes et aux réglages de votre boutique.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Échec de connexion</span>
                <span className="text-[11px] leading-relaxed block text-rose-300">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Adresse Email Administrateur</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@boutique.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Mot de Passe</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-slate-500 hover:text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification des accès...</span>
                </>
              ) : (
                <>
                  <span>Se Connecter à l'Administration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {demoModeAvailable && (
            <>
              {/* Development-only demo access. Production never renders a bypass. */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider shrink-0">
                  Accès de développement
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleDemoLogin}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 text-left transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-purple-300">
                  <span>Mode Démo Local</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Disponible uniquement hors production</p>
              </button>
            </>
          )}

        </div>
      </div>

      {/* Security Footer */}
      <footer className="relative z-10 py-4 px-6 text-center border-t border-slate-900 text-[11px] text-slate-500 space-y-1">
        <p className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Session chiffrée SSL / JWT 256-bit • Base de données PostgreSQL</span>
        </p>
        <p className="text-[10px] text-slate-600">
          En cas d'oubli de mot de passe, utilisez la procédure de récupération sécurisée du serveur.
        </p>
      </footer>

    </div>
  );
};
