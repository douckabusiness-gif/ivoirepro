import { Product, StoreSettings, SpecializedAgent, SpecializedAgentId } from './types';

export { type SpecializedAgent, type SpecializedAgentId };

export interface OrchestrationResult {
  selectedAgent: SpecializedAgent;
  intent: string;
  confidence: number;
  routingReason: string;
  systemPrompt: string;
  orchestrationPath: string[];
}

export const DEFAULT_SPECIALIZED_AGENTS: Record<string, SpecializedAgent> = {
  sales: {
    id: 'sales',
    name: 'Amara',
    role: 'Conseillère Vente & Personal Shopper',
    avatar: '🛍️',
    color: 'from-pink-500 to-rose-600',
    badge: 'CONSEILLÈRE VENTE',
    temperature: 0.7,
    description: 'Guide les acheteurs, suggère les meilleurs articles, conseille sur les styles et tailles, et valorise le catalogue.',
    sampleTriggers: ['produit', 'choisir', 'robe', 'sneakers', 'taille', 'nouveauté', 'conseil', 'catalogue', 'collection'],
    systemPromptTemplate: `Tu es Amara, la Conseillère Vente & Personal Shopper d'élite de la boutique {storeName}.
Ton objectif est de conseiller le client avec élégance, enthousiasme et précision commerciale.
RÈGLES D'OR :
1. Réponds toujours en français chaleureux, professionnel et vendeur.
2. Tous les prix et calculs doivent être UNIQUEMENT exprimés en Franc CFA (FCFA) - JAMAIS en euros ou dollars.
3. Mets en avant les produits du catalogue fournis dans le contexte ci-dessous avec leurs prix exacts en FCFA.
4. Encourage poliment à ajouter au panier ou à passer commande.
5. Si un article demandé n'est pas en stock, propose une alternative proche du catalogue.`,
    enabled: true,
    isCustom: false
  },
  support: {
    id: 'support',
    name: 'Malik',
    role: 'Spécialiste Support, Suivi & Logistique',
    avatar: '📦',
    color: 'from-blue-500 to-cyan-600',
    badge: 'SUPPORT & SUIVI',
    temperature: 0.4,
    description: 'Gère le suivi des commandes, renseigne sur les délais de livraison à Dakar et dans les régions, et détaille les modes de paiement (Wave, Orange Money, Cash).',
    sampleTriggers: ['livraison', 'delai', 'délai', 'quand', 'suivi', 'commande', 'colis', 'transport', 'dakar', 'region', 'wave', 'orange money', 'payer', 'paiement'],
    systemPromptTemplate: `Tu es Malik, Spécialiste Support Client, Suivi de Commandes et Logistique pour la boutique {storeName}.
RÈGLES D'OR :
1. Sois rassurant, courtois, rigoureux et très précis.
2. RAPPELS LOGISTIQUES CLÉS :
   - Livraison Express à Dakar sous 24h ouvrées.
   - Livraison dans les autres régions du Sénégal sous 48h à 72h.
   - Frais de livraison standard : {shippingFee} FCFA (Gratuit dès {freeShippingThreshold} FCFA d'achat).
   - Moyens de paiement acceptés : Wave Mobile Money, Orange Money, Carte Bancaire, et Paiement Cash à la livraison.
3. Toujours mentionner les montants strictement en FCFA.
4. Si le client demande le suivi d'un colis ou d'un numéro de commande, invite-le à fournir son numéro de commande ou son numéro de téléphone.`,
    enabled: true,
    isCustom: false
  },
  copywriter: {
    id: 'copywriter',
    name: 'Aïda',
    role: 'Copywriter & Merchandiser Marketing',
    avatar: '✍️',
    color: 'from-purple-500 to-indigo-600',
    badge: 'RÉDACTION & SEO',
    temperature: 0.8,
    description: 'Rédige des descriptions d\'articles captivantes, met en valeur les détails matières et crée des fiches produits optimisées pour la conversion.',
    sampleTriggers: ['redige', 'rédige', 'description', 'fiche produit', 'slogan', 'seo', 'merchandising', 'texte de vente', 'pitch'],
    systemPromptTemplate: `Tu es Aïda, Experte Copywriter & Merchandiser E-commerce pour la boutique {storeName}.
RÈGLES D'OR :
1. Rédige des textes percutants, modernes, haut de gamme et irrésistibles qui déclenchent le coup de cœur.
2. Structure avec : Titre accrocheur, Avantages clés (bullet points), Détails & Matières, et Appel à l'action (CTA).
3. Mentionne toujours la valeur en Franc CFA (FCFA).`,
    enabled: true,
    isCustom: false
  },
  promo: {
    id: 'promo',
    name: 'Cheikh',
    role: 'Stratège Promos, Négociation & Fidélité',
    avatar: '🏷️',
    color: 'from-amber-500 to-orange-600',
    badge: 'PROMO & FIDÉLITÉ',
    temperature: 0.6,
    description: 'Propose les meilleures offres spéciales, applique des remises avantageuses sur le panier et valorise les économies réalisées.',
    sampleTriggers: ['promo', 'reduction', 'réduction', 'remise', 'code', 'coupon', 'solde', 'rabais', 'negocier', 'négocier', 'moins cher', 'dernier prix'],
    systemPromptTemplate: `Tu es Cheikh, Stratège en Offres Commerciales, Promos et Fidélisation pour la boutique {storeName}.
RÈGLES D'OR :
1. Sois chaleureux, persuasif et généreux tout en protégeant la valeur de la marque.
2. Si le client demande une remise :
   - Propose un code promotionnel temporaire de bienvenue (ex: "BIENVENUE5" pour 5% ou "VIP10" dès 30 000 FCFA).
   - Rappelle que la livraison est 100% offerte dès {freeShippingThreshold} FCFA d'achat !
   - Propose de combiner 2 articles pour économiser sur les frais d'expédition.
3. Exprime toutes les remises et calculs uniquement en FCFA.`,
    enabled: true,
    isCustom: false
  },
  satisfaction: {
    id: 'satisfaction',
    name: 'Fatou',
    role: 'Médiatrice & Satisfaction Client',
    avatar: '🛡️',
    color: 'from-emerald-500 to-teal-600',
    badge: 'MÉDIATION & RETOURS',
    temperature: 0.4,
    description: 'Désamorce les mécontentements, assiste les retours ou échanges d\'articles et garantit une expérience client 5 étoiles.',
    sampleTriggers: ['remboursement', 'rembourser', 'retour', 'retourner', 'echange', 'échanger', 'abime', 'abîmé', 'mauvaise taille', 'insatisfait', 'plainte', 'reclamation', 'réclamation', 'probleme', 'problème', 'decu', 'déçu'],
    systemPromptTemplate: `Tu es Fatou, Responsable Médiation et Satisfaction Client pour {storeName}.
RÈGLES D'OR :
1. Fais preuve d'une empathie absolue, d'écoute active et de calme rassurant.
2. Exprime des excuses sincères en cas de désagrément sans rejeter la faute sur le client.
3. Explique la procédure simple d'échange ou de retour sous 7 jours ouvrés.
4. Donne les coordonnées d'assistance directe : {contactPhone} ou WhatsApp {whatsappNumber}.`,
    enabled: true,
    isCustom: false
  }
};

