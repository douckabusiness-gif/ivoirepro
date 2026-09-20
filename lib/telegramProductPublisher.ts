import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import type { StoreSettings } from './types';
import { escapeTelegramHtml } from './telegram';

export interface TelegramPhotoProcessResult {
  success: boolean;
  productId?: string;
  productSlug?: string;
  productTitle?: string;
  categoryName?: string;
  price?: number;
  currency?: string;
  error?: string;
}

/**
 * Robust Price Extractor from Telegram Caption
 */
export function extractPriceFromText(text: string): number | null {
  if (!text) return null;
  const clean = text.toLowerCase();

  // 1. Pattern: "45k" ou "45.5 k"
  const kMatch = clean.match(/(\d+(?:[\.,]\d+)?)\s*k\b/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) return Math.round(num * 1000);
  }

  // 2. Pattern: "prix : 45 000" ou "45 000 FCFA" ou "45000f" ou "45.000"
  const priceMatches = clean.match(/(?:prix\s*[:=]?\s*)?(\d{1,3}(?:[\s\.]\d{3})+|\d{4,8})\s*(?:fcfa|f cfa|cfa|f\b|frs)?/i);
  if (priceMatches && priceMatches[1]) {
    const rawDigits = priceMatches[1].replace(/[\s\.]/g, '');
    const val = parseInt(rawDigits, 10);
    if (!isNaN(val) && val >= 500 && val <= 50000000) {
      return val;
    }
  }

  // 3. Pattern: chiffre après "prix"
  const directMatch = clean.match(/prix\s*[:=]?\s*(\d+)/i);
  if (directMatch && directMatch[1]) {
    const val = parseInt(directMatch[1], 10);
    if (!isNaN(val) && val > 0) return val;
  }

  return null;
}

/**
 * Nettoie les titres de produits pour retirer d'éventuels prix ou tirets collés
 */
export function sanitizeProductTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/[\s–\-—:]+\d[\d\s\.,]*(?:fcfa|cfa|f\b|frs)?\s*$/i, '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();
}

/**
 * Nettoie les descriptions pour convertir/supprimer les balises HTML et garantir un rendu pro
 */
export function sanitizeProductDescription(desc: string): string {
  if (!desc) return '';
  return desc
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => `\n• ${content.trim()}`)
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Télécharger une photo depuis les serveurs Telegram
 */
async function downloadTelegramPhoto(fileId: string, botToken: string): Promise<{ buffer: Buffer; filePath: string }> {
  const getFileUrl = `https://api.telegram.org/bot${encodeURIComponent(botToken)}/getFile?file_id=${encodeURIComponent(fileId)}`;
  const res = await fetch(getFileUrl);
  const data = await res.json().catch(() => null);
  
  if (!res.ok || !data?.ok || !data.result?.file_path) {
    throw new Error(`Telegram getFile échoué: ${data?.description || res.status}`);
  }

  const filePath = data.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${encodeURIComponent(botToken)}/${filePath}`;
  const imgRes = await fetch(downloadUrl);
  if (!imgRes.ok) {
    throw new Error(`Téléchargement de l'image Telegram échoué HTTP ${imgRes.status}`);
  }

  const arrayBuffer = await imgRes.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), filePath };
}

/**
 * Enregistrer l'image sur le serveur web
 */
function saveImageLocally(buffer: Buffer, originalFilePath: string): { filename: string; relativeUrl: string } {
  const ext = (path.extname(originalFilePath) || '.jpg').toLowerCase();
  const filename = `tg-prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}${ext}`;

  // Déterminer le dossier d'upload
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch {}

  const fullPath = path.join(uploadDir, filename);
  fs.writeFileSync(fullPath, buffer);

  return {
    filename,
    relativeUrl: `/api/uploads/${filename}`,
  };
}

/**
 * Générer un slug produit unique
 */
function generateProductSlug(title: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
  return `${base || 'produit'}-${Date.now().toString(36)}`;
}

/**
 * Analyse Multimodale avec Vision IA (Gemini ou OpenAI ou Heuristique)
 */
