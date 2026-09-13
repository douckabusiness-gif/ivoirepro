import { Product, Category, StoreSettings, ChatMessage } from './types';
import { orchestrateAgentRouting, OrchestrationResult, SpecializedAgent } from './agentOrchestrator';

export interface AgentChatResponse {
  text: string;
  providerUsed?: string;
  suggestedProducts?: Product[];
  suggestedActions?: { label: string; action: string; payload?: string }[];
  agent?: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
    badge: string;
  };
  orchestration?: {
    intent: string;
    confidence: number;
    routingReason: string;
    path: string[];
  };
}

export interface GeneratedProductContent {
  title: string;
  shortDescription: string;
  description: string;
  suggestedPrice: number;
  tags: string[];
  specs: Record<string, string>;
}

export interface StoreInsight {
  type: 'stock_alert' | 'revenue_trend' | 'recommendation';
  title: string;
  description: string;
  actionLabel?: string;
  actionTab?: string;
}

function getSelectedAiModel(settings: StoreSettings): string | null {
  const model = settings.aiModel?.trim();
  if (!model || model.toLowerCase() === 'auto') return null;
  return model;
}

function getProviderApiKey(settings: StoreSettings, provider: string): string {
  switch (provider) {
    case 'openai': return settings.openaiApiKey?.trim() || '';
    case 'claude': return settings.claudeApiKey?.trim() || '';
    case 'groq': return settings.groqApiKey?.trim() || '';
    case 'deepseek': return settings.deepseekApiKey?.trim() || '';
    case 'glm': return settings.glmApiKey?.trim() || '';
    case 'gemini': return settings.geminiApiKey?.trim() || '';
    default: return '';
  }
}

/**
 * Autonomous Multi-LLM AI Agent Engine for E-Commerce Live Support & Automation
 * Powered by an Orchestrator with 5 Specialized Autonomous Agents:
 * - 🛍️ Amara (Conseillère Vente & Personal Shopper)
 * - 📦 Malik (Support, Suivi & Logistique)
 * - ✍️ Aïda (Copywriting & Merchandising)
 * - 🏷️ Cheikh (Stratège Promos & Fidélité)
 * - 🛡️ Fatou (Médiatrice & Retours)
 */
