'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { Product, Category } from '@/lib/types';
import { processUploadedImage } from '@/lib/imageUtils';
import {
  Plane,
  Coins,
  DollarSign,
  TrendingUp,
  Calculator,
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Eye,
  Check,
  Sparkles,
  RefreshCw,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Layers,
  Tag,
  ChevronRight,
  Percent,
  ShoppingBag,
  Boxes,
  UploadCloud,
  X,
  CheckCircle2,
  Sliders,
  Globe,
  Building2,
  Flame,
  ArrowUpRight,
  Save,
  CheckCircle,
  Scale,
  Truck,
  Power
} from 'lucide-react';

const DUBAI_LUXURY_COLLECTIONS = [
  {
    id: 'perfumes',
    name: "Parfums d'Orient & Ouds",
    nameKeywords: ['parfum', 'oud', 'fragrance', 'lattafa', 'asad', 'khamrah', 'orient'],
    icon: '🌺',
    badge: "Sillage d'Exception",
    description: "Parfums de niche orientaux, ouds impériaux et élixirs de Dubaï (Lattafa, Swiss Arabian, Armaf, Maison Alhambra).",
    defaultWeight: 0.6,
    defaultAed: 160
  },
  {
    id: 'watches',
    name: 'Montres & Bijoux Or 24K',
    nameKeywords: ['montre', 'gold', 'or', 'bijoux', 'parure', 'diamant', 'squelette', 'chronographe'],
    icon: '👑',
    badge: 'Gold Souk DXB',
    description: "Horlogerie de prestige, chronographes squelette et parures dorées à l'or fin directement du Gold Souk de Deira.",
    defaultWeight: 0.4,
    defaultAed: 350
  },
  {
    id: 'abayas',
    name: 'Abayas & Haute Couture',
    nameKeywords: ['abaya', 'soie', 'robe', 'couture', 'caftan', 'voile', 'medine', 'nidha'],
    icon: '🧕',
    badge: 'Haute Couture DXB',
    description: "Abayas en soie de Médine, tissus Nidha premium, broderies artisanales et confections émiraties haut de gamme.",
    defaultWeight: 0.8,
    defaultAed: 220
  },
  {
    id: 'hightech',
    name: 'High-Tech DXB & Apple',
    nameKeywords: ['iphone', 'macbook', 'airpods', 'pro max', 'samsung', 'playstation', 'gadget', 'high-tech'],
    icon: '📱',
    badge: 'Dubai Mall Tech',
    description: "Smartphones de dernière génération, versions physiques internationales, tablettes et accessoires exclusifs de Dubaï.",
    defaultWeight: 0.5,
    defaultAed: 2500
  },
  {
    id: 'bakhoors',
    name: 'Bakhoors & Encensoirs Royaux',
    nameKeywords: ['bakhoor', 'encens', 'encensoir', 'mabkhara', 'bakhour', 'charbon'],
    icon: '🪵',
    badge: 'Tradition Khaleeji',
    description: "Encens traditionnels émiratis en copeaux de bois d'agarwood et encensoirs sculptés de prestige.",
    defaultWeight: 1.0,
    defaultAed: 120
  }
];