async function analyzeProductWithAi(
  imageBuffer: Buffer,
  caption: string,
  settings: StoreSettings
): Promise<{
  title: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  price: number;
  originalPrice: number;
  shortDescription: string;
  description: string;
  tags: string[];
  badgeText: string;
  isDubaiPreorder: boolean;
  specs: Record<string, string>;
}> {
  // 1. Récupérer toutes les catégories actuelles
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
    orderBy: { createdAt: 'asc' },
  });

  const categoriesContext = categories.map(c => ({
    id: c.id,
    name: c.name,
    subcategories: c.subcategories.map(s => ({ id: s.id, name: s.name })),
  }));

  const userExplicitPrice = extractPriceFromText(caption);

  const base64Data = imageBuffer.toString('base64');
  const mimeType = 'image/jpeg';

  const geminiKey = settings.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim() || '';
  const openaiKey = settings.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim() || '';
  const groqKey = settings.groqApiKey?.trim() || process.env.GROQ_API_KEY?.trim() || '';

  const prompt = `Tu es l'agent IA expert e-commerce d'Ivoire Djassa à Abidjan (Côte d'Ivoire).
Analyse les informations de ce produit transmises par le commerçant sur Telegram.
IMPORTANT : Ce produit est STRICTEMENT destiné à la boutique en ligne principale ivoireci.com (Abidjan). Il ne doit JAMAIS être publié dans l'espace Dubaï.

LÉGENDE FOURNIE PAR LE MARCHAND : "${caption || '(Aucune légende, photo seule)'}"
PRIX DÉTECTÉ DANS LA LÉGENDE : ${userExplicitPrice ? `${userExplicitPrice} FCFA` : 'Non précisé (à estimer judicieusement)'}

CATÉGORIES DISPONIBLES DANS LA BOUTIQUE :
${JSON.stringify(categoriesContext, null, 2)}

INSTRUCTIONS :
1. "title" : Rédige un titre commercial accrocheur et précis (ex : "Sneakers Nike Air Jordan 4 Retro - Noir", "Machine à Pain RAF Automatique 12 Programmes", "Souffleur de Feuilles Électrique 1800W"). NE METS JAMAIS le prix, ni la mention FCFA, ni de tiret avec le prix dans le titre ! Le titre doit être uniquement le nom commercial du produit.
2. "categoryId" & "categoryName" : Choisis impérativement l'ID d'une catégorie EXISTANTE dans la liste ci-dessus.
3. "subcategoryId" & "subcategoryName" : Choisis une sous-catégorie existante de cette catégorie si applicable, ou null.
4. "price" : Si un prix est détecté (${userExplicitPrice || 'aucun'}), utilise STRICTEMENT ${userExplicitPrice || 'une estimation réaliste en FCFA (multiple de 500)'}.
5. "originalPrice" : Prix barré suggéré (environ 15% à 25% plus cher que price pour effet promo).
6. "shortDescription" : Résumé percutant en 1 ou 2 phrases pour mobile.
7. "description" : Présentation complète, moderne et très professionnelle. Rédige avec des sections claires et des puces d'emojis propres (✨ Points Forts, ⚙️ Caractéristiques Clés, 🚚 Livraison Express Abidjan 24h, 💳 Paiement Sécurisé Wave / OM / MTN). IMPORTANT : N'utilise AUCUNE balise HTML brute (PAS de <ul>, PAS de <li>, PAS de <strong>, PAS de <p>). Utilise uniquement des puces propres avec des tirets (•).
8. "tags" : 5 à 7 mots-clés pertinents (ex: ["mode", "chaussures", "abidjan", "promo"]).
9. "badgeText" : "Nouveau", "Tendance", ou "Vente Flash".
10. "isDubaiPreorder" : false (Toujours false, publication exclusive sur ivoireci.com).
11. "specs" : Objet clé/valeur des caractéristiques visibles (Matière, Couleur, Modèle, Garantie).

RÉPONDS STRICTEMENT AU FORMAT JSON UNIQUE SANS BALISE MARKDOWN NI TEXTE AUTOUR :
{
  "title": "...",
  "categoryId": "...",
  "categoryName": "...",
  "subcategoryId": null,
  "subcategoryName": null,
  "price": 0,
  "originalPrice": 0,
  "shortDescription": "...",
  "description": "...",
  "tags": [],
  "badgeText": "...",
  "isDubaiPreorder": false,
  "specs": {}
}`;

  // Tenter Gemini Vision en priorité
  if (geminiKey) {
    try {
      const model = settings.aiModel && !settings.aiModel.includes('auto') 
        ? settings.aiModel 
        : 'gemini-2.0-flash';
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.title && parsed.categoryId) {
          if (userExplicitPrice) parsed.price = userExplicitPrice;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Erreur Gemini Vision pour produit Telegram:', err);
    }
  }

  // Tenter OpenAI Vision (GPT-4o / GPT-4o-mini)
  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64Data}` }
                }
              ]
            }
          ],
          temperature: 0.4,
          max_tokens: 1000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim() || '';
        const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.title && parsed.categoryId) {
          if (userExplicitPrice) parsed.price = userExplicitPrice;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Erreur OpenAI Vision pour produit Telegram:', err);
    }
  }

  // Tenter Groq (openai/gpt-oss-120b) pour analyse experte du produit et des catégories
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'user',
              content: prompt,
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim() || '';
        const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.title && parsed.categoryId) {
          if (userExplicitPrice) parsed.price = userExplicitPrice;
          parsed.isDubaiPreorder = false;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Erreur Groq Text pour produit Telegram:', err);
    }
  }

  // Fallback Heuristique intelligent si pas d'API IA ou indisponible
  let matchedCat = categories[0];
  let matchedSub: any = null;
  const lowerCaption = caption.toLowerCase();

  // 1. Électroménager & Climatisation
  if (/pain|machine\s*a\s*pain|four|micro-onde|friteuse|air\s*fryer|blender|mixeur|robot|cuiseur|gaziniere|plaque|refrigerateur|frigo|congelateur|climatiseur|clim|ventilateur|lave-linge|machine\s*a\s*laver|fer\s*a\s*repasser|bouilloire|electromenager|aspirateur|cuisine/i.test(lowerCaption)) {
    const aCat = categories.find(c => c.id === 'cat-appliances');
    if (aCat) {
      matchedCat = aCat;
      if (/air\s*fryer|friteuse|blender|mixeur|robot|pain|cuiseur/i.test(lowerCaption)) {
        matchedSub = aCat.subcategories.find(s => s.id === 'sub-app-robots') || null;
      } else if (/four|gaziniere|plaque|cuisiniere/i.test(lowerCaption)) {
        matchedSub = aCat.subcategories.find(s => s.id === 'sub-app-cuisiniere') || null;
      } else if (/clim|ventilateur/i.test(lowerCaption)) {
        matchedSub = aCat.subcategories.find(s => s.id === 'sub-app-clim') || null;
      } else if (/frigo|refrigerateur|congelateur/i.test(lowerCaption)) {
        matchedSub = aCat.subcategories.find(s => s.id === 'sub-app-frigo') || null;
      } else if (/lave-linge|machine\s*a\s*laver|seche-linge/i.test(lowerCaption)) {
        matchedSub = aCat.subcategories.find(s => s.id === 'sub-app-lave-linge') || null;
      } else if (/fer|bouilloire/i.test(lowerCaption)) {
        matchedSub = aCat.subcategories.find(s => s.id === 'sub-app-fers') || null;
      }
    }
  }
  // 2. Téléphones & Tablettes
  else if (/phone|iphone|samsung|galaxy|pixel|redmi|xiaomi|tecno|infinix|portable|smartphone|tablette|ipad|airpods|ecouteurs|montre\s*connectee|apple\s*watch/i.test(lowerCaption)) {
    const pCat = categories.find(c => c.id === 'cat-phones');
    if (pCat) {
      matchedCat = pCat;
      if (/iphone|apple|ipad|airpods/i.test(lowerCaption)) {
        matchedSub = pCat.subcategories.find(s => s.id === 'sub-phone-apple') || null;
      } else if (/samsung|xiaomi|redmi|tecno|infinix|android/i.test(lowerCaption)) {
        matchedSub = pCat.subcategories.find(s => s.id === 'sub-phone-android') || null;
      } else if (/tablette|ipad/i.test(lowerCaption)) {
        matchedSub = pCat.subcategories.find(s => s.id === 'sub-phone-tablettes') || null;
      } else if (/ecouteurs|airpods|casque/i.test(lowerCaption)) {
        matchedSub = pCat.subcategories.find(s => s.id === 'sub-phone-ecouteurs') || null;
      }
    }
  }
  // 3. Électronique & Son
  else if (/tv|television|smart\s*tv|ecran\s*4k|home\s*cinema|baffle|enceinte|karaoke|sono|drone|camera|gopro|playstation|ps5|ps4|xbox|console/i.test(lowerCaption)) {
    const eCat = categories.find(c => c.id === 'cat-electronics');
    if (eCat) {
      matchedCat = eCat;
      if (/tv|television|smart\s*tv/i.test(lowerCaption)) {
        matchedSub = eCat.subcategories.find(s => s.id === 'sub-elec-tv') || null;
      } else if (/baffle|enceinte|sono/i.test(lowerCaption)) {
        matchedSub = eCat.subcategories.find(s => s.id === 'sub-elec-speakers') || null;
      } else if (/home\s*cinema|barre\s*de\s*son/i.test(lowerCaption)) {
        matchedSub = eCat.subcategories.find(s => s.id === 'sub-elec-soundbars') || null;
      } else if (/playstation|ps5|ps4|xbox|console/i.test(lowerCaption)) {
        matchedSub = eCat.subcategories.find(s => s.id === 'sub-elec-gaming') || null;
      }
    }
  }
  // 4. Informatique & Bureautique
  else if (/ordinateur|pc|laptop|macbook|dell|hp|lenovo|asus|clavier|souris|moniteur|imprimante|disque\s*dur|ssd|cle\s*usb|routeur|box\s*wifi/i.test(lowerCaption)) {
    const cCat = categories.find(c => c.id === 'cat-computers');
    if (cCat) matchedCat = cCat;
  }
  // 5. Beauté, Parfums & Bien-Être
  else if (/parfum|eau\s*de\s*parfum|fragrance|oud|lattafa|creme|serum|visage|savon|lotion|maquillage|rouge\s*a\s*levres|perruque|meche|cheveux/i.test(lowerCaption)) {
    const bCat = categories.find(c => c.id === 'cat-beauty');
    if (bCat) matchedCat = bCat;
  }
  // 6. Mode & Habillement
  else if (/chaussure|basket|sneaker|soulier|sandale|talon|robe|combinaison|chemise|polo|pantalon|costume|t-shirt|jean|veste|sac\s*a\s*main|sacoche|boubou|wax|pagne|lingerie|pyjama|mode|vetement/i.test(lowerCaption)) {
    const fCat = categories.find(c => c.id === 'cat-fashion');
    if (fCat) {
      matchedCat = fCat;
      if (/chaussure|basket|sneaker|soulier|sandale|talon/i.test(lowerCaption)) {
        matchedSub = fCat.subcategories.find(s => s.id === 'sub-mode-chaussures') || null;
      } else if (/robe|combinaison|jupe/i.test(lowerCaption)) {
        matchedSub = fCat.subcategories.find(s => s.id === 'sub-mode-femme') || null;
      } else if (/chemise|polo|costume|pantalon/i.test(lowerCaption)) {
        matchedSub = fCat.subcategories.find(s => s.id === 'sub-mode-homme') || null;
      } else if (/boubou|wax|pagne/i.test(lowerCaption)) {
        matchedSub = fCat.subcategories.find(s => s.id === 'sub-mode-wax') || null;
      } else if (/sac/i.test(lowerCaption)) {
        matchedSub = fCat.subcategories.find(s => s.id === 'sub-mode-sacs') || null;
      }
    }
  }

  const finalPrice = userExplicitPrice || 25000;
  const title = caption.length > 3 && caption.length < 80
    ? caption.charAt(0).toUpperCase() + caption.slice(1)
    : `Nouvel Arrivage ${matchedCat.name}`;

  return {
    title,
    categoryId: matchedCat.id,
    categoryName: matchedCat.name,
    subcategoryId: matchedSub?.id || null,
    subcategoryName: matchedSub?.name || null,
    price: finalPrice,
    originalPrice: Math.round(finalPrice * 1.2 / 500) * 500,
    shortDescription: `Produit certifié de haute qualité. Disponible dès maintenant avec livraison express à Abidjan.`,
    description: `Découvrez notre **${title}**, sélectionné avec rigueur pour sa qualité et sa durabilité.\n\n` +
      `✨ **Points Forts :**\n` +
      `- Conforme aux normes et standards de qualité\n` +
      `- Idéal pour un usage quotidien fiable\n\n` +
      `🚚 **Livraison Express :** Partout à Abidjan sous 24h et en intérieur sous 48h.\n` +
      `💳 **Paiement Sécurisé :** Wave, Orange Money, MTN Money ou à la livraison.`,
    tags: [matchedCat.name.toLowerCase(), 'abidjan', 'nouveaute'],
    badgeText: 'Nouveau',
    isDubaiPreorder: false,
    specs: {
      'Disponibilité': 'En stock immédiat à Abidjan',
      'Origine': 'Import Certifié'
    }
  };
}

// Structures pour l'agrégation d'albums et lots de photos
interface AlbumPhotoItem {
  fileId: string;
  caption?: string;
  messageId: number;
}

interface AlbumQueueEntry {
  groupKey: string;
  chatId: number | string;
  items: AlbumPhotoItem[];
  caption: string;
  settings: StoreSettings;
  statusMsgId?: number;
  timer: NodeJS.Timeout;
}

// Buffers en mémoire partagée
const albumBuffers = new Map<string, AlbumQueueEntry>();
const lastChatBatchKey = new Map<string | number, string>();

/**
 * Mise en file d'attente d'une photo Telegram pour agrégation automatique en un seul produit
 */
export async function queueTelegramProductPhoto(
  message: any,
  settings: StoreSettings
): Promise<{ queued: boolean; count: number }> {
  const botToken = settings.telegramBotToken?.trim();
  const chatId = message.chat?.id;
  if (!botToken || !chatId) return { queued: false, count: 0 };

  // 1. Extraire la meilleure résolution de photo ou document image
  const photos = message.photo;
  const doc = message.document;
  let fileId = '';

  if (Array.isArray(photos) && photos.length > 0) {
    fileId = photos[photos.length - 1].file_id;
  } else if (doc && (doc.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(doc.file_name || ''))) {
    fileId = doc.file_id;
  }

  if (!fileId) return { queued: false, count: 0 };

  const messageCaption = (message.caption || '').trim();
  const mediaGroupId = message.media_group_id ? String(message.media_group_id) : null;

  // Déterminer la clé de regroupement :
  // Si media_group_id existe : regrouper par media_group_id
  // Sinon : regrouper par lot consécutif du même chat (fenêtre de 2.5s)
  let groupKey: string;
  if (mediaGroupId) {
    groupKey = `mg_${chatId}_${mediaGroupId}`;
  } else {
    const existingChatKey = lastChatBatchKey.get(chatId);
    if (existingChatKey && albumBuffers.has(existingChatKey)) {
      groupKey = existingChatKey;
    } else {
      groupKey = `chat_${chatId}_${Date.now()}`;
      lastChatBatchKey.set(chatId, groupKey);
    }
  }

  const existing = albumBuffers.get(groupKey);

  if (existing) {
    existing.items.push({ fileId, caption: messageCaption, messageId: message.message_id });
    if (!existing.caption && messageCaption) {
      existing.caption = messageCaption;
    }
    existing.settings = settings;

    // Réinitialiser le timer avec debounce de 1.8s
    clearTimeout(existing.timer);
    existing.timer = setTimeout(() => {
      processAlbumBatch(groupKey).catch(err => console.error('Erreur processAlbumBatch:', err));
    }, 1800);

    // Mettre à jour le message d'attente s'il existe
    if (existing.statusMsgId) {
      fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: existing.statusMsgId,
          text: `🤖 <i>Agent IA : ${existing.items.length} photos du même produit reçues... Regroupement et publication en cours...</i>`,
          parse_mode: 'HTML',
        }),
      }).catch(() => null);
    }

    console.log(`[Telegram Album] Photo ${existing.items.length} ajoutée au lot ${groupKey}`);
    return { queued: true, count: existing.items.length };
  } else {
    // Premier élément du lot
    let statusMsgId: number | undefined;
    try {
      const res = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 <i>L'Agent IA détecte vos photos... Réception en cours...</i>`,
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.ok && data.result?.message_id) {
        statusMsgId = data.result.message_id;
      }
    } catch {}

    const newEntry: AlbumQueueEntry = {
      groupKey,
      chatId,
      items: [{ fileId, caption: messageCaption, messageId: message.message_id }],
      caption: messageCaption,
      settings,
      statusMsgId,
      timer: setTimeout(() => {
        processAlbumBatch(groupKey).catch(err => console.error('Erreur processAlbumBatch:', err));
      }, 2400),
    };

    albumBuffers.set(groupKey, newEntry);
    console.log(`[Telegram Album] Nouveau lot créé pour ${groupKey}`);
    return { queued: true, count: 1 };
  }
}