export async function generateAutonomousChatReply(
  visitorMessage: string,
  history: ChatMessage[],
  products: Product[],
  categories: Category[],
  settings: StoreSettings
): Promise<AgentChatResponse> {
  const cleanMsg = visitorMessage.trim().toLowerCase();
  const provider = settings.aiProvider || 'local';

  // 1. Run Master Orchestration Router
  const historyForOrch = history.map(h => ({
    sender: (h.sender === 'visitor' ? 'user' : 'agent') as 'user' | 'agent',
    text: h.text
  }));
  const orchestration = orchestrateAgentRouting(visitorMessage, historyForOrch, settings, products);
  const selectedModel = getSelectedAiModel(settings);

  if (provider === 'local') {
    const localRes = generateLocalExpertResponse(cleanMsg, products, categories, settings, orchestration);
    return enrichResponse(localRes, 'Moteur Expert Local', orchestration);
  }

  const providerKey = getProviderApiKey(settings, provider);
  if (!providerKey) {
    return enrichResponse({
      text: `Le fournisseur **${provider.toUpperCase()}** ne peut pas répondre : aucune clé API active n'est configurée. Ajoutez votre clé dans l'espace administrateur, récupérez les modèles réels, puis sélectionnez-en un.`,
      suggestedActions: [{ label: '💬 Contacter le support', action: 'open_whatsapp' }]
    }, 'Configuration IA requise', orchestration);
  }

  if (!selectedModel) {
    return enrichResponse({
      text: `Aucun modèle réel n'est sélectionné pour **${provider.toUpperCase()}**. Dans l'espace administrateur, cliquez sur « Récupérer les modèles en direct » puis choisissez un modèle retourné par votre clé API.`,
      suggestedActions: [{ label: '💬 Contacter le support', action: 'open_whatsapp' }]
    }, 'Modèle IA non sélectionné', orchestration);
  }

  // 2. Attempt routing through selected AI Provider with Orchestrator Prompt
  try {
    if (provider === 'openai' && settings.openaiApiKey) {
      const res = await callOpenAiApi(visitorMessage, history, products, categories, settings, orchestration);
      if (res) return enrichResponse(res, 'OpenAI', orchestration);
    } else if (provider === 'claude' && settings.claudeApiKey) {
      const res = await callClaudeApi(visitorMessage, history, products, categories, settings, orchestration);
      if (res) return enrichResponse(res, 'Anthropic Claude', orchestration);
    } else if (provider === 'groq' && settings.groqApiKey) {
      const res = await callGroqApi(visitorMessage, history, products, categories, settings, orchestration);
      if (res) return enrichResponse(res, 'Groq', orchestration);
    } else if (provider === 'deepseek' && settings.deepseekApiKey) {
      const res = await callDeepSeekApi(visitorMessage, history, products, categories, settings, orchestration);
      if (res) return enrichResponse(res, 'DeepSeek', orchestration);
    } else if (provider === 'glm' && settings.glmApiKey) {
      const res = await callGlmApi(visitorMessage, history, products, categories, settings, orchestration);
      if (res) return enrichResponse(res, 'Zhipu AI (GLM)', orchestration);
    } else if (provider === 'gemini' && settings.geminiApiKey) {
      const res = await callGeminiApi(visitorMessage, history, products, categories, settings, orchestration);
      if (res) return enrichResponse(res, 'Google Gemini', orchestration);
    }
  } catch (err) {
    console.warn(`[AI Engine] Provider ${provider} failed for model ${selectedModel}:`, err);
  }

  // Keep a transparent local response if a configured provider is temporarily unavailable.
  const localRes = generateLocalExpertResponse(cleanMsg, products, categories, settings, orchestration);
  return enrichResponse({
    ...localRes,
    text: `Le modèle réel **${selectedModel}** n'a pas pu répondre pour le moment. Voici une aide locale en attendant :\n\n${localRes.text}`
  }, 'Moteur Expert Local (secours)', orchestration);
}

function enrichResponse(
  res: AgentChatResponse,
  providerName: string,
  orchestration: OrchestrationResult
): AgentChatResponse {
  return {
    ...res,
    providerUsed: providerName,
    agent: {
      id: orchestration.selectedAgent.id,
      name: orchestration.selectedAgent.name,
      role: orchestration.selectedAgent.role,
      avatar: orchestration.selectedAgent.avatar,
      color: orchestration.selectedAgent.color,
      badge: orchestration.selectedAgent.badge,
    },
    orchestration: {
      intent: orchestration.intent,
      confidence: orchestration.confidence,
      routingReason: orchestration.routingReason,
      path: orchestration.orchestrationPath
    }
  };
}

/**
 * Builds the Context & System Prompt for LLMs incorporating Orchestrator instructions
 */
