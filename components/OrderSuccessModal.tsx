'use client';

import React from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  CheckCircle2, 
  MessageCircle, 
  ExternalLink, 
  ShoppingBag, 
  ArrowRight, 
  Printer, 
  ShieldCheck, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const OrderSuccessModal = () => {
  const { 
    lastCreatedOrder, 
    settings, 
    setCurrentView, 
    generateWhatsAppOrderLink, 
    formatPrice 
  } = useStore();

  if (!lastCreatedOrder) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-slate-500">Aucune commande récente à afficher.</p>
        <button
          onClick={() => setCurrentView('shop')}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Retourner à la boutique
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const whatsappLink = generateWhatsAppOrderLink(lastCreatedOrder);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8 text-center animate-in zoom-in-95 duration-300">
        
        {/* Celebration Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            Commande Confirmée Avec Succès
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Merci pour votre confiance, {lastCreatedOrder.customerName} !
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Votre commande porte le numéro <strong className="text-slate-900">{lastCreatedOrder.orderNumber}</strong>. 
            Notre équipe prépare votre colis avec le plus grand soin.
          </p>
        </div>

        {/* Priority Action: WhatsApp notification */}
        <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 text-left space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-emerald-950">
                Transmettre & Confirmer votre commande sur WhatsApp
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Cliquez sur le bouton ci-dessous pour envoyer automatiquement le récapitulatif à notre service client sur WhatsApp pour un traitement prioritaire.
              </p>
            </div>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Envoyer la commande sur WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* If Wave / Online Payment Link chosen */}
        {lastCreatedOrder.paymentMethod === 'wave' && settings.wavePaymentUrl && (
          <div className="p-5 rounded-xl bg-sky-50 border border-sky-200 text-left flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-sky-950">Lien direct de paiement Wave</p>
              <p className="text-xs text-sky-700">Vous pouvez régler directement via l'application Wave.</p>
            </div>
            <a
              href={settings.wavePaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <span>Ouvrir Wave</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {lastCreatedOrder.paymentMethod === 'payment_link' && settings.customPaymentLinkUrl && (
          <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200 text-left flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-indigo-950">Lien de paiement sécurisé en ligne</p>
              <p className="text-xs text-indigo-700">Réglez votre facture par carte bancaire sécurisée.</p>
            </div>
            <a
              href={settings.customPaymentLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <span>Procéder au Paiement</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Invoice Summary Box */}
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Récapitulatif des Articles</span>
            <span className="text-xs font-bold text-slate-900">Total : {formatPrice(lastCreatedOrder.totalAmount)}</span>
          </div>

          <div className="space-y-3">
            {lastCreatedOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    {it.productTitle} <span className="text-slate-400 font-normal">x{it.quantity}</span>
                  </p>
                  {(it.selectedColor || it.selectedSize) && (
                    <p className="text-[11px] text-slate-500">
                      {it.selectedColor && `Coul: ${it.selectedColor}`} {it.selectedSize && `T: ${it.selectedSize}`}
                    </p>
                  )}
                </div>
                <span className="font-bold text-slate-800">{formatPrice(it.price * it.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Adresse de livraison :</span>
              <span className="font-semibold text-slate-900 text-right">{lastCreatedOrder.customerAddress}, {lastCreatedOrder.customerCity}</span>
            </div>
            <div className="flex justify-between">
              <span>Téléphone de contact :</span>
              <span className="font-semibold text-slate-900">{lastCreatedOrder.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode de règlement :</span>
              <span className="font-semibold text-slate-900 uppercase">{lastCreatedOrder.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setCurrentView('shop')}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continuer mes achats</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer la facture</span>
          </button>
        </div>

      </div>
    </div>
  );
};
