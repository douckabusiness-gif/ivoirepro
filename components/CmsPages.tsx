'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  ChevronDown, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Send,
  HelpCircle,
  FileText,
  Info,
  Lock,
  Printer,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const CmsPages = () => {
  const { currentView, settings, generateWhatsAppGeneralLink, setCurrentView } = useStore();
  const [openFaqId, setOpenFaqId] = useState<string | null>(settings.faqList[0]?.id || null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSent, setIsSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Bonjour ${settings.storeName} !\n\nMessage de contact de : *${contactForm.name}*\n📧 Email : ${contactForm.email}\n📞 Tél : ${contactForm.phone}\n\n📝 Message :\n${contactForm.message}`;
    const url = generateWhatsAppGeneralLink(msg);
    window.open(url, '_blank');
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3000);
  };

  if (currentView === 'about') {
    return (
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Notre Histoire & Valeurs</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">À Propos de {settings.storeName}</h1>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
            <p className="whitespace-pre-line text-base text-slate-700 font-medium">
              {settings.aboutUsText}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1">
              <p className="text-2xl font-black text-indigo-600">100%</p>
              <p className="text-xs font-bold text-slate-800">Articles Originaux & Garantis</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1">
              <p className="text-2xl font-black text-emerald-600">24h - 48h</p>
              <p className="text-xs font-bold text-slate-800">Livraison Rapide Sécurisée</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center space-y-1">
              <p className="text-2xl font-black text-sky-600">7j / 7</p>
              <p className="text-xs font-bold text-slate-800">Support Client WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'faq') {
    return (
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Centre d'aide</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Questions Fréquemment Posées (FAQ)</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Retrouvez toutes les réponses concernant nos commandes, paiements, livraisons et garanties.
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {settings.faqList.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 bg-slate-50/60 hover:bg-slate-100/60 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 py-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Direct Help Callout */}
          <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-sm text-emerald-950">Vous n'avez pas trouvé votre réponse ?</h3>
              <p className="text-xs text-emerald-800">Posez directement votre question à notre équipe par WhatsApp.</p>
            </div>
            <a
              href={generateWhatsAppGeneralLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shrink-0 transition"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Contacter sur WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'contact') {
    return (
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left: Contact Info */}
          <div className="md:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Support & Renseignements</span>
              <h2 className="text-2xl font-black">Contactez Notre Équipe</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Notre service client est à votre entière disposition pour vous accompagner dans vos commandes et répondre à vos questions.
              </p>

              <div className="space-y-4 pt-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400">Téléphone / WhatsApp</p>
                    <p className="font-bold text-white text-sm">{settings.whatsappNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400">Email Officiel</p>
                    <p className="font-bold text-white text-sm">{settings.contactEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400">Siège / Adresse</p>
                    <p className="font-bold text-white text-sm">{settings.contactAddress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400">Horaires d'Ouverture</p>
                    <p className="font-bold text-white text-sm">Lundi - Dimanche : 8h00 - 21h00</p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={generateWhatsAppGeneralLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ouvrir une discussion WhatsApp</span>
            </a>
          </div>

          {/* Right: Message Form */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Envoyez-nous un Message Direct</h2>
              <p className="text-xs text-slate-500">Remplissez ce formulaire pour nous transmettre votre demande.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Votre Nom *</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Ex: Amadou Fall"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Numéro de Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+221 77..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Votre Message / Question *</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Expliquez-nous votre demande en détail..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer le Message</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  if (currentView === 'delivery') {
    return (
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Informations Logistiques</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Livraison & Politique de Retours</h1>
            </div>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">Modalités d'Expédition & Délais</h3>
              <p className="whitespace-pre-line">{settings.deliveryPolicyText}</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">Garantie & Politique de Retours (14 Jours)</h3>
              <p className="whitespace-pre-line">{settings.returnPolicyText}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'terms') {
    return (
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentView('shop')}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la boutique</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            title="Imprimer ou enregistrer en PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Document Contractuel
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    • Conforme Droit Commercial OHADA & Sénégal
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Conditions Générales d'Utilisation & de Vente
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
              <p>Mise à jour officielle</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">Mars 2026</p>
            </div>
          </div>

          {/* Quick Summary Pill Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Paiement Sécurisé</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Wave, Orange Money & Espèces</p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
              <Truck className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Livraison Express</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Dakar 24h & Toutes Régions</p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Garantie & Retours</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">14 jours pour échanger</p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/40 p-5 sm:p-7 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="whitespace-pre-line font-normal">{settings.termsText}</p>
          </div>

          {/* Related Legal Links */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Des questions sur nos conditions ? Contactez notre support au{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{settings.whatsappNumber}</span>
            </p>

            <button
              onClick={() => setCurrentView('privacy')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Consulter la Politique de Confidentialité</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'privacy') {
    return (
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => setCurrentView('shop')}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la boutique</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            title="Imprimer ou enregistrer en PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Vie Privée & Données Personnelles
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    • Conforme Loi n° 2008-12 (CDP Sénégal)
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Politique de Confidentialité
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
              <p>Mise à jour officielle</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">Mars 2026</p>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Données Non Cédées</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Zéro revente à des tiers</p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
              <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Chiffrement SSL/TLS</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Transactions 100% sécurisées</p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Droit de Rectification</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Suppression sur simple demande</p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/40 p-5 sm:p-7 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="whitespace-pre-line font-normal">{settings.privacyText}</p>
          </div>

          {/* Related Legal Links */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pour exercer vos droits ou modifier vos données, contactez notre DPO :{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{settings.contactEmail}</span>
            </p>

            <button
              onClick={() => setCurrentView('terms')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Consulter les Conditions Générales (CGV)</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