function buildSystemPrompt(
  products: Product[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): string {
  const catalogSummary = products.slice(0, 18).map(p => 
    `- [ID:${p.id}] "${p.title}" | Prix: ${p.price} FCFA | Stock: ${p.stockCount} ${p.stockCount <= 5 ? '(Stock Faible)' : ''} | Rayon: ${p.categoryName || 'Général'} | Résumé: ${p.shortDescription || p.description.slice(0, 80)}`
  ).join('\n');

  if (orchestration) {
    return `${orchestration.systemPrompt}

CATALOGUE DISPONIBLE DANS LA BOUTIQUE (strictement en FCFA) :
${catalogSummary}

RAPPEL IMPORTANT : Sois concis (3 à 5 phrases max), chaleureux, pertinent et mentionne les prix et remises uniquement en Franc CFA (FCFA).`;
  }

  const storeName = settings.storeName || 'ELITE BOUTIQUE';
  const agentName = settings.aiAgentName || 'Amara';
  const tone = settings.aiAgentTone || 'chaleureux';
  const customInstructions = settings.aiCustomInstructions ? `\nInstructions spécifiques de la boutique :\n${settings.aiCustomInstructions}` : '';

  return `Tu es ${agentName}, la conseillère commerciale d'élite et assistante IA de la boutique de prestige "${storeName}".
Ton rôle est de conseiller les clients avec courtoisie, élégance et persuasion commerciale en français.
Ton ton est : ${tone} (dynamique, chaleureux, expert et rassurant).

RÈGLES COMMERCIALES STRICTES :
1. DEVISE : Tous les prix sont STRICTEMENT et UNIQUEMENT en Francs CFA (FCFA). Aucun prix dans une autre devise.
2. PAIEMENTS ACCEPTÉS : Wave Mobile Money (instantané), Orange Money (code marchand) et Paiement à la Livraison en espèces.
3. LIVRAISON : Livraison express sous 24h à Dakar et sous 48h dans toutes les régions du Sénégal. Livraison GRATUITE dès ${settings.freeShippingThreshold || 50000} FCFA d'achat (tarif standard: ${settings.standardShippingFee || 2000} FCFA).
4. CATALOGUE DISPONIBLE :
${catalogSummary}

5. CONSEIL & VENTE : Sois concise (3 à 5 phrases max), donne les noms exacts des produits et leurs prix en FCFA. Si le client souhaite commander, invite-le à donner son nom, téléphone et adresse pour validation immédiate.${customInstructions}`;
}

/**
 * 1. Google Gemini API Connector
 */
async function callGeminiApi(
  userMsg: string,
  history: ChatMessage[],
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): Promise<AgentChatResponse | null> {
  const apiKey = settings.geminiApiKey;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(products, settings, orchestration);
  const modelName = getSelectedAiModel(settings);
  if (!modelName) throw new Error('Aucun modèle Gemini sélectionné');
  // Keep the API key in a request header instead of the URL so it cannot leak
  // through proxy access logs, browser history, or error diagnostics.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nHistorique récent :\n${formatRecentHistory(history)}\n\nClient : ${userMsg}` }]
      }
    ],
    generationConfig: {
      temperature: orchestration?.selectedAgent.temperature ?? settings.aiTemperature ?? 0.7,
      maxOutputTokens: 500
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
  const data = await res.json();
  const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!replyText) return null;

  const matchingProducts = searchCatalog(userMsg, products, categories).slice(0, settings.aiAgentMaxRecommendations || 3);
  return {
    text: replyText,
    suggestedProducts: matchingProducts.length > 0 ? matchingProducts : undefined
  };
}

/**
 * 2. OpenAI (ChatGPT) Connector
 */
async function callOpenAiApi(
  userMsg: string,
  history: ChatMessage[],
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): Promise<AgentChatResponse | null> {
  const apiKey = settings.openaiApiKey;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(products, settings, orchestration);
  const modelName = getSelectedAiModel(settings);
  if (!modelName) throw new Error('Aucun modèle OpenAI sélectionné');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4).map(m => ({
      role: m.sender === 'visitor' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMsg }
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: orchestration?.selectedAgent.temperature ?? settings.aiTemperature ?? 0.7,
      max_tokens: 500
    })
  });

  if (!res.ok) throw new Error(`OpenAI API error ${res.status}`);
  const data = await res.json();
  const replyText = data?.choices?.[0]?.message?.content;
  if (!replyText) return null;

  const matchingProducts = searchCatalog(userMsg, products, categories).slice(0, settings.aiAgentMaxRecommendations || 3);
  return {
    text: replyText,
    suggestedProducts: matchingProducts.length > 0 ? matchingProducts : undefined
  };
}

/**
 * 3. Anthropic Claude Connector
 */
async function callClaudeApi(
  userMsg: string,
  history: ChatMessage[],
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): Promise<AgentChatResponse | null> {
  const apiKey = settings.claudeApiKey;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(products, settings, orchestration);
  const modelName = getSelectedAiModel(settings);
  if (!modelName) throw new Error('Aucun modèle Claude sélectionné');

  const messages = [
    ...history.slice(-4).map(m => ({
      role: m.sender === 'visitor' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMsg }
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelName,
      system: systemPrompt,
      messages,
      max_tokens: 500,
      temperature: orchestration?.selectedAgent.temperature ?? settings.aiTemperature ?? 0.7
    })
  });

  if (!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  const replyText = data?.content?.[0]?.text;
  if (!replyText) return null;

  const matchingProducts = searchCatalog(userMsg, products, categories).slice(0, settings.aiAgentMaxRecommendations || 3);
  return {
    text: replyText,
    suggestedProducts: matchingProducts.length > 0 ? matchingProducts : undefined
  };
}

