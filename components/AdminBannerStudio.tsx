'use client';

import React, { useState, useRef } from 'react';
import { 
  StoreSettings, 
  HeroSlideItem, 
  InGridBannerItem, 
  Product, 
  Category 
} from '@/lib/types';
import { processUploadedImage } from '@/lib/imageUtils';
import { 
  Sparkles, 
  Flame, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Save, 
  UploadCloud, 
  ImageIcon, 
  Link as LinkIcon, 
  MessageCircle, 
  Package, 
  Layers, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  ArrowLeft, 
  ExternalLink, 
  Check, 
  ShoppingBag, 
  X,
  FileEdit,
  Info,
  RefreshCw,
  Search
} from 'lucide-react';

interface AdminBannerStudioProps {
  localSettings: StoreSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => Promise<void>;
  saveSuccessMsg: string;
  products: Product[];
  categories: Category[];
}

interface BannerDraft {
  id: string;
  placement: 'hero' | 'grid';
  enabled: boolean;
  image: string;
  displayMode: 'graphic' | 'standard';
  title: string;
  highlight: string;
  subtitle: string;
  badge: string;
  tag: string;
  promoDiscount: string;
  textAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number;
  theme: string;
  buttonText: string;
  secondaryButtonText: string;
  actionType: 'shop' | 'whatsapp' | 'product' | 'category' | 'link';
  whatsappMessage: string;
  targetProductId: string;
  targetCategoryId: string;
  customLink: string;
}

const DEFAULT_DRAFT: BannerDraft = {
  id: '',
  placement: 'hero',
  enabled: true,
  image: '',
  displayMode: 'graphic',
  title: 'Nouvelle Offre Spéciale',
  highlight: 'À Portée De Clic',
  subtitle: 'Découvrez notre sélection exclusive disponible immédiatement avec livraison rapide.',
  badge: 'NOUVEAU',
  tag: '-20% IMMÉDIAT',
  promoDiscount: '-20% VIP',
  textAlignment: 'left',
  overlayOpacity: 40,
  theme: 'midnight',
  buttonText: 'Découvrir le Catalogue',
  secondaryButtonText: 'Commander sur WhatsApp',
  actionType: 'shop',
  whatsappMessage: 'Bonjour ! Je vous contacte au sujet de l\'offre vue sur la bannière de la boutique. Est-elle toujours disponible ?',
  targetProductId: '',
  targetCategoryId: '',
  customLink: ''
};

