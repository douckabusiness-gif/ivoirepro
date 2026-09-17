'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/storeContext';
import { 
  Plane, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const DubaiFooter: React.FC = () => {
  const { settings } = useStore();

  const personalShopperWhatsApp = () => {
    const phone = settings.whatsappNumber || '2250700000000';
    const text = encodeURIComponent(
      "Bonjour Service Conciergerie Dubaï ! 🇦🇪\nJe souhaite en savoir plus sur les précommandes et les prochains arrivages."
    );
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  return (
    <footer className="bg-slate-950 border-t border-amber-500/30 text-white font-sans">
      
      {/* 1. Reassurance Strip */}
      <div className="border-b border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Fret Aérien Express</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Vols cargo réguliers DXB ➔ ABJ sous 7 à 10 jours ouvrés.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">100% Authentique</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Acheté en direct auprès des boutiques et distributeurs officiels.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Paiement Garanti</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Wave, Orange Money, MTN, Moov et Carte sécurisés.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Suivi Dédié WhatsApp</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Photos de votre colis à Dubaï avant embarquement.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-white text-base tracking-tight uppercase">
                  {settings.storeName || 'IVOIRE DJASSA'}
                </span>
                <span className="block text-[10px] text-amber-400 font-bold uppercase">
                  Espace Dubaï VIP 🇦🇪
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Le service d'importation et de précommandes directes des Émirats Arabes Unis vers la Côte d'Ivoire. Retrouvez le meilleur des souks et malls de Dubaï livré en toute sécurité à Abidjan.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
              >
                <span>Accéder à la Boutique Abidjan (Stock 24h)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Col 2: Rayons Dubaï */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Rayons & Arrivages Dubaï
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#dubai-catalog" className="hover:text-amber-400 transition">🏺 Parfums Arabes & Ouds (Lattafa, Afnan)</a>
              </li>
              <li>
                <a href="#dubai-catalog" className="hover:text-amber-400 transition">⌚ Montres Homme & Femme Or 24K</a>
              </li>
              <li>
                <a href="#dubai-catalog" className="hover:text-amber-400 transition">🧕 Abayas Papillon & Soie de Médine</a>
              </li>
              <li>
                <a href="#dubai-catalog" className="hover:text-amber-400 transition">📱 High-Tech & Smartphones Spéc. DXB</a>
              </li>
              <li>
                <a href="#dubai-catalog" className="hover:text-amber-400 transition">🪵 Bakhoors & Encensoirs Royaux</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Comment ça marche */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Logistique & Délais
            </h5>
            <div className="space-y-2 text-xs text-slate-400">
              <p>✈️ <strong>Fret Aérien :</strong> Départ DXB ➔ Arrivée ABJ</p>
              <p>⏱️ <strong>Délai Moyen :</strong> 7 à 10 jours ouvrés</p>
              <p>📍 <strong>Livraison :</strong> À domicile à Abidjan ou expédition intérieur de la Côte d'Ivoire</p>
              <p>🛡️ <strong>Assurance Fret :</strong> Tous nos envois sont assurés contre la perte ou casse</p>
            </div>
          </div>

          {/* Col 4: Personal Shopper & Conciergerie */}
          <div className="space-y-3">
            <h5 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Conciergerie Dubaï Sur-Mesure
            </h5>
            <p className="text-xs text-slate-400">
              Un article introuvable à Abidjan ? Envoyez-nous simplement sa photo ou son lien : notre acheteur sur place à Dubaï s'en charge.
            </p>
            <a
              href={personalShopperWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contacter le Personal Shopper</span>
            </a>
          </div>

        </div>

        {/* 3. Bottom Credits */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {settings.storeName || 'IVOIRE DJASSA'} — Service Import Dubaï VIP. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-amber-400 transition">Boutique Principale Abidjan</Link>
            <span>•</span>
            <a href="#dubai-faq" className="hover:text-amber-400 transition">FAQ Précommandes</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