/**
 * 4. Groq Connector
 */
async function callGroqApi(
  userMsg: string,
  history: ChatMessage[],
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): Promise<AgentChatResponse | null> {
  const apiKey = settings.groqApiKey;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(products, settings, orchestration);
  const modelName = getSelectedAiModel(settings);
  if (!modelName) throw new Error('Aucun modèle Groq sélectionné');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4).map(m => ({
      role: m.sender === 'visitor' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMsg }
  ];

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: orchestration?.selectedAgent.temperature ?? settings.aiTemperature ?? 0.7,
      max_tokens: 500
    })
  });

  if (!res.ok) throw new Error(`Groq API error ${res.status}`);
  const data = await res.json();
  const replyText = data?.choices?.[0]?.message?.content;
  if (!replyText) return null;

  const matchingProducts = searchCatalog(userMsg, products, categories).slice(0, settings.aiAgentMaxRecommendations || 3);
  return {
    text: replyText,
    suggestedProducts: matchingProducts.length > 0 ? matchingProducts : undefined
  };
}

/**
 * 5. DeepSeek Connector
 */
async function callDeepSeekApi(
  userMsg: string,
  history: ChatMessage[],
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): Promise<AgentChatResponse | null> {
  const apiKey = settings.deepseekApiKey;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(products, settings, orchestration);
  const modelName = getSelectedAiModel(settings);
  if (!modelName) throw new Error('Aucun modèle DeepSeek sélectionné');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4).map(m => ({
      role: m.sender === 'visitor' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMsg }
  ];

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: orchestration?.selectedAgent.temperature ?? settings.aiTemperature ?? 0.7,
      max_tokens: 500
    })
  });

  if (!res.ok) throw new Error(`DeepSeek API error ${res.status}`);
  const data = await res.json();
  const replyText = data?.choices?.[0]?.message?.content;
  if (!replyText) return null;

  const matchingProducts = searchCatalog(userMsg, products, categories).slice(0, settings.aiAgentMaxRecommendations || 3);
  return {
    text: replyText,
    suggestedProducts: matchingProducts.length > 0 ? matchingProducts : undefined
  };
}

/**
 * 6. GLM / Zhipu AI Connector
 */
async function callGlmApi(
  userMsg: string,
  history: ChatMessage[],
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): Promise<AgentChatResponse | null> {
  const apiKey = settings.glmApiKey;
  if (!apiKey) return null;

  const systemPrompt = buildSystemPrompt(products, settings, orchestration);
  const modelName = getSelectedAiModel(settings);
  if (!modelName) throw new Error('Aucun modèle GLM sélectionné');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4).map(m => ({
      role: m.sender === 'visitor' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMsg }
  ];

  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: orchestration?.selectedAgent.temperature ?? settings.aiTemperature ?? 0.7,
      max_tokens: 500
    })
  });

  if (!res.ok) throw new Error(`GLM API error ${res.status}`);
  const data = await res.json();
  const replyText = data?.choices?.[0]?.message?.content;
  if (!replyText) return null;

  const matchingProducts = searchCatalog(userMsg, products, categories).slice(0, settings.aiAgentMaxRecommendations || 3);
  return {
    text: replyText,
    suggestedProducts: matchingProducts.length > 0 ? matchingProducts : undefined
  };
}

/**
 * Helper to format recent conversation history
 */
function formatRecentHistory(history: ChatMessage[]): string {
  if (!history || history.length === 0) return '(Début de la conversation)';
  return history.slice(-4).map(m => `${m.sender === 'visitor' ? 'Client' : 'Conseillère'}: ${m.text}`).join('\n');
}

/**
 * Local Expert Reasoning & RAG Engine for E-Commerce
 */
