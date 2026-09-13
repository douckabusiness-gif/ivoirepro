import { Product, PriceTier } from './types';

/**
 * Default tiers matching standard wholesale discounts:
 * - 1 to 4 pcs: Regular base retail price (Prix détail)
 * - 5 to 19 pcs: -8% discount (13 800 FCFA for a 15 000 FCFA base price)
 * - 20+ pcs: -15% wholesale discount (12 750 FCFA for a 15 000 FCFA base price)
 */
export const DEFAULT_TIER_PERCENTAGES = [
  { minQty: 1, maxQty: 4, discountPercent: 0, label: 'Prix détail' },
  { minQty: 5, maxQty: 19, discountPercent: 8, label: '-8% Remise' },
  { minQty: 20, maxQty: undefined, discountPercent: 15, label: '-15% Grossiste' },
];

/**
 * Computes the 3 effective pricing tiers for a product with concrete unit prices.
 */
export function getEffectivePriceTiers(product: Product): PriceTier[] {
  const basePrice = Math.round(Number(product.price) || 0);

  // If custom tiers are configured and valid
  if (product.priceTiers && Array.isArray(product.priceTiers) && product.priceTiers.length > 0) {
    return product.priceTiers.map(t => {
      const minQty = Math.max(1, Number(t.minQty) || 1);
      const maxQty = t.maxQty ? Number(t.maxQty) : undefined;
      const discountPercent = t.discountPercent !== undefined ? Number(t.discountPercent) : undefined;
      let price = t.price !== undefined && t.price !== null ? Math.round(Number(t.price)) : 0;
      
      if (!price && discountPercent !== undefined) {
        price = Math.max(0, Math.round(basePrice * (1 - discountPercent / 100)));
      } else if (!price) {
        price = basePrice;
      }

      let label = t.label || (discountPercent ? `-${discountPercent}% Remise` : 'Prix détail');
      return { minQty, maxQty, price, discountPercent, label };
    });
  }

  // Otherwise standard 3-tier structure
  return [
    {
      minQty: 1,
      maxQty: 4,
      price: basePrice,
      discountPercent: 0,
      label: 'Prix détail'
    },
    {
      minQty: 5,
      maxQty: 19,
      price: Math.max(0, Math.round(basePrice * 0.92)), // -8%
      discountPercent: 8,
      label: '-8% Remise'
    },
    {
      minQty: 20,
      maxQty: undefined,
      price: Math.max(0, Math.round(basePrice * 0.85)), // -15%
      discountPercent: 15,
      label: '-15% Grossiste'
    }
  ];
}

/**
 * Returns the effective unit price for a given product and quantity.
 * If tierPricingEnabled is false, base product.price is always returned.
 */
export function getUnitPriceForQuantity(product: Product, quantity: number = 1): number {
  const basePrice = Math.round(Number(product.price) || 0);
  if (!product.tierPricingEnabled) {
    return basePrice;
  }

  const safeQty = Math.max(1, Math.round(quantity) || 1);
  const tiers = getEffectivePriceTiers(product);

  // Sort tiers descending by minQty to find the highest applicable tier
  const sortedDesc = [...tiers].sort((a, b) => b.minQty - a.minQty);
  const matchedTier = sortedDesc.find(t => safeQty >= t.minQty);

  if (matchedTier && typeof matchedTier.price === 'number') {
    return matchedTier.price;
  }

  return basePrice;
}

/**
 * Returns the index (0, 1, or 2) of the active tier for the selected quantity.
 */
export function getActiveTierIndex(tiers: PriceTier[], quantity: number): number {
  const safeQty = Math.max(1, Math.round(quantity) || 1);
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (safeQty >= tiers[i].minQty) {
      return i;
    }
  }
  return 0;
}