export const AdminBannerStudio: React.FC<AdminBannerStudioProps> = ({
  localSettings,
  setLocalSettings,
  handleSaveSettings,
  saveSuccessMsg,
  products,
  categories
}) => {
  // Navigation: 'list' (dashboard overview) or 'editor' (pro full-page banner studio)
  const [studioView, setStudioView] = useState<'list' | 'editor'>('list');
  const [listFilter, setListFilter] = useState<'all' | 'hero' | 'grid' | 'enabled' | 'hidden'>('all');
  
  // Banner Draft state for creation/editing
  const [draft, setDraft] = useState<BannerDraft>(DEFAULT_DRAFT);
  const [editingOriginPlacement, setEditingOriginPlacement] = useState<'hero' | 'grid'>('hero');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Drag & drop and upload states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [productSearch, setProductSearch] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const heroSlides: HeroSlideItem[] = Array.isArray(localSettings.heroSlidesList)
    ? (localSettings.heroSlidesList as HeroSlideItem[])
    : [];

  const gridBanners: InGridBannerItem[] = Array.isArray(localSettings.inGridBannersList)
    ? (localSettings.inGridBannersList as InGridBannerItem[])
    : [];

  // Metrics
  const totalCount = heroSlides.length + gridBanners.length;
  const heroCount = heroSlides.length;
  const gridCount = gridBanners.length;
  const activeCount = 
    heroSlides.filter((s) => s.enabled !== false).length + 
    gridBanners.filter((b) => b.enabled !== false).length;

  // Unified items for dashboard list
  interface UnifiedBanner {
    id: string;
    placement: 'hero' | 'grid';
    index: number;
    enabled: boolean;
    image: string;
    displayMode: 'graphic' | 'standard';
    title: string;
    subtitle: string;
    badge: string;
    actionType: string;
    targetProductId?: string;
    targetCategoryId?: string;
    whatsappMessage?: string;
    customLink?: string;
    rawHero?: HeroSlideItem;
    rawGrid?: InGridBannerItem;
  }

  const allUnifiedBanners: UnifiedBanner[] = [
    ...heroSlides.map((s, idx) => ({
      id: s.id || `hero-${idx}`,
      placement: 'hero' as const,
      index: idx,
      enabled: s.enabled !== false,
      image: s.image || '',
      displayMode: (s.displayMode === 'graphic' || (!s.title && !s.subtitle)) ? ('graphic' as const) : ('standard' as const),
      title: s.title || `Bannière Hero #${idx + 1}`,
      subtitle: s.subtitle || '',
      badge: s.badge || '',
      actionType: (s.linkAction || s.buttonAction || 'shop') as string,
      targetProductId: s.targetProductId,
      targetCategoryId: s.targetCategoryId,
      whatsappMessage: s.whatsappMessage,
      customLink: s.linkUrl || s.buttonLink,
      rawHero: s
    })),
    ...gridBanners.map((b, idx) => ({
      id: b.id || `grid-${idx}`,
      placement: 'grid' as const,
      index: idx,
      enabled: b.enabled !== false,
      image: b.imageUrl || '',
      displayMode: (b.displayMode === 'graphic') ? ('graphic' as const) : ('standard' as const),
      title: b.title || `Bannière Grille #${idx + 1}`,
      subtitle: b.subtitle || '',
      badge: b.badge || '',
      actionType: (b.buttonAction || 'shop') as string,
      targetProductId: b.targetProductId,
      targetCategoryId: b.targetCategoryId,
      whatsappMessage: b.whatsappMessage,
      customLink: b.buttonLink,
      rawGrid: b
    }))
  ];

  // Filtered list
  const filteredBanners = allUnifiedBanners.filter((b) => {
    if (listFilter === 'hero') return b.placement === 'hero';
    if (listFilter === 'grid') return b.placement === 'grid';
    if (listFilter === 'enabled') return b.enabled;
    if (listFilter === 'hidden') return !b.enabled;
    return true;
  });

  // Open Creator for a new banner
  const handleOpenCreate = (targetPlacement: 'hero' | 'grid' = 'hero') => {
    const newId = `banner-${Date.now()}`;
    const nextNum = (targetPlacement === 'hero' ? heroSlides.length : gridBanners.length) + 1;
    setDraft({
      ...DEFAULT_DRAFT,
      id: newId,
      placement: targetPlacement,
      title: `Bannière #${nextNum}`,
      image: '',
      displayMode: 'graphic'
    });
    setEditingOriginPlacement(targetPlacement);
    setEditingId(null);
    setUploadError('');
    setStudioView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Editor for an existing banner
  const handleOpenEdit = (item: UnifiedBanner) => {
    if (item.placement === 'hero' && item.rawHero) {
      const h = item.rawHero;
      setDraft({
        id: h.id || item.id,
        placement: 'hero',
        enabled: h.enabled !== false,
        image: h.image || '',
        displayMode: h.displayMode || (h.title ? 'standard' : 'graphic'),
        title: h.title || '',
        highlight: h.highlight || '',
        subtitle: h.subtitle || '',
        badge: h.badge || '',
        tag: h.tag || '',
        promoDiscount: h.promoDiscount || '',
        textAlignment: h.textAlignment || 'left',
        overlayOpacity: typeof h.overlayOpacity === 'number' ? h.overlayOpacity : 40,
        theme: h.theme || 'midnight',
        buttonText: h.buttonText || 'Découvrir',
        secondaryButtonText: h.secondaryButtonText || 'WhatsApp',
        actionType: (h.linkAction || h.buttonAction || 'shop') as any,
        whatsappMessage: h.whatsappMessage || '',
        targetProductId: h.targetProductId || '',
        targetCategoryId: h.targetCategoryId || '',
        customLink: h.linkUrl || h.buttonLink || ''
      });
    } else if (item.placement === 'grid' && item.rawGrid) {
      const g = item.rawGrid;
      setDraft({
        id: g.id || item.id,
        placement: 'grid',
        enabled: g.enabled !== false,
        image: g.imageUrl || '',
        displayMode: g.displayMode || (g.title ? 'standard' : 'graphic'),
        title: g.title || '',
        highlight: '',
        subtitle: g.subtitle || '',
        badge: g.badge || '',
        tag: '',
        promoDiscount: '',
        textAlignment: 'left',
        overlayOpacity: typeof g.overlayOpacity === 'number' ? g.overlayOpacity : 40,
        theme: g.theme || 'gold',
        buttonText: g.buttonText || 'En Profiter',
        secondaryButtonText: 'WhatsApp',
        actionType: (g.buttonAction || 'shop') as any,
        whatsappMessage: g.whatsappMessage || '',
        targetProductId: g.targetProductId || '',
        targetCategoryId: g.targetCategoryId || '',
        customLink: g.buttonLink || ''
      });
    }
    setEditingOriginPlacement(item.placement);
    setEditingId(item.id);
    setUploadError('');
    setStudioView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Image Upload Handler with compression
  const handleImageFile = async (file: File) => {
    if (!file) return;
    setIsProcessingImage(true);
    setUploadError('');
    try {
      const maxWidth = draft.placement === 'hero' ? 1920 : 1400;
      const maxHeight = draft.placement === 'hero' ? 1080 : 800;
      const compressed = await processUploadedImage(file, maxWidth, maxHeight, 0.88);
      setDraft((prev) => ({ ...prev, image: compressed }));
    } catch (err: any) {
      setUploadError(err?.message || "Erreur lors de l'importation de l'image.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await handleImageFile(files[0]);
    }
  };

  // Delete banner
  const handleDelete = (item: UnifiedBanner) => {
    if (!confirm(`Confirmez-vous la suppression définitive de la bannière "${item.title}" ?`)) return;
    if (item.placement === 'hero') {
      const updated = heroSlides.filter((_, idx) => idx !== item.index);
      setLocalSettings((prev) => ({ ...prev, heroSlidesList: updated }));
    } else {
      const updated = gridBanners.filter((_, idx) => idx !== item.index);
      setLocalSettings((prev) => ({ ...prev, inGridBannersList: updated }));
    }
  };

  // Duplicate banner
  const handleDuplicate = (item: UnifiedBanner) => {
    if (item.placement === 'hero' && item.rawHero) {
      const cloned: HeroSlideItem = {
        ...item.rawHero,
        id: `hero-slide-${Date.now()}`,
        title: `${item.rawHero.title || 'Bannière'} (Copie)`
      };
      const updated = [
        ...heroSlides.slice(0, item.index + 1),
        cloned,
        ...heroSlides.slice(item.index + 1)
      ];
      setLocalSettings((prev) => ({ ...prev, heroSlidesList: updated }));
    } else if (item.placement === 'grid' && item.rawGrid) {
      const cloned: InGridBannerItem = {
        ...item.rawGrid,
        id: `grid-banner-${Date.now()}`,
        title: `${item.rawGrid.title || 'Bannière'} (Copie)`
      };
      const updated = [
        ...gridBanners.slice(0, item.index + 1),
        cloned,
        ...gridBanners.slice(item.index + 1)
      ];
      setLocalSettings((prev) => ({ ...prev, inGridBannersList: updated }));
    }
  };

  // Move banner
  const handleMove = (item: UnifiedBanner, direction: 'up' | 'down') => {
    if (item.placement === 'hero') {
      const targetIdx = direction === 'up' ? item.index - 1 : item.index + 1;
      if (targetIdx < 0 || targetIdx >= heroSlides.length) return;
      const updated = [...heroSlides];
      const temp = updated[item.index];
      updated[item.index] = updated[targetIdx];
      updated[targetIdx] = temp;
      setLocalSettings((prev) => ({ ...prev, heroSlidesList: updated }));
    } else {
      const targetIdx = direction === 'up' ? item.index - 1 : item.index + 1;
      if (targetIdx < 0 || targetIdx >= gridBanners.length) return;
      const updated = [...gridBanners];
      const temp = updated[item.index];
      updated[item.index] = updated[targetIdx];
      updated[targetIdx] = temp;
      setLocalSettings((prev) => ({ ...prev, inGridBannersList: updated }));
    }
  };

  // Toggle status
  const handleToggle = (item: UnifiedBanner) => {
    if (item.placement === 'hero') {
      const updated = heroSlides.map((s, i) =>
        i === item.index ? { ...s, enabled: s.enabled === false ? true : false } : s
      );
      setLocalSettings((prev) => ({ ...prev, heroSlidesList: updated }));
    } else {
      const updated = gridBanners.map((b, i) =>
        i === item.index ? { ...b, enabled: b.enabled === false ? true : false } : b
      );
      setLocalSettings((prev) => ({ ...prev, inGridBannersList: updated }));
    }
  };

  // Save current draft
  const handleSaveDraft = async () => {
    if (!draft.image) {
      alert("Veuillez sélectionner ou importer une image pour votre bannière.");
      return;
    }

    const isNew = !editingId;

    if (draft.placement === 'hero') {
      const heroItem: HeroSlideItem = {
        id: draft.id || `hero-slide-${Date.now()}`,
        enabled: draft.enabled,
        placement: 'hero',
        displayMode: draft.displayMode,
        image: draft.image,
        title: draft.displayMode === 'graphic' ? (draft.title || 'Affiche Graphique') : draft.title,
        highlight: draft.highlight,
        subtitle: draft.subtitle,
        badge: draft.badge,
        tag: draft.tag,
        promoDiscount: draft.promoDiscount,
        textAlignment: draft.textAlignment,
        overlayOpacity: draft.overlayOpacity,
        theme: draft.theme,
        buttonText: draft.buttonText,
        buttonAction: draft.actionType,
        buttonLink: draft.customLink,
        linkAction: draft.actionType,
        linkUrl: draft.customLink,
        secondaryButtonText: draft.secondaryButtonText,
        secondaryButtonAction: 'whatsapp',
        whatsappMessage: draft.whatsappMessage,
        targetProductId: draft.targetProductId,
        targetCategoryId: draft.targetCategoryId
      };

      let updatedHero = [...heroSlides];

      // If moving from grid to hero
      if (!isNew && editingOriginPlacement === 'grid') {
        const cleanedGrid = gridBanners.filter((b) => b.id !== editingId);
        setLocalSettings((prev) => ({ ...prev, inGridBannersList: cleanedGrid }));
        updatedHero.push(heroItem);
      } else if (!isNew) {
        updatedHero = updatedHero.map((s) => (s.id === editingId ? heroItem : s));
      } else {
        updatedHero.push(heroItem);
      }

      setLocalSettings((prev) => ({ ...prev, heroSlidesList: updatedHero }));
    } else {
      // In-Grid Banner
      const gridItem: InGridBannerItem = {
        id: draft.id || `grid-banner-${Date.now()}`,
        enabled: draft.enabled,
        placement: 'grid',
        displayMode: draft.displayMode,
        imageUrl: draft.image,
        title: draft.title || 'Bannière Promo',
        subtitle: draft.subtitle,
        badge: draft.badge,
        buttonText: draft.buttonText,
        buttonAction: draft.actionType,
        buttonLink: draft.customLink,
        targetProductId: draft.targetProductId,
        targetCategoryId: draft.targetCategoryId,
        whatsappMessage: draft.whatsappMessage,
        theme: draft.theme,
        overlayOpacity: draft.overlayOpacity
      };

      let updatedGrid = [...gridBanners];

      // If moving from hero to grid
      if (!isNew && editingOriginPlacement === 'hero') {
        const cleanedHero = heroSlides.filter((s) => s.id !== editingId);
        setLocalSettings((prev) => ({ ...prev, heroSlidesList: cleanedHero }));
        updatedGrid.push(gridItem);
      } else if (!isNew) {
        updatedGrid = updatedGrid.map((b) => (b.id === editingId ? gridItem : b));
      } else {
        updatedGrid.push(gridItem);
      }

      setLocalSettings((prev) => ({ ...prev, inGridBannersList: updatedGrid }));
    }

    setStudioView('list');
    await handleSaveSettings();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* VIEW 1: BANNER DASHBOARD & LIST OVERVIEW */}
      {/* ========================================================================= */}
      {studioView === 'list' && (
        <div className="space-y-6">
          
          {/* Header Title Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  Studio Graphique & Bannières Pro
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Gestionnaire de Bannières & Campagnes
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Ajoutez vos propres images (Canva, Photoshop, photos smartphone), définissez vos instructions de redirection au clic (WhatsApp, produit ou catégorie) et contrôlez l'affichage de votre boutique.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenCreate('hero')}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Créer une Nouvelle Bannière</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer Tout</span>
                </button>
              </div>
            </div>

            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Toast Notification */}
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bannières</span>
              <p className="text-2xl font-black text-white">{totalCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">🌟 Carrousel Hero</span>
              <p className="text-2xl font-black text-indigo-400">{heroCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">🔥 Grille Catalogue</span>
              <p className="text-2xl font-black text-orange-400">{gridCount}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">🟢 En Ligne</span>
              <p className="text-2xl font-black text-emerald-400">{activeCount}</p>
            </div>
          </div>

          {/* Filter Bar & Quick Create Selector */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setListFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  listFilter === 'all'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Toutes ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('hero')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  listFilter === 'hero'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🌟 Carrousel Hero ({heroCount})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('grid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  listFilter === 'grid'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🔥 Grille Catalogue ({gridCount})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('enabled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  listFilter === 'enabled'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                🟢 Actives ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setListFilter('hidden')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  listFilter === 'hidden'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ⚪ Masquées ({totalCount - activeCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenCreate('hero')}
                className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Hero Carrousel</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenCreate('grid')}
                className="px-3 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Grille Catalogue</span>
              </button>
            </div>
          </div>

          {/* Banners Grid */}
          {filteredBanners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBanners.map((item) => {
                const isHero = item.placement === 'hero';
                const isGraphic = item.displayMode === 'graphic';
                const totalInSameGroup = isHero ? heroSlides.length : gridBanners.length;

                // Action description label
                let actionLabel = 'Boutique générale';
                if (item.actionType === 'whatsapp') {
                  actionLabel = '📱 WhatsApp direct';
                } else if (item.actionType === 'product') {
                  const targetProd = products.find((p) => p.id === item.targetProductId);
                  actionLabel = targetProd ? `📦 Produit: ${targetProd.title}` : '📦 Fiche Produit';
                } else if (item.actionType === 'category') {
                  const targetCat = categories.find((c) => c.id === item.targetCategoryId);
                  actionLabel = targetCat ? `🏷️ Rayon: ${targetCat.name}` : '🏷️ Rayon';
                } else if (item.actionType === 'link') {
                  actionLabel = `🌐 Lien: ${item.customLink || 'externe'}`;
                }

                return (
                  <div
                    key={`${item.placement}-${item.id}`}
                    className={`bg-slate-900 rounded-3xl border transition-all overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md ${
                      item.enabled
                        ? 'border-slate-800 hover:border-indigo-500/60'
                        : 'border-slate-800/60 opacity-75'
                    }`}
                  >
                    {/* Visual Card Header */}
                    <div className="p-4 space-y-3">
                      
                      {/* Thumbnail Container */}
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-500 text-xs">
                            <ImageIcon className="w-8 h-8 text-slate-600" />
                            <span>Aucun visuel</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                            isHero
                              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}>
                            {isHero ? '🌟 Hero Haut' : '🔥 Grille'} #{item.index + 1}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md border ${
                            item.enabled
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-900/80 text-slate-400 border-slate-700'
                          }`}>
                            {item.enabled ? '● En ligne' : '○ Masquée'}
                          </span>
                        </div>

                        {/* Bottom Tag */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                            {isGraphic ? '🖼️ Affiche Canva/Pure' : '✍️ Composée'}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/80 text-slate-950 text-[10px] font-black">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="space-y-1 pt-1">
                        <h3 className="text-sm font-black text-white truncate" title={item.title}>
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {item.subtitle}
                          </p>
                        )}
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                          <LinkIcon className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">{actionLabel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={item.index === 0}
                          onClick={() => handleMove(item, 'up')}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Monter dans le carrousel"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={item.index === totalInSameGroup - 1}
                          onClick={() => handleMove(item, 'down')}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                          title="Descendre dans le carrousel"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            item.enabled
                              ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                              : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50'
                          }`}
                          title={item.enabled ? 'Masquer la bannière' : 'Publier la bannière'}
                        >
                          {item.enabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title="Dupliquer la bannière"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer ml-1"
                        >
                          <FileEdit className="w-3 h-3" />
                          <span>Modifier</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">Aucune bannière ne correspond à votre filtre</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Créez vos bannières personnalisées avec vos propres images et instructions pour dynamiser les ventes de votre boutique.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenCreate('hero')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer une Bannière Hero</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCreate('grid')}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer une Bannière Grille</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DEDICATED PRO BANNER CREATION & EDIT STUDIO ("Page d'Ajout Pro") */}
      {/* ========================================================================= */}
      {studioView === 'editor' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          
          {/* Top Bar: Back, Status & Quick Save */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStudioView('list')}
                className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                title="Retour à la liste des bannières"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {editingId ? 'Modification' : 'Création Dédiée'}
                  </span>
                  <span className="text-xs text-slate-500">/</span>
                  <span className="text-xs text-slate-400 font-bold">
                    {draft.placement === 'hero' ? '🌟 Carrousel Hero Haut' : '🔥 Grille Produits'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {draft.title || 'Nouvelle Bannière Publicitaire'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStudioView('list')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Enregistrer & Publier</span>
              </button>
            </div>
          </div>

          {/* Main Studio Grid: Form (Left 7 cols) & Live Simulator (Right 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: THE PRO STUDIO FORM */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SECTION 1: EMPLACEMENT & STATUT */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
                    <span>Emplacement & Visibilité de la Bannière</span>
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={draft.enabled}
                      onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {draft.enabled ? '🟢 Active sur la boutique' : '⚪ Masquée (brouillon)'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDraft({ ...draft, placement: 'hero' })}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      draft.placement === 'hero'
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-xs text-white">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>🌟 Carrousel Hero (Haut de Page)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      La grande affiche plein écran visible par 100% de vos visiteurs dès l'ouverture de la boutique.
                    </p>
                  </div>

                  <div
                    onClick={() => setDraft({ ...draft, placement: 'grid' })}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      draft.placement === 'grid'
                        ? 'bg-orange-950/60 border-orange-500 ring-2 ring-orange-500/30 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-xs text-white">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>🔥 Grille Catalogue (Intercalée)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Bannière promotionnelle glissée entre les rangées d'articles dans votre catalogue.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: VOS PROPRES IMAGES (DRAG & DROP / NATIVE UPLOAD) */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                    <span>Votre Propre Image de Bannière</span>
                  </h3>

                  <span className="text-[11px] text-slate-400">
                    Conseillé : {draft.placement === 'hero' ? '1920 x 800 px (16:9)' : '1200 x 400 px'}
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? 'border-indigo-400 bg-indigo-950/40 ring-4 ring-indigo-500/20'
                      : draft.image
                        ? 'border-emerald-500/40 bg-slate-950/80'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleImageFile(file);
                    }}
                  />

                  {draft.image ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-700 bg-black/40">
                        <img
                          src={draft.image}
                          alt="Bannière sélectionnée"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 cursor-pointer transition"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Remplacer l'image</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraft({ ...draft, image: '' })}
                            className="p-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-[11px] backdrop-blur-md border border-rose-500/30 cursor-pointer transition"
                            title="Supprimer cette image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Image chargée et optimisée pour un affichage ultra-rapide</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-white">
                          Glissez-déposez votre image ici, ou{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-indigo-400 hover:text-indigo-300 underline font-black cursor-pointer"
                          >
                            parcourez vos fichiers
                          </button>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Formats acceptés : PNG, JPG, WEBP, GIF. Import direct depuis votre ordinateur ou smartphone.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessingImage}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-md transition cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>{isProcessingImage ? 'Optimisation en cours...' : 'Choisir une image depuis mon appareil'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400 font-bold">{uploadError}</p>
                )}

                {/* Direct Image URL Alternative */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Ou collez une URL d'image directe (ex: Unsplash, CDN externe) :
                  </span>
                  <input
                    type="text"
                    value={draft.image}
                    onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* SECTION 3: MODE DE CONCEPTION & INSTRUCTIONS VISUELLES */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
                    <span>Style Graphique & Vos Instructions Textuelles</span>
                  </h3>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDraft({ ...draft, displayMode: 'graphic' })}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      draft.displayMode === 'graphic'
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-xs text-white">
                      <span>🖼️ Affiche Pure (Canva / Image prête)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Idéal si votre image a déjà tous ses textes et slogans intégrés. <strong>Aucun texte superposé</strong> ne vient gâcher votre création.
                    </p>
                  </div>

                  <div
                    onClick={() => setDraft({ ...draft, displayMode: 'standard' })}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      draft.displayMode === 'standard'
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-xs text-white">
                      <span>✍️ Bannière Composée (Textes & Boutons)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Affiche des textes personnalisés, un badge promo et des boutons d'action au-dessus de votre photo avec un voile sombre élégant.
                    </p>
                  </div>
                </div>

                {/* Composed Mode Fields */}
                {draft.displayMode === 'standard' && (
                  <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in">
                    
                    {/* Badge & Discount Tag */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Badge supérieur (Ex: VENTE FLASH)</label>
                        <input
                          type="text"
                          value={draft.badge}
                          onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                          placeholder="NOUVELLE COLLECTION 2026"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Tag de réduction (Ex: -30% VIP)</label>
                        <input
                          type="text"
                          value={draft.promoDiscount}
                          onChange={(e) => setDraft({ ...draft, promoDiscount: e.target.value, tag: e.target.value })}
                          placeholder="-30% OFFRE LIMITÉE"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Title & Highlight */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Titre Principal</label>
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                          placeholder="L'Excellence & Le Style"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Surlignage Couleur (Dégradé)</label>
                        <input
                          type="text"
                          value={draft.highlight}
                          onChange={(e) => setDraft({ ...draft, highlight: e.target.value })}
                          placeholder="À Portée De Clic."
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Descriptif / Sous-titre</label>
                      <textarea
                        rows={2}
                        value={draft.subtitle}
                        onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                        placeholder="Commandez en un éclair par WhatsApp ou payez en toute sécurité en ligne avec livraison express."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
                      />
                    </div>

                    {/* Text Alignment & Overlay Opacity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300">Alignement des Textes</label>
                        <div className="flex items-center gap-1.5">
                          {(['left', 'center', 'right'] as const).map((align) => (
                            <button
                              key={align}
                              type="button"
                              onClick={() => setDraft({ ...draft, textAlignment: align })}
                              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                                draft.textAlignment === align
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {align === 'left' ? 'Gauche' : align === 'center' ? 'Centré' : 'Droite'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300">Voile sombre d'assombrissement</label>
                          <span className="text-xs font-black text-indigo-400">{draft.overlayOpacity}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {[0, 25, 45, 65].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setDraft({ ...draft, overlayOpacity: pct })}
                              className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                draft.overlayOpacity === pct
                                  ? 'bg-indigo-600 text-white border-indigo-500'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Button Labels */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Libellé Bouton Principal</label>
                        <input
                          type="text"
                          value={draft.buttonText}
                          onChange={(e) => setDraft({ ...draft, buttonText: e.target.value })}
                          placeholder="Explorer le Catalogue"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300">Libellé Bouton Secondaire</label>
                        <input
                          type="text"
                          value={draft.secondaryButtonText}
                          onChange={(e) => setDraft({ ...draft, secondaryButtonText: e.target.value })}
                          placeholder="Commander sur WhatsApp"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* SECTION 4: INSTRUCTIONS AU CLIC & REDIRECTION */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
                    <span>Instructions au Clic & Redirection</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Que fait la bannière au clic ?</span>
                </div>

                {/* Redirect Action Selector Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'whatsapp', label: 'Discussion WhatsApp', icon: <MessageCircle className="w-4 h-4 text-emerald-400" /> },
                    { id: 'product', label: 'Produit Spécifique', icon: <Package className="w-4 h-4 text-indigo-400" /> },
                    { id: 'category', label: 'Rayon / Catégorie', icon: <Layers className="w-4 h-4 text-amber-400" /> },
                    { id: 'shop', label: 'Catalogue Général', icon: <ShoppingBag className="w-4 h-4 text-sky-400" /> },
                    { id: 'link', label: 'Lien Web Externe', icon: <ExternalLink className="w-4 h-4 text-pink-400" /> }
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setDraft({ ...draft, actionType: act.id as any })}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                        draft.actionType === act.id
                          ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {act.icon}
                        {draft.actionType === act.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <span className="text-xs font-bold text-white block">{act.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-fields depending on Action Type */}
                <div className="pt-2">
                  
                  {/* WHATSAPP CUSTOM MESSAGE */}
                  {draft.actionType === 'whatsapp' && (
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <MessageCircle className="w-4 h-4" />
                        <span>Message Automatique Pré-rédigé pour WhatsApp :</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Quand le client clique sur votre bannière, WhatsApp s'ouvre avec votre numéro et ce message directement tapé :
                      </p>
                      <textarea
                        rows={3}
                        value={draft.whatsappMessage}
                        onChange={(e) => setDraft({ ...draft, whatsappMessage: e.target.value })}
                        placeholder="Bonjour ! J'ai vu votre bannière promo et je souhaite commander..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  )}

                  {/* SPECIFIC PRODUCT TARGET */}
                  {draft.actionType === 'product' && (
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 animate-in fade-in">
                      <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                        <Package className="w-4 h-4" />
                        <span>Sélectionnez le Produit Cible :</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Le clic sur la bannière ouvrira directement la fiche détaillée de cet article avec le bouton d'achat.
                      </p>

                      {/* Product Filter Input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un produit par nom..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <select
                        value={draft.targetProductId}
                        onChange={(e) => setDraft({ ...draft, targetProductId: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      >
                        <option value="">-- Choisir un produit dans la liste --</option>
                        {products
                          .filter((p) => !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()))
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} — {p.price.toLocaleString('fr-FR')} FCFA
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* SPECIFIC CATEGORY TARGET */}
                  {draft.actionType === 'category' && (
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-amber-500/30 animate-in fade-in">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                        <Layers className="w-4 h-4" />
                        <span>Sélectionnez le Rayon / Catégorie Cible :</span>
                      </div>
                      <select
                        value={draft.targetCategoryId}
                        onChange={(e) => setDraft({ ...draft, targetCategoryId: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      >
                        <option value="">-- Choisir un rayon --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* EXTERNAL LINK */}
                  {draft.actionType === 'link' && (
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-pink-500/30 animate-in fade-in">
                      <div className="flex items-center gap-2 text-pink-300 text-xs font-bold">
                        <ExternalLink className="w-4 h-4" />
                        <span>URL du Lien Externe :</span>
                      </div>
                      <input
                        type="text"
                        value={draft.customLink}
                        onChange={(e) => setDraft({ ...draft, customLink: e.target.value })}
                        placeholder="https://instagram.com/ma_boutique ou /promo-speciale"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-pink-500 focus:outline-hidden"
                      />
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: LIVE SIMULATOR PREVIEW */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-20 space-y-4">
                
                {/* Simulator Card Header */}
                <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black text-white">Aperçu en Direct</span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                        previewDevice === 'desktop'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                        previewDevice === 'mobile'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Simulator Visual Box */}
                <div className="bg-slate-950 p-4 sm:p-5 rounded-3xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Emplacement : <strong>{draft.placement === 'hero' ? 'Carrousel Hero (Haut)' : 'Grille Produits'}</strong></span>
                    <span>Mode : <strong>{draft.displayMode === 'graphic' ? 'Affiche Pure' : 'Composée'}</strong></span>
                  </div>

                  {/* The Simulated Banner Box */}
                  <div 
                    className={`relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
                      previewDevice === 'mobile' ? 'max-w-[320px] mx-auto h-[380px]' : 'w-full h-[280px] sm:h-[320px]'
                    }`}
                  >
                    {draft.image ? (
                      draft.displayMode === 'graphic' ? (
                        /* Graphic Mode Preview */
                        <div className="w-full h-full relative cursor-pointer">
                          <img
                            src={draft.image}
                            alt={draft.title}
                            className="w-full h-full object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-end p-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                              👆 Cliquable vers : {draft.actionType}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Composed Mode Preview */
                        <div className="relative w-full h-full flex flex-col justify-between p-5 text-white overflow-hidden">
                          <img
                            src={draft.image}
                            alt={draft.title}
                            className="absolute inset-0 w-full h-full object-cover object-center"
                          />
                          <div
                            className="absolute inset-0 bg-slate-950"
                            style={{ opacity: (draft.overlayOpacity || 40) / 100 }}
                          />

                          {/* Top Badge */}
                          <div className={`relative z-10 flex ${
                            draft.textAlignment === 'center' ? 'justify-center' : draft.textAlignment === 'right' ? 'justify-end' : 'justify-start'
                          }`}>
                            {draft.badge && (
                              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase text-white">
                                {draft.badge}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className={`relative z-10 space-y-2 ${
                            draft.textAlignment === 'center' ? 'text-center' : draft.textAlignment === 'right' ? 'text-right' : 'text-left'
                          }`}>
                            <h4 className="text-lg sm:text-xl font-black text-white leading-tight">
                              {draft.title || 'Titre de la Bannière'}
                              {draft.highlight && (
                                <span className="block text-amber-300">{draft.highlight}</span>
                              )}
                            </h4>
                            {draft.subtitle && (
                              <p className="text-xs text-slate-200 font-light line-clamp-2">
                                {draft.subtitle}
                              </p>
                            )}

                            <div className={`flex items-center gap-2 pt-1 ${
                              draft.textAlignment === 'center' ? 'justify-center' : draft.textAlignment === 'right' ? 'justify-end' : 'justify-start'
                            }`}>
                              {draft.buttonText && (
                                <span className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-[11px] shadow-sm">
                                  {draft.buttonText}
                                </span>
                              )}
                              {draft.secondaryButtonText && (
                                <span className="px-3.5 py-1.5 rounded-xl bg-white/20 text-white font-bold text-[11px] backdrop-blur-md">
                                  {draft.secondaryButtonText}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bottom Discount */}
                          <div className="relative z-10 flex justify-between items-center text-[10px]">
                            {draft.promoDiscount && (
                              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black">
                                {draft.promoDiscount}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-2 text-slate-500">
                        <ImageIcon className="w-10 h-10 text-slate-700" />
                        <p className="text-xs font-bold text-slate-400">Importez une image pour visualiser le rendu</p>
                      </div>
                    )}
                  </div>

                  {/* Summary of click behavior */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>Comportement au clic configuré :</span>
                    </div>
                    {draft.actionType === 'whatsapp' && (
                      <p className="text-slate-400 pl-5">
                        Ouvre WhatsApp vers votre numéro commercial avec le message : <em className="text-white">"{draft.whatsappMessage || '...'}"</em>
                      </p>
                    )}
                    {draft.actionType === 'product' && (
                      <p className="text-slate-400 pl-5">
                        Ouvre la fiche produit de : <strong className="text-white">{products.find(p => p.id === draft.targetProductId)?.title || 'Article sélectionné'}</strong>
                      </p>
                    )}
                    {draft.actionType === 'category' && (
                      <p className="text-slate-400 pl-5">
                        Filtre le catalogue sur le rayon : <strong className="text-white">{categories.find(c => c.id === draft.targetCategoryId)?.name || 'Rayon sélectionné'}</strong>
                      </p>
                    )}
                    {draft.actionType === 'shop' && (
                      <p className="text-slate-400 pl-5">Redirige vers l'ensemble du catalogue de la boutique.</p>
                    )}
                    {draft.actionType === 'link' && (
                      <p className="text-slate-400 pl-5">Redirige vers l'URL : <code className="text-indigo-300">{draft.customLink || '...'}</code></p>
                    )}
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-between gap-3 shadow-md">
                  <button
                    type="button"
                    onClick={() => setStudioView('list')}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-95"
                  >
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>Enregistrer et Publier</span>
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