function generateLocalExpertResponse(
  query: string,
  products: Product[],
  categories: Category[],
  settings: StoreSettings,
  orchestration?: OrchestrationResult
): AgentChatResponse {
  const agentName = orchestration?.selectedAgent.name || settings.aiAgentName || 'Amara';
  const agentId = orchestration?.selectedAgent.id;
  const storeName = settings.storeName || 'notre boutique';
  const currency = 'FCFA';

  // --- INTENT 1: SALUTATIONS & ACCUEIL ---
  if (
    query.match(/^(bonjour|bonsoir|salut|hello|hi|coucou|salam|hey)/i) &&
    query.length < 25
  ) {
    return {
      text: `Bonjour et bienvenue chez **${storeName}** ! 👋 Je suis **${agentName}**, votre conseillère shopping en direct.\n\nJe suis là pour vous faire découvrir nos collections exclusives, vérifier nos stocks en temps réel et vous guider dans vos commandes.\n\nQue recherchez-vous aujourd'hui ?`,
      suggestedActions: [
        { label: '🔥 Ventes Flash & Promos', action: 'show_flash' },
        { label: '📦 Délais de livraison', action: 'delivery_info' },
        { label: '💳 Modes de paiement', action: 'payment_info' }
      ]
    };
  }

  // Keep the local fallback aligned with the selected specialist when no
  // external provider key is configured.
  if (agentId === 'satisfaction' && /retour|rembours|echange|échang|plainte|probl[eè]me|insatisfait/i.test(query)) {
    return {
      text: `Je suis **${agentName}**, votre interlocutrice pour les retours et la satisfaction client. Nous pouvons organiser un échange ou un remboursement sous 14 jours après réception, à condition que l'article soit neuf, non utilisé et dans son emballage d'origine. Envoyez-moi votre numéro de commande et la raison de votre demande afin que je vous accompagne immédiatement.`,
      suggestedActions: [
        { label: '💬 Parler au support sur WhatsApp', action: 'open_whatsapp' },
        { label: '📦 Voir mes commandes', action: 'show_shop' }
      ]
    };
  }

  if (agentId === 'copywriter' && /r[eé]dig|description|fiche produit|slogan|seo|texte|pitch/i.test(query)) {
    const product = searchCatalog(query, products, categories)[0] || products[0];
    const productName = product?.title || 'votre produit';
    const price = product ? ` Prix indicatif : ${product.price.toLocaleString('fr-FR')} ${currency}.` : '';
    return {
      text: `Voici une proposition signée **${agentName}** pour **${productName}** :\n\n**L'élégance et la performance réunies dans un article pensé pour votre quotidien.** Profitez d'une finition soignée, d'un style affirmé et d'une qualité sélectionnée par notre boutique.${price}\n\n✨ **Pourquoi il plaît :** design premium, usage confortable et disponibilité en stock limité.\n\n**Commandez maintenant** et bénéficiez de notre accompagnement client personnalisé.`,
      suggestedProducts: product ? [product] : undefined,
      suggestedActions: [
        { label: '🛍️ Voir le catalogue', action: 'show_shop' },
        { label: '💬 Commander via WhatsApp', action: 'open_whatsapp' }
      ]
    };
  }

  // --- INTENT 2: PAIEMENTS (Wave, Orange Money, CB, Livraison) ---
  if (
    query.includes('paiement') ||
    query.includes('payer') ||
    query.includes('wave') ||
    query.includes('orange money') ||
    query.includes('carte') ||
    query.includes('espece') ||
    query.includes('livraison pay')
  ) {
    let paymentText = `Chez **${storeName}**, nous acceptons les modes de paiement les plus simples et sécurisés :\n\n`;
    if (settings.enableWavePayment) {
      paymentText += `🌊 **Wave Mobile Money** : Paiement instantané sans frais.\n`;
    }
    if (settings.enableOrangeMoney) {
      paymentText += `🍊 **Orange Money** : Transfert direct via code marchand.\n`;
    }
    if (settings.enableCashOnDelivery) {
      paymentText += `💵 **Paiement à la livraison** : Vous ne réglez qu'à la réception de votre colis en mains propres.\n`;
    }
    if (settings.enableCustomPaymentLink) {
      paymentText += `💳 **Carte Bancaire (Visa / Mastercard)** : Paiement en ligne 100% sécurisé.\n`;
    }
    paymentText += `\nSouhaitez-vous de l'aide pour finaliser un achat ?`;

    return {
      text: paymentText,
      suggestedActions: [
        { label: '🛍️ Voir le catalogue', action: 'show_shop' },
        { label: '💬 Parler à un humain sur WhatsApp', action: 'open_whatsapp' }
      ]
    };
  }

  // --- INTENT 3: DÉLAIS ET FRAIS DE LIVRAISON ---
  if (
    query.includes('livraison') ||
    query.includes('livrer') ||
    query.includes('frais') ||
    query.includes('delai') ||
    query.includes('délai') ||
    query.includes('dakar') ||
    query.includes('senegal') ||
    query.includes('combien de temps')
  ) {
    const freeThreshold = settings.freeShippingThreshold || 50000;
    const shippingFee = settings.standardShippingFee || 2000;

    return {
      text: `🚚 **Informations de Livraison chez ${storeName}** :\n\n- 📍 **Dakar & Banlieue** : Livraison express sous **24h** directement à votre domicile ou bureau.\n- 📦 **Régions du Sénégal** : Expédition sécurisée sous **48h à 72h**.\n- 💰 **Tarif standard** : ${shippingFee.toLocaleString('fr-FR')} ${currency}.\n- 🎉 **LIVRAISON OFFERTE** pour toute commande à partir de **${freeThreshold.toLocaleString('fr-FR')} ${currency}** !\n\nAvez-vous un article en vue ?`,
      suggestedActions: [
        { label: '⚡ Voir les articles en stock', action: 'show_stock' },
        { label: '💬 Commander sur WhatsApp', action: 'open_whatsapp' }
      ]
    };
  }

  // --- INTENT 4: PROMOTIONS & VENTES FLASH ---
  if (
    query.includes('promo') ||
    query.includes('promotion') ||
    query.includes('promotions') ||
    query.includes('solde') ||
    query.includes('reduction') ||
    query.includes('réduction') ||
    query.includes('remise') ||
    query.includes('flash') ||
    query.includes('rabais')
  ) {
    const flashProducts = products.filter(p => p.isFlashSale || (p.originalPrice && p.originalPrice > p.price)).slice(0, 3);
    return {
      text: `🔥 **Ventes Flash & Promotions du Moment !**\n\nNous proposons actuellement des remises exceptionnelles sur une sélection d'articles limités. Voici nos meilleures offres disponibles en direct :`,
      suggestedProducts: flashProducts.length > 0 ? flashProducts : products.slice(0, 3),
      suggestedActions: [
        { label: '🛒 Accéder à toutes les promotions', action: 'show_flash' }
      ]
    };
  }

  // --- INTENT 5: RECHERCHE PRODUITS PAR MOTS-CLÉS / PRIX / RAYON ---
  const matchingProducts = searchCatalog(query, products, categories);

  if (matchingProducts.length > 0) {
    const topMatches = matchingProducts.slice(0, settings.aiAgentMaxRecommendations || 3);
    const namesList = topMatches.map(p => `• **${p.title}** (${p.price.toLocaleString('fr-FR')} ${currency})`).join('\n');

    return {
      text: `J'ai trouvé exactement ce que vous cherchez dans notre catalogue ! ✨\n\n${namesList}\n\nTous ces articles sont disponibles en stock immédiat. Cliquez sur une carte ci-dessous pour voir les photos et commander :`,
      suggestedProducts: topMatches,
      suggestedActions: [
        { label: '🛒 Tout voir dans la boutique', action: 'show_shop' },
        { label: '💬 Commander via WhatsApp', action: 'open_whatsapp' }
      ]
    };
  }

  // --- INTENT 6: PRISE DE COMMANDE CONVERSATIONNELLE ---
  if (
    query.includes('commander') ||
    query.includes('acheter') ||
    query.includes('prendre') ||
    query.includes('reserver') ||
    query.includes('commander maintenant')
  ) {
    return {
      text: `Avec plaisir ! Pour enregistrer votre commande immédiatement avec livraison express, indiquez-moi simplement :\n\n1️⃣ **L'article ou le modèle souhaité**\n2️⃣ **Votre Prénom et Nom**\n3️⃣ **Votre numéro de téléphone (WhatsApp)**\n4️⃣ **Votre adresse exacte de livraison (Ville / Quartier)**\n\nJe valide votre commande dès réception de vos détails ! 🛍️`,
      suggestedActions: [
        { label: '💬 Finaliser sur WhatsApp Direct', action: 'open_whatsapp' }
      ]
    };
  }

  // --- INTENT 7: RÉPONSE GÉNÉRALE PAR DÉFAUT (ASSISTANTE BIENVEILLANTE) ---
  const popularProducts = products.filter(p => p.featured || p.rating >= 4.8).slice(0, 3);

  return {
    text: `Je suis à votre entière disposition ! 😊\n\nVous pouvez me demander nos prix en **${currency}**, nos disponibilités en stock, nos délais de livraison ou encore des conseils sur nos articles tendance.\n\nVoici quelques-unes de nos pièces les plus appréciées en ce moment :`,
    suggestedProducts: popularProducts.length > 0 ? popularProducts : products.slice(0, 3),
    suggestedActions: [
      { label: '📦 Délais de livraison', action: 'delivery_info' },
      { label: '💳 Modes de paiement Wave & OM', action: 'payment_info' },
      { label: '💬 Équipe WhatsApp', action: 'open_whatsapp' }
    ]
  };
}

