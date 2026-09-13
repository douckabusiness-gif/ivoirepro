import { prisma } from './prisma';
import { initialStoreSettings } from './initialData';
import { toPublicSettings } from './settingsSecurity';
import type { Category, Product, StoreSettings } from './types';

/**
 * Chargeurs de données publiques partagés entre les routes API et les
 * Server Components (rendu initial de la home). Les résultats passent par un
 * aller-retour JSON pour avoir exactement la même forme que les réponses API
 * (dates en chaînes, pas d'objets Prisma).
 */
function toJson<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const settingsInclude = { faqList: { orderBy: { order: 'asc' as const } } };

/** Charge (ou crée au premier démarrage) la ligne StoreSettings complète, secrets inclus. */
export async function loadStoreSettingsRecord() {
  let settings: any = await prisma.storeSettings.findUnique({
    where: { id: 'default_settings' },
    include: settingsInclude,
  });

  if (!settings) {
    const { faqList, ...rest } = initialStoreSettings;
    settings = await prisma.storeSettings.create({
      data: {
        id: 'default_settings',
        ...(rest as any),
        faqList: {
          create: faqList.map((faq, idx) => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: faq.category || 'Général',
            order: idx,
          })),
        },
      },
      include: settingsInclude,
    });
  }

  // Older databases used `auto` as an AI model placeholder. It is no longer
  // a valid model: only an identifier returned by the provider API may be used.
  if (settings.aiModel === 'auto') settings.aiModel = '';
  return settings;
}

/** Paramètres visibles par tout visiteur (clés IA/SMTP/Telegram retirées). */
export async function getPublicSettings(): Promise<StoreSettings> {
  const record = await loadStoreSettingsRecord();
  return toJson<StoreSettings>(toPublicSettings(record));
}

export async function getPublicProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return toJson<Product[]>(products);
}

export async function getPublicCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    include: { subcategories: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' },
  });
  return toJson<Category[]>(categories);
}

export interface HomeInitialData {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
}

/** Données nécessaires au premier rendu de la boutique. Tolérant aux pannes DB. */
export async function getHomeInitialData(): Promise<HomeInitialData | null> {
  try {
    const [settings, products, categories] = await Promise.all([
      getPublicSettings(),
      getPublicProducts(),
      getPublicCategories(),
    ]);
    return { settings, products, categories };
  } catch (error) {
    console.error('Impossible de précharger les données de la boutique côté serveur:', error);
    return null;
  }
}