export const AdminDubaiManager: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    formatPrice,
    settings,
    updateSettings
  } = useStore();

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'converter' | 'categories' | 'settings'>('products');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dubai Product Form
  const [formTitle, setFormTitle] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formOriginalPrice, setFormOriginalPrice] = useState<string>('');
  const [formAedPrice, setFormAedPrice] = useState<string>('');
  const [formDeliveryDays, setFormDeliveryDays] = useState('7 à 10 jours ouvrés');
  const [formBatchDate, setFormBatchDate] = useState('Prochain vol cargo ce mardi');
  const [formBadgeText, setFormBadgeText] = useState('🇦🇪 Arrivage Dubaï');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formInStock, setFormInStock] = useState(true);
  const [formStockCount, setFormStockCount] = useState<number>(15);

  // In-modal quick AED calculator toggle
  const [showModalCalculator, setShowModalCalculator] = useState(false);
  const [quickAedInput, setQuickAedInput] = useState<string>('200');
  const [quickCargoFee, setQuickCargoFee] = useState<string>('5000');
  const [quickMarginPercent, setQuickMarginPercent] = useState<number>(35);

  // Standalone Currency Converter State
  const [calcCurrency, setCalcCurrency] = useState<'AED' | 'USD' | 'EUR'>('AED');
  const [calcRate, setCalcRate] = useState<number>(168.0);
  const [calcAedPrice, setCalcAedPrice] = useState<number>(250);
  const [calcWeightKg, setCalcWeightKg] = useState<number>(0.8);
  const [calcCargoPerKg, setCalcCargoPerKg] = useState<number>(5000);
  const [calcCustomsFee, setCalcCustomsFee] = useState<number>(2000);
  const [calcMarginPercent, setCalcMarginPercent] = useState<number>(35);
  const [calcTargetCategory, setCalcTargetCategory] = useState<string>('');
  const [calcProductTitle, setCalcProductTitle] = useState<string>('');

  // Settings State for Dubai
  const [dubaiEnabled, setDubaiEnabled] = useState<boolean>(settings.dubaiPageEnabled !== false);
  const [dubaiTitle, setDubaiTitle] = useState<string>(settings.dubaiPageTitle || 'Espace Dubaï VIP • Précommandes & Arrivages Directs ✈️');
  const [dubaiSubtitle, setDubaiSubtitle] = useState<string>(settings.dubaiPageSubtitle || 'Commandez vos articles authentiques importés de Dubaï avec paiement sécurisé et livraison garantie à Abidjan.');
  const [dubaiNextFlight, setDubaiNextFlight] = useState<string>(settings.dubaiNextFlightDate || 'Vol Cargo chaque mardi & vendredi');
  const [dubaiGlobalAedRate, setDubaiGlobalAedRate] = useState<number>(settings.dubaiAedRate || 168.0);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTogglingDubai, setIsTogglingDubai] = useState(false);

  // Fast One-Click Toggle for Dubai Page Activation/Deactivation
  const handleToggleDubaiPage = async () => {
    const nextState = !dubaiEnabled;
    setIsTogglingDubai(true);
    setDubaiEnabled(nextState);
    try {
      await updateSettings({
        dubaiPageEnabled: nextState
      });
      showToast(
        nextState 
          ? "✅ Espace Dubaï VIP ACTIVÉ avec succès ! (Accessible sur https://www.ivoireci.com/dubai)" 
          : "🔴 Espace Dubaï VIP DÉSACTIVÉ ! (/dubai est désormais suspendu pour le public)",
        nextState ? 'success' : 'error'
      );
    } catch (err: any) {
      setDubaiEnabled(!nextState); // Rollback on failure
      showToast(err.message || 'Erreur lors de la mise à jour de la page Dubaï.', 'error');
    } finally {
      setIsTogglingDubai(false);
    }
  };

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setDubaiEnabled(settings.dubaiPageEnabled !== false);
      if (settings.dubaiPageTitle) setDubaiTitle(settings.dubaiPageTitle);
      if (settings.dubaiPageSubtitle) setDubaiSubtitle(settings.dubaiPageSubtitle);
      if (settings.dubaiNextFlightDate) setDubaiNextFlight(settings.dubaiNextFlightDate);
      if (settings.dubaiAedRate) {
        setDubaiGlobalAedRate(settings.dubaiAedRate);
        setCalcRate(settings.dubaiAedRate);
      }
    }
  }, [settings]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filter Dubai products (only products marked with isDubaiPreorder: true)
  const dubaiProducts = useMemo(() => {
    return products.filter((p) => p.isDubaiPreorder === true);
  }, [products]);

  // Filtered Dubai Products for table
  const filteredDubaiProducts = useMemo(() => {
    return dubaiProducts.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.badgeText && p.badgeText.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || p.categoryId === categoryFilter;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'inStock' && p.inStock) ||
        (stockFilter === 'outOfStock' && !p.inStock);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [dubaiProducts, searchQuery, categoryFilter, stockFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = dubaiProducts.length;
    const totalStock = dubaiProducts.reduce((acc, p) => acc + (p.stockCount || 0), 0);
    const totalValueFcfa = dubaiProducts.reduce((acc, p) => acc + (p.price * (p.stockCount || 1)), 0);
    const totalValueAed = Math.round(totalValueFcfa / (dubaiGlobalAedRate || 168));
    const inStockCount = dubaiProducts.filter((p) => p.inStock).length;

    return { totalCount, totalStock, totalValueFcfa, totalValueAed, inStockCount };
  }, [dubaiProducts, dubaiGlobalAedRate]);

  // Converter calculations
  const converterResults = useMemo(() => {
    const purchaseCostFcfa = Math.round(calcAedPrice * calcRate);
    const cargoCostFcfa = Math.round(calcWeightKg * calcCargoPerKg);
    const totalLandedCost = purchaseCostFcfa + cargoCostFcfa + calcCustomsFee;
    const grossMarginAmount = Math.round(totalLandedCost * (calcMarginPercent / 100));
    const rawSalePrice = totalLandedCost + grossMarginAmount;
    // Round up to nearest 500 FCFA for commercial appeal
    const recommendedSalePrice = Math.ceil(rawSalePrice / 500) * 500;
    const actualMarginFcfa = recommendedSalePrice - totalLandedCost;
    const actualMarginPercent = totalLandedCost > 0 ? Math.round((actualMarginFcfa / recommendedSalePrice) * 100) : 0;
    const multiplier = purchaseCostFcfa > 0 ? (recommendedSalePrice / purchaseCostFcfa).toFixed(2) : '1.00';

    return {
      purchaseCostFcfa,
      cargoCostFcfa,
      totalLandedCost,
      recommendedSalePrice,
      actualMarginFcfa,
      actualMarginPercent,
      multiplier
    };
  }, [calcAedPrice, calcRate, calcWeightKg, calcCargoPerKg, calcCustomsFee, calcMarginPercent]);

  // Open Create Modal with clean defaults
  const handleOpenCreateModal = (prefill?: Partial<Product> & { aed?: number }) => {
    setIsEditing(false);
    setEditingProductId(null);

    const defaultCat = categories.length > 0 ? categories[0].id : '';

    setFormTitle(prefill?.title || '');
    setFormCategoryId(prefill?.categoryId || defaultCat);
    setFormPrice(prefill?.price ? String(prefill.price) : '');
    setFormOriginalPrice(prefill?.originalPrice ? String(prefill.originalPrice) : '');
    setFormAedPrice(prefill?.aed ? String(prefill.aed) : '');
    setFormDeliveryDays(prefill?.dubaiDeliveryDays || '7 à 10 jours ouvrés');
    setFormBatchDate(prefill?.dubaiBatchDate || dubaiNextFlight || 'Prochain vol cargo ce mardi');
    setFormBadgeText(prefill?.badgeText || '🇦🇪 Arrivage Dubaï');
    setFormImageUrl(prefill?.images?.[0] || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80');
    setFormDescription(prefill?.description || 'Article authentique importé directement des boutiques officielles et souks de Dubaï. Certifié 100% original.');
    setFormShortDescription(prefill?.shortDescription || 'Import direct Dubaï • Fret Aérien sécurisé');
    setFormInStock(true);
    setFormStockCount(15);
    setShowModalCalculator(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (p: Product) => {
    setIsEditing(true);
    setEditingProductId(p.id);

    setFormTitle(p.title);
    setFormCategoryId(p.categoryId);
    setFormPrice(String(p.price));
    setFormOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    const estimatedAed = (p as any).aedPurchasePrice || Math.round(p.price / (dubaiGlobalAedRate || 168));
    setFormAedPrice(String(estimatedAed));
    setFormDeliveryDays(p.dubaiDeliveryDays || '7 à 10 jours ouvrés');
    setFormBatchDate(p.dubaiBatchDate || 'Prochain vol cargo ce mardi');
    setFormBadgeText(p.badgeText || '🇦🇪 Arrivage Dubaï');
    setFormImageUrl(p.images?.[0] || '');
    setFormDescription(p.description || '');
    setFormShortDescription(p.shortDescription || '');
    setFormInStock(p.inStock !== false);
    setFormStockCount(p.stockCount ?? 10);
    setShowModalCalculator(false);
    setIsModalOpen(true);
  };

  // Quick AED conversion inside modal
  const handleApplyQuickAedCalculation = () => {
    const aed = parseFloat(quickAedInput) || 0;
    const cargo = parseFloat(quickCargoFee) || 5000;
    const rate = dubaiGlobalAedRate || 168;
    const margin = quickMarginPercent / 100;

    if (aed <= 0) {
      showToast('Veuillez entrer un montant AED valide.', 'error');
      return;
    }

    const costFcfa = aed * rate;
    const totalCost = costFcfa + cargo;
    const calculatedPrice = Math.ceil((totalCost * (1 + margin)) / 500) * 500;
    const calculatedOriginalPrice = Math.ceil((calculatedPrice * 1.25) / 500) * 500;

    setFormPrice(String(calculatedPrice));
    setFormOriginalPrice(String(calculatedOriginalPrice));
    setFormAedPrice(String(aed));
    setShowModalCalculator(false);
    showToast(`Calcul appliqué : ${calculatedPrice.toLocaleString('fr-FR')} FCFA (${aed} AED)`, 'success');
  };

  // Save product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Le nom du produit est obligatoire.', 'error');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Veuillez spécifier un prix de vente FCFA valide.', 'error');
      return;
    }

    const origPriceNum = formOriginalPrice ? parseFloat(formOriginalPrice) : undefined;
    const aedNum = formAedPrice ? parseFloat(formAedPrice) : Math.round(priceNum / (dubaiGlobalAedRate || 168));

    setIsSubmitting(true);

    try {
      const productPayload: any = {
        title: formTitle.trim(),
        categoryId: formCategoryId,
        price: priceNum,
        originalPrice: origPriceNum && origPriceNum > priceNum ? origPriceNum : null,
        discountPercent: origPriceNum && origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : null,
        images: formImageUrl.trim() ? [formImageUrl.trim()] : ['https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80'],
        description: formDescription.trim(),
        shortDescription: formShortDescription.trim(),
        badgeText: formBadgeText.trim() || '🇦🇪 Arrivage Dubaï',
        inStock: formInStock,
        stockCount: formStockCount >= 0 ? formStockCount : 10,
        isDubaiPreorder: true,
        dubaiDeliveryDays: formDeliveryDays.trim() || '7 à 10 jours ouvrés',
        dubaiBatchDate: formBatchDate.trim() || 'Prochain vol cargo ce mardi',
        aedPurchasePrice: aedNum
      };

      if (isEditing && editingProductId) {
        await updateProduct(editingProductId, productPayload);
        showToast('Article Dubaï mis à jour avec succès !', 'success');
      } else {
        await addProduct(productPayload);
        showToast('Nouvel article Dubaï ajouté au catalogue !', 'success');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving Dubai product:', err);
      showToast(err.message || "Erreur lors de l'enregistrement de l'article.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle inStock quick action
  const handleToggleStock = async (p: Product) => {
    try {
      await updateProduct(p.id, { inStock: !p.inStock });
      showToast(p.inStock ? 'Article marqué En Rupture temporaire' : 'Article marqué Disponible en stock', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du changement de disponibilité.', 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async (p: Product) => {
    if (confirm(`Confirmer la suppression définitive de l'article Dubaï : "${p.title}" ?`)) {
      try {
        await deleteProduct(p.id);
        showToast('Article Dubaï supprimé du catalogue.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Erreur lors de la suppression.', 'error');
      }
    }
  };

  // Transfer converter result to new product creation
  const handleCreateProductFromConverter = () => {
    const defaultCat = calcTargetCategory || (categories.length > 0 ? categories[0].id : '');
    handleOpenCreateModal({
      title: calcProductTitle || `Article de Dubaï (${calcAedPrice} AED)`,
      categoryId: defaultCat,
      price: converterResults.recommendedSalePrice,
      originalPrice: Math.ceil((converterResults.recommendedSalePrice * 1.25) / 500) * 500,
      aed: calcAedPrice,
      dubaiDeliveryDays: '7 à 10 jours ouvrés via Fret Aérien DXB',
      badgeText: '🇦🇪 Nouveauté Dubaï',
      description: `Article authentique acheté à Dubaï (${calcAedPrice} AED). Frais de fret aérien et formalités douanières inclus dans le prix de vente.`
    });
  };

  // Save Settings
  const handleSaveDubaiSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettings({
        dubaiPageEnabled: dubaiEnabled,
        dubaiPageTitle: dubaiTitle.trim(),
        dubaiPageSubtitle: dubaiSubtitle.trim(),
        dubaiNextFlightDate: dubaiNextFlight.trim(),
        dubaiAedRate: Number(dubaiGlobalAedRate)
      });
      showToast("Paramètres de l'Espace Dubaï enregistrés avec succès !", 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde des paramètres.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Image upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await processUploadedImage(file, 1000, 1000, 0.85);
      setFormImageUrl(base64);
      showToast('Image optimisée et chargée !', 'success');
    } catch (err: any) {
      showToast(err.message || "Erreur de chargement de l'image.", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold border backdrop-blur-xl transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-950/40'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/50 shadow-rose-950/40'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER BANNER & DUBAI STATUS */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-6 md:p-8 shadow-2xl shadow-amber-950/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Plane className="w-3.5 h-3.5" /> Dubaï VIP Hub 🇦🇪
              </span>

              {/* Dynamic Live Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border transition-all ${
                dubaiEnabled 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20' 
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${dubaiEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{dubaiEnabled ? 'Page /dubai en Ligne (Active)' : 'Page /dubai Suspendue (Hors-Ligne)'}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold">
                1 AED = {dubaiGlobalAedRate} FCFA
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Gestionnaire Espace Dubaï VIP
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Pilotez l'importation de Dubaï vers la Côte d'Ivoire. Activez ou désactivez la page publique Dubaï, convertissez les devises émiraties (AED),
              calculez vos marges de fret aérien et publiez des articles luxueux en précommande.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* BOUTON ON / OFF MASTER SWITCH DE LA PAGE DUBAÏ */}
            <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${
              dubaiEnabled
                ? 'bg-slate-950/90 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                : 'bg-slate-950/90 border-rose-500/50 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/30'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                  dubaiEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  <Power className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">
                    {dubaiEnabled ? 'Page Dubaï Active' : 'Page Dubaï Désactivée'}
                  </div>
                  <div className={`text-[10px] font-bold ${dubaiEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {dubaiEnabled ? 'Accessible au public' : 'Accès public suspendu'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleDubaiPage}
                disabled={isTogglingDubai}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors cursor-pointer border-2 focus:outline-none ${
                  dubaiEnabled
                    ? 'bg-emerald-500 border-emerald-400'
                    : 'bg-slate-800 border-slate-700'
                }`}
                title={dubaiEnabled ? 'Cliquer pour DÉSACTIVER la page Dubaï' : 'Cliquer pour ACTIVER la page Dubaï'}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    dubaiEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/dubai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
              >
                <ExternalLink className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Voir /dubai</span>
              </a>

              <button
                onClick={() => handleOpenCreateModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Produit Dubaï</span>
              </button>
            </div>

          </div>
        </div>

        {/* Dubai KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>Articles Dubaï</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.totalCount} <span className="text-xs font-normal text-slate-400">références</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              {stats.inStockCount} actifs en précommande
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>Valeur Marchande (FCFA)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-emerald-300">
              {stats.totalValueFcfa.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">FCFA</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Total stock valorisé
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>Équivalent Dirhams</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl md:text-2xl font-black text-amber-300">
              {stats.totalValueAed.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">AED</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Base : 1 AED = {dubaiGlobalAedRate} FCFA
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1">
              <span>Fret & Vol Cargo</span>
              <Plane className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-sm font-black text-white truncate" title={dubaiNextFlight}>
              {dubaiNextFlight}
            </div>
            <div className="text-[11px] text-indigo-300 font-semibold mt-1">
              Délais : 7 à 10j ouvrés
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TABS NAVIGATION */}
      {/* ========================================================================= */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 no-scrollbar">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'products'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Articles Dubaï ({stats.totalCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('converter')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'converter'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Convertisseur Devises AED ➔ FCFA & Marges</span>
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'categories'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catégories & Collections Dubaï</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
            activeSubTab === 'settings'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Paramètres Fret & Vol</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PRODUCTS LIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher parfum, montre, abaya..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">Tous les statuts</option>
                <option value="inStock">En stock (disponible)</option>
                <option value="outOfStock">En rupture</option>
              </select>

              <button
                onClick={() => handleOpenCreateModal()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-amber-500/20 ml-auto sm:ml-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Produit</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          {filteredDubaiProducts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                <Plane className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Aucun article Dubaï trouvé</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Modifiez vos filtres de recherche pour afficher les articles correspondants.'
                  : 'Commencez dès maintenant en ajoutant votre premier article importé de Dubaï.'}
              </p>
              <button
                onClick={() => handleOpenCreateModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Article Dubaï
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Article & Visuel</th>
                      <th className="py-3.5 px-4">Catégorie</th>
                      <th className="py-3.5 px-4 text-right">Prix Vente (FCFA)</th>
                      <th className="py-3.5 px-4 text-right">Coût Est. (AED)</th>
                      <th className="py-3.5 px-4">Délais Fret Aérien</th>
                      <th className="py-3.5 px-4 text-center">Disponibilité</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredDubaiProducts.map((p) => {
                      const estimatedAed = (p as any).aedPurchasePrice || Math.round(p.price / (dubaiGlobalAedRate || 168));
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3 min-w-[240px]">
                              <img
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=200&auto=format&fit=crop&q=80'}
                                alt={p.title}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-700/80 flex-shrink-0"
                              />
                              <div className="space-y-1">
                                <div className="font-bold text-white line-clamp-1">{p.title}</div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {p.badgeText && (
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      {p.badgeText}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Stock: {p.stockCount ?? 10}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                              {p.categoryName || 'Catalogue'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="font-black text-emerald-400 text-sm">
                              {p.price.toLocaleString('fr-FR')} FCFA
                            </div>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <div className="text-[10px] text-slate-500 line-through">
                                {p.originalPrice.toLocaleString('fr-FR')} FCFA
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="font-bold text-amber-300">
                              ~{estimatedAed} AED
                            </div>
                            <div className="text-[10px] text-slate-500">
                              au taux {dubaiGlobalAedRate}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-slate-200 text-[11px] font-medium">
                              <Plane className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{p.dubaiDeliveryDays || '7 à 10 jours ouvrés'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {p.dubaiBatchDate || 'Vol mardi & vendredi'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition ${
                                p.inStock
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              }`}
                            >
                              {p.inStock ? 'Disponible ✓' : 'Rupture ✕'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`/dubai`}
                                target="_blank"
                                rel="noreferrer"
                                title="Voir sur la boutique Dubaï"
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                title="Modifier l'article"
                                className="p-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                title="Supprimer l'article"
                                className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: INTERACTIVE CURRENCY CONVERTER & MARGIN SIMULATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Simulator Inputs Column */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Simulateur Achat Dubaï ➔ Vente Abidjan</h2>
                <p className="text-xs text-slate-400">Calcul automatique du coût d'achat brut, fret aérien au kg, douane et prix de vente conseillé.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Currency selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Devise d'achat locale</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'AED', label: '🇦🇪 AED', defaultRate: 168 },
                    { code: 'USD', label: '🇺🇸 USD', defaultRate: 615 },
                    { code: 'EUR', label: '🇪🇺 EUR', defaultRate: 655.95 }
                  ].map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => {
                        setCalcCurrency(curr.code as any);
                        setCalcRate(curr.defaultRate);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center ${
                        calcCurrency === curr.code
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exchange rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Taux de Change (1 {calcCurrency} = ? FCFA)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={calcRate}
                    onChange={(e) => setCalcRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">FCFA</span>
                </div>
              </div>

              {/* Purchase price */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300">Prix d'Achat Local ({calcCurrency})</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcAedPrice}
                    onChange={(e) => setCalcAedPrice(parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 250 AED"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-black text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    {calcCurrency}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[50, 120, 200, 350, 500, 1200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCalcAedPrice(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    >
                      {preset} {calcCurrency}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight in kg */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Poids Estimé (kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={calcWeightKg}
                    onChange={(e) => setCalcWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">KG</span>
                </div>
                <div className="text-[10px] text-slate-500">Parfum ~0.6kg, Abaya ~0.8kg, Montre ~0.4kg</div>
              </div>

              {/* Air Cargo rate per kg */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Fret Aérien (par kg)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcCargoPerKg}
                    onChange={(e) => setCalcCargoPerKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">FCFA/kg</span>
                </div>
                <div className="text-[10px] text-slate-500">Tarif standard DXB ➔ ABJ : 5 000 FCFA/kg</div>
              </div>

              {/* Customs & Handling */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Frais Douane & Dépotage</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcCustomsFee}
                    onChange={(e) => setCalcCustomsFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">FCFA</span>
                </div>
              </div>

              {/* Desired profit margin */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Marge Commerciale (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={calcMarginPercent}
                    onChange={(e) => setCalcMarginPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">%</span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {[20, 30, 35, 45, 60].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCalcMarginPercent(pct)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        calcMarginPercent === pct ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional product creation pre-fill */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Création rapide d'un article avec ce calcul</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nom de l'article (ex: Parfum Lattafa Asad 100ml)"
                  value={calcProductTitle}
                  onChange={(e) => setCalcProductTitle(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <select
                  value={calcTargetCategory}
                  onChange={(e) => setCalcTargetCategory(e.target.value)}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Sélectionner la catégorie cible...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-950 border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Résultat Financier Estimé</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  x{converterResults.multiplier} coef
                </span>
              </div>

              {/* Recommended Sale Price Box */}
              <div className="bg-slate-950/80 rounded-2xl p-5 border border-amber-500/30 text-center space-y-1">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prix de Vente Conseillé (TTC)</div>
                <div className="text-3xl md:text-4xl font-black text-amber-300">
                  {converterResults.recommendedSalePrice.toLocaleString('fr-FR')} <span className="text-sm font-bold text-white">FCFA</span>
                </div>
                <div className="text-xs text-slate-400">
                  Soit environ <strong className="text-amber-400">{(converterResults.recommendedSalePrice / (dubaiGlobalAedRate || 168)).toFixed(0)} AED</strong> au client final
                </div>
              </div>

              {/* Cost breakdown items */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    Coût d'achat brut ({calcAedPrice} {calcCurrency})
                  </span>
                  <span className="font-bold text-white">
                    {converterResults.purchaseCostFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-indigo-400" />
                    Fret Aérien ({calcWeightKg} kg)
                  </span>
                  <span className="font-bold text-white">
                    {converterResults.cargoCostFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Douane & Formalités
                  </span>
                  <span className="font-bold text-white">
                    {calcCustomsFee.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800 text-slate-200">
                  <span className="font-bold">📦 Coût de Revient Total Arrivé Abidjan</span>
                  <span className="font-extrabold text-white">
                    {converterResults.totalLandedCost.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Bénéfice Net Estimé ({converterResults.actualMarginPercent}%)
                  </span>
                  <span className="font-black text-sm">
                    +{converterResults.actualMarginFcfa.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleCreateProductFromConverter}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                <span>Créer le Produit avec ce Calcul</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: DUBAI CURATED CATEGORIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800/80 space-y-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Catégories Clés & Collections Prestigieuses de Dubaï</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
              Ces collections thématiques sont mises en avant sur la page publique <a href="/dubai" target="_blank" className="text-amber-400 underline">https://www.ivoireci.com/dubai</a>. Vous pouvez filtrer les articles existants ou créer un nouvel article directement dans la catégorie sélectionnée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DUBAI_LUXURY_COLLECTIONS.map((col) => {
              // Count matching products
              const matchingCount = dubaiProducts.filter((p) => {
                const titleLower = p.title.toLowerCase();
                const descLower = (p.description || '').toLowerCase();
                const catLower = (p.categoryName || '').toLowerCase();
                return col.nameKeywords.some((k) => titleLower.includes(k) || descLower.includes(k) || catLower.includes(k));
              }).length;

              return (
                <div
                  key={col.id}
                  className="group bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 transition flex flex-col justify-between space-y-5 shadow-xl hover:shadow-amber-950/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800">{col.icon}</span>
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        {col.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                      {col.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Articles en ligne :</span>
                      <span className="font-black text-white px-2 py-0.5 rounded-md bg-slate-800">
                        {matchingCount} articles
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSearchQuery(col.nameKeywords[0]);
                          setActiveSubTab('products');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition text-center"
                      >
                        Voir articles
                      </button>

                      <button
                        onClick={() => {
                          const targetCat = categories.find((c) => col.nameKeywords.some((k) => c.name.toLowerCase().includes(k)))?.id || (categories[0]?.id || '');
                          handleOpenCreateModal({
                            categoryId: targetCat,
                            badgeText: col.badge,
                            aed: col.defaultAed,
                            price: Math.ceil((col.defaultAed * (dubaiGlobalAedRate || 168) * 1.35) / 500) * 500
                          });
                        }}
                        className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition text-center flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SETTINGS & FLIGHT SCHEDULE */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && (
        <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Paramètres Logistique & Page Dubaï</h2>
              <p className="text-xs text-slate-400">Configurez l'affichage public, le planning des vols cargo et le taux de change de base.</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            
            {/* Toggle Dubai Page */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>Activer / Désactiver la Page Espace Dubaï VIP</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    dubaiEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {dubaiEnabled ? '🟢 EN LIGNE' : '🔴 HORS-LIGNE'}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {dubaiEnabled
                    ? 'La page /dubai est actuellement ouverte et visible par tous les clients.'
                    : 'La page /dubai est suspendue et affiche un message de maintenance.'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleDubaiPage}
                disabled={isTogglingDubai}
                className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors cursor-pointer border-2 focus:outline-none ${
                  dubaiEnabled ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    dubaiEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Page Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Titre Public de l'Espace Dubaï</label>
              <input
                type="text"
                value={dubaiTitle}
                onChange={(e) => setDubaiTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Page Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Sous-titre Promotionnel</label>
              <textarea
                rows={2}
                value={dubaiSubtitle}
                onChange={(e) => setDubaiSubtitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Flight Schedule */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-amber-400" />
                <span>Date & Fréquence du Prochain Vol Cargo</span>
              </label>
              <input
                type="text"
                value={dubaiNextFlight}
                onChange={(e) => setDubaiNextFlight(e.target.value)}
                placeholder="Ex: Vol Cargo chaque mardi & vendredi"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-amber-500"
              />
              <div className="text-[10px] text-slate-500">
                Ce texte s'affiche en bandeau d'alerte et sur chaque fiche produit pour rassurer l'acheteur sur la date d'expédition.
              </div>
            </div>

            {/* Global AED Exchange Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Taux de Change Global par Défaut (1 AED = ? FCFA)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={dubaiGlobalAedRate}
                  onChange={(e) => setDubaiGlobalAedRate(parseFloat(e.target.value) || 168)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  FCFA / AED
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                Taux moyen du marché : ~165 à 170 FCFA pour 1 Dirham émirati.
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="button"
                disabled={isSavingSettings}
                onClick={handleSaveDubaiSettings}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{isSavingSettings ? 'Enregistrement en cours...' : "Sauvegarder les Paramètres Dubaï"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT CREATION / EDIT MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isEditing ? "Modifier l'Article Dubaï" : "Nouvel Article en Précommande Dubaï 🇦🇪"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ce produit sera tagué <code className="text-amber-400">isDubaiPreorder: true</code> et publié sur <code className="text-amber-400">/dubai</code>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Quick AED Conversion Helper Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Coins className="w-4 h-4" />
                    Calculateur Express Devises AED ➔ FCFA
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowModalCalculator(!showModalCalculator)}
                    className="text-[11px] font-bold text-amber-400 hover:underline"
                  >
                    {showModalCalculator ? 'Masquer' : 'Ouvrir le convertisseur'}
                  </button>
                </div>

                {showModalCalculator && (
                  <div className="pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300">Prix d'Achat (AED)</label>
                      <input
                        type="number"
                        value={quickAedInput}
                        onChange={(e) => setQuickAedInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-300">Forfait Fret Aérien</label>
                      <input
                        type="number"
                        value={quickCargoFee}
                        onChange={(e) => setQuickCargoFee(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1 flex flex-col justify-end">
                      <button
                        type="button"
                        onClick={handleApplyQuickAedCalculation}
                        className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
                      >
                        Appliquer au prix
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300">Titre de l'article *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lattafa Khamrah Qahwa 100ml Original Dubaï"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Catégorie *</label>
                  <select
                    required
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Badge VIP</label>
                  <input
                    type="text"
                    placeholder="Ex: 🇦🇪 Arrivage Dubaï"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Pricing & AED */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Prix de Vente (FCFA) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Ex: 35000"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-black focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Prix Barré (Optionnel FCFA)</label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="Ex: 45000"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Équivalent Dubaï (AED)</label>
                  <input
                    type="number"
                    value={formAedPrice}
                    onChange={(e) => setFormAedPrice(e.target.value)}
                    placeholder="Ex: 210"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Delivery Days & Cargo Flight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Délais de Livraison Fret</label>
                  <input
                    type="text"
                    value={formDeliveryDays}
                    onChange={(e) => setFormDeliveryDays(e.target.value)}
                    placeholder="Ex: 7 à 10 jours ouvrés"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Planning Vol Cargo</label>
                  <input
                    type="text"
                    value={formBatchDate}
                    onChange={(e) => setFormBatchDate(e.target.value)}
                    placeholder="Ex: Prochain vol cargo ce mardi"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Image Input & Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Image de l'article (URL ou Téléversement)</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Téléverser</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {formImageUrl && (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700 mt-2">
                    <img src={formImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Description Détaillée</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Notes olfactives, caractéristiques du tissu, garantie..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Availability Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-white">Disponible en précommande</span>
                <button
                  type="button"
                  onClick={() => setFormInStock(!formInStock)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    formInStock ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition" />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isEditing ? 'Enregistrer les modifications' : "Publier l'Article Dubaï"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
