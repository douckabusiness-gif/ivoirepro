import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Nettoie les titres de produits pour retirer d'éventuels prix ou suffixes collés (ex: "– 36000FCFA", "- 45 000 CFA")
 */
export function cleanProductTitle(title?: string | null): string {
  if (!title) return '';
  return title
    .replace(/[\s–\-—:]+\d[\d\s\.,]*(?:fcfa|cfa|f\b|frs)?\s*$/i, '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();
}

