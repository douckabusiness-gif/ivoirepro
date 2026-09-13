'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const { settings, generateWhatsAppGeneralLink } = useStore();
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  if (!settings.whatsappFloatingEnabled) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateWhatsAppGeneralLink(userMsg || undefined);
    window.open(url, '_blank');
    setIsOpenChat(false);
    setUserMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Mini Chat Popup Window */}
      {isOpenChat && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-neutral-200/80 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 flex flex-col">
          
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white relative">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span className="w-3 h-3 bg-emerald-300 border-2 border-emerald-600 rounded-full absolute top-0 right-0"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{settings.storeName}</h4>
                <p className="text-[11px] text-emerald-100 font-medium">Service Client en Ligne (7j/7)</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpenChat(false)}
              className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Message Bubble */}
          <div className="p-4 bg-neutral-50 text-xs text-neutral-800 space-y-2">
            <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs border border-neutral-100 max-w-[85%]">
              <p className="font-medium">
                Bonjour ! 👋 Bienvenue sur la boutique <strong>{settings.storeName}</strong>. Comment pouvons-nous vous aider aujourd'hui ?
              </p>
              <span className="text-[10px] text-neutral-400 block text-right mt-1">À l'instant</span>
            </div>
          </div>

          {/* Quick Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-3 py-2 bg-neutral-100 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer shrink-0"
              title="Envoyer sur WhatsApp"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Main Button */}
      <button
        onClick={() => setIsOpenChat(!isOpenChat)}
        className="relative group flex items-center gap-3 p-3.5 sm:px-4 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-2xl shadow-emerald-700/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label="Discussion WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
        </span>

        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="text-xs font-black hidden sm:inline tracking-wide">
          WhatsApp Direct
        </span>
      </button>

    </div>
  );
};