/**
 * Traitement final d'un lot de photos regroupées en un SEUL produit
 */
async function processAlbumBatch(groupKey: string): Promise<TelegramPhotoProcessResult> {
  const entry = albumBuffers.get(groupKey);
  if (!entry) return { success: false, error: 'Lot introuvable' };

  albumBuffers.delete(groupKey);
  if (lastChatBatchKey.get(entry.chatId) === groupKey) {
    lastChatBatchKey.delete(entry.chatId);
  }

  const { chatId, items, caption, settings, statusMsgId } = entry;
  const botToken = settings.telegramBotToken?.trim();
  const baseUrl = (settings.seoCanonicalUrl || process.env.APP_URL || 'https://www.ivoireci.com').replace(/\/+$/, '');
  const currency = settings.currency || 'FCFA';

  if (!botToken || !chatId) {
    return { success: false, error: 'Bot token ou chatId manquant' };
  }

  if (statusMsgId) {
    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: statusMsgId,
        text: `🤖 <i>L'Agent IA analyse ${items.length} photo(s) du produit, génère la fiche technique et publie sur ivoireci.com...</i>`,
        parse_mode: 'HTML',
      }),
    }).catch(() => null);
  }

  try {
    // 1. Télécharger toutes les photos en parallèle
    const downloadedList = await Promise.all(
      items.map(it => downloadTelegramPhoto(it.fileId, botToken))
    );

    // 2. Enregistrer localement toutes les photos et créer le tableau d'images
    const imageUrls: string[] = [];
    for (const d of downloadedList) {
      const { relativeUrl } = saveImageLocally(d.buffer, d.filePath);
      imageUrls.push(`${baseUrl}${relativeUrl}`);
    }

    // 3. Analyser avec l'IA en utilisant la première image + la légende commune du lot
    const primaryBuffer = downloadedList[0].buffer;
    const aiData = await analyzeProductWithAi(primaryBuffer, caption, settings);

    // 4. Catégorisation
    let validCat = await prisma.category.findUnique({
      where: { id: aiData.categoryId },
      include: { subcategories: true }
    });

    if (!validCat) {
      validCat = await prisma.category.findFirst({
        include: { subcategories: true }
      });
    }

    if (!validCat) {
      throw new Error('Aucune catégorie trouvée dans la boutique.');
    }

    const categoryId = validCat.id;
    const categoryName = validCat.name;
    const subcategoryId = aiData.subcategoryId && validCat.subcategories.some(s => s.id === aiData.subcategoryId)
      ? aiData.subcategoryId
      : (validCat.subcategories[0]?.id || null);
    const subcategoryName = validCat.subcategories.find(s => s.id === subcategoryId)?.name || null;

    // 5. Créer l'unique produit avec TOUTES les images regroupées
    const sanitizedTitle = sanitizeProductTitle(aiData.title);
    const sanitizedDescription = sanitizeProductDescription(aiData.description);
    const slug = generateProductSlug(sanitizedTitle || aiData.title);
    const discountPercent = aiData.originalPrice && aiData.originalPrice > aiData.price
      ? Math.round(((aiData.originalPrice - aiData.price) / aiData.originalPrice) * 100)
      : null;

    const newProduct = await prisma.product.create({
      data: {
        id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        title: sanitizedTitle || aiData.title,
        slug,
        description: sanitizedDescription || aiData.description,
        shortDescription: aiData.shortDescription,
        price: aiData.price,
        originalPrice: aiData.originalPrice || null,
        discountPercent,
        categoryId,
        categoryName,
        subcategoryId,
        subcategoryName,
        images: imageUrls, // TOUTES LES PHOTOS DANS LE MÊME PRODUIT !
        featured: false,
        isNew: true,
        isFlashSale: false,
        isDubaiPreorder: false, // EXCLUSIVEMENT SUR IVOIRECI.COM
        inStock: true,
        stockCount: 10,
        rating: 5.0,
        reviewCount: 1,
        badgeText: aiData.badgeText,
        tags: aiData.tags,
        specs: aiData.specs as any,
      }
    });

    // Incrémenter le compteur de la catégorie
    await prisma.category.update({
      where: { id: categoryId },
      data: { itemCount: { increment: 1 } }
    }).catch(() => null);

    // Supprimer le message d'attente
    if (statusMsgId) {
      await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: statusMsgId }),
      }).catch(() => null);
    }

    // 6. Envoyer le message de confirmation avec la photo principale et les boutons
    const productUrl = `${baseUrl}/produit/${newProduct.slug}`;
    const priceText = `${newProduct.price.toLocaleString('fr-FR')} ${currency}`;
    const origPriceText = newProduct.originalPrice
      ? ` <s>${newProduct.originalPrice.toLocaleString('fr-FR')} ${currency}</s>`
      : '';

    const captionText = [
      `🎉 <b>PRODUIT PUBLIÉ EN DIRECT PAR L'AGENT IA !</b>`,
      '',
      `📸 <b>Titre :</b> ${escapeTelegramHtml(newProduct.title)}`,
      `🖼️ <b>Photos :</b> ${imageUrls.length} photo(s) haute résolution regroupée(s)`,
      `📂 <b>Catégorie :</b> ${escapeTelegramHtml(categoryName)}${subcategoryName ? ` › ${escapeTelegramHtml(subcategoryName)}` : ''}`,
      `💰 <b>Prix :</b> <b>${priceText}</b>${origPriceText}`,
      `📦 <b>Stock :</b> ${newProduct.stockCount} unités`,
      `🏷️ <b>Badge :</b> ${escapeTelegramHtml(newProduct.badgeText || 'Nouveau')}`,
      `📍 <b>Boutique :</b> Abidjan (Livraison express 24h)`,
      `🟢 <b>Statut :</b> En Ligne sur ivoireci.com`,
      '',
      `🔗 <b>Lien direct boutique :</b>`,
      `<code>${productUrl}</code>`,
    ].join('\n');

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Voir sur le Site', url: productUrl }
        ],
        [
          { text: '✏️ Modifier Prix (-10%)', callback_data: `tgprod_discount:${newProduct.id}:10` },
          { text: '✏️ Modifier Prix (+5 000)', callback_data: `tgprod_adjprice:${newProduct.id}:5000` },
        ],
        [
          { text: '⏸️ Mettre Hors Stock', callback_data: `tgprod_stock:${newProduct.id}` },
          { text: '🗑️ Supprimer de la Boutique', callback_data: `tgprod_del:${newProduct.id}` }
        ]
      ]
    };

    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: items[0].fileId,
        caption: captionText,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard,
      }),
    });

    return {
      success: true,
      productId: newProduct.id,
      productSlug: newProduct.slug,
      productTitle: newProduct.title,
      categoryName,
      price: newProduct.price,
      currency,
    };
  } catch (error: any) {
    console.error('Erreur traitement lot de photos Telegram:', error);
    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `❌ <b>Erreur lors de la publication du produit :</b>\n<code>${escapeTelegramHtml(error.message || 'Erreur inconnue')}</code>`,
        parse_mode: 'HTML',
      }),
    }).catch(() => null);

    return { success: false, error: error.message };
  }
}

/**
 * Point d'entrée rétrocompatible
 */
export async function handleTelegramProductPhoto(
  message: any,
  settings: StoreSettings
): Promise<TelegramPhotoProcessResult> {
  await queueTelegramProductPhoto(message, settings);
  return { success: true };
}
