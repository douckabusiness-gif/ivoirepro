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
1. "title" : Rédige un titre commercial accrocheur et précis (ex : "Sneakers Nike Air Jordan 4 Retro - Noir", "Robe de Soirée Élégante en Satin", "iPhone 13 Pro Max 256Go").
2. "categoryId" & "categoryName" : Choisis impérativement l'ID d'une catégorie EXISTANTE dans la liste ci-dessus.
3. "subcategoryId" & "subcategoryName" : Choisis une sous-catégorie existante de cette catégorie si applicable, ou null.
4. "price" : Si un prix est détecté (${userExplicitPrice || 'aucun'}), utilise STRICTEMENT ${userExplicitPrice || 'une estimation réaliste en FCFA (multiple de 500)'}.
5. "originalPrice" : Prix barré suggéré (environ 15% à 25% plus cher que price pour effet promo).
6. "shortDescription" : Résumé percutant en 1 ou 2 phrases pour mobile.
7. "description" : Présentation complète avec puces (Points Forts, Caractéristiques, Livraison express 24h Abidjan, Paiement sécurisé Wave / Orange Money / MTN).
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
  let matchedSub = null;
  const lowerCaption = caption.toLowerCase();

  if (/chaussure|basket|sneaker|soulier|sandale/i.test(lowerCaption)) {
    const fCat = categories.find(c => c.id === 'cat-fashion');
    if (fCat) {
      matchedCat = fCat;
      matchedSub = fCat.subcategories.find(s => s.id === 'sub-mode-chaussures') || null;
    }
  } else if (/phone|iphone|samsung|pixel|portable|android|tablette/i.test(lowerCaption)) {
    const pCat = categories.find(c => c.id === 'cat-phones');
    if (pCat) matchedCat = pCat;
  } else if (/parfum|fragrance|oud|beaute|creme|soin/i.test(lowerCaption)) {
    const bCat = categories.find(c => c.id === 'cat-beauty');
    if (bCat) matchedCat = bCat;
  }

  const finalPrice = userExplicitPrice || 25000;
  const title = caption.length > 3 && caption.length < 70
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
    description: `Découvrez notre **${title}**, sélectionné avec rigueur pour sa qualité et son style irréprochable.\n\n` +
      `✨ **Points Forts :**\n` +
      `- Finition et durabilité garanties\n` +
      `- Conforme aux standards internationaux\n\n` +
      `🚚 **Livraison Express :** Partout à Abidjan sous 24h et en intérieur sous 48h.\n` +
      `💳 **Paiement :** Wave, Orange Money, MTN Money ou à la livraison.`,
    tags: [matchedCat.name.toLowerCase(), 'abidjan', 'nouveaute', 'luxe'],
    badgeText: 'Nouveau',
    isDubaiPreorder: false,
    specs: {
      'Disponibilité': 'En stock immédiat à Abidjan',
      'Origine': 'Import Certifié'
    }
  };
}

/**
 * Point d'entrée principal : Traiter une photo reçue sur Telegram
 */
export async function handleTelegramProductPhoto(
  message: any,
  settings: StoreSettings
): Promise<TelegramPhotoProcessResult> {
  const botToken = settings.telegramBotToken?.trim();
  const chatId = message.chat?.id;
  const baseUrl = (settings.seoCanonicalUrl || process.env.APP_URL || 'https://www.ivoireci.com').replace(/\/+$/, '');
  const currency = settings.currency || 'FCFA';

  if (!botToken || !chatId) {
    return { success: false, error: 'Bot token ou chatId manquant' };
  }

  // 1. Extraire la meilleure résolution de photo
  const photos = message.photo;
  const doc = message.document;
  let fileId = '';

  if (Array.isArray(photos) && photos.length > 0) {
    // La dernière entrée est la plus haute résolution
    fileId = photos[photos.length - 1].file_id;
  } else if (doc && doc.mime_type?.startsWith('image/')) {
    fileId = doc.file_id;
  }

  if (!fileId) {
    return { success: false, error: 'Aucun fichier image trouvé dans le message' };
  }

  const caption = (message.caption || '').trim();

  // 2. Envoyer une notification temporaire de traitement
  const statusMsgRes = await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🤖 <i>L'Agent IA analyse votre photo en haute résolution, identifie le produit et configure la fiche en direct...</i>`,
      parse_mode: 'HTML',
    }),
  }).catch(() => null);

  const statusMsgData = await statusMsgRes?.json().catch(() => null);
  const statusMsgId = statusMsgData?.result?.message_id;

  try {
    // 3. Télécharger l'image depuis Telegram
    const { buffer, filePath } = await downloadTelegramPhoto(fileId, botToken);

    // 4. Enregistrer localement pour la boutique web
    const { filename, relativeUrl } = saveImageLocally(buffer, filePath);
    const fullImageUrl = `${baseUrl}${relativeUrl}`;

    // 5. Analyser avec l'IA
    const aiData = await analyzeProductWithAi(buffer, caption, settings);

    // Vérifier l'existence de la catégorie
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

    // 6. Créer le produit dans la base de données
    const slug = generateProductSlug(aiData.title);
    const discountPercent = aiData.originalPrice && aiData.originalPrice > aiData.price
      ? Math.round(((aiData.originalPrice - aiData.price) / aiData.originalPrice) * 100)
      : null;

    const newProduct = await prisma.product.create({
      data: {
        id: `prod-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        title: aiData.title,
        slug,
        description: aiData.description,
        shortDescription: aiData.shortDescription,
        price: aiData.price,
        originalPrice: aiData.originalPrice || null,
        discountPercent,
        categoryId,
        categoryName,
        subcategoryId,
        subcategoryName,
        images: [fullImageUrl],
        featured: false,
        isNew: true,
        isFlashSale: false,
        isDubaiPreorder: false,
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

    // 7. Supprimer le message d'attente
    if (statusMsgId) {
      await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: statusMsgId }),
      }).catch(() => null);
    }

    // 8. Préparer le message final enrichi
    const productUrl = `${baseUrl}/produit/${newProduct.slug}`;

    const priceText = `${newProduct.price.toLocaleString('fr-FR')} ${currency}`;
    const origPriceText = newProduct.originalPrice
      ? ` <s>${newProduct.originalPrice.toLocaleString('fr-FR')} ${currency}</s>`
      : '';

    const captionText = [
      `🎉 <b>PRODUIT PUBLIÉ EN DIRECT PAR L'AGENT IA !</b>`,
      '',
      `📸 <b>Titre :</b> ${escapeTelegramHtml(newProduct.title)}`,
      `📂 <b>Rayon :</b> ${escapeTelegramHtml(categoryName)}${subcategoryName ? ` › ${escapeTelegramHtml(subcategoryName)}` : ''}`,
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

    // Envoyer la photo avec le clavier interactif
    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: fileId, // Réutilise directement le file_id Telegram (instantané)
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
    console.error('Erreur traitement photo Telegram:', error);
    
    // Si échec, notifier l'administrateur
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