export const SPECIALIZED_AGENTS = DEFAULT_SPECIALIZED_AGENTS;

function normalizeForRouting(value: string) {
  return value
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Returns the current list of specialized agents (customized from settings or fallback to defaults)
 */
export function getSpecializedAgentsList(settings?: StoreSettings | null): SpecializedAgent[] {
  if (settings?.customAgents && Array.isArray(settings.customAgents) && settings.customAgents.length > 0) {
    return settings.customAgents;
  }
  return Object.values(DEFAULT_SPECIALIZED_AGENTS);
}

/**
 * Intelligent Intent Classifier & Dispatcher with Dynamic Agent Support
 */
export function orchestrateAgentRouting(
  userPrompt: string,
  history: { sender: 'user' | 'agent'; text: string }[] = [],
  settings?: StoreSettings | null,
  products: Product[] = []
): OrchestrationResult {
  const promptLower = normalizeForRouting(userPrompt.trim());
  const allAgents = getSpecializedAgentsList(settings);
  const enabledAgents = allAgents.filter(a => a.enabled !== false);

  // If no enabled agents, fallback to default sales
  const activeAgentPool = enabledAgents.length > 0 ? enabledAgents : [DEFAULT_SPECIALIZED_AGENTS.sales];

  let selectedAgent: SpecializedAgent | null = null;
  let intent = 'conseil_general';
  let confidence = 0.85;
  let routingReason = "Routage automatique vers le conseiller disponible";

  // 1. First Pass: score every trigger instead of stopping at the first agent.
  // This prevents a generic word such as "produit" from winning over a more
  // specific request such as "promotion" or "remboursement".
  const triggerMatches = activeAgentPool.flatMap((agent, agentIndex) =>
    (Array.isArray(agent.sampleTriggers) ? agent.sampleTriggers : [])
      .map((trigger) => normalizeForRouting(String(trigger).trim()))
      .filter((trigger) => trigger.length > 1 && promptLower.includes(trigger))
      .map((trigger) => ({ agent, agentIndex, trigger }))
  );

  const bestTrigger = triggerMatches.sort((a, b) => {
    if (b.trigger.length !== a.trigger.length) return b.trigger.length - a.trigger.length;
    return a.agentIndex - b.agentIndex;
  })[0];

  if (bestTrigger) {
    selectedAgent = bestTrigger.agent;
    intent = `specialiste_${bestTrigger.agent.id}`;
    confidence = bestTrigger.trigger.length >= 8 ? 0.96 : 0.94;
    routingReason = `Déclencheur "${bestTrigger.trigger}" activé pour ${bestTrigger.agent.name} (${bestTrigger.agent.role})`;
  }

  // 2. Second Pass: Semantic Rule checks if no direct trigger matched
  if (!selectedAgent) {
    // Check Dissatisfaction / Complaints / Returns
    const isSatisfaction = [
      'remboursement', 'rembourser', 'retour', 'retourner', 'echange', 'échanger', 'abime', 'abîmé',
      'mauvaise taille', 'pas satisfait', 'insatisfait', 'plainte', 'reclamation', 'réclamation',
      'retard important', 'probleme', 'problème', 'erreur de produit', 'decu', 'déçu'
    ].some(kw => promptLower.includes(normalizeForRouting(kw)));

    // Check Promo / Discount
    const isPromo = [
      'promo', 'promotion', 'promotions', 'reduction', 'réduction', 'remise', 'code', 'coupon', 'solde', 'rabais',
      'negocier', 'négocier', 'moins cher', 'dernier prix', 'diminuer', 'offre speciale', 'gratuit'
    ].some(kw => promptLower.includes(normalizeForRouting(kw)));

    // Check Support / Logistics
    const isSupport = [
      'livraison', 'delai', 'délai', 'quand', 'suivi', 'commande', 'ou est mon', 'où est mon',
      'colis', 'transport', 'dakar', 'region', 'région', 'frais de port', 'frais de livraison',
      'wave', 'orange money', 'payer', 'paiement', 'carte', 'espece', 'espèces', 'a la livraison'
    ].some(kw => promptLower.includes(normalizeForRouting(kw)));

    // Check Copywriting
    const isCopywriting = [
      'redige', 'rédige', 'description produit', 'fiche produit', 'slogan', 'seo', 'merchandising',
      'texte de vente', 'copywriting', 'pitch'
    ].some(kw => promptLower.includes(normalizeForRouting(kw)));

    if (isSatisfaction) {
      selectedAgent = activeAgentPool.find(a => a.id === 'satisfaction') || null;
      if (selectedAgent) {
        intent = 'gestion_reclamation_et_retours';
        confidence = 0.95;
        routingReason = "Détection de réclamation, demande d'échange ou insatisfaction client";
      }
    } else if (isPromo) {
      selectedAgent = activeAgentPool.find(a => a.id === 'promo') || null;
      if (selectedAgent) {
        intent = 'negociation_et_codes_promo';
        confidence = 0.92;
        routingReason = "Demande de réduction, code promotionnel ou négociation tarifaire";
      }
    } else if (isSupport) {
      selectedAgent = activeAgentPool.find(a => a.id === 'support') || null;
      if (selectedAgent) {
        intent = 'support_logistique_et_suivi';
        confidence = 0.95;
        routingReason = "Demande relative aux délais de livraison, expédition, suivi ou moyens de paiement";
      }
    } else if (isCopywriting) {
      selectedAgent = activeAgentPool.find(a => a.id === 'copywriter') || null;
      if (selectedAgent) {
        intent = 'redaction_marketing_et_seo';
        confidence = 0.90;
        routingReason = "Demande de rédaction marketing ou création de fiche produit";
      }
    }
  }

  // 3. Fallback: Select Sales agent or first enabled agent
  if (!selectedAgent) {
    selectedAgent = activeAgentPool.find(a => a.id === 'sales') || activeAgentPool[0] || DEFAULT_SPECIALIZED_AGENTS.sales;
    intent = 'conseil_vente_et_catalogue';
    confidence = 0.88;
    routingReason = "Recherche d'articles, conseils de style ou découverte du catalogue";
  }

  // Build Store Context
  const storeName = settings?.storeName || 'Élite Boutique Sénégal';
  const shippingFee = (settings?.standardShippingFee ?? 2000).toLocaleString('fr-FR');
  const freeThreshold = (settings?.freeShippingThreshold ?? 50000).toLocaleString('fr-FR');
  const contactPhone = settings?.contactPhone || '+221 77 000 00 00';
  const whatsappNumber = settings?.whatsappNumber || '+221 77 000 00 00';

  let filledPrompt = (selectedAgent.systemPromptTemplate || DEFAULT_SPECIALIZED_AGENTS.sales.systemPromptTemplate)
    .replace(/{storeName}/g, storeName)
    .replace(/{shippingFee}/g, shippingFee)
    .replace(/{freeShippingThreshold}/g, freeThreshold)
    .replace(/{contactPhone}/g, contactPhone)
    .replace(/{whatsappNumber}/g, whatsappNumber)
    .replace(/{agentName}/g, selectedAgent.name)
    .replace(/{agentRole}/g, selectedAgent.role);

  // Append custom global admin instructions if defined
  if (settings?.aiCustomInstructions?.trim()) {
    filledPrompt += `\n\nCONSIGNES SPÉCIFIQUES SUPPLÉMENTAIRES DE LA DIRECTION :\n${settings.aiCustomInstructions.trim()}`;
  }

  return {
    selectedAgent,
    intent,
    confidence,
    routingReason,
    systemPrompt: filledPrompt,
    orchestrationPath: ['🎯 Orchestrateur Central', `${selectedAgent.avatar} ${selectedAgent.name} (${selectedAgent.role})`]
  };
}
