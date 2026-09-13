'use client';

import React from 'react';
import Link from 'next/link';
import { StoreProvider, useStore } from '@/lib/storeContext';
import { PartnerPortal } from '@/components/PartnerPortal';
import { 
  Store, 
  ExternalLink, 
  MessageCircle, 
  Sun, 
  Moon, 
  Award, 
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

function PartnerHeader() {
  const { settings, isDarkMode, toggleDarkMode } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand Section */}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 group transition"
            title="Retourner au site public"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-md group-hover:scale-105 transition-transform">
              {(settings?.storeName || 'B').charAt(0)}
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white block group-hover:text-amber-400 transition">
                {settings?.storeName || 'Boutique'}
              </span>
              <span className="text-[10px] font-extrabold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                Espace Partenaires & Affiliés
              </span>
            </div>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Public Storefront Link */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Ouvrir la boutique publique dans un nouvel onglet"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Boutique Publique</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Partner WhatsApp Support */}
          <a
            href={`https://wa.me/${(settings.whatsappNumber || '221770000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, je suis partenaire sur ${settings.storeName} et j'ai une question.`)}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Contacter le support partenaire"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span className="hidden md:inline">Support Ambassadeurs</span>
          </a>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

        </div>

      </div>
    </header>
  );
}

function PartnerFooter() {
  const { settings } = useStore();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-8 text-xs font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-bold text-slate-300">
            © {new Date().getFullYear()} {settings.storeName} • Portail Partenaire & Micro-Franchises
          </p>
          <p className="text-[11px] text-slate-500">
            Commissions garanties & paiements instantanés par Wave et Orange Money.
          </p>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/" className="hover:text-white transition">Boutique Publique</Link>
          <span>•</span>
          <Link href="/admin" className="hover:text-white transition">Accès Administrateur</Link>
        </div>
      </div>
    </footer>
  );
}

function PartnerViewContent() {
  const { settings } = useStore();
  const isProgramDisabled = settings?.partnerProgramEnabled === false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      <PartnerHeader />
      {isProgramDisabled && (
        <div className="bg-gradient-to-r from-rose-950 via-amber-950 to-slate-950 border-b border-rose-800/50 p-4 text-center text-xs text-rose-200">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider">
              Programme Suspendu
            </span>
            <span>
              Le programme partenaire et ambassadeur est temporairement désactivé par l'administrateur de la boutique. Les nouvelles inscriptions sont suspendues.
            </span>
            <Link href="/" className="underline text-amber-300 hover:text-white font-bold ml-1">
              Retourner à la boutique →
            </Link>
          </div>
        </div>
      )}
      <main className="flex-1">
        <PartnerPortal />
      </main>
      <PartnerFooter />
    </div>
  );
}

export default function PartnerPage() {
  return (
    <StoreProvider initialView="partenaire">
      <PartnerViewContent />
    </StoreProvider>
  );
}