/**
 * Search catalog by keywords, categories, and price
 */
function searchCatalog(query: string, products: Product[], categories: Category[]): Product[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];

  const priceMatch = query.match(/(?:moins de|sous|inf[eé]rieur [aà]|max|budget)\s*(\d+)/i);
  const maxBudget = priceMatch ? parseInt(priceMatch[1], 10) : null;

  return products.filter(p => {
    const titleMatch = words.some(w => p.title.toLowerCase().includes(w));
    const catMatch = words.some(w => p.categoryName?.toLowerCase().includes(w) || p.subcategoryName?.toLowerCase().includes(w));
    const descMatch = words.some(w => p.description.toLowerCase().includes(w) || p.shortDescription?.toLowerCase().includes(w));
    const tagMatch = p.tags?.some(t => words.some(w => t.toLowerCase().includes(w)));

    const matchesKeyword = titleMatch || catMatch || descMatch || tagMatch;
    const matchesBudget = maxBudget !== null ? p.price <= maxBudget : true;

    return matchesKeyword && matchesBudget;
  });
}

/**
 * Autonomous AI Product Content Generator (For Admin Back-Office)
 */
export async function generateProductAiListing(
  promptOrKeyword: string,
  categoryId: string,
  categoryName: string,
  settings: StoreSettings
): Promise<GeneratedProductContent> {
  const keyword = promptOrKeyword.trim();

  // Smart localized copywriting engine
  const title = keyword.length > 5 && keyword.length < 50
    ? `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Édition Prestige`
    : `Article Exclusif ${keyword}`;

  const shortDescription = `Produit d'exception alliant élégance, durabilité et finition haut de gamme. Disponible en stock limité avec livraison rapide.`;

  const description = `Découvrez l'excellence avec notre **${title}** spécialement sélectionné pour répondre aux plus hautes exigences de style et de performance.\n\n` +
    `✨ **Points Forts :**\n` +
    `- **Qualité Supérieure** : Matériaux nobles et conception soignée pour une durabilité maximale.\n` +
    `- **Design Élégant & Intemporel** : S'adapte parfaitement à votre quotidien et vos grandes occasions.\n` +
    `- **Garantie & Authenticité** : Produit 100% conforme, vérifié avant chaque expédition.\n\n` +
    `🚚 **Livraison Express 24h** partout à Dakar et sous 48h dans les régions du Sénégal.\n` +
    `💳 **Paiement sécurisé** : Wave, Orange Money ou à la livraison.`;

  const suggestedPrice = Math.round((15000 + Math.random() * 35000) / 500) * 500;

  return {
    title,
    shortDescription,
    description,
    suggestedPrice,
    tags: [categoryName.toLowerCase(), 'tendance', 'luxe', 'nouveauté', 'exclusif'],
    specs: {
      'Origine': 'Import Certifié Premium',
      'Garantie': '12 Mois',
      'Disponibilité': 'En stock immédiat'
    }
  };
}
