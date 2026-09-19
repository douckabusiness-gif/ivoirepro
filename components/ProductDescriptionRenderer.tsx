'use client';

import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Box, 
  Zap, 
  HelpCircle,
  Clock,
  MapPin,
  CreditCard
} from 'lucide-react';

interface ProductDescriptionRendererProps {
  description?: string | null;
  className?: string;
}

/**
 * Renders inline text with **bold** support
 */
function renderFormattedInline(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          return (
            <strong key={index} className="font-bold text-slate-900 dark:text-white">
              {content}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

/**
 * Cleans raw HTML markup into clean structured text lines while preserving intent
 */
function normalizeRawDescription(raw: string): string {
  if (!raw) return '';
  return raw
    // Convert <li>...</li> to bullet points
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => `\n• ${content.trim()}`)
    // Convert <strong> and <b> to markdown **...**
    .replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, (_, content) => `**${content.trim()}**`)
    // Convert <br> and </p> to linebreaks
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Clean up entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Remove excessive empty lines
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface BlockItem {
  type: 'intro' | 'header' | 'bullet' | 'shipping' | 'payment' | 'highlight';
  text: string;
  icon?: string;
}

export const ProductDescriptionRenderer: React.FC<ProductDescriptionRendererProps> = ({
  description,
  className = '',
}) => {
  const blocks = useMemo(() => {
    if (!description || description.trim() === '') return [];
    
    const cleanText = normalizeRawDescription(description);
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    const result: BlockItem[] = [];

    lines.forEach((line) => {
      // 1. Check for shipping banner
      if (/^(?:🚚|🚀)?\s*(?:\*\*)?(?:livraison|expédition)/i.test(line)) {
        result.push({ type: 'shipping', text: line.replace(/^(?:🚚|🚀)\s*/, '') });
        return;
      }

      // 2. Check for payment banner
      if (/^(?:💳|💵|💰)?\s*(?:\*\*)?(?:paiement|moyens?\s+de\s+paiement)/i.test(line)) {
        result.push({ type: 'payment', text: line.replace(/^(?:💳|💵|💰)\s*/, '') });
        return;
      }

      // 3. Check for bullet list item
      if (/^[•\-\*]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line)) {
        const bulletText = line.replace(/^[•\-\*]\s+/, '').replace(/^\d+[\.\)]\s+/, '');
        result.push({ type: 'bullet', text: bulletText });
        return;
      }

      // 4. Check for section header (ends with ":" or starts with emoji)
      if (
        /^(?:✨|📦|⚙️|🛡️|💡|🔍|🔥|⭐|🏷️)/.test(line) ||
        (line.length < 80 && line.endsWith(':'))
      ) {
        result.push({ type: 'header', text: line });
        return;
      }

      // 5. Default: paragraph/intro
      result.push({ type: 'intro', text: line });
    });

    return result;
  }, [description]);

  if (!description || blocks.length === 0) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs italic">
        Aucune description détaillée n'est disponible pour cet article actuellement.
      </div>
    );
  }

  // Group consecutive bullets into lists
  const renderedElements: React.ReactNode[] = [];
  let currentBulletGroup: string[] = [];

  const flushBullets = (keyIndex: number) => {
    if (currentBulletGroup.length > 0) {
      renderedElements.push(
        <div
          key={`bullet-group-${keyIndex}`}
          className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-5 my-3 shadow-2xs space-y-2.5"
        >
          {currentBulletGroup.map((item, bIdx) => (
            <div key={bIdx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <div className="flex-1">
                {renderFormattedInline(item)}
              </div>
            </div>
          ))}
        </div>
      );
      currentBulletGroup = [];
    }
  };

  blocks.forEach((block, idx) => {
    if (block.type === 'bullet') {
      currentBulletGroup.push(block.text);
      return;
    }

    // Flush any pending bullet group
    flushBullets(idx);

    if (block.type === 'header') {
      renderedElements.push(
        <div key={`header-${idx}`} className="pt-3 pb-1 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {renderFormattedInline(block.text)}
          </h4>
        </div>
      );
    } else if (block.type === 'shipping') {
      renderedElements.push(
        <div
          key={`shipping-${idx}`}
          className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 flex items-start gap-3 my-2.5 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200"
        >
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-700 dark:text-emerald-300 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold block text-emerald-950 dark:text-emerald-100 mb-0.5">Livraison Express Abidjan & Intérieur :</span>
            {renderFormattedInline(block.text.replace(/^(?:\*\*)?livraison\s*(?:express)?\s*(?::|\*\*:)\s*/i, ''))}
          </div>
        </div>
      );
    } else if (block.type === 'payment') {
      renderedElements.push(
        <div
          key={`payment-${idx}`}
          className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-3.5 flex items-start gap-3 my-2.5 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200"
        >
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg text-indigo-700 dark:text-indigo-300 shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold block text-indigo-950 dark:text-indigo-100 mb-0.5">Paiement 100% Sécurisé :</span>
            {renderFormattedInline(block.text.replace(/^(?:\*\*)?paiement\s*(?:sécurisé)?\s*(?::|\*\*:)\s*/i, ''))}
          </div>
        </div>
      );
    } else {
      renderedElements.push(
        <p
          key={`intro-${idx}`}
          className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm"
        >
          {renderFormattedInline(block.text)}
        </p>
      );
    }
  });

  // Flush remaining bullets
  flushBullets(blocks.length);

  return (
    <div className={`space-y-3 font-normal ${className}`}>
      {renderedElements}
    </div>
  );
};
