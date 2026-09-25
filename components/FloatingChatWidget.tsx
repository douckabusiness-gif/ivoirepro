'use client';

import React, { type ReactNode, useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  MessageSquare, 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Phone, 
  Radio,
  Volume2,
  User, 
  CheckCheck, 
  ShieldCheck,
  Zap,
  Bot
} from 'lucide-react';

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const tokens = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`)/g);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={index} className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[0.9em]">{token.slice(1, -1)}</code>;
    }
    return <React.Fragment key={index}>{token}</React.Fragment>;
  });
};

const renderMessageMarkdown = (text: string): ReactNode => {
  return text.split(/\r?\n/).map((line, index, lines) => (
    <React.Fragment key={index}>
      {renderInlineMarkdown(line)}
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
};

export const FloatingChatWidget = () => {
  const { 
    settings, 
    visitorId,
    visitorChatMessages, 
    sendVisitorChatMessage, 
    fetchVisitorChatMessages,
    unreadVisitorChatCount, 
    generateWhatsAppGeneralLink,
    isChatDrawerOpen,
    setIsChatDrawerOpen,
    currentView,
    setCurrentView,
    startWebCall,
    simulateIncomingCall
  } = useStore();

  const [activeTab, setActiveTab] = useState<'livechat' | 'call' | 'whatsapp'>('livechat');
  const [inputText, setInputText] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [showIdentityInputs, setShowIdentityInputs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [failedMessageText, setFailedMessageText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [retryAiText, setRetryAiText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const aiTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const pendingAiRepliesRef = useRef(0);
  const isMountedRef = useRef(true);

  const aiAvailable = settings.aiAgentEnabled !== false;
  const whatsappAvailable = settings.whatsappFloatingEnabled !== false;

  useEffect(() => {
    const timers = aiTimersRef.current;
    return () => {
      isMountedRef.current = false;
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (!isChatDrawerOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      previouslyFocusedRef.current?.focus();
    };
  }, [isChatDrawerOpen]);

  useEffect(() => {
    if (!whatsappAvailable && activeTab === 'whatsapp') {
      setActiveTab('livechat');
    }
  }, [activeTab, whatsappAvailable]);

  // Auto-scroll when new messages arrive or typing status changes
  useEffect(() => {
    if (isChatDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visitorChatMessages, isChatDrawerOpen, isAgentTyping]);

  // Load saved name/phone from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('boutique_visitor_name') || '';
      const savedPhone = localStorage.getItem('boutique_visitor_phone') || '';
      setVisitorName(savedName);
      setVisitorPhone(savedPhone);
      if (!savedName) {
        setShowIdentityInputs(true);
      }
    }
  }, []);

  const queueAiReply = (textToSend: string) => {
    if (!aiAvailable) return;

    pendingAiRepliesRef.current += 1;
    setIsAgentTyping(true);

    let timer: ReturnType<typeof setTimeout>;
    timer = setTimeout(async () => {
      aiTimersRef.current.delete(timer);
      try {
        const response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            text: textToSend
          })
        });

        if (!response.ok) {
          throw new Error(`Agent response failed with status ${response.status}`);
        }

        await fetchVisitorChatMessages();
        if (isMountedRef.current) {
          setAiError(null);
          setRetryAiText(null);
        }
      } catch (err) {
        console.error('AI Agent auto-reply error:', err);
        if (isMountedRef.current) {
          setAiError('La réponse automatique est momentanément indisponible.');
          setRetryAiText(textToSend);
        }
      } finally {
        pendingAiRepliesRef.current = Math.max(0, pendingAiRepliesRef.current - 1);
        if (isMountedRef.current && pendingAiRepliesRef.current === 0) {
          setIsAgentTyping(false);
        }
      }
    }, Math.max(0, settings.aiAgentAutoReplyDelay ?? 1200));

    aiTimersRef.current.add(timer);
  };

  const handleSendMessage = async (customText?: string, options?: { skipAiReply?: boolean }) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    setInputText('');
    setIsSending(true);
    setSendError(null);
    setFailedMessageText(null);
    setAiError(null);
    setRetryAiText(null);

    if (typeof window !== 'undefined') {
      if (visitorName) localStorage.setItem('boutique_visitor_name', visitorName);
      if (visitorPhone) localStorage.setItem('boutique_visitor_phone', visitorPhone);
    }

    // 1. Send visitor message
    const sent = await sendVisitorChatMessage(textToSend, visitorName || undefined, visitorPhone || undefined);
    setIsSending(false);

    if (!sent) {
      setInputText(textToSend);
      setSendError('Impossible d’envoyer votre message. Vérifiez votre connexion puis réessayez.');
      setFailedMessageText(textToSend);
      return;
    }

    // 2. Trigger Autonomous AI Agent if enabled
    if (!options?.skipAiReply) {
      queueAiReply(textToSend);
    }
  };

  const handleHumanSupportRequest = () => {
    setActiveTab('livechat');
    if (!visitorPhone) setShowIdentityInputs(true);
    const phoneDetails = visitorPhone
      ? ` Mon numéro de téléphone est ${visitorPhone}.`
      : ' Merci de me demander mon numéro de téléphone pour organiser le rappel.';
    void handleSendMessage(`Je souhaite être rappelé(e) par un conseiller humain.${phoneDetails}`, { skipAiReply: true });
  };

  const handleActionClick = (action: string, label: string) => {
    if (action === 'open_whatsapp') {
      window.open(generateWhatsAppGeneralLink(), '_blank');
    } else if (action === 'show_shop') {
      setCurrentView('shop');
      setIsChatDrawerOpen(false);
    } else if (action === 'show_flash') {
      handleSendMessage('Quelles sont les meilleures réductions et ventes flash du moment ?');
    } else if (action === 'delivery_info') {
      handleSendMessage('Quels sont vos délais et tarifs de livraison ?');
    } else if (action === 'payment_info') {
      handleSendMessage('Comment fonctionne le paiement par Wave ou Orange Money ?');
    } else {
      handleSendMessage(label);
    }
  };

  if (!aiAvailable && !whatsappAvailable) return null;

  const cleanAgentName = (settings.aiAgentName || 'Amara')
    .replace(/\s*\([^)]*IA[^)]*\)/gi, '')
    .trim() || 'Amara';
  const agentName = cleanAgentName;

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      
      {/* Live Chat & Support Window */}
      {isChatDrawerOpen && (
        <div
          ref={panelRef}
          id="floating-chat-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="floating-chat-title"
          className="mb-3.5 w-[92vw] sm:w-[410px] max-w-[420px] h-[550px] max-h-[calc(100vh-8rem)] sm:max-h-[82vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 flex flex-col font-sans transition-colors"
        >
          
          {/* Top Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-teal-600 p-4 text-white flex flex-col gap-2 shrink-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white relative shadow-inner">
                  <MessageSquare className="w-5 h-5 fill-white/20" />
                  <span className="w-3 h-3 bg-emerald-400 border-2 border-indigo-700 rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 id="floating-chat-title" className="font-black text-sm leading-tight tracking-tight">{settings.storeName}</h4>
                    <span className="text-[9px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-sm">
                      En ligne
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-100 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    <span>Conseillère shopping • Service client</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab(activeTab === 'call' ? 'livechat' : 'call')}
                  className={`px-2.5 py-1 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer ${
                    activeTab === 'call'
                      ? 'bg-white/25 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30'
                  }`}
                  title="Appels Web audio directs"
                >
                  <Phone className="w-3 h-3" />
                  <span className="hidden sm:inline text-[11px]">Appel Web</span>
                </button>

                <button
                  onClick={() => setIsChatDrawerOpen(false)}
                  ref={closeButtonRef}
                  aria-label="Fermer le chat"
                  className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Channels Switcher Tabs */}
            <div role="tablist" aria-label="Canaux de support" className="flex items-center p-1 bg-black/20 rounded-xl text-xs font-bold gap-1 mt-1">
              <button
                id="floating-chat-tab"
                role="tab"
                aria-selected={activeTab === 'livechat'}
                aria-controls="floating-chat-tabpanel"
                onClick={() => setActiveTab('livechat')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeTab === 'livechat'
                    ? 'bg-white text-indigo-900 shadow-sm font-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[11px]">Chat</span>
                {unreadVisitorChatCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                id="floating-call-tab"
                role="tab"
                aria-selected={activeTab === 'call'}
                aria-controls="floating-call-tabpanel"
                onClick={() => setActiveTab('call')}
                className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                  activeTab === 'call'
                    ? 'bg-white text-indigo-900 shadow-sm font-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">Appel Web</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </button>

              {whatsappAvailable && (
                <button
                  id="floating-whatsapp-tab"
                  role="tab"
                  aria-selected={activeTab === 'whatsapp'}
                  aria-controls="floating-whatsapp-tabpanel"
                  onClick={() => setActiveTab('whatsapp')}
                  className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    activeTab === 'whatsapp'
                      ? 'bg-emerald-500 text-white shadow-sm font-black'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span className="text-[11px]">WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: LIVE CHAT STREAM */}
          {activeTab === 'livechat' && (
            <div id="floating-chat-tabpanel" role="tabpanel" aria-labelledby="floating-chat-tab" className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
              
              {/* Optional Identification Pill */}
              {showIdentityInputs ? (
                <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 text-[11px] flex items-center gap-1">
                      <User className="w-3 h-3" /> Vos coordonnées (optionnel)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowIdentityInputs(false)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Masquer
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Votre Prénom / Nom"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
                    />
                    <input
                      type="text"
                      placeholder="N° Téléphone (WhatsApp)"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Conseillère shopping & Service client connectés</span>
                  </span>
                  <button
                    onClick={() => setShowIdentityInputs(true)}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                  >
                    {visitorName ? `👤 ${visitorName}` : '+ Coordonnées'}
                  </button>
                </div>
              )}

              {/* Message List */}
              <div aria-live="polite" aria-atomic="false" className="flex-1 p-4 overflow-y-auto space-y-3.5">
                
                {/* Welcome Auto-Message */}
                <div className="flex items-start gap-2 max-w-[88%]">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1 shadow-sm">
                    💬
                  </div>
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 space-y-1.5">
                    {aiAvailable ? (
                      <>
                        <p className="font-semibold leading-relaxed">
                          {renderMessageMarkdown(`Bonjour ! 👋 Je suis **${agentName}**, votre conseillère shopping chez **${settings.storeName}**.`)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {renderMessageMarkdown(`Je connais tous nos articles en stock, nos prix en **${settings.currency}**, nos délais de livraison et nos promotions. Comment puis-je vous aider ?`)}
                        </p>
                        <span className="text-[9px] text-slate-400 block text-right font-medium">Service Client</span>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold leading-relaxed">Bonjour ! 👋</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Notre équipe a bien reçu votre message et vous répondra dès que possible.</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Conversation History */}
                {visitorChatMessages.map((msg) => {
                  const isVisitor = msg.sender === 'visitor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${isVisitor ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isVisitor && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-1 shadow-sm">
                          {msg.senderName?.includes('🛍️') ? '🛍️' :
                           msg.senderName?.includes('📦') ? '📦' :
                           msg.senderName?.includes('✍️') ? '✍️' :
                           msg.senderName?.includes('🏷️') ? '🏷️' :
                           msg.senderName?.includes('🛡️') ? '🛡️' : '💬'}
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl max-w-[85%] text-xs shadow-xs space-y-1.5 ${
                          isVisitor
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        {!isVisitor && msg.senderName && (
                          <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
                            <span>{msg.senderName}</span>
                          </div>
                        )}
                        <p className="font-medium leading-relaxed">{renderMessageMarkdown(msg.text)}</p>
                        <div className={`flex items-center justify-end gap-1 text-[9px] ${
                          isVisitor ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {isVisitor && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Agent Typing Indicator */}
                {isAgentTyping && (
                  <div className="flex items-start gap-2 max-w-[85%] animate-in fade-in">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-1 shadow-sm">
                      💬
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl rounded-tl-xs shadow-xs border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400">{agentName} est en train d'écrire...</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions Suggestions */}
              {visitorChatMessages.length === 0 && (
                <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-1.5">
                  {[
                    { label: '🔥 Ventes Flash & Promos', action: 'show_flash' },
                    { label: '📦 Délais de livraison', action: 'delivery_info' },
                    { label: '💳 Payer par Wave / Orange Money', action: 'payment_info' },
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleActionClick(q.action, q.label)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              )}

              {(sendError || aiError) && (
                <div role="alert" className="px-3 py-2 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
                  <span>{sendError || aiError}</span>
                  {sendError && failedMessageText && (
                    <button
                      type="button"
                      onClick={() => void handleSendMessage(failedMessageText)}
                      className="shrink-0 font-black underline underline-offset-2"
                    >
                      Réessayer
                    </button>
                  )}
                  {!sendError && retryAiText && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiError(null);
                        queueAiReply(retryAiText);
                      }}
                      className="shrink-0 font-black underline underline-offset-2"
                    >
                      Réessayer la réponse
                    </button>
                  )}
                </div>
              )}

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  aria-label="Votre message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl transition cursor-pointer shrink-0 shadow-md"
                  title="Envoyer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* TAB 2: DIRECT WHATSAPP LAUNCHER */}
          {activeTab === 'whatsapp' && (
            <div id="floating-whatsapp-tabpanel" role="tabpanel" aria-labelledby="floating-whatsapp-tab" className="flex-1 p-6 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-4">
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <MessageCircle className="w-9 h-9 fill-white" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Discuter sur WhatsApp Officiel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Échangez directement avec notre équipe commerciale pour une réponse instantanée et le partage de photos.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-left space-y-1">
                  <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300">Numéro WhatsApp :</p>
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">{settings.whatsappNumber}</p>
                </div>
              </div>

              <a
                href={generateWhatsAppGeneralLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Ouvrir la Discussion WhatsApp</span>
              </a>
            </div>
          )}

          {/* TAB 3: DEDICATED WEB CALL (VoIP) CONSOLE */}
          {activeTab === 'call' && (
            <div id="floating-call-tabpanel" role="tabpanel" aria-labelledby="floating-call-tab" className="flex-1 p-5 overflow-y-auto flex flex-col justify-between bg-slate-50 dark:bg-slate-950 space-y-4">
              <div className="space-y-4">
                {/* VoIP Header Card */}
                <div className="p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl text-white border border-indigo-700/50 shadow-md space-y-2 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="font-black text-sm">Appels Web VoIP Directs</h4>
                  <p className="text-xs text-indigo-200">
                    Passez des appels audio haute définition directement depuis votre navigateur. Aucun numéro ni crédit téléphonique requis !
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sonnerie & VoIP HD • 100% Gratuit</span>
                  </div>
                </div>

                {/* Call Options */}
                <div className="space-y-2.5">
                  {/* Option 1: Shopping Advisor */}
                  {aiAvailable && <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shrink-0">
                        🎧
                      </div>
                      <div>
                        <h5 className="font-black text-xs text-slate-900 dark:text-white">{agentName}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Conseillère vocale 24h/24 & 7j/7</p>
                      </div>
                    </div>
                    <button
                      onClick={() => startWebCall('ai_advisor')}
                      className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Appeler</span>
                    </button>
                  </div>}

                  {/* Option 2: Human Support */}
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                          🎧
                        </div>
                        <div>
                          <h5 className="font-black text-xs text-slate-900 dark:text-white">Service Client Direct</h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Appel vocal en direct avec notre équipe</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const name = visitorName.trim() || 'Client Boutique';
                          const phone = visitorPhone.trim();
                          startWebCall('human_agent', name, phone ? `Tél: ${phone}` : 'Appel direct depuis la boutique');
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                        title="Appeler le service client"
                      >
                        <Phone className="w-3.5 h-3.5 animate-pulse" />
                        <span>Appeler</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                      <span className="text-slate-400">Préférer être rappelé plus tard ?</span>
                      <button
                        type="button"
                        onClick={handleHumanSupportRequest}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        Demander un rappel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ringtone Tester Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => simulateIncomingCall()}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Tester la sonnerie d'appel entrant</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Compatible avec tous les smartphones et ordinateurs, sans application à installer.</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Floating Main Button */}
      <button
        onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
        aria-expanded={isChatDrawerOpen}
        aria-controls="floating-chat-panel"
        className="relative group flex items-center gap-2 p-3 sm:px-4 sm:py-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold rounded-full shadow-2xl shadow-indigo-700/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        aria-label={isChatDrawerOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {/* Pulse Dot */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900" />
        </span>

        <MessageSquare className="w-5 h-5 fill-white/20" />
        <span className="text-xs font-black hidden sm:inline tracking-wide">
          <span>Chat</span>
        </span>
      </button>

    </div>
  );
};
