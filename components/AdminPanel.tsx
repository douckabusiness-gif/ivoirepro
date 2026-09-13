'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore, AppView } from '@/lib/storeContext';
import { Product, Category, Subcategory, Order, OrderStatus, PaymentStatus, FAQItem, StoreSettings, HeroSlideItem, InGridBannerItem } from '@/lib/types';
import { DEFAULT_SPECIALIZED_AGENTS, SPECIALIZED_AGENTS, getSpecializedAgentsList, SpecializedAgent, SpecializedAgentId } from '@/lib/agentOrchestrator';
import { processUploadedIcon, processUploadedImage, processUploadedLogo } from '@/lib/imageUtils';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  MessageCircle, 
  Settings, 
  FileEdit, 
  Eye, 
  EyeOff,
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Save, 
  TrendingUp, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  Layers, 
  Globe, 
  Phone, 
  PhoneCall,
  PhoneOff,
  Radio,
  Volume2,
  Mail, 
  Sparkles,
  Lock,
  LogOut,
  ChevronRight,
  Search,
  Filter,
  Image as ImageIcon,
  Upload,
  Palette,
  Paintbrush,
  Sliders,
  CheckCircle2,
  Menu,
  ChevronDown,
  FolderTree,
  Tag,
  FolderPlus,
  Folder,
  ListTree,
  Grid,
  ArrowRight,
  ChevronUp,
  Camera,
  UploadCloud,
  Star,
  Copy,
  Link as LinkIcon,
  Sun,
  Moon,
  Clock,
  CheckCircle,
  Truck,
  Flame,
  HelpCircle,
  MapPin,
  FileText,
  MessageSquare,
  Bot,
  Cpu,
  Zap,
  Wand2,
  Lightbulb,
  Send,
  UserCheck,
  Gift,
  BadgePercent,
  Share2,
  Crown,
  Percent,
  RotateCcw,
  ArrowLeft,
  Bike,
  Smartphone,
  Monitor,
  Banknote,
  Landmark,
  Wallet,
  Film
} from 'lucide-react';
import { ChatMessage, ChatConversation } from '@/lib/types';
import { initialStoreSettings } from '@/lib/initialData';
import { MarketingStudio } from '@/components/MarketingStudio';
import { AdminPartnersManager } from '@/components/AdminPartnersManager';
import { AdminDeliveryManager } from '@/components/AdminDeliveryManager';
import { AdminBannerStudio } from '@/components/AdminBannerStudio';
import { InGridPromoBanner } from '@/components/InGridPromoBanner';
import { AdminTeamManager } from '@/components/AdminTeamManager';
import { AdminLoginScreen } from '@/components/AdminLoginScreen';
import { AdminAnalyticsDashboard } from '@/components/AdminAnalyticsDashboard';
import { AdminPasswordSecurity } from '@/components/AdminPasswordSecurity';
import { isValidGoogleAnalyticsId, normalizeGoogleAnalyticsId } from '@/lib/googleAnalytics';
import { UserRole, ROLE_DEFINITIONS } from '@/lib/types';
import { SITE_THEME_PRESETS, SiteThemeName, normalizeHexColor } from '@/lib/siteTheme';

export const AdminPanel = () => {
  const {
    settings,
    updateSettings,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    formatPrice,
    setCurrentView,
    setSelectedProductId,
    setSelectedCategoryFilter,
    isAdminAuthenticated,
    adminEmail,
    loginWithGoogle,
    loginAsDemoAdmin,
    logoutAdmin,
    resetToDemoData,
    isSyncing,
    isDarkMode,
    toggleDarkMode,
    chatConversations,
    unreadAdminChatCount,
    sendAdminChatMessage,
    markChatAsRead,
    deleteChatConversation,
    deliveryPersons,
    currentUser,
    teamMembers,
    effectiveRole,
    openFeed,
    activeCall,
    startWebCall,
    simulateIncomingCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endWebCall
  } = useStore();

  // Admin Active Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'analytics' | 'chat' | 'agent' | 'products' | 'categories' | 'orders' | 'delivery' | 'banners' | 'partners' | 'marketing' | 'payments' | 'whatsapp' | 'branding' | 'appearance' | 'cms' | 'pages-explorer' | 'settings' | 'team'
  >('dashboard');

  // Store Settings Local State & Sub-pages
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  const [settingsSubTab, setSettingsSubTab] = useState<'store' | 'ai' | 'shipping' | 'legal' | 'maintenance' | 'pages' | 'smtp' | 'telegram' | 'seo' | 'security'>('store');
  const [paymentSubTab, setPaymentSubTab] = useState<'cod' | 'mobile_money' | 'cards' | 'bank'>('cod');

  // SMTP Email Server & Test State
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>(settings.contactEmail || '');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState<boolean>(false);
  const [isSendingTelegramTest, setIsSendingTelegramTest] = useState<boolean>(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [isSettingUpTelegramWebhook, setIsSettingUpTelegramWebhook] = useState<boolean>(false);
  const [telegramWebhookResult, setTelegramWebhookResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [showTelegramBotToken, setShowTelegramBotToken] = useState<boolean>(false);

  // CMS & Legal Pages States
  const [cmsSubTab, setCmsSubTab] = useState<'privacy' | 'terms' | 'returns' | 'delivery' | 'about' | 'contact'>('privacy');
  const [cmsPreviewMode, setCmsPreviewMode] = useState<boolean>(false);
  const [legalSubPageTab, setLegalSubPageTab] = useState<'about' | 'terms' | 'privacy' | 'returns' | 'delivery' | 'contact'>('about');
  const [legalPreviewMode, setLegalPreviewMode] = useState<boolean>(false);

  const handleInsertClause = (field: 'privacyText' | 'termsText' | 'returnPolicyText' | 'deliveryPolicyText' | 'aboutUsText', clauseText: string) => {
    const current = (localSettings[field] || '').trim();
    const updated = current ? `${current}\n\n${clauseText}` : clauseText;
    setLocalSettings({ ...localSettings, [field]: updated });
    setSaveSuccessMsg('Clause juridique insérée avec succès !');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  const handleResetToLegalTemplate = (field: 'privacyText' | 'termsText' | 'returnPolicyText' | 'deliveryPolicyText' | 'aboutUsText') => {
    if (confirm("Réinitialiser ce texte avec le modèle juridique officiel certifié ?")) {
      const defaultText = (initialStoreSettings as any)[field] || '';
      setLocalSettings({ ...localSettings, [field]: defaultText });
      setSaveSuccessMsg('Modèle officiel sénégalais rétabli !');
      setTimeout(() => setSaveSuccessMsg(''), 2500);
    }
  };

  const [isGeneratingAiProduct, setIsGeneratingAiProduct] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Marketing Tab State
  const [marketingTopic, setMarketingTopic] = useState('Offres Spéciales Ventes Flash du Week-end');
  const [marketingTone, setMarketingTone] = useState<'flash' | 'luxe' | 'relance' | 'fetes'>('flash');
  const [marketingAiOutput, setMarketingAiOutput] = useState<string | null>(null);
  const [isGeneratingMarketingCopy, setIsGeneratingMarketingCopy] = useState(false);
  const [copiedMarketingText, setCopiedMarketingText] = useState<string | null>(null);

  // Specialized Agents Management State
  const [editingAgent, setEditingAgent] = useState<SpecializedAgent | null>(null);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [agentModalData, setAgentModalData] = useState<Partial<SpecializedAgent>>({});
  const [agentModalNewTrigger, setAgentModalNewTrigger] = useState('');
  const [agentActionSuccessMsg, setAgentActionSuccessMsg] = useState('');

  const currentAgentsList = getSpecializedAgentsList(localSettings);

  const handleOpenEditAgent = (agent: SpecializedAgent) => {
    setEditingAgent(agent);
    setIsCreatingAgent(false);
    setAgentModalData({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      avatar: agent.avatar,
      color: agent.color,
      badge: agent.badge,
      temperature: agent.temperature,
      description: agent.description,
      sampleTriggers: [...(agent.sampleTriggers || [])],
      systemPromptTemplate: agent.systemPromptTemplate,
      enabled: agent.enabled !== false,
      isCustom: agent.isCustom
    });
    setAgentModalNewTrigger('');
  };

  const handleOpenCreateAgent = () => {
    setEditingAgent(null);
    setIsCreatingAgent(true);
    setAgentModalData({
      name: '',
      role: 'Conseiller IA Spécialisé',
      avatar: '🛍️',
      color: 'from-indigo-500 to-purple-600',
      badge: 'NOUVEL AGENT',
      temperature: 0.7,
      description: 'Conseille les clients et valorise le catalogue.',
      sampleTriggers: ['conseil', 'recommandation', 'achat'],
      systemPromptTemplate: `Tu es un conseiller commercial d'élite pour la boutique {storeName}.\nConseille les clients avec précision, chaleur et persuasion en Franc CFA (FCFA).`,
      enabled: true,
      isCustom: true
    });
    setAgentModalNewTrigger('');
  };

  const handleCloseAgentModal = () => {
    setEditingAgent(null);
    setIsCreatingAgent(false);
    setAgentModalData({});
    setAgentModalNewTrigger('');
  };

  const handleSaveAgentModal = async () => {
    if (!agentModalData.name?.trim()) {
      alert("Veuillez renseigner au moins le nom de l'agent.");
      return;
    }

    const currentList = getSpecializedAgentsList(localSettings);
    let updatedList: SpecializedAgent[];

    if (editingAgent) {
      updatedList = currentList.map(a => 
        a.id === editingAgent.id ? { ...a, ...agentModalData, name: agentModalData.name!.trim() } as SpecializedAgent : a
      );
    } else {
      const newId = `agent-custom-${Date.now()}`;
      const newAgent: SpecializedAgent = {
        id: newId,
        name: agentModalData.name.trim(),
        role: agentModalData.role?.trim() || 'Conseiller IA Spécialisé',
        avatar: agentModalData.avatar?.trim() || '🤖',
        color: agentModalData.color || 'from-indigo-500 to-purple-600',
        badge: agentModalData.badge?.trim() || 'EXPERT IA',
        temperature: agentModalData.temperature ?? 0.7,
        description: agentModalData.description?.trim() || 'Agent IA personnalisé.',
        sampleTriggers: agentModalData.sampleTriggers || [],
        systemPromptTemplate: agentModalData.systemPromptTemplate?.trim() || `Tu es ${agentModalData.name}, conseiller pour {storeName}.`,
        enabled: agentModalData.enabled !== false,
        isCustom: true
      };
      updatedList = [...currentList, newAgent];
    }

    const updatedSettings = { ...localSettings, customAgents: updatedList };
    setLocalSettings(updatedSettings);
    await updateSettings({ customAgents: updatedList });
    handleCloseAgentModal();
    setAgentActionSuccessMsg(editingAgent ? `Paramètres de l'agent "${agentModalData.name}" enregistrés !` : `Nouvel agent "${agentModalData.name}" créé avec succès !`);
    setTimeout(() => setAgentActionSuccessMsg(''), 3500);
  };

  const handleToggleAgent = async (agentId: string) => {
    const currentList = getSpecializedAgentsList(localSettings);
    const updatedList = currentList.map(a => 
      a.id === agentId ? { ...a, enabled: a.enabled === false ? true : false } : a
    );
    const updatedSettings = { ...localSettings, customAgents: updatedList };
    setLocalSettings(updatedSettings);
    await updateSettings({ customAgents: updatedList });
    setAgentActionSuccessMsg("Statut de l'agent mis à jour !");
    setTimeout(() => setAgentActionSuccessMsg(''), 3000);
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'agent "${agentName}" ?`)) {
      const currentList = getSpecializedAgentsList(localSettings);
      const updatedList = currentList.filter(a => a.id !== agentId);
      const updatedSettings = { ...localSettings, customAgents: updatedList };
      setLocalSettings(updatedSettings);
      await updateSettings({ customAgents: updatedList });
      setAgentActionSuccessMsg(`Agent "${agentName}" supprimé avec succès.`);
      setTimeout(() => setAgentActionSuccessMsg(''), 3000);
    }
  };

  const handleResetDefaultAgents = async () => {
    if (confirm("Réinitialiser tous les agents aux 5 agents officiels d'origine (Amara, Malik, Aïda, Cheikh, Fatou) ?")) {
      const defaultList = Object.values(DEFAULT_SPECIALIZED_AGENTS);
      const updatedSettings = { ...localSettings, customAgents: defaultList };
      setLocalSettings(updatedSettings);
      await updateSettings({ customAgents: defaultList });
      setAgentActionSuccessMsg("Tous les agents ont été réinitialisés aux réglages d'origine.");
      setTimeout(() => setAgentActionSuccessMsg(''), 3500);
    }
  };

  const handleAddTriggerTag = () => {
    const trigger = agentModalNewTrigger.trim().toLowerCase();
    if (!trigger) return;
    const currentTriggers = agentModalData.sampleTriggers || [];
    if (!currentTriggers.includes(trigger)) {
      setAgentModalData({
        ...agentModalData,
        sampleTriggers: [...currentTriggers, trigger]
      });
    }
    setAgentModalNewTrigger('');
  };

  const handleRemoveTriggerTag = (indexToRemove: number) => {
    const currentTriggers = agentModalData.sampleTriggers || [];
    setAgentModalData({
      ...agentModalData,
      sampleTriggers: currentTriggers.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setTestEmailResult({ success: false, error: 'Veuillez saisir une adresse email de test valide.' });
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testEmail: testEmailRecipient,
          smtpHost: localSettings.smtpHost,
          smtpPort: localSettings.smtpPort,
          smtpSecure: localSettings.smtpSecure,
          smtpUser: localSettings.smtpUser,
          smtpPass: localSettings.smtpPass,
          smtpFromName: localSettings.smtpFromName,
          smtpFromEmail: localSettings.smtpFromEmail,
          smtpEnabled: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({ success: true, message: data.message });
      } else {
        setTestEmailResult({ success: false, error: data.error || 'Échec de l\'envoi du test SMTP' });
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, error: err.message || 'Erreur réseau' });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSendTelegramTest = async () => {
    if (!localSettings.telegramBotToken?.trim() || !localSettings.telegramChatId?.trim()) {
      setTelegramTestResult({ success: false, error: 'Renseignez le token du bot et le Chat ID avant le test.' });
      return;
    }

    setIsSendingTelegramTest(true);
    setTelegramTestResult(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: localSettings.storeName,
          telegramBotToken: localSettings.telegramBotToken,
          telegramChatId: localSettings.telegramChatId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTelegramTestResult({ success: true, message: data.message || 'Message de test envoyé sur Telegram.' });
      } else {
        setTelegramTestResult({ success: false, error: data.error || 'Échec de l\'envoi du test Telegram.' });
      }
    } catch (err: any) {
      setTelegramTestResult({ success: false, error: err?.message || 'Erreur réseau pendant le test Telegram.' });
    } finally {
      setIsSendingTelegramTest(false);
    }
  };

  const handleSetupTelegramWebhook = async () => {
    setIsSettingUpTelegramWebhook(true);
    setTelegramWebhookResult(null);
    try {
      const res = await fetch('/api/telegram/setup-webhook', {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setTelegramWebhookResult({ success: true, message: data.message || 'Webhook Telegram activé avec succès !' });
      } else {
        setTelegramWebhookResult({ success: false, error: data.error || 'Échec de l\'activation du webhook Telegram.' });
      }
    } catch (err: any) {
      setTelegramWebhookResult({ success: false, error: err?.message || 'Erreur réseau lors de la configuration du webhook.' });
    } finally {
      setIsSettingUpTelegramWebhook(false);
    }
  };

  // Live Chat Console State
  const [selectedChatConvId, setSelectedChatConvId] = useState<string | null>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [adminChatInput, setAdminChatInput] = useState('');
  const [activeConvMessages, setActiveConvMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic AI Models & Provider State
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelFetchSource, setModelFetchSource] = useState<string | null>(null);
  const [modelFetchError, setModelFetchError] = useState<string | null>(null);

  // Helper to get active API key for current provider
  const getActiveApiKey = (provider: string, s: typeof localSettings) => {
    switch (provider) {
      case 'groq': return s.groqApiKey || '';
      case 'gemini': return s.geminiApiKey || '';
      case 'openai': return s.openaiApiKey || '';
      case 'deepseek': return s.deepseekApiKey || '';
      case 'claude': return s.claudeApiKey || '';
      case 'glm': return s.glmApiKey || '';
      default: return '';
    }
  };

  const fetchModelsForProvider = async (provider: string, apiKey?: string) => {
    setAvailableModels([]);
    setModelFetchSource(null);
    setIsLoadingModels(true);
    setModelFetchError(null);

    if (provider !== 'local' && !apiKey?.trim()) {
      setModelFetchError(`Renseignez d’abord la clé API ${provider.toUpperCase()}, puis récupérez les modèles réels.`);
      setLocalSettings(prev => ({ ...prev, aiModel: '' }));
      setIsLoadingModels(false);
      return;
    }

    try {
      const res = await fetch('/api/agent/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey })
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.models)) {
        const models = data.models as { id: string; name: string; description?: string }[];
        setAvailableModels(models);
        setModelFetchSource(
          data.source === 'live_api'
            ? 'Modèles réels récupérés via votre clé API ⚡'
            : data.source === 'local'
              ? 'Mode local actif : aucun modèle API'
              : 'Catalogue réel du fournisseur'
        );
        setLocalSettings(prev => {
          const currentModel = prev.aiModel?.trim();
          const stillAvailable = currentModel && currentModel !== 'auto' && models.some(model => model.id === currentModel);
          return stillAvailable ? prev : { ...prev, aiModel: '' };
        });
      } else {
        setAvailableModels([]);
        setLocalSettings(prev => ({ ...prev, aiModel: '' }));
        setModelFetchError(data.error || 'Erreur récupération modèles');
      }
    } catch (err: any) {
      setAvailableModels([]);
      setLocalSettings(prev => ({ ...prev, aiModel: '' }));
      setModelFetchError(err?.message || 'Erreur de connexion');
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Auto-fetch models when provider changes
  useEffect(() => {
    const prov = localSettings.aiProvider || 'gemini';
    const key = getActiveApiKey(prov, localSettings);
    fetchModelsForProvider(prov, key);
  }, [localSettings.aiProvider]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedChatConvId && chatConversations.length > 0) {
      setSelectedChatConvId(chatConversations[0].id);
    }
  }, [chatConversations, selectedChatConvId]);

  // Fetch messages for selected conversation & mark as read
  const fetchSelectedConvMessages = async (convId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConvMessages(data.messages || []);
      }
      await markChatAsRead(convId, 'admin');
    } catch (err) {
      console.error('Failed to load conv messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedChatConvId) {
      fetchSelectedConvMessages(selectedChatConvId);
      const interval = setInterval(() => {
        if (selectedChatConvId) {
          fetchSelectedConvMessages(selectedChatConvId);
        }
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [selectedChatConvId]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvMessages]);

  const handleAdminSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatConvId || !adminChatInput.trim()) return;
    const textToSend = adminChatInput.trim();
    setAdminChatInput('');
    await sendAdminChatMessage(selectedChatConvId, textToSend);
    await fetchSelectedConvMessages(selectedChatConvId);
  };

  // Mobile lateral sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Category & Subcategory Management State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    iconName: 'Grid'
  });

  const [addingSubForCatId, setAddingSubForCatId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<{ categoryId: string; subId: string } | null>(null);
  const [subcategoryForm, setSubcategoryForm] = useState<{ name: string; description: string; image?: string }>({
    name: '',
    description: '',
    image: ''
  });

  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');

  // Products Table Filter by Category & Subcategory
  const [filterCategoryInProducts, setFilterCategoryInProducts] = useState<string>('all');
  const [filterSubcategoryInProducts, setFilterSubcategoryInProducts] = useState<string>('all');
  const [filterStockInProducts, setFilterStockInProducts] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');

  // Product Form State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    description: '',
    shortDescription: '',
    price: 15000,
    originalPrice: 20000,
    categoryId: categories[0]?.id || '',
    subcategoryId: undefined,
    subcategoryName: undefined,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    stockCount: 10,
    inStock: true,
    featured: true,
    isNew: true,
    isFlashSale: false,
    rating: 4.9,
    reviewCount: 5,
    badgeText: 'NOUVEAU',
    colors: ['Noir', 'Argent'],
    sizes: []
  });

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [productImageError, setProductImageError] = useState('');
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [isUploadingSubcategoryImage, setIsUploadingSubcategoryImage] = useState(false);
  const [isSavingCatalog, setIsSavingCatalog] = useState(false);

  // File Inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pwaIconFileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const subcategoryFileInputRef = useRef<HTMLInputElement>(null);

  // Local Settings UI Feedback
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [logoUploadError, setLogoUploadError] = useState('');
  const [pwaIconUploadError, setPwaIconUploadError] = useState('');
  const [copiedAdminUrl, setCopiedAdminUrl] = useState(false);

  // Orders Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Sync localSettings with settings
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  React.useEffect(() => {
    if (editingProductId || categories.length === 0) return;
    setProductForm((current) => {
      if (categories.some((category) => category.id === current.categoryId)) return current;
      return {
        ...current,
        categoryId: categories[0].id,
        subcategoryId: undefined,
        subcategoryName: undefined,
      };
    });
  }, [categories, editingProductId]);

  // Copy Admin URL
  const handleCopyAdminUrl = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/admin`;
      navigator.clipboard.writeText(url);
      setCopiedAdminUrl(true);
      setTimeout(() => setCopiedAdminUrl(false), 2000);
    }
  };

  // Calculations for Dashboard
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;
  const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'delivered').length;
  const lowStockProducts = products.filter(p => p.stockCount <= 5);
  const totalSubcategoriesCount = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);

  const handleSaveSettings = async () => {
    setLogoUploadError('');
    setPwaIconUploadError('');
    const googleAnalyticsId = normalizeGoogleAnalyticsId(localSettings.seoGoogleAnalyticsId);
    if (!isValidGoogleAnalyticsId(googleAnalyticsId)) return;
    const settingsToSave = { ...localSettings, seoGoogleAnalyticsId: googleAnalyticsId };
    setLocalSettings(settingsToSave);
    try {
      // Logo and PWA icon can be large data URLs. Save only changed media in
      // dedicated requests so the regular settings payload stays compact.
      const mediaChanges: Array<[keyof Pick<StoreSettings, 'storeLogoUrl' | 'pwaIconUrl'>, string]> = [];
      if (settingsToSave.storeLogoUrl !== settings.storeLogoUrl) {
        mediaChanges.push(['storeLogoUrl', settingsToSave.storeLogoUrl || '']);
      }
      if (settingsToSave.pwaIconUrl !== settings.pwaIconUrl) {
        mediaChanges.push(['pwaIconUrl', settingsToSave.pwaIconUrl || '']);
      }

      for (const [field, value] of mediaChanges) {
        const mediaResponse = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        });
        if (!mediaResponse.ok) {
          const mediaError = await mediaResponse.json().catch(() => null);
          throw new Error(mediaError?.error || `Impossible d'enregistrer ${field}.`);
        }
      }

      const saved = await updateSettings(settingsToSave);
      if (!saved) {
        throw new Error('Les autres paramètres n’ont pas pu être enregistrés.');
      }

      if (typeof window !== 'undefined') {
        // Refresh browser metadata immediately after a branding change.
        const iconHref = settingsToSave.pwaIconUrl ? `/api/pwa/icon?v=${Date.now()}` : '/icons/icon-192x192.svg';
        document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => {
          link.href = iconHref;
        });
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.update()));
          } catch (error) {
            console.warn('Impossible de vérifier immédiatement la mise à jour PWA:', error);
          }
        }
      }
      setSaveSuccessMsg('Paramètres enregistrés et synchronisés avec succès !');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (error: any) {
      const message = error?.message || 'La sauvegarde a échoué. Réduisez la taille du logo ou utilisez une URL image.';
      setLogoUploadError(message);
      setPwaIconUploadError(message);
      return;
    }
  };

  const handleApplySiteTheme = (theme: SiteThemeName) => {
    if (theme === 'custom') {
      setLocalSettings(prev => ({ ...prev, homeTheme: 'custom', heroTheme: 'custom' }));
      return;
    }

    const preset = SITE_THEME_PRESETS[theme];
    setLocalSettings(prev => ({
      ...prev,
      homeTheme: theme,
      heroTheme: preset.heroTheme,
      siteHeaderColor: preset.headerColor,
      siteFooterColor: preset.footerColor,
      siteBodyColor: preset.bodyColor,
    }));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryForm.name?.trim() || '';
    if (!name) {
      setSaveErrorMsg('Le nom du rayon est obligatoire.');
      return;
    }

    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    setIsSavingCatalog(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, {
          name,
          description: categoryForm.description?.trim() || '',
          image: categoryForm.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          iconName: categoryForm.iconName || 'Grid'
        });
        setSaveSuccessMsg(`Rayon "${name}" mis à jour avec succès !`);
      } else {
        await addCategory({
          name,
          slug: name,
          description: categoryForm.description?.trim() || '',
          image: categoryForm.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          iconName: categoryForm.iconName || 'Grid',
          subcategories: []
        });
        setSaveSuccessMsg(`Nouveau rayon "${name}" créé avec succès !`);
      }

      setIsAddingCategory(false);
      setEditingCategoryId(null);
      setCategoryForm({ name: '', description: '', image: '', iconName: 'Grid' });
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (error: any) {
      setSaveErrorMsg(error?.message || 'Impossible d’enregistrer le rayon.');
    } finally {
      setIsSavingCatalog(false);
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent, categoryId: string) => {
    e.preventDefault();
    const name = subcategoryForm.name.trim();
    if (!name) {
      setSaveErrorMsg('Le nom de la sous-catégorie est obligatoire.');
      return;
    }

    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    setIsSavingCatalog(true);
    try {
      if (editingSubId && editingSubId.categoryId === categoryId) {
        await updateSubcategory(categoryId, editingSubId.subId, {
          name,
          description: subcategoryForm.description.trim(),
          image: subcategoryForm.image || undefined
        });
        setSaveSuccessMsg(`Sous-catégorie "${name}" mise à jour !`);
      } else {
        await addSubcategory(categoryId, {
          name,
          description: subcategoryForm.description.trim(),
          image: subcategoryForm.image || undefined
        });
        setSaveSuccessMsg(`Sous-catégorie "${name}" créée et ajoutée au rayon !`);
      }

      setAddingSubForCatId(null);
      setEditingSubId(null);
      setSubcategoryForm({ name: '', description: '', image: '' });
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (error: any) {
      setSaveErrorMsg(error?.message || 'Impossible d’enregistrer la sous-catégorie.');
    } finally {
      setIsSavingCatalog(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    setLogoUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoUploadError('L\'image dépasse la taille maximale recommandée de 2 Mo.');
      return;
    }

    try {
      const dataUrl = await processUploadedLogo(file);
      if (dataUrl.length > 900_000) {
        throw new Error('Le logo reste trop volumineux après compression. Utilisez une image plus légère ou un lien URL.');
      }
      setLocalSettings(prev => ({ ...prev, storeLogoUrl: dataUrl }));
      setSaveSuccessMsg('Image chargée ! Cliquez sur "Sauvegarder le Logo" pour l\'appliquer.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      setLogoUploadError(err?.message || 'Erreur lors de la lecture du fichier image.');
    } finally {
      input.value = '';
    }
  };

  const handlePwaIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwaIconUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPwaIconUploadError('Veuillez sélectionner un fichier image valide (PNG, JPG, WebP ou SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPwaIconUploadError('L\'image dépasse la taille maximale recommandée de 2 Mo.');
      return;
    }

    try {
      // PWA icons are kept compact while preserving the uploaded artwork.
      const dataUrl = await processUploadedIcon(file, 512);
      setLocalSettings(prev => ({ ...prev, pwaIconUrl: dataUrl }));
      setSaveSuccessMsg('Icône PWA chargée ! Cliquez sur « Sauvegarder le Logo » pour l\'appliquer.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      setPwaIconUploadError(err?.message || 'Erreur lors du traitement de l\'icône PWA.');
    }
  };

  // Product Images Upload Handler
  const handleProductFilesUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setProductImageError('');
    setIsUploadingProductImage(true);

    try {
      const fileArray = Array.from(files);
      const newImages: string[] = [];

      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          setProductImageError('Certains fichiers ignorés : seuls les formats image (JPG, PNG, WebP, GIF) sont supportés.');
          continue;
        }
        const dataUrl = await processUploadedImage(file, 1200, 1200, 0.85);
        newImages.push(dataUrl);
      }

      if (newImages.length > 0) {
        setProductForm(prev => {
          const currentImages = prev.images || [];
          return {
            ...prev,
            images: [...currentImages, ...newImages]
          };
        });
        setSaveSuccessMsg(`${newImages.length} photo(s) importée(s) avec succès !`);
        setTimeout(() => setSaveSuccessMsg(''), 3500);
      }
    } catch (err: any) {
      setProductImageError(err?.message || 'Erreur lors du traitement des images.');
    } finally {
      setIsUploadingProductImage(false);
    }
  };

  const handleRemoveProductImage = (indexToRemove: number) => {
    setProductForm(prev => {
      const current = prev.images || [];
      const updated = current.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, images: updated };
    });
  };

  const handleSetPrimaryProductImage = (indexToPrimary: number) => {
    setProductForm(prev => {
      const current = [...(prev.images || [])];
      if (indexToPrimary >= 0 && indexToPrimary < current.length) {
        const [item] = current.splice(indexToPrimary, 1);
        current.unshift(item);
      }
      return { ...prev, images: current };
    });
  };

  const handleAddCustomImageUrl = () => {
    if (!customUrlInput.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...(prev.images || []), customUrlInput.trim()]
    }));
    setCustomUrlInput('');
  };

  // Category & Subcategory Image Upload
  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCategoryImage(true);
    try {
      const dataUrl = await processUploadedImage(file, 1000, 1000, 0.85);
      setCategoryForm(prev => ({ ...prev, image: dataUrl }));
      setSaveSuccessMsg('Image de rayon importée !');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de l\'import de l\'image de rayon.');
    } finally {
      setIsUploadingCategoryImage(false);
    }
  };

  const handleSubcategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSubcategoryImage(true);
    try {
      const dataUrl = await processUploadedImage(file, 800, 800, 0.85);
      setSubcategoryForm(prev => ({ ...prev, image: dataUrl }));
      setSaveSuccessMsg('Image de sous-catégorie importée !');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (err: any) {
      alert(err?.message || 'Erreur lors de l\'import de l\'image de sous-catégorie.');
    } finally {
      setIsUploadingSubcategoryImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = productForm.title?.trim() || '';
    const price = Number(productForm.price);
    const stockCount = Number(productForm.stockCount ?? 10);
    const currentCat = categories.find(c => c.id === productForm.categoryId);
    if (!title || !Number.isFinite(price) || price <= 0 || !currentCat) {
      setSaveErrorMsg('Renseignez un titre, un prix supérieur à zéro et sélectionnez un rayon existant.');
      return;
    }
    if (!Number.isInteger(stockCount) || stockCount < 0) {
      setSaveErrorMsg('La quantité en stock doit être un nombre entier positif ou nul.');
      return;
    }

    const defaultImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
    const finalImages = (productForm.images && productForm.images.length > 0) ? productForm.images : [defaultImg];

    const categoryName = currentCat.name;
    
    let subcategoryName = productForm.subcategoryName;
    if (productForm.subcategoryId && !subcategoryName) {
      const currentSub = currentCat?.subcategories?.find(s => s.id === productForm.subcategoryId);
      subcategoryName = currentSub?.name;
    }

    const productPayload = {
      title,
      description: productForm.description || '',
      shortDescription: productForm.shortDescription || productForm.description?.slice(0, 100) || '',
      price,
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      categoryId: productForm.categoryId,
      categoryName,
      subcategoryId: productForm.subcategoryId || undefined,
      subcategoryName: subcategoryName || undefined,
      images: finalImages,
      stockCount,
      inStock: stockCount > 0,
      featured: Boolean(productForm.featured),
      isNew: Boolean(productForm.isNew),
      isFlashSale: Boolean(productForm.isFlashSale),
      discountPercent: productForm.discountPercent ? Number(productForm.discountPercent) : undefined,
      flashSaleEndsAt: productForm.flashSaleEndsAt,
      badgeText: productForm.badgeText || (productForm.isFlashSale ? 'PROMO' : productForm.isNew ? 'NOUVEAU' : undefined),
      rating: productForm.rating ?? 4.9,
      reviewCount: productForm.reviewCount ?? 8,
      colors: productForm.colors || [],
      sizes: productForm.sizes || [],
      tags: productForm.tags || [categoryName.toLowerCase()],
      tierPricingEnabled: Boolean(productForm.tierPricingEnabled),
      priceTiers: productForm.priceTiers || undefined
    };

    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    setIsSavingCatalog(true);
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
        setSaveSuccessMsg(`Produit "${productPayload.title}" mis à jour avec succès !`);
      } else {
        await addProduct(productPayload as any);
        setSaveSuccessMsg(`Nouveau produit "${productPayload.title}" ajouté au catalogue !`);
      }

      setIsAddingProduct(false);
      setEditingProductId(null);
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    } catch (error: any) {
      setSaveErrorMsg(error?.message || 'Impossible d’enregistrer le produit.');
    } finally {
      setIsSavingCatalog(false);
    }
  };

  // AI Product Copywriting Generator
  const handleGenerateAiProduct = async () => {
    if (!productForm.title?.trim()) {
      alert('Veuillez renseigner un titre ou un mot-clé pour le produit d\'abord.');
      return;
    }
    setIsGeneratingAiProduct(true);
    try {
      const res = await fetch('/api/agent/generate-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: productForm.title,
          categoryId: productForm.categoryId,
          categoryName: categories.find(c => c.id === productForm.categoryId)?.name || 'Général'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setProductForm(prev => ({
            ...prev,
            title: data.product.title || prev.title,
            shortDescription: data.product.shortDescription || prev.shortDescription,
            description: data.product.description || prev.description,
            price: prev.price || data.product.suggestedPrice,
            tags: data.product.tags || prev.tags
          }));
        }
      }
    } catch (e) {
      console.error('Failed to generate product copy:', e);
    } finally {
      setIsGeneratingAiProduct(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = productSearch === '' || 
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.subcategoryName?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = filterCategoryInProducts === 'all' || p.categoryId === filterCategoryInProducts;
    const matchesSub = filterSubcategoryInProducts === 'all' || p.subcategoryId === filterSubcategoryInProducts;
    const matchesStock = filterStockInProducts === 'all' || 
      (filterStockInProducts === 'instock' && p.stockCount > 5) ||
      (filterStockInProducts === 'lowstock' && p.stockCount <= 5 && p.stockCount > 0) ||
      (filterStockInProducts === 'outofstock' && p.stockCount === 0);

    return matchesSearch && matchesCat && matchesSub && matchesStock;
  });

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = orderSearch === '' || 
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Navigation Items (Menu Latéral Allégé & sans doublons avec Paramètres Généraux)
  const navSections = [
    {
      group: 'COMMERCE & VENTES',
      items: [
        { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard className="w-4 h-4" />, badge: null },
        { id: 'orders', label: 'Commandes', icon: <ShoppingBag className="w-4 h-4" />, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} new` : `${orders.length}` },
        { id: 'delivery', label: 'Livraison Autonome 🇨🇮', icon: <Bike className="w-4 h-4 text-amber-400" />, badge: `${deliveryPersons.length} coursiers` },
        { id: 'products', label: 'Produits & Catalogue', icon: <Package className="w-4 h-4" />, badge: `${products.length}` },
        { id: 'categories', label: 'Rayons & Catégories', icon: <Layers className="w-4 h-4" />, badge: `${categories.length}` },
        { id: 'chat', label: 'Support & Chat Direct', icon: <MessageSquare className="w-4 h-4" />, badge: unreadAdminChatCount > 0 ? `${unreadAdminChatCount} new` : (chatConversations.length > 0 ? `${chatConversations.length}` : null) },
        { id: 'agent', label: 'Système Multi-Agents IA', icon: <Bot className="w-4 h-4 text-indigo-400" />, badge: localSettings.aiAgentEnabled !== false ? `${currentAgentsList.length} Agents 🤖` : 'Désactivé' },
      ]
    },
    {
      group: 'MARKETING & CROISSANCE',
      items: [
        { id: 'banners', label: 'Bannières & Section Hero', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: 'Hero & Grille 🎨' },
        { id: 'partners', label: 'Partenaires & Affiliés', icon: <Users className="w-4 h-4 text-amber-400" />, badge: localSettings.partnerProgramEnabled !== false ? 'Actif 🤝' : 'Désactivé ⏸️' },
        { id: 'marketing', label: 'Marketing & Promos', icon: <Flame className="w-4 h-4 text-orange-400" />, badge: 'VIP 🎁' },
      ]
    },
    {
      group: 'CANAUX & PAIEMENT',
      items: [
        { id: 'payments', label: 'Moyens de Paiement', icon: <CreditCard className="w-4 h-4" />, badge: 'Wave/OM' },
        { id: 'whatsapp', label: 'Assistant WhatsApp', icon: <MessageCircle className="w-4 h-4" />, badge: 'Live' },
      ]
    },
    {
      group: 'ADMINISTRATION & SYSTÈME',
      items: [
        { id: 'branding', label: 'Logo & Identité Visuelle', icon: <Palette className="w-4 h-4 text-amber-400" />, badge: localSettings.storeLogoUrl ? 'Logo actif' : 'À configurer' },
        { id: 'appearance', label: 'Couleurs & Thèmes', icon: <Paintbrush className="w-4 h-4 text-pink-400" />, badge: localSettings.homeTheme || 'Midnight' },
        { id: 'analytics', label: 'Analytics & Visiteurs', icon: <TrendingUp className="w-4 h-4 text-cyan-400" />, badge: 'En direct' },
        { id: 'team', label: 'Équipe & Rôles', icon: <Users className="w-4 h-4 text-purple-400" />, badge: teamMembers.length > 0 ? `${teamMembers.length}` : null },
        { id: 'settings', label: 'Paramètres Généraux', icon: <Settings className="w-4 h-4 text-slate-300" />, badge: 'Config ⚙️' },
      ]
    }
  ];

  // Dynamic role filtering
  const allowedTabs = ROLE_DEFINITIONS[effectiveRole]?.allowedTabs || ROLE_DEFINITIONS.admin.allowedTabs;

  const filteredNavSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => allowedTabs.includes(item.id))
    }))
    .filter(section => section.items.length > 0);

  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab((allowedTabs[0] as any) || 'dashboard');
    }
  }, [effectiveRole, allowedTabs, activeTab]);

  // If not authenticated as admin/team member, show login screen
  if (!isAdminAuthenticated) {
    return <AdminLoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Header Bar for Admin */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-md">
        
        {/* Left: Mobile Toggle & Store Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            aria-label="Menu latéral"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20 font-black text-base overflow-hidden">
              {settings.storeLogoUrl ? (
                <img src={settings.storeLogoUrl} alt="Logo de la boutique" className="w-full h-full object-contain bg-white" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white tracking-tight uppercase">
                  {settings.storeName || 'Boutique'}
                </span>
                <span className="text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  {ROLE_DEFINITIONS[effectiveRole]?.badge || 'Admin Pro'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold hidden sm:block">
                Console de Gestion & E-Commerce Haute Performance
              </p>
            </div>
          </div>
        </div>

        {/* Right: Fast Actions & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Sync Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-slate-300">
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Synchronisation...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-mono">En direct</span>
              </>
            )}
          </div>

          {/* Dark Mode Quick Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Clair</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Sombre</span>
              </>
            )}
          </button>

          {/* View Live Store Button */}
          <button
            onClick={() => setCurrentView('home')}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Voir la Boutique</span>
            <span className="sm:hidden">Boutique</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logoutAdmin}
            className="px-3 sm:px-3.5 py-2 bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-rose-500/30 transition cursor-pointer shadow-xs"
            title="Se déconnecter de l'administration"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>

      </header>

      {/* Main Admin Workspace Layout */}
      <div className="flex-1 flex min-w-0">
        
        {/* ========================================================================= */}
        {/* LATERAL SIDEBAR NAVIGATION */}
        {/* ========================================================================= */}
        <aside className={`fixed lg:sticky top-[57px] bottom-0 left-0 z-40 w-64 sm:w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 overflow-y-auto ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          
          <div className="p-4 space-y-6">
            
            {filteredNavSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3">
                  {section.group}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-white' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-indigo-300 border border-slate-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>

          {/* Sidebar Footer User / Session */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-200 truncate">{currentUser?.name || 'Administrateur'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || adminEmail}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.2 rounded-md">
                    {ROLE_DEFINITIONS[effectiveRole]?.badge || '👑 Super Admin'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logoutAdmin}
                className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1 border border-rose-500/30 text-xs font-bold shrink-0"
                title="Déconnexion de l'administration"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quitter</span>
              </button>
            </div>
          </div>

        </aside>

        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ========================================================================= */}
        {/* MAIN ADMIN CONTENT AREA */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 bg-slate-900/40 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Breadcrumb & Notification Banner */}
          <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                ESPACE ADMIN
              </span>
              <span className="text-slate-600 text-xs">/</span>
              <span className="text-xs font-bold text-slate-200 capitalize">
                {activeTab === 'dashboard' && 'Tableau de bord'}
                {activeTab === 'analytics' && 'Analytics & Visiteurs'}
                {activeTab === 'chat' && 'Support Client & Chat Direct'}
                {activeTab === 'products' && 'Gestion Produits & Catalogue'}
                {activeTab === 'categories' && 'Rayons & Catégories'}
                {activeTab === 'orders' && 'Commandes & Livraisons'}
                {activeTab === 'partners' && 'Partenaires & Affiliation (Micro-Franchise)'}
                {activeTab === 'banners' && 'Studio Pro Bannières & Publicités'}
                {activeTab === 'payments' && 'Moyens de Paiement & Liens'}
                {activeTab === 'whatsapp' && 'Paramètres WhatsApp Commercial'}
                {activeTab === 'branding' && 'Logo & Identité Visuelle'}
                {activeTab === 'appearance' && 'Couleurs & Thèmes'}
                {activeTab === 'settings' && 'Paramètres Généraux'}
                {activeTab === 'team' && 'Équipe & Attribution des Rôles'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                {products.length} produits • {categories.length} rayons • {orders.length} commandes
              </span>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Ouvrir la boutique publique pour les clients dans un nouvel onglet"
              >
                <span>🌐 Voir la Boutique</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Status Message Notification */}
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {saveErrorMsg && (
            <div className="p-4 bg-rose-950/80 border border-rose-700/80 text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="flex-1">{saveErrorMsg}</span>
              <button
                type="button"
                onClick={() => setSaveErrorMsg('')}
                className="p-1 text-rose-300 hover:text-white transition cursor-pointer"
                aria-label="Fermer le message d'erreur"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Incoming VoIP Web Call Alert Banner */}
          {activeCall && activeCall.status === 'ringing' && (
            <div className="sticky top-2 z-40 p-4 bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600 rounded-2xl text-white shadow-2xl shadow-rose-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce border-2 border-white/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm">📞 Appel Web Entrant : {activeCall.contactName}</h3>
                    <span className="text-[10px] font-black uppercase bg-white/30 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                      Sonnerie en cours
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 mt-0.5 font-medium">
                    {activeCall.contactSubtitle || 'Un client appelle le service client depuis la boutique'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={acceptIncomingCall}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-xl shadow-emerald-500/50 hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Phone className="w-4 h-4 animate-bounce" />
                  <span>DÉCROCHER</span>
                </button>
                <button
                  onClick={rejectIncomingCall}
                  className="px-4 py-2 bg-slate-900/80 hover:bg-slate-900 text-rose-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Refuser</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: TABLEAU DE BORD (DASHBOARD) */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    Tableau de Bord & Activité Commerciale
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vue consolidée des ventes, commandes en direct et performances de votre boutique.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-white/20" />
                    <span>Chat Direct ({unreadAdminChatCount > 0 ? `${unreadAdminChatCount} non lu(s)` : `${chatConversations.length}`})</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('branding');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                  >
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Changer Logo</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProductId(null);
                      setIsAddingProduct(true);
                      setActiveTab('products');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Produit</span>
                  </button>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Revenue Card */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-2 border-t-4 border-t-emerald-500">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chiffre d'Affaires</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{formatPrice(totalRevenue)}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Wave, Orange Money & En Ligne
                  </p>
                </div>

                {/* Orders Card */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-2 border-t-4 border-t-indigo-500">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Commandes</span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{totalOrdersCount}</p>
                  <p className="text-[11px] text-indigo-400 font-semibold">
                    {pendingOrdersCount} commande{pendingOrdersCount > 1 ? 's' : ''} en attente
                  </p>
                </div>

                {/* Products Card */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-2 border-t-4 border-t-sky-500">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalogue Produits</span>
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{products.length}</p>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Répartis sur {categories.length} rayons ({totalSubcategoriesCount} sous-cat.)
                  </p>
                </div>

                {/* Stock Alerts Card */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm space-y-2 border-t-4 border-t-rose-500">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Alertes Stock</span>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-white">{lowStockProducts.length}</p>
                  <p className="text-[11px] text-rose-400 font-semibold">
                    Produits avec stock critique (≤ 5)
                  </p>
                </div>

              </div>

              {/* Recent Orders Section */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white">Dernières Commandes Réceptionnées</h3>
                    <p className="text-xs text-slate-400">Traitez et contactez vos acheteurs instantanément sur WhatsApp.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Voir tout ({orders.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3">N° Commande</th>
                        <th className="pb-3">Client</th>
                        <th className="pb-3">Articles</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Paiement</th>
                        <th className="pb-3">Statut</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-800/60 transition">
                          <td className="py-3.5 font-bold text-white">{order.orderNumber}</td>
                          <td className="py-3.5">
                            <p className="font-bold text-white">{order.customerName}</p>
                            <p className="text-[11px] text-slate-400">{order.customerPhone} • {order.customerCity}</p>
                          </td>
                          <td className="py-3.5 text-slate-300 max-w-xs truncate">
                            {order.items.map(i => `${i.productTitle} (x${i.quantity})`).join(', ')}
                          </td>
                          <td className="py-3.5 font-black text-white">{formatPrice(order.totalAmount)}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              order.paymentStatus === 'paid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              order.orderStatus === 'delivered' ? 'bg-emerald-950 text-emerald-300' :
                              order.orderStatus === 'shipped' ? 'bg-sky-950 text-sky-300' :
                              order.orderStatus === 'processing' ? 'bg-purple-950 text-purple-300' : 'bg-slate-800 text-slate-200'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${order.customerName}, nous confirmons la prise en charge de votre commande #${order.orderNumber} d'un montant de ${formatPrice(order.totalAmount)} sur ${settings.storeName}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded-lg inline-flex items-center gap-1 font-bold text-[11px] border border-emerald-800/80 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-emerald-400" />
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'analytics' && <AdminAnalyticsDashboard />}

          {/* ========================================================================= */}
          {/* TAB 1.5: SUPPORT CLIENT & CHAT EN DIRECT (LIVE CHAT CONSOLE) */}
          {/* ========================================================================= */}
          {activeTab === 'chat' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
                    <MessageSquare className="w-6 h-6 fill-white/20" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>Support Client & Chat en Direct</span>
                      <span className="text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        ● Connecté
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Répondez en temps réel aux visiteurs et acheteurs depuis le widget de la page d'accueil.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => simulateIncomingCall('Visiteur Boutique (Direct)', 'Appel VoIP entrant depuis le panier')}
                    className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Tester la sonnerie d'appel entrant"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Tester Sonnerie</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    {chatConversations.length} discussion(s) • {unreadAdminChatCount} non lu(s)
                  </span>
                </div>
              </div>

              {/* Chat Hub Layout (Split View) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl min-h-[580px]">
                
                {/* Left Panel: Conversations List (4 cols) */}
                <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/60">
                  
                  {/* Search bar */}
                  <div className="p-4 border-b border-slate-800 space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        placeholder="Rechercher par nom, téléphone..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Conversations Scrollable List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
                    {chatConversations.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 space-y-2">
                        <MessageSquare className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                        <p className="text-xs font-bold">Aucun message de visiteur pour le moment.</p>
                        <p className="text-[11px] text-slate-600">Dès qu'un client utilise le widget de chat, sa discussion apparaîtra ici.</p>
                      </div>
                    ) : (
                      chatConversations
                        .filter(c => {
                          const query = chatSearchQuery.toLowerCase();
                          return (
                            c.visitorName.toLowerCase().includes(query) ||
                            (c.visitorPhone && c.visitorPhone.includes(query)) ||
                            c.lastMessageText.toLowerCase().includes(query)
                          );
                        })
                        .map((conv) => {
                          const isSelected = selectedChatConvId === conv.id;
                          return (
                            <button
                              key={conv.id}
                              onClick={() => setSelectedChatConvId(conv.id)}
                              className={`w-full p-4 text-left flex items-start gap-3 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600/15 border-l-4 border-indigo-500'
                                  : 'hover:bg-slate-900/80'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                                {conv.visitorName.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-bold text-xs text-white truncate">
                                    {conv.visitorName}
                                  </p>
                                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                                    {new Date(conv.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                {conv.visitorPhone && (
                                  <p className="text-[10px] text-indigo-400 font-semibold truncate">
                                    📞 {conv.visitorPhone}
                                  </p>
                                )}

                                <p className="text-xs text-slate-400 truncate mt-0.5 font-normal">
                                  {conv.lastMessageText || 'Discussion démarrée'}
                                </p>
                              </div>

                              {conv.unreadByAdmin > 0 && (
                                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black shrink-0">
                                  {conv.unreadByAdmin}
                                </span>
                              )}
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Right Panel: Active Conversation Window (8 cols) */}
                <div className="lg:col-span-8 flex flex-col bg-slate-900 min-h-[500px]">
                  
                  {selectedChatConvId ? (
                    (() => {
                      const activeConv = chatConversations.find(c => c.id === selectedChatConvId);
                      return (
                        <>
                          {/* Thread Header */}
                          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/40">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                {activeConv?.visitorName.charAt(0).toUpperCase() || 'V'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-black text-sm text-white">{activeConv?.visitorName || 'Visiteur'}</h3>
                                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                    En direct
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  {activeConv?.visitorPhone ? `Tél: ${activeConv.visitorPhone}` : 'Visiteur Boutique'} • Première visite : {activeConv ? new Date(activeConv.createdAt).toLocaleDateString('fr-FR') : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startWebCall('direct_visitor', activeConv?.visitorName || 'Visiteur en direct', activeConv?.visitorPhone || 'Client Chat')}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30 cursor-pointer"
                                title="Appeler ce client en direct via le Web"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Appel Web</span>
                              </button>

                              {activeConv?.visitorPhone && (
                                <a
                                  href={`https://wa.me/${activeConv.visitorPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${activeConv.visitorName}, nous faisons suite à votre message sur le chat de ${settings.storeName}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                  <span>WhatsApp</span>
                                </a>
                              )}

                              <button
                                onClick={async () => {
                                  if (confirm('Voulez-vous supprimer cette discussion ?')) {
                                    await deleteChatConversation(selectedChatConvId);
                                    setSelectedChatConvId(null);
                                  }
                                }}
                                className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                                title="Supprimer la conversation"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Message History Stream */}
                          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/30">
                            {isLoadingMessages && activeConvMessages.length === 0 ? (
                              <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
                                Chargement des messages...
                              </div>
                            ) : activeConvMessages.length === 0 ? (
                              <div className="text-center text-slate-500 text-xs p-8">
                                Aucun message dans cette discussion.
                              </div>
                            ) : (
                              activeConvMessages.map((msg) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                  <div
                                    key={msg.id}
                                    className={`flex items-start gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                  >
                                    {!isAdmin && (
                                      <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                                        {msg.senderName.charAt(0)}
                                      </div>
                                    )}

                                    <div
                                      className={`p-3.5 rounded-2xl max-w-[80%] text-xs shadow-md space-y-1 ${
                                        isAdmin
                                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs'
                                          : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-80 mb-0.5">
                                        <span>{isAdmin ? 'Vous (Support Boutique)' : msg.senderName}</span>
                                        <span>{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                      <p className="font-normal whitespace-pre-line leading-relaxed text-xs">{msg.text}</p>
                                    </div>
                                  </div>
                                );
                              })
                            )}

                            <div ref={chatMessagesEndRef} />
                          </div>

                          {/* Quick Canned Responses */}
                          <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex flex-wrap gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 self-center">Réponses rapides :</span>
                            {[
                              'Bonjour ! Comment pouvons-nous vous aider ?',
                              'Votre commande est bien enregistrée.',
                              'La livraison s\'effectue sous 24h à 48h au Sénégal.',
                              'Paiements acceptés : Wave, Orange Money ou à la livraison.'
                            ].map((canned, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setAdminChatInput(canned)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-600/30 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-800 transition cursor-pointer"
                              >
                                {canned}
                              </button>
                            ))}
                          </div>

                          {/* Admin Reply Input Bar */}
                          <form
                            onSubmit={handleAdminSendReply}
                            className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3"
                          >
                            <input
                              type="text"
                              value={adminChatInput}
                              onChange={(e) => setAdminChatInput(e.target.value)}
                              placeholder="Répondre au client en direct..."
                              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                            />
                            <button
                              type="submit"
                              disabled={!adminChatInput.trim()}
                              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer shrink-0"
                            >
                              <Send className="w-4 h-4" />
                              <span>Envoyer</span>
                            </button>
                          </form>
                        </>
                      );
                    })()
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                      <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-white text-sm">Sélectionnez une discussion</h3>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Cliquez sur un visiteur dans la liste de gauche pour lire ses messages et lui répondre en direct.
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1.7: SYSTÈME MULTI-AGENTS AUTONOME AVEC ORCHESTRATION & GESTION TOTALE */}
          {/* ========================================================================= */}
          {activeTab === 'agent' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Success Notification Alert */}
              {agentActionSuccessMsg && (
                <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-emerald-200 text-xs sm:text-sm font-bold shadow-lg animate-in slide-in-from-top duration-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{agentActionSuccessMsg}</span>
                  </div>
                  <button
                    onClick={() => setAgentActionSuccessMsg('')}
                    className="p-1 hover:bg-emerald-900 rounded-lg text-emerald-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Master Header with Orchestration Status & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30 shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex flex-wrap items-center gap-2">
                      <span>Système Multi-Agents Autonome & Orchestration</span>
                      <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        localSettings.aiAgentEnabled !== false
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {localSettings.aiAgentEnabled !== false
                          ? `● ${currentAgentsList.filter(a => a.enabled !== false).length} / ${currentAgentsList.length} Agents Actifs 24/7`
                          : '○ Système en Pause'}
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Visualisez, modifiez les paramètres, créez ou supprimez vos agents IA pour personnaliser le service client de votre boutique.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Master Toggle */}
                  <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.aiAgentEnabled !== false}
                        onChange={(e) => {
                          const updated = { ...localSettings, aiAgentEnabled: e.target.checked };
                          setLocalSettings(updated);
                          updateSettings({ aiAgentEnabled: e.target.checked });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <span className="text-xs font-bold text-slate-200">
                      {localSettings.aiAgentEnabled !== false ? 'IA Active' : 'IA Désactivée'}
                    </span>
                  </div>

                  {/* Create New Agent Button */}
                  <button
                    type="button"
                    onClick={handleOpenCreateAgent}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer un Nouvel Agent</span>
                  </button>

                  {/* Reset Defaults Button */}
                  <button
                    type="button"
                    onClick={handleResetDefaultAgents}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    title="Restaurer les 5 agents officiels d'origine"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Restaurer par Défaut</span>
                  </button>
                </div>
              </div>

              {/* Visual Dynamic Orchestration Flow Diagram */}
              <div className="p-6 bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h3 className="font-black text-sm text-white uppercase tracking-wider">
                      Flux d'Orchestration Dynamique Multi-Agents
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full uppercase">
                    Routage Automatique & Personnalisé
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-center">
                  {/* Step 1 */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 md:col-span-1">
                    <span className="text-xl">💬</span>
                    <h4 className="text-xs font-black text-white">1. Message Client</h4>
                    <p className="text-[10px] text-slate-400">Demande ou action shopping</p>
                  </div>

                  <div className="hidden md:flex justify-center text-indigo-400 font-bold text-lg">➔</div>

                  {/* Step 2 */}
                  <div className="p-3.5 bg-gradient-to-tr from-indigo-950 to-purple-950 rounded-xl border border-indigo-500/50 space-y-1 md:col-span-2 shadow-lg shadow-indigo-950/50">
                    <span className="text-xl">🎯</span>
                    <h4 className="text-xs font-black text-indigo-200">2. Orchestrateur Central</h4>
                    <p className="text-[10px] text-indigo-300">Analyse les mots-clés triggers & délègue</p>
                  </div>

                  <div className="hidden md:flex justify-center text-indigo-400 font-bold text-lg">➔</div>

                  {/* Step 3 */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 md:col-span-1">
                    <div className="flex flex-wrap justify-center gap-1 text-sm max-w-[120px] mx-auto">
                      {currentAgentsList.filter(a => a.enabled !== false).map(ag => (
                        <span key={ag.id} title={ag.name}>{ag.avatar}</span>
                      ))}
                    </div>
                    <h4 className="text-xs font-black text-white">3. Agent Spécialisé</h4>
                    <p className="text-[10px] text-slate-400">Réponse experte en FCFA</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Specialized Agents Cards Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Agents Configurés ({currentAgentsList.length}) :</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Cliquez sur <strong>Modifier</strong> pour changer le prompt, l'avatar ou les mots-clés de chaque agent.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('settings');
                      setSettingsSubTab('ai');
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fournisseur IA ({localSettings.aiProvider || 'Gemini'}) & Clés API →</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentAgentsList.map((ag) => {
                    const isEnabled = ag.enabled !== false;
                    return (
                      <div
                        key={ag.id}
                        className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between space-y-4 ${
                          isEnabled
                            ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50'
                            : 'bg-slate-950/80 border-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${ag.color || 'from-indigo-600 to-purple-600'} text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0`}>
                                {ag.avatar || '🤖'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-sm font-black text-white">{ag.name}</h4>
                                  {ag.isCustom && (
                                    <span className="text-[9px] font-black uppercase bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded-md">
                                      Sur-mesure
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight">{ag.role}</p>
                              </div>
                            </div>

                            <span className="text-[9px] font-black bg-slate-950 text-indigo-300 border border-slate-800 px-2 py-0.5 rounded-md uppercase shrink-0">
                              {ag.badge}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            {ag.description}
                          </p>

                          {/* Trigger Keywords */}
                          <div className="pt-2 border-t border-slate-800/80 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Mots-clés Déclencheurs ({ag.sampleTriggers?.length || 0}) :
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                              {ag.sampleTriggers && ag.sampleTriggers.length > 0 ? (
                                ag.sampleTriggers.map((tr, i) => (
                                  <span key={i} className="text-[9px] bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">
                                    {tr}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-500 italic">Aucun déclencheur spécifique</span>
                              )}
                            </div>
                          </div>

                          {/* Temperature */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                            <span>Créativité / Température :</span>
                            <span className="font-mono font-bold text-indigo-400">{ag.temperature ?? 0.7}</span>
                          </div>
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                          {/* Toggle Active Switch */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleToggleAgent(ag.id)}
                              className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5 bg-slate-950 border-slate-700"
                            />
                            <span className={`text-[11px] font-bold ${isEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {isEnabled ? 'Actif' : 'Désactivé'}
                            </span>
                          </label>

                          <div className="flex items-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditAgent(ag)}
                              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-500/30"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteAgent(ag.id, ag.name)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs transition cursor-pointer border border-rose-500/20"
                              title={`Supprimer ${ag.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* MODAL COMPLET D'ÉDITION & CRÉATION D'AGENT IA */}
              {/* ========================================================================= */}
              {(editingAgent || isCreatingAgent) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
                  <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${agentModalData.color || 'from-indigo-600 to-purple-600'} text-white flex items-center justify-center text-2xl font-bold shadow-md`}>
                          {agentModalData.avatar || '🤖'}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-white">
                            {editingAgent ? `Modifier l'Agent : ${editingAgent.name}` : 'Créer un Nouvel Agent IA'}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Personnalisez l'identité, le prompt système et les déclencheurs de cet agent.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCloseAgentModal}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Form */}
                    <div className="space-y-4">
                      
                      {/* Name & Role */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Nom de l'Agent *</label>
                          <input
                            type="text"
                            value={agentModalData.name || ''}
                            onChange={(e) => setAgentModalData({ ...agentModalData, name: e.target.value })}
                            placeholder="Ex: Amara, Malik, Khadija VIP..."
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Rôle & Spécialité *</label>
                          <input
                            type="text"
                            value={agentModalData.role || ''}
                            onChange={(e) => setAgentModalData({ ...agentModalData, role: e.target.value })}
                            placeholder="Ex: Conseillère Vente & Personal Shopper"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Avatar Emoji & Badge */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Avatar / Emoji</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={agentModalData.avatar || '🤖'}
                              onChange={(e) => setAgentModalData({ ...agentModalData, avatar: e.target.value })}
                              className="w-16 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-xl text-white font-bold"
                            />
                            <div className="flex flex-wrap gap-1">
                              {['🛍️', '📦', '✍️', '🏷️', '🛡️', '🤖', '💎', '👔', '👗', '🌟', '🎯', '👑'].map((em) => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => setAgentModalData({ ...agentModalData, avatar: em })}
                                  className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-indigo-600 text-sm flex items-center justify-center border border-slate-800 transition cursor-pointer"
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Badge Textuel</label>
                          <input
                            type="text"
                            value={agentModalData.badge || ''}
                            onChange={(e) => setAgentModalData({ ...agentModalData, badge: e.target.value.toUpperCase() })}
                            placeholder="Ex: CONSEILLÈRE VENTE, SUPPORT & SUIVI"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Color Theme Gradient */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Palette & Thème Visuel</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: 'Rose & Pink', val: 'from-pink-500 to-rose-600' },
                            { name: 'Bleu & Cyan', val: 'from-blue-500 to-cyan-600' },
                            { name: 'Violet & Indigo', val: 'from-purple-500 to-indigo-600' },
                            { name: 'Ambre & Orange', val: 'from-amber-500 to-orange-600' },
                            { name: 'Émeraude & Teal', val: 'from-emerald-500 to-teal-600' },
                            { name: 'Indigo & Fuchsia', val: 'from-indigo-600 to-fuchsia-600' },
                            { name: 'Rouge & Carmin', val: 'from-red-500 to-rose-700' },
                            { name: 'Ardoise Sombre', val: 'from-slate-700 to-slate-900' }
                          ].map((theme) => (
                            <button
                              key={theme.val}
                              type="button"
                              onClick={() => setAgentModalData({ ...agentModalData, color: theme.val })}
                              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                                agentModalData.color === theme.val
                                  ? 'border-indigo-400 bg-indigo-950/60 ring-2 ring-indigo-500/50'
                                  : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${theme.val}`} />
                              <span className="text-[11px] font-bold text-slate-200 truncate">{theme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Temperature Slider */}
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">Température / Niveau de Créativité :</span>
                          <span className="font-mono font-black text-indigo-400 text-sm">
                            {agentModalData.temperature ?? 0.7}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1.0}
                          step={0.1}
                          value={agentModalData.temperature ?? 0.7}
                          onChange={(e) => setAgentModalData({ ...agentModalData, temperature: parseFloat(e.target.value) })}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                          <span>0.1 (Très strict, factuel)</span>
                          <span>0.7 (Équilibré & vendeur)</span>
                          <span>1.0 (Très créatif & spontané)</span>
                        </div>
                      </div>

                      {/* Short Description */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Description Résumée</label>
                        <input
                          type="text"
                          value={agentModalData.description || ''}
                          onChange={(e) => setAgentModalData({ ...agentModalData, description: e.target.value })}
                          placeholder="Ex: Guide les acheteurs et valorise le catalogue en FCFA."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Triggers Tags */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-300">
                          Mots-clés Déclencheurs (L'orchestrateur délègue à cet agent si le client mentionne l'un de ces mots)
                        </label>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={agentModalNewTrigger}
                            onChange={(e) => setAgentModalNewTrigger(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTriggerTag();
                              }
                            }}
                            placeholder="Tapez un mot-clé (ex: robe, livraison, promo...) et appuyez sur Ajouter"
                            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={handleAddTriggerTag}
                            className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Ajouter
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(agentModalData.sampleTriggers || []).map((tr, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800/80 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                              <span>{tr}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTriggerTag(idx)}
                                className="text-indigo-400 hover:text-rose-400 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* System Prompt Template */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">
                            Prompt Système & Instructions Détaillées (Règles d'or de l'agent)
                          </label>
                          <span className="text-[10px] text-indigo-400 font-mono">
                            Variables : {'{storeName}'}, {'{shippingFee}'}, {'{freeShippingThreshold}'}, {'{contactPhone}'}, {'{whatsappNumber}'}
                          </span>
                        </div>

                        <textarea
                          rows={6}
                          value={agentModalData.systemPromptTemplate || ''}
                          onChange={(e) => setAgentModalData({ ...agentModalData, systemPromptTemplate: e.target.value })}
                          placeholder="Tu es un conseiller pour la boutique {storeName}..."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                        />
                      </div>

                      {/* Active Status Toggle */}
                      <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div>
                          <p className="text-xs font-bold text-white">Activer cet agent immédiatement</p>
                          <p className="text-[11px] text-slate-400">Si activé, l'orchestrateur pourra lui déléguer des conversations.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={agentModalData.enabled !== false}
                          onChange={(e) => setAgentModalData({ ...agentModalData, enabled: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-0 w-4 h-4 bg-slate-900 border-slate-700 cursor-pointer"
                        />
                      </div>

                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleCloseAgentModal}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Annuler
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAgentModal}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingAgent ? 'Enregistrer les Modifications' : 'Créer l\'Agent'}</span>
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: LOGO & IDENTITÉ VISUELLE (BRANDING) */}
          {/* ========================================================================= */}
          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-md">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black text-white">
                        Gestion du Logo & Image de Marque
                      </h1>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ajoutez, téléversez ou modifiez le logo officiel affiché sur l'en-tête, le pied de page et les factures.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-200 uppercase tracking-wider">
                    Aperçu en Direct du Logo
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Light Background Preview */}
                    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3 min-h-[160px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Aperçu En-Tête (Light Mode)
                      </span>
                      {localSettings.storeLogoUrl ? (
                        <img 
                          src={localSettings.storeLogoUrl} 
                          alt="Aperçu Logo" 
                          style={{ height: `${localSettings.storeLogoHeight || 44}px` }}
                          className="w-auto max-w-[240px] object-contain transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                            {localSettings.storeName.charAt(0) || 'E'}
                          </div>
                          <span className="font-extrabold text-lg text-slate-900 uppercase">
                            {localSettings.storeName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dark Background Preview */}
                    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-3 min-h-[160px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Aperçu En-Tête & Pied de Page (Dark Mode)
                      </span>
                      {localSettings.storeLogoUrl ? (
                        <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                          <img 
                            src={localSettings.storeLogoUrl} 
                            alt="Aperçu Logo Sombre" 
                            style={{ height: `${localSettings.storeLogoHeight || 44}px` }}
                            className="w-auto max-w-[240px] object-contain transition-all"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                            {localSettings.storeName.charAt(0) || 'E'}
                          </div>
                          <span className="font-extrabold text-lg text-white uppercase">
                            {localSettings.storeName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Option 1: File Upload */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Option 1 : Téléverser une Image Depuis Votre Appareil</span>
                  </div>
                  
                  <p className="text-xs text-slate-400">
                    Sélectionnez un fichier PNG, JPG, WebP ou SVG (2 Mo maximum). Le logo est optimisé avant la sauvegarde.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Choisir un Fichier Image...</span>
                    </button>

                    {localSettings.storeLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setLocalSettings(prev => ({ ...prev, storeLogoUrl: '' }))}
                        className="px-4 py-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-rose-800 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer le Logo</span>
                      </button>
                    )}
                  </div>

                  {logoUploadError && (
                    <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-800 bg-rose-950/60 px-3.5 py-3 text-xs font-semibold text-rose-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{logoUploadError}</span>
                    </div>
                  )}
                </div>

                {/* Option 2: Image URL Direct */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Option 2 : Saisir l'URL Directe d'une Image Web</span>
                  </div>

                  <input
                    type="url"
                    value={localSettings.storeLogoUrl || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, storeLogoUrl: e.target.value }))}
                    placeholder="https://votre-domaine.com/logo.png ou lien CDN..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Sizing Slider */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-300">
                    Hauteur d'Affichage du Logo dans la Barre : {localSettings.storeLogoHeight || 44}px
                  </label>
                  <input
                    type="range"
                    min={28}
                    max={65}
                    value={localSettings.storeLogoHeight || 44}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, storeLogoHeight: Number(e.target.value) }))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>28px (Discret)</span>
                    <span>44px (Standard)</span>
                    <span>65px (Grand)</span>
                  </div>
                </div>

                {/* PWA App Icon */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Icône de l'application PWA</span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Cette icône sera utilisée lors de l'installation sur téléphone et dans le manifeste PWA.
                  </p>

                  <input
                    type="file"
                    ref={pwaIconFileInputRef}
                    onChange={handlePwaIconUpload}
                    accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2 shrink-0">
                      <img
                        src={localSettings.pwaIconUrl || '/icons/icon-192x192.svg'}
                        alt="Aperçu icône PWA"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => pwaIconFileInputRef.current?.click()}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Choisir une icône</span>
                        </button>

                        {localSettings.pwaIconUrl && (
                          <button
                            type="button"
                            onClick={() => setLocalSettings(prev => ({ ...prev, pwaIconUrl: '' }))}
                            className="px-4 py-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-rose-800 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        value={localSettings.pwaIconUrl || ''}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, pwaIconUrl: e.target.value }))}
                        placeholder="https://votre-domaine.com/icone-pwa.png"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {pwaIconUploadError && (
                    <p className="text-xs font-semibold text-rose-400">{pwaIconUploadError}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
                  <button
                    onClick={handleSaveSettings}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder le Logo & les Paramètres</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: COULEURS & THÈMES DU SITE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-7 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                    <Paintbrush className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">Couleurs & Thèmes du Site</h1>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                      Personnalisez l'en-tête, le fond général, le footer et l'ambiance visuelle de la page d'accueil.
                      Les changements sont appliqués après sauvegarde.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-black text-white">Thèmes prédéfinis</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Un clic prépare toutes les couleurs et le style du hero.</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-300 bg-pink-500/10 border border-pink-500/20 px-2 py-1 rounded-lg">
                      {localSettings.homeTheme || 'midnight'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                    {(Object.keys(SITE_THEME_PRESETS) as Array<Exclude<SiteThemeName, 'custom'>>).map((theme) => {
                      const preset = SITE_THEME_PRESETS[theme];
                      const isSelected = (localSettings.homeTheme || 'midnight') === theme;
                      return (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => handleApplySiteTheme(theme)}
                          className={`text-left p-3 rounded-xl border transition cursor-pointer ${isSelected ? 'border-pink-400 bg-pink-500/10 shadow-lg shadow-pink-500/10' : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-7 h-7 rounded-lg border border-white/20 shadow-inner" style={{ background: `linear-gradient(135deg, ${preset.headerColor} 0 50%, ${preset.footerColor} 50% 100%)` }} />
                            <span className="text-xs font-black text-white">{preset.label}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 ml-auto" />}
                          </div>
                          <p className="text-[10px] leading-relaxed text-slate-500">{preset.description}</p>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleApplySiteTheme('custom')}
                      className={`text-left p-3 rounded-xl border transition cursor-pointer ${localSettings.homeTheme === 'custom' ? 'border-pink-400 bg-pink-500/10 shadow-lg shadow-pink-500/10' : 'border-slate-800 bg-slate-950/70 hover:border-slate-600'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-lg border border-white/20 bg-gradient-to-br from-cyan-500 via-pink-500 to-amber-400" />
                        <span className="text-xs font-black text-white">Personnalisé</span>
                        {localSettings.homeTheme === 'custom' && <CheckCircle2 className="w-3.5 h-3.5 text-pink-400 ml-auto" />}
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-500">Utilisez vos propres couleurs ci-dessous.</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h2 className="text-sm font-black text-white">Couleurs principales</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Choisissez une couleur via le sélecteur ou saisissez son code hexadécimal.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'siteHeaderColor' as const, label: "Couleur de l'en-tête", fallback: '#ffffff', hint: 'Navbar et zone supérieure' },
                      { key: 'siteBodyColor' as const, label: 'Couleur du fond principal', fallback: '#f1f5f9', hint: "Fond de la page d'accueil" },
                      { key: 'siteFooterColor' as const, label: 'Couleur du footer', fallback: '#020617', hint: 'Pied de page du site' },
                    ].map((field) => {
                      const color = normalizeHexColor(localSettings[field.key], field.fallback);
                      return (
                        <label key={field.key} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                          <span className="block text-xs font-bold text-slate-200">{field.label}</span>
                          <span className="flex items-center gap-3">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value, homeTheme: 'custom', heroTheme: 'custom' }))}
                              className="h-11 w-14 cursor-pointer rounded-lg border border-slate-700 bg-transparent p-1"
                              aria-label={field.label}
                            />
                            <input
                              type="text"
                              value={localSettings[field.key] || field.fallback}
                              onChange={(e) => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value, homeTheme: 'custom', heroTheme: 'custom' }))}
                              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs uppercase text-white focus:border-pink-500 focus:outline-hidden"
                              maxLength={7}
                              spellCheck={false}
                              aria-label={`Code hexadécimal - ${field.label}`}
                            />
                          </span>
                          <span className="block text-[10px] text-slate-500">{field.hint}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-black text-white">Aperçu</h2>
                  <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                    <div className="flex min-h-12 items-center justify-between px-4" style={{ backgroundColor: normalizeHexColor(localSettings.siteHeaderColor, '#ffffff') }}>
                      <span className="text-xs font-black" style={{ color: '#0f172a' }}>EN-TÊTE</span>
                      <span className="h-2 w-24 rounded-full bg-black/15" />
                    </div>
                    <div className="flex min-h-20 items-center justify-center px-4" style={{ backgroundColor: normalizeHexColor(localSettings.siteBodyColor, '#f1f5f9') }}>
                      <span className="rounded-lg bg-white/75 px-4 py-2 text-xs font-bold text-slate-800 shadow-sm">Aperçu de la page d'accueil</span>
                    </div>
                    <div className="flex min-h-12 items-center justify-between px-4" style={{ backgroundColor: normalizeHexColor(localSettings.siteFooterColor, '#020617') }}>
                      <span className="text-xs font-black text-white">FOOTER</span>
                      <span className="h-2 w-20 rounded-full bg-white/25" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-5">
                  <button
                    type="button"
                    onClick={() => handleApplySiteTheme('midnight')}
                    className="px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-7 py-3 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-pink-600/20 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les couleurs et le thème</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GESTION DES PRODUITS (CATALOGUE CRUD) */}
          {/* ========================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Gestion du Catalogue Produits</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Ajoutez des références, modifiez les prix et ajustez les stocks.</p>
                </div>
                <button
                  onClick={() => {
                    setSaveErrorMsg('');
                    if (categories.length === 0) {
                      setActiveTab('categories');
                      setEditingCategoryId(null);
                      setCategoryForm({ name: '', description: '', image: '', iconName: 'Grid' });
                      setIsAddingCategory(true);
                      setSaveErrorMsg('Créez d’abord un rayon avant de publier votre premier produit.');
                      return;
                    }
                    setEditingProductId(null);
                    setProductForm({
                      title: '',
                      description: '',
                      shortDescription: '',
                      price: 25000,
                      originalPrice: 35000,
                      categoryId: categories[0].id,
                      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
                      stockCount: 10,
                      inStock: true,
                      featured: true,
                      isNew: true,
                      isFlashSale: false,
                      rating: 4.9,
                      reviewCount: 5,
                      badgeText: 'NOUVEAU',
                      colors: ['Noir', 'Argent']
                    });
                    setIsAddingProduct(true);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Nouveau Produit</span>
                </button>
              </div>

              {/* Product Form Modal / Section */}
              {isAddingProduct && (
                <div className="bg-slate-900 rounded-2xl border-2 border-indigo-500 p-6 sm:p-8 space-y-6 shadow-2xl animate-in slide-in-from-top-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                    <h3 className="font-black text-lg text-white">
                      {editingProductId ? 'Modifier le Produit' : 'Créer un Nouveau Produit'}
                    </h3>
                    <button 
                      onClick={() => setIsAddingProduct(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      <div className="space-y-1 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">Titre du Produit *</label>
                          <button
                            type="button"
                            onClick={handleGenerateAiProduct}
                            disabled={isGeneratingAiProduct || !productForm.title?.trim()}
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 px-2.5 py-0.5 rounded-lg transition disabled:opacity-40 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>{isGeneratingAiProduct ? 'Rédaction IA en cours...' : '⚡ Rédiger la fiche avec l\'IA'}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={productForm.title || ''}
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          placeholder="Ex: Montre Chronographe Automatique Or 24K"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Rayon / Catégorie *</label>
                        <select
                          required
                          value={productForm.categoryId || ''}
                          onChange={(e) => {
                            const newCatId = e.target.value;
                            setProductForm({ 
                              ...productForm, 
                              categoryId: newCatId,
                              subcategoryId: undefined,
                              subcategoryName: undefined
                            });
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
                        >
                          <option value="" disabled>Sélectionnez un rayon</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Prix de Vente ({settings.currency}) *</label>
                        <input
                          type="number"
                          required
                          value={productForm.price || ''}
                          onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Prix Original / Barré</label>
                        <input
                          type="number"
                          value={productForm.originalPrice || ''}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Quantité en Stock *</label>
                        <input
                          type="number"
                          required
                          value={productForm.stockCount || ''}
                          onChange={(e) => setProductForm({ ...productForm, stockCount: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                        <label className="text-xs font-bold text-slate-300">Description Détaillée</label>
                        <textarea
                          rows={3}
                          value={productForm.description || ''}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="Décrivez les fonctionnalités, matériaux et avantages..."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Section Remises par Quantité / Paliers Dégressifs */}
                      <div className="sm:col-span-2 lg:col-span-3 p-4 sm:p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <BadgePercent className="w-4 h-4 text-indigo-400" />
                              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                                Remises par Quantité (Paliers Dégressifs & Prix Grossiste)
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Autoriser des tarifs dégressifs par volume sur la page de détail : 1-4 pièces (détail), 5-19 pièces (-8%), 20+ pièces (-15% grossiste).
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={Boolean(productForm.tierPricingEnabled)}
                              onChange={(e) => setProductForm({ ...productForm, tierPricingEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-2 text-xs font-bold text-slate-300">
                              {productForm.tierPricingEnabled ? 'Autorisé (Actif)' : 'Désactivé'}
                            </span>
                          </label>
                        </div>

                        {productForm.tierPricingEnabled && (
                          <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-in fade-in duration-200">
                            <p className="text-[11px] font-bold text-indigo-300">
                              Aperçu des Paliers Calculés (basé sur le prix de vente : {formatPrice(Number(productForm.price) || 0)}) :
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                              {/* Palier 1 */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                                <p className="text-[11px] font-semibold text-slate-400">1 - 4 pièces</p>
                                <p className="text-sm font-black text-white my-0.5">
                                  {formatPrice(Number(productForm.price) || 0)}
                                </p>
                                <p className="text-[10px] text-slate-400">Prix détail (Base)</p>
                              </div>

                              {/* Palier 2 */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                                <p className="text-[11px] font-semibold text-amber-400">5 - 19 pièces</p>
                                <p className="text-sm font-black text-white my-0.5">
                                  {formatPrice(Math.round((Number(productForm.price) || 0) * 0.92))}
                                </p>
                                <p className="text-[10px] text-emerald-400 font-bold">-8% Remise</p>
                              </div>

                              {/* Palier 3 */}
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80">
                                <p className="text-[11px] font-semibold text-amber-400">20+ pièces</p>
                                <p className="text-sm font-black text-white my-0.5">
                                  {formatPrice(Math.round((Number(productForm.price) || 0) * 0.85))}
                                </p>
                                <p className="text-[10px] text-emerald-400 font-bold">-15% Grossiste</p>
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-500 italic">
                              💡 Les clients visualisent ce bloc sombre exactement sous le titre et la note du produit, et peuvent commander en 1 clic au tarif de gros.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Product Images Upload */}
                      <div className="space-y-4 sm:col-span-2 lg:col-span-3 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <div>
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-indigo-400" />
                              <span>Photos & Galerie du Produit</span>
                              <span className="text-[11px] font-normal text-slate-400">
                                ({productForm.images?.length || 0} photo{(productForm.images?.length || 0) > 1 ? 's' : ''})
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              ref={productFileInputRef}
                              onChange={(e) => handleProductFilesUpload(e.target.files)}
                              accept="image/*"
                              multiple
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => productFileInputRef.current?.click()}
                              disabled={isUploadingProductImage}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Importer Photos...</span>
                            </button>
                          </div>
                        </div>

                        {/* Image grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {productForm.images?.map((img, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 aspect-square bg-slate-950">
                              <img src={img} alt="Product" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveProductImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingCatalog || categories.length === 0}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                      >
                        {isSavingCatalog ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isSavingCatalog ? 'Enregistrement...' : editingProductId ? 'Sauvegarder les Modifications' : 'Créer le Produit'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Filter & Toolbar */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Rechercher par nom..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={filterCategoryInProducts}
                    onChange={(e) => setFilterCategoryInProducts(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-slate-200"
                  >
                    <option value="all">Tous les rayons ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs font-bold text-slate-400">
                  {filteredProducts.length} produit(s) trouvé(s)
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] bg-slate-950/60">
                        <th className="p-4">Article</th>
                        <th className="p-4">Rayon</th>
                        <th className="p-4">Prix</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-medium">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/50 transition">
                          <td className="p-4 flex items-center gap-3">
                            <img src={p.images[0]} alt={p.title} className="w-12 h-12 object-cover rounded-xl bg-slate-950 border border-slate-800 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate max-w-xs">{p.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{p.shortDescription || p.description}</p>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-indigo-400">{p.categoryName}</td>
                          <td className="p-4 font-black text-white">
                            <div>{formatPrice(p.price)}</div>
                            {p.tierPricingEnabled && (
                              <span className="inline-block text-[9px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded mt-0.5">
                                ⚡ Remise volume (-8%, -15%)
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              p.stockCount > 5 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {p.stockCount} en stock
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                              Actif
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProductId(p.id);
                                  setProductForm(p);
                                  setIsAddingProduct(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl transition cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Supprimer définitivement le produit "${p.title}" ?`)) {
                                    setSaveErrorMsg('');
                                    try {
                                      await deleteProduct(p.id);
                                      setSaveSuccessMsg(`Produit "${p.title}" supprimé.`);
                                      setTimeout(() => setSaveSuccessMsg(''), 3500);
                                    } catch (error: any) {
                                      setSaveErrorMsg(error?.message || 'Impossible de supprimer le produit.');
                                    }
                                  }
                                }}
                                className="p-2 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: GESTION DES RAYONS & CATÉGORIES */}
          {/* ========================================================================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Gestion des Rayons & Sous-Catégories</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Organisez vos articles par univers spécialisés et sous-rayons.</p>
                </div>
                <button
                  onClick={() => {
                    setSaveErrorMsg('');
                    setEditingCategoryId(null);
                    setCategoryForm({ name: '', description: '', image: '', iconName: 'Grid' });
                    setIsAddingCategory(true);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Rayon</span>
                </button>
              </div>

              {isAddingCategory && (
                <div className="bg-slate-900 rounded-2xl border-2 border-indigo-500 p-6 sm:p-8 shadow-2xl animate-in slide-in-from-top-4">
                  <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-800">
                    <div>
                      <h2 className="text-lg font-black text-white">
                        {editingCategoryId ? 'Modifier le rayon' : 'Créer un nouveau rayon'}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Le rayon sera immédiatement disponible pour vos produits.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setEditingCategoryId(null);
                      }}
                      className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
                      aria-label="Fermer le formulaire de rayon"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveCategory} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-300">Nom du rayon *</span>
                        <input
                          type="text"
                          required
                          maxLength={120}
                          value={categoryForm.name || ''}
                          onChange={(e) => setCategoryForm((current) => ({ ...current, name: e.target.value }))}
                          placeholder="Ex: Téléphones & Accessoires"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </label>

                      <label className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-300">Icône du rayon</span>
                        <select
                          value={categoryForm.iconName || 'Grid'}
                          onChange={(e) => setCategoryForm((current) => ({ ...current, iconName: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        >
                          <option value="Grid">Grille (Par défaut)</option>
                          <option value="Shirt">Mode & Vêtements</option>
                          <option value="Smartphone">Téléphones & Tablettes</option>
                          <option value="Laptop">Informatique & PC</option>
                          <option value="Headphones">Audio & Son</option>
                          <option value="Home">Maison & Électroménager</option>
                          <option value="Sparkles">Beauté & Cosmétiques</option>
                          <option value="Watch">Montres & Bijoux</option>
                          <option value="Baby">Bébé & Enfants</option>
                          <option value="Dumbbell">Sports & Fitness</option>
                          <option value="Car">Auto & Moto</option>
                          <option value="ShoppingBag">Supermarché & Épicerie</option>
                          <option value="Tag">Offres & Promos</option>
                        </select>
                      </label>

                      <label className="space-y-1.5 md:col-span-2">
                        <span className="text-xs font-bold text-slate-300">Description</span>
                        <textarea
                          rows={3}
                          maxLength={5000}
                          value={categoryForm.description || ''}
                          onChange={(e) => setCategoryForm((current) => ({ ...current, description: e.target.value }))}
                          placeholder="Décrivez brièvement les produits de ce rayon."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </label>

                      <div className="space-y-2 md:col-span-2">
                        <span className="text-xs font-bold text-slate-300">Image du rayon</span>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="url"
                            value={categoryForm.image || ''}
                            onChange={(e) => setCategoryForm((current) => ({ ...current, image: e.target.value }))}
                            placeholder="https://..."
                            className="min-w-0 flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                          <input
                            ref={categoryFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCategoryFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => categoryFileInputRef.current?.click()}
                            disabled={isUploadingCategoryImage}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            {isUploadingCategoryImage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            <span>{isUploadingCategoryImage ? 'Importation...' : 'Importer'}</span>
                          </button>
                        </div>
                        {categoryForm.image && (
                          <img
                            src={categoryForm.image}
                            alt="Aperçu du rayon"
                            className="w-28 h-20 object-cover rounded-xl border border-slate-700 bg-slate-950"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setEditingCategoryId(null);
                        }}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingCatalog}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
                      >
                        {isSavingCatalog ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isSavingCatalog ? 'Enregistrement...' : editingCategoryId ? 'Enregistrer les modifications' : 'Créer le rayon'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories list */}
              <div className="space-y-4">
                {categories.length === 0 && (
                  <div className="border border-dashed border-slate-700 rounded-2xl px-6 py-10 text-center bg-slate-900/50">
                    <FolderPlus className="w-9 h-9 text-indigo-400 mx-auto mb-3" />
                    <p className="font-bold text-white">Aucun rayon enregistré</p>
                    <p className="text-xs text-slate-400 mt-1">Créez votre premier rayon pour pouvoir publier des produits.</p>
                  </div>
                )}
                {categories.map((cat) => {
                  const catProducts = products.filter(p => p.categoryId === cat.id);
                  const isAddingSub = addingSubForCatId === cat.id;
                  const isEditingSub = editingSubId?.categoryId === cat.id;

                  return (
                    <div key={cat.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          <img src={cat.image} alt={cat.name} className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-700" />
                          <div>
                            <h3 className="font-black text-base text-white">{cat.name}</h3>
                            <p className="text-xs text-slate-400">{catProducts.length} produit(s) • {cat.subcategories?.length || 0} sous-catégorie(s)</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAddingSubForCatId(isAddingSub ? null : cat.id);
                              setEditingSubId(null);
                              setSubcategoryForm({ name: '', description: '', image: '' });
                              setSaveErrorMsg('');
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            + Sous-catégorie
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setCategoryForm({
                                name: cat.name,
                                description: cat.description,
                                image: cat.image,
                                iconName: cat.iconName || 'Grid',
                              });
                              setIsAddingCategory(true);
                              setSaveErrorMsg('');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-2 bg-slate-800 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl transition cursor-pointer"
                            title="Modifier le rayon"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Supprimer le rayon "${cat.name}" ?`)) {
                                setSaveErrorMsg('');
                                try {
                                  await deleteCategory(cat.id);
                                  setSaveSuccessMsg(`Rayon "${cat.name}" supprimé.`);
                                  setTimeout(() => setSaveSuccessMsg(''), 3500);
                                } catch (error: any) {
                                  setSaveErrorMsg(error?.message || 'Impossible de supprimer le rayon.');
                                }
                              }
                            }}
                            className="p-2 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {isAddingSub && (
                        <form
                          onSubmit={(event) => handleSaveSubcategory(event, cat.id)}
                          className="rounded-xl border border-indigo-500/40 bg-slate-950/70 p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-black text-white">
                              {isEditingSub ? 'Modifier la sous-catégorie' : `Ajouter une sous-catégorie à ${cat.name}`}
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingSubForCatId(null);
                                setEditingSubId(null);
                                setSubcategoryForm({ name: '', description: '', image: '' });
                              }}
                              className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                              aria-label="Fermer le formulaire de sous-catégorie"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              required
                              maxLength={120}
                              value={subcategoryForm.name}
                              onChange={(e) => setSubcategoryForm((current) => ({ ...current, name: e.target.value }))}
                              placeholder="Nom de la sous-catégorie *"
                              className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={subcategoryForm.description}
                              onChange={(e) => setSubcategoryForm((current) => ({ ...current, description: e.target.value }))}
                              placeholder="Courte description"
                              className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                            <input
                              type="url"
                              value={subcategoryForm.image || ''}
                              onChange={(e) => setSubcategoryForm((current) => ({ ...current, image: e.target.value }))}
                              placeholder="URL de l’image (facultatif)"
                              className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            />
                            <div className="flex gap-2">
                              <input
                                ref={subcategoryFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleSubcategoryFileUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => subcategoryFileInputRef.current?.click()}
                                disabled={isUploadingSubcategoryImage}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                                <span>Importer une image</span>
                              </button>
                              <button
                                type="submit"
                                disabled={isSavingCatalog}
                                className="ml-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                              >
                                {isSavingCatalog ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>{isEditingSub ? 'Modifier' : 'Ajouter'}</span>
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Subcategories chips */}
                      <div className="flex flex-wrap gap-2">
                        {cat.subcategories?.map(sub => (
                          <span key={sub.id} className="pl-3 pr-1 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-indigo-400" />
                            <span>{sub.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingSubForCatId(cat.id);
                                setEditingSubId({ categoryId: cat.id, subId: sub.id });
                                setSubcategoryForm({
                                  name: sub.name,
                                  description: sub.description || '',
                                  image: sub.image || '',
                                });
                                setSaveErrorMsg('');
                              }}
                              className="p-1 text-indigo-400 hover:text-white transition cursor-pointer"
                              title="Modifier la sous-catégorie"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Supprimer la sous-catégorie "${sub.name}" ?`)) {
                                  setSaveErrorMsg('');
                                  try {
                                    await deleteSubcategory(cat.id, sub.id);
                                    setSaveSuccessMsg(`Sous-catégorie "${sub.name}" supprimée.`);
                                    setTimeout(() => setSaveSuccessMsg(''), 3500);
                                  } catch (error: any) {
                                    setSaveErrorMsg(error?.message || 'Impossible de supprimer la sous-catégorie.');
                                  }
                                }
                              }}
                              className="p-1 text-rose-400 hover:text-white transition cursor-pointer"
                              title="Supprimer la sous-catégorie"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        {(!cat.subcategories || cat.subcategories.length === 0) && !isAddingSub && (
                          <span className="text-xs text-slate-500">Aucune sous-catégorie pour ce rayon.</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: GESTION DES COMMANDES (ORDERS) */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">Suivi des Commandes ({orders.length})</h1>
                  <p className="text-xs text-slate-400 mt-0.5">Mises à jour des statuts de livraison, validation et relance WhatsApp.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Bike className="w-4 h-4" />
                    <span>Livreurs & Dispatch ({deliveryPersons.length})</span>
                  </button>
                  <input
                    type="text"
                    placeholder="Rechercher nom, n°..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">{order.orderNumber}</span>
                          <span className="text-xs text-slate-400">• {new Date(order.createdAt).toLocaleString('fr-FR')}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-300">
                          👤 {order.customerName} ({order.customerPhone}) • 📍 {order.customerAddress}, {order.customerCity}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-indigo-400">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${order.customerName} !\n\nNous vous contactons depuis la boutique ${settings.storeName} concernant votre commande *#${order.orderNumber}* (${formatPrice(order.totalAmount)}).\n\nVotre colis est en préparation. Avez-vous une précision pour la livraison ?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-400">Statut :</span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="px-3 py-1.5 bg-slate-950 font-bold rounded-lg border border-slate-700 text-white"
                        >
                          <option value="pending">En attente</option>
                          <option value="processing">En préparation</option>
                          <option value="shipped">Expédiée</option>
                          <option value="delivered">Livrée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Supprimer définitivement la commande ${order.orderNumber} ?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="text-rose-400 hover:underline font-bold text-xs cursor-pointer"
                      >
                        Supprimer la commande
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* TAB 6: MOYENS DE PAIEMENT & PASSERELLES (PAYMENTS) */}
          {/* ========================================================================= */}
          {activeTab === 'payments' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Header Title Card - Compact & Épuré */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Moyens de Paiement & Encaissement
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {[
                        localSettings.enableCashOnDelivery,
                        localSettings.enableWavePayment,
                        localSettings.enableOrangeMoney,
                        localSettings.enableMtnMoney !== false,
                        localSettings.enableMoovMoney !== false,
                        localSettings.enableCustomPaymentLink,
                        localSettings.enableBankTransfer
                      ].filter(Boolean).length} / 7 Actifs
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Activez et personnalisez vos modes de règlement : Paiement à la livraison (espèces), Mobile Money, Cartes et Virements.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-400 font-bold">Devise :</span>
                    <span className="text-emerald-400 font-black">{settings.currency || 'FCFA'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Navigation par Sous-Onglets Thématiques (Compact & Sans Défilement Excessif) */}
              <div className="flex items-center gap-1.5 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
                {[
                  {
                    id: 'cod' as const,
                    label: 'Paiement Livraison (COD)',
                    icon: Truck,
                    badge: localSettings.enableCashOnDelivery ? 'Actif' : 'Inactif',
                    active: localSettings.enableCashOnDelivery
                  },
                  {
                    id: 'mobile_money' as const,
                    label: 'Mobile Money',
                    icon: Smartphone,
                    badge: `${[
                      localSettings.enableWavePayment,
                      localSettings.enableOrangeMoney,
                      localSettings.enableMtnMoney !== false,
                      localSettings.enableMoovMoney !== false
                    ].filter(Boolean).length} Actifs`,
                    active: [
                      localSettings.enableWavePayment,
                      localSettings.enableOrangeMoney,
                      localSettings.enableMtnMoney !== false,
                      localSettings.enableMoovMoney !== false
                    ].some(Boolean)
                  },
                  {
                    id: 'cards' as const,
                    label: 'Cartes Bancaires & Web',
                    icon: CreditCard,
                    badge: localSettings.enableCustomPaymentLink ? 'Actif' : 'Inactif',
                    active: localSettings.enableCustomPaymentLink
                  },
                  {
                    id: 'bank' as const,
                    label: 'Virement RIB / IBAN',
                    icon: Landmark,
                    badge: localSettings.enableBankTransfer ? 'Actif' : 'Inactif',
                    active: localSettings.enableBankTransfer
                  },
                ].map((tab) => {
                  const isCurrent = paymentSubTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentSubTab(tab.id)}
                      className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 text-white border-emerald-400 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tab.active
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ========================================================================= */}
              {/* SOUS-ONGLET 1 : PAIEMENT À LA LIVRAISON (CASH ON DELIVERY - COD) */}
              {/* ========================================================================= */}
              {paymentSubTab === 'cod' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="bg-slate-900 rounded-2xl border-2 border-amber-500/40 p-5 sm:p-6 space-y-5 shadow-lg">
                    
                    {/* Switch En-tête */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-black text-white tracking-tight">
                              Paiement en Espèces à la Livraison (COD)
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              N°1 EN AFRIQUE 🌟
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Permet au client de payer en espèces ou par Mobile Money lors de la remise en main propre par votre coursier.
                          </p>
                        </div>
                      </div>

                      {/* Master Switch COD */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-bold text-slate-300">
                          {localSettings.enableCashOnDelivery ? 'Mode Activé ✅' : 'Mode Désactivé ⏸️'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLocalSettings({ ...localSettings, enableCashOnDelivery: !localSettings.enableCashOnDelivery })}
                          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            localSettings.enableCashOnDelivery ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              localSettings.enableCashOnDelivery ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Grille Contenu & Aperçu Direct */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Colonne Réglages */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>Consignes affichées au client lors du choix de ce mode :</span>
                            </label>
                            <span className="text-[10px] font-mono text-slate-500">
                              {localSettings.codInstructions?.length || 0} car.
                            </span>
                          </div>

                          <textarea
                            rows={3}
                            value={localSettings.codInstructions || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, codInstructions: e.target.value })}
                            placeholder="Ex: Préparez l'appoint en espèces pour le coursier. Le paiement Wave / Orange Money est également accepté lors de la remise."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                          />
                        </div>

                        {/* Insertion rapide de clauses */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Ajouter une consigne certifiée en 1 clic :</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const current = (localSettings.codInstructions || '').trim();
                                const clause = "CONSIGNE APPOINT ESPÈCES :\nMerci de prévoir l'appoint exact en espèces ou de vous assurer d'avoir le solde nécessaire sur votre compte Wave / Orange Money.";
                                setLocalSettings({ ...localSettings, codInstructions: current ? `${current}\n\n${clause}` : clause });
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-[11px] rounded-lg transition cursor-pointer"
                            >
                              + Préparation Appoint
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = (localSettings.codInstructions || '').trim();
                                const clause = "AVISAGE COURSIER :\nLe livreur vous contacte obligatoirement 15 à 30 minutes avant son arrivée pour convenir de l'adresse exacte.";
                                setLocalSettings({ ...localSettings, codInstructions: current ? `${current}\n\n${clause}` : clause });
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-[11px] rounded-lg transition cursor-pointer"
                            >
                              + Appel Préalable 30min
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const current = (localSettings.codInstructions || '').trim();
                                const clause = "VÉRIFICATION COLIS :\nVous pouvez vérifier l'aspect extérieur du colis scellé en présence du livreur avant le règlement intégral.";
                                setLocalSettings({ ...localSettings, codInstructions: current ? `${current}\n\n${clause}` : clause });
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-[11px] rounded-lg transition cursor-pointer"
                            >
                              + Contrôle Avant Remise
                            </button>
                          </div>
                        </div>

                        {/* Note Réconciliation Flotte */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs">
                          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            <strong className="text-amber-300">Comptabilité des livreurs en direct :</strong> Les commandes en paiement à la livraison sont enregistrées en statut <em>En attente d'encaissement</em> et automatiquement décomptées dans l'onglet <strong>Livraison Autonome</strong> lors de la remise.
                          </p>
                        </div>
                      </div>

                      {/* Colonne Aperçu Visuel Client Instantané */}
                      <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Aperçu en direct pour l'acheteur :</span>
                          </span>

                          <div className={`p-3.5 rounded-xl border transition ${
                            localSettings.enableCashOnDelivery
                              ? 'bg-amber-50/10 border-amber-500/60 shadow-xs'
                              : 'bg-slate-900 border-slate-800 opacity-60'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <input type="radio" checked={localSettings.enableCashOnDelivery} readOnly className="accent-amber-500" />
                                <div>
                                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                                    <span>Paiement à la Livraison</span>
                                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 rounded">LE PLUS CHOISI</span>
                                  </span>
                                  <p className="text-[10px] text-slate-400">Réglez en espèces ou Mobile Money au coursier</p>
                                </div>
                              </div>
                              <Truck className="w-4 h-4 text-amber-400" />
                            </div>

                            {localSettings.enableCashOnDelivery && localSettings.codInstructions && (
                              <div className="mt-2.5 p-2 bg-slate-950/80 rounded-lg border border-slate-800 text-[10px] text-slate-300 italic whitespace-pre-line">
                                💬 &quot;{localSettings.codInstructions}&quot;
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 text-center font-mono">
                          {localSettings.enableCashOnDelivery ? 'Option actuellement visible au panier' : 'Option masquée au panier'}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SOUS-ONGLET 2 : MOBILE MONEY (WAVE, ORANGE MONEY, MTN, MOOV) */}
              {/* ========================================================================= */}
              {paymentSubTab === 'mobile_money' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Wave Mobile Money */}
                    <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-sky-500/30 space-y-3 shadow-xs hover:border-sky-500/50 transition">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm">
                            🌊
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white">Wave Mobile Money</h4>
                            <span className="text-[10px] text-sky-400 font-bold">0% de frais pour l'acheteur</span>
                          </div>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.enableWavePayment}
                            onChange={(e) => setLocalSettings({ ...localSettings, enableWavePayment: e.target.checked })}
                            className="rounded text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                          />
                          <span>{localSettings.enableWavePayment ? 'Actif' : 'Inactif'}</span>
                        </label>
                      </div>

                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Numéro Marchand / Réception Wave</label>
                          <input
                            type="text"
                            value={localSettings.waveMerchantPhone || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, waveMerchantPhone: e.target.value })}
                            placeholder="+221 77 890 12 34 ou +225 07..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Lien Direct Wave (Optionnel)</label>
                          <input
                            type="text"
                            value={localSettings.wavePaymentUrl || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, wavePaymentUrl: e.target.value })}
                            placeholder="https://pay.wave.com/m/M_..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Orange Money */}
                    <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-orange-500/30 space-y-3 shadow-xs hover:border-orange-500/50 transition">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-black text-sm">
                            🍊
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white">Orange Money (OM)</h4>
                            <span className="text-[10px] text-orange-400 font-bold">Transfert direct ou Code Marchand</span>
                          </div>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.enableOrangeMoney}
                            onChange={(e) => setLocalSettings({ ...localSettings, enableOrangeMoney: e.target.checked })}
                            className="rounded text-orange-500 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                          />
                          <span>{localSettings.enableOrangeMoney ? 'Actif' : 'Inactif'}</span>
                        </label>
                      </div>

                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Code Marchand ou Numéro Orange Money</label>
                          <input
                            type="text"
                            value={localSettings.orangeMoneyMerchantNumber || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, orangeMoneyMerchantNumber: e.target.value })}
                            placeholder="Ex: #144*391# ou +221 78 890 12 34"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono"
                          />
                          <p className="text-[10px] text-slate-500">Syntaxe USSD ou numéro de téléphone de votre compte marchand.</p>
                        </div>
                      </div>
                    </div>

                    {/* MTN Mobile Money */}
                    <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-amber-500/30 space-y-3 shadow-xs hover:border-amber-500/50 transition">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                            🟡
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white">MTN Mobile Money (MoMo)</h4>
                            <span className="text-[10px] text-amber-400 font-bold">Côte d'Ivoire & Sous-région</span>
                          </div>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.enableMtnMoney !== false}
                            onChange={(e) => setLocalSettings({ ...localSettings, enableMtnMoney: e.target.checked })}
                            className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                          />
                          <span>{localSettings.enableMtnMoney !== false ? 'Actif' : 'Inactif'}</span>
                        </label>
                      </div>

                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Numéro Marchand / Réception MoMo</label>
                          <input
                            type="text"
                            value={localSettings.mtnMerchantNumber || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, mtnMerchantNumber: e.target.value })}
                            placeholder="+225 05 89 01 23 45"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Moov Money */}
                    <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-cyan-500/30 space-y-3 shadow-xs hover:border-cyan-500/50 transition">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
                            🔵
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white">Moov Money (CI)</h4>
                            <span className="text-[10px] text-cyan-400 font-bold">Réseau Moov Africa</span>
                          </div>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.enableMoovMoney !== false}
                            onChange={(e) => setLocalSettings({ ...localSettings, enableMoovMoney: e.target.checked })}
                            className="rounded text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                          />
                          <span>{localSettings.enableMoovMoney !== false ? 'Actif' : 'Inactif'}</span>
                        </label>
                      </div>

                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-300">Numéro Marchand / Réception Moov</label>
                          <input
                            type="text"
                            value={localSettings.moovMerchantNumber || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, moovMerchantNumber: e.target.value })}
                            placeholder="+225 01 23 45 67 89"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SOUS-ONGLET 3 : CARTES BANCAIRES & PASSERELLE WEB */}
              {/* ========================================================================= */}
              {paymentSubTab === 'cards' && (
                <div className="p-5 sm:p-6 bg-slate-900 rounded-2xl border border-indigo-500/30 space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white uppercase tracking-wide">
                            Cartes Bancaires (Visa / Mastercard) & Liens Sécurisés
                          </h4>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase font-bold">
                            Diaspora & International 💳
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Idéal pour les acheteurs de la diaspora réglant par carte bancaire internationale via Stripe, PayTech ou CinetPay.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.enableCustomPaymentLink}
                        onChange={(e) => setLocalSettings({ ...localSettings, enableCustomPaymentLink: e.target.checked })}
                        className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{localSettings.enableCustomPaymentLink ? 'Mode Activé' : 'Désactivé'}</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Libellé du Bouton au Panier</label>
                      <input
                        type="text"
                        value={localSettings.customPaymentLinkLabel || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, customPaymentLinkLabel: e.target.value })}
                        placeholder="Ex: Carte Bancaire (Visa / Mastercard)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">URL du Lien de Paiement / Passerelle</label>
                      <input
                        type="url"
                        value={localSettings.customPaymentLinkUrl || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, customPaymentLinkUrl: e.target.value })}
                        placeholder="https://buy.stripe.com/... ou lien PayTech / CinetPay"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SOUS-ONGLET 4 : VIREMENT BANCAIRE & RIB / IBAN */}
              {/* ========================================================================= */}
              {paymentSubTab === 'bank' && (
                <div className="p-5 sm:p-6 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white uppercase tracking-wide">
                            Virement Bancaire Direct (RIB / IBAN)
                          </h4>
                          <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full uppercase font-bold">
                            Commandes B2B & Gros Volumes 🏦
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Transmettez vos coordonnées bancaires pour les virements de compte à compte.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.enableBankTransfer}
                        onChange={(e) => setLocalSettings({ ...localSettings, enableBankTransfer: e.target.checked })}
                        className="rounded text-indigo-500 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{localSettings.enableBankTransfer ? 'Mode Activé' : 'Désactivé'}</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Coordonnées Bancaires Complètes (RIB / IBAN / Titulaire)</label>
                    <textarea
                      rows={3}
                      value={localSettings.bankDetails || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankDetails: e.target.value })}
                      placeholder="Banque: BOA Sénégal / CBAO&#10;Titulaire: ELITE BOUTIQUE SARL&#10;RIB: SN08 SN01 2010 0345 6789 0123 45"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Persistent Action Bar - Compact */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-medium">
                    Tous vos réglages sont enregistrés de façon permanente dans PostgreSQL.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: ASSISTANT WHATSAPP */}
          {/* ========================================================================= */}
          {activeTab === 'whatsapp' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5 fill-emerald-400/20" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    Configuration WhatsApp Commercial
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configurez le numéro de destination et le modèle de message envoyé automatiquement par vos clients.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Numéro WhatsApp Commercial *</label>
                  <input
                    type="text"
                    value={localSettings.whatsappNumber || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                    placeholder="+221 77 890 12 34"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Modèle de Message Automatique</label>
                  <textarea
                    rows={6}
                    value={localSettings.whatsappAutoMessage || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappAutoMessage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer la Configuration WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MARKETING & PROMOTIONS */}
          {/* ========================================================================= */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Marketing Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-purple-500/30 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-600/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>Centre Marketing & Promotions</span>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        OFFRES & CAMPAGNES 2026
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gérez vos codes de réduction, générez des campagnes WhatsApp percutantes et pilotez vos offres spéciales.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentView('marketing')}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Voir la Page Client Marketing</span>
                  </button>
                </div>
              </div>

              {/* Marketing KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Codes Promo</span>
                    <BadgePercent className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-black text-white">4 Codes</p>
                  <p className="text-[11px] text-emerald-400 font-medium">100% Actifs & Testés</p>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Remise Max</span>
                    <Percent className="w-4 h-4 text-pink-400" />
                  </div>
                  <p className="text-2xl font-black text-pink-400">-35%</p>
                  <p className="text-[11px] text-slate-400">Sur les Ventes Flash</p>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Parrainage</span>
                    <Gift className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-400">5 000 F</p>
                  <p className="text-[11px] text-slate-400">Par ami recommandé</p>
                </div>

                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Packs Bundles</span>
                    <Package className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="text-2xl font-black text-cyan-400">3 Packs</p>
                  <p className="text-[11px] text-slate-400">Économies groupées</p>
                </div>
              </div>

              {/* STUDIO DE PUBLICITÉ & CRÉATION MÉDIA (AFFICHES & VIDÉOS PUB) */}
              <MarketingStudio />

              {/* SECTION 1: GESTION DES CODES PROMOTIONNELS */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">
                        Codes Promotionnels & Réductions Actives
                      </h2>
                      <p className="text-xs text-slate-400">Ces codes sont visibles et utilisables par vos clients sur la boutique.</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80 flex items-center gap-1.5 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Synchronisés sur la page /marketing</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      code: 'BIENVENUE5',
                      discount: '-5%',
                      badge: 'NOUVEAU CLIENT',
                      desc: 'Valable sur la 1ère commande sans minimum.',
                      min: 'Dès 1 FCFA',
                      color: 'border-pink-500/40 bg-pink-950/20'
                    },
                    {
                      code: 'VIP10',
                      discount: '-10%',
                      badge: 'REMISE PANIER',
                      desc: 'Remise dès 30 000 FCFA d\'achats.',
                      min: 'Dès 30 000 FCFA',
                      color: 'border-purple-500/40 bg-purple-950/20'
                    },
                    {
                      code: 'EXPRESS221',
                      discount: 'GRATUIT',
                      badge: 'LIVRAISON OFFERTE',
                      desc: 'Frais de livraison 100% offerts.',
                      min: 'Dès 25 000 FCFA',
                      color: 'border-emerald-500/40 bg-emerald-950/20'
                    },
                    {
                      code: 'DUOFLASH',
                      discount: '-15%',
                      badge: 'PACK DUO',
                      desc: '15% de remise dès 2 articles commandés.',
                      min: 'Pour 2 articles',
                      color: 'border-amber-500/40 bg-amber-950/20'
                    }
                  ].map((c) => {
                    const isCopied = copiedMarketingText === c.code;
                    return (
                      <div
                        key={c.code}
                        className={`p-5 rounded-2xl border ${c.color} space-y-3 flex flex-col justify-between`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900 text-slate-200 border border-slate-700">
                              {c.badge}
                            </span>
                            <span className="text-lg font-black text-white font-mono">{c.discount}</span>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-sm font-black text-indigo-300 font-mono tracking-wider">{c.code}</p>
                            <p className="text-xs text-slate-400 leading-tight">{c.desc}</p>
                          </div>

                          <p className="text-[11px] text-slate-400 font-medium">
                            Seuil : <span className="text-slate-200 font-bold">{c.min}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(c.code);
                            setCopiedMarketingText(c.code);
                            setTimeout(() => setCopiedMarketingText(null), 2000);
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Code copié !' : 'Copier le code'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: GÉNÉRATEUR IA DE CAMPAGNES (AÏDA - MERCHANDISER) */}
              <div className="bg-slate-900 rounded-2xl border border-indigo-500/30 p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">
                        Copilote & Générateur IA de Campagnes Marketing (Aïda)
                      </h2>
                      <p className="text-xs text-slate-400">Rédigez instantanément des messages promotionnels optimisés pour WhatsApp et les réseaux sociaux.</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/80 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Agent Merchandiser & Copywriter</span>
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'flash', label: '🔥 Vente Flash & Week-end', prompt: 'Vente Flash du week-end sur tout le catalogue avec remise -25%' },
                      { id: 'relance', label: '🛒 Relance Panier Abandonné', prompt: 'Offre exclusive pour finaliser sa commande avec livraison offerte' },
                      { id: 'luxe', label: '💎 Collection VIP & Luxe', prompt: 'Arrivage de montres et parfums d\'exception en série limitée' },
                      { id: 'fetes', label: '🎉 Fêtes & Événements', prompt: 'Offre spéciale cadeaux et packs duo avec code BIENVENUE5' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => {
                          setMarketingTone(btn.id as any);
                          setMarketingTopic(btn.prompt);
                        }}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                          marketingTone === btn.id
                            ? 'bg-purple-950/80 border-purple-400 text-purple-200 ring-2 ring-purple-500/30'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Sujet / Thème de la Campagne Promotionnelle :</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={marketingTopic}
                        onChange={(e) => setMarketingTopic(e.target.value)}
                        placeholder="Ex: Vente flash sneakers -30% valable jusqu'à dimanche soir..."
                        className="flex-1 w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        disabled={isGeneratingMarketingCopy || !marketingTopic.trim()}
                        onClick={() => {
                          setIsGeneratingMarketingCopy(true);
                          setTimeout(() => {
                            const msg = `🔥 *OFFRE EXCLUSIVE ${settings.storeName.toUpperCase()} !*\n\n` +
                              `✨ *${marketingTopic}*\n\n` +
                              `Profitez dès maintenant de nos réductions exclusives jusqu'à *-30%* sur une sélection d'articles haut de gamme !\n\n` +
                              `🎁 *Codes Promo Actifs :*\n` +
                              `• *BIENVENUE5* : -5% de bienvenue\n` +
                              `• *VIP10* : -10% dès 30 000 FCFA d'achats\n` +
                              `• *EXPRESS221* : Livraison offerte dès 25 000 FCFA\n\n` +
                              `🚚 *Livraison rapide 24h/48h* partout au Sénégal avec paiement sécurisé (Wave, Orange Money ou Espèces à la livraison).\n\n` +
                              `👉 Cliquez sur le lien pour commander directement sur WhatsApp :\n` +
                              `https://wa.me/${settings.whatsappNumber}?text=Bonjour%20je%20souhaite%20profiter%20de%20l%27offre%20marketing`;
                            setMarketingAiOutput(msg);
                            setIsGeneratingMarketingCopy(false);
                          }, 600);
                        }}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{isGeneratingMarketingCopy ? 'Génération...' : 'Générer le Message IA'}</span>
                      </button>
                    </div>
                  </div>

                  {marketingAiOutput && (
                    <div className="p-5 bg-slate-950 rounded-2xl border border-purple-500/40 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                        <span>Message Commercial Généré Prêt à Diffuser :</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(marketingAiOutput);
                            setCopiedMarketingText('ai-msg');
                            setTimeout(() => setCopiedMarketingText(null), 2000);
                          }}
                          className="text-xs text-purple-400 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {copiedMarketingText === 'ai-msg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMarketingText === 'ai-msg' ? 'Copié !' : 'Copier le message'}</span>
                        </button>
                      </div>

                      <pre className="font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed font-medium bg-slate-900 p-4 rounded-xl border border-slate-800">
                        {marketingAiOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: BUNDLES & OFFRES GROUPÉES */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                  <Gift className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-base font-black text-white uppercase tracking-wider">
                      Packs Promotionnels & Ventes Groupées (Bundles)
                    </h2>
                    <p className="text-xs text-slate-400">Ces packs encouragent l'achat combiné avec une économie immédiate en FCFA.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'Pack Prestige & Horlogerie',
                      items: 'Montre Chronographe + Extrait de Parfum Oud (100ml)',
                      sepPrice: 121000,
                      packPrice: 95000,
                      savings: 26000,
                      badge: 'ÉCONOMIE -25%'
                    },
                    {
                      name: 'Pack High-Tech Nomade',
                      items: 'Smartwatch Horizon Fit Ultra + Enceinte Bluetooth SoundWave 360°',
                      sepPrice: 71500,
                      packPrice: 54000,
                      savings: 17500,
                      badge: 'PERFORMANCE -30%'
                    },
                    {
                      name: 'Pack Look Urbain & Solaire',
                      items: 'Sneakers Velocity Runner + Lunettes Aviateur Titanium',
                      sepPrice: 64500,
                      packPrice: 48000,
                      savings: 16500,
                      badge: 'TENDANCE -28%'
                    }
                  ].map((pk, idx) => (
                    <div key={idx} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/80">
                          {pk.badge}
                        </span>
                        <h4 className="text-sm font-black text-white">{pk.name}</h4>
                        <p className="text-xs text-slate-400 leading-tight">{pk.items}</p>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Séparé :</span>
                          <span className="line-through">{formatPrice(pk.sepPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">Prix Pack :</span>
                          <span className="text-sm font-black text-emerald-400">{formatPrice(pk.packPrice)}</span>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-bold text-right">
                          Économie : {formatPrice(pk.savings)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: GESTIONNAIRE DES PAGES & TEXTES LÉGAUX (CMS) */}
          {/* ========================================================================= */}
          {activeTab === 'cms' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header with Master Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-600/30">
                    <FileEdit className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>Pages & Textes Légaux (CMS)</span>
                      <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {cmsSubTab === 'privacy' ? 'Politique de Confidentialité 🔒' :
                         cmsSubTab === 'terms' ? 'Conditions d\'Utilisation & Vente 📜' :
                         cmsSubTab === 'returns' ? 'Retours & Remboursements 📦' :
                         cmsSubTab === 'delivery' ? 'Politique de Livraison 🚚' :
                         cmsSubTab === 'about' ? 'À Propos de la Boutique ℹ️' : 'Coordonnées & Support 📞'}
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Rédigez, modifiez et prévisualisez la politique de confidentialité, les CGU/CGV et les mentions obligatoires de votre boutique.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCmsPreviewMode(!cmsPreviewMode)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                      cmsPreviewMode
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{cmsPreviewMode ? 'Mode Édition' : 'Mode Aperçu'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView(
                      cmsSubTab === 'privacy' ? 'privacy' : 
                      cmsSubTab === 'terms' ? 'terms' : 
                      cmsSubTab === 'returns' ? 'delivery' : 
                      cmsSubTab === 'delivery' ? 'delivery' : 
                      cmsSubTab === 'about' ? 'about' : 'contact'
                    )}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                    title="Voir la page publique sur la boutique"
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    <span className="hidden sm:inline">Tester sur la Boutique</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs Bar */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                {[
                  { id: 'privacy', label: '1. Politique de Confidentialité', icon: Lock, badge: 'Obligatoire' },
                  { id: 'terms', label: '2. Conditions d\'Utilisation (CGU / CGV)', icon: FileText, badge: 'Contrat' },
                  { id: 'returns', label: '3. Retours & Remboursements', icon: RotateCcw, badge: '14 Jours' },
                  { id: 'delivery', label: '4. Politique de Livraison', icon: Truck, badge: '24/48h' },
                  { id: 'about', label: '5. À Propos de la Boutique', icon: HelpCircle, badge: 'Histoire' },
                  { id: 'contact', label: '6. Coordonnées & Contact', icon: Phone, badge: 'Support' },
                ].map((tab) => {
                  const isActive = cmsSubTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCmsSubTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {tab.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* =========================================================
                  SUB-PAGE 1: POLITIQUE DE CONFIDENTIALITÉ
                 ========================================================= */}
              {cmsSubTab === 'privacy' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider">
                          Politique de Confidentialité & Protection des Données
                        </h2>
                        <p className="text-xs text-slate-400">
                          Texte légal affiché aux clients sur la collecte, l'utilisation et la non-revente de leurs données.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetToLegalTemplate('privacyText')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                        title="Rétablir le modèle juridique sénégalais d'origine"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Modèle Officiel</span>
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {localSettings.privacyText?.length || 0} caractères
                      </span>
                    </div>
                  </div>

                  {/* Quick Clause Insertions */}
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ajouter rapidement une clause juridique :</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsertClause('privacyText', 'CONFORMITÉ LOI CDP SÉNÉGAL (LOI N° 2008-12) :\nLes traitements de données à caractère personnel opérés sur notre plateforme sont conformes aux dispositions de la loi sénégalaise n° 2008-12 relative à la protection des données à caractère personnel. Les utilisateurs peuvent solliciter la CDP ou notre délégué à la protection des données pour toute réclamation.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Loi CDP Sénégal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('privacyText', 'SÉCURITÉ DES PAIEMENTS MOBILE MONEY (WAVE / ORANGE MONEY) :\nLes règlements par Wave, Orange Money ou carte bancaire sont exécutés sur des passerelles chiffrées sécurisées PCI-DSS. Notre boutique n\'a jamais accès à vos codes PIN, mots de passe à usage unique (OTP) ou identifiants bancaires secrets.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Sécurité Wave/OM
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('privacyText', 'POLITIQUE RELATIVE AUX COOKIES & LOCAL STORAGE :\nNous utilisons des cookies et le stockage local sécurisé exclusivement pour sauvegarder votre panier d\'achats, mémoriser vos préférences de navigation et sécuriser vos connexions clients.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Clause Cookies
                      </button>
                    </div>
                  </div>

                  {/* Editor vs Live Preview */}
                  {cmsPreviewMode ? (
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold border-b border-slate-800 pb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aperçu en direct (rendu public client)</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {localSettings.privacyText}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Contenu de la Politique de Confidentialité</label>
                      <textarea
                        rows={16}
                        value={localSettings.privacyText || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, privacyText: e.target.value })}
                        placeholder="Rédigez ici votre politique de confidentialité..."
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white leading-relaxed focus:ring-2 focus:ring-cyan-500 focus:outline-hidden font-sans"
                      />
                    </div>
                  )}

                  {/* Information Callout */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-emerald-300">Pourquoi cette page est essentielle ?</p>
                      <p className="text-slate-400 leading-relaxed">
                        La politique de confidentialité rassure vos clients sur l'utilisation de leur numéro de téléphone pour les livraisons, protège votre entreprise juridiquement et garantit la conformité avec les réglementations sur les données personnelles.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-PAGE 2: CONDITIONS D'UTILISATION & VENTE (CGU / CGV)
                 ========================================================= */}
              {cmsSubTab === 'terms' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider">
                          Conditions Générales d'Utilisation & de Vente (CGU / CGV)
                        </h2>
                        <p className="text-xs text-slate-400">
                          Contrat de vente en ligne régissant les prix en FCFA, les modalités de paiement, les livraisons et les garanties.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetToLegalTemplate('termsText')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                        title="Rétablir le modèle juridique sénégalais d'origine"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Modèle Officiel</span>
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {localSettings.termsText?.length || 0} caractères
                      </span>
                    </div>
                  </div>

                  {/* Quick Clause Insertions */}
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ajouter rapidement une clause contractuelle :</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsertClause('termsText', 'MODALITÉS DE PAIEMENT SÉCURISÉ :\nLe règlement s\'effectue en Francs CFA (FCFA) via Wave, Orange Money ou en espèces à la livraison. En cas de paiement à la livraison, le client s\'engage à préparer le montant exact convenu lors de la venue du coursier.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Modalités Paiement Wave/OM/Espèces
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('termsText', 'DÉLAIS D\'EXPÉDITION ET LIVRAISON EXPRESS :\nToute commande validée avant 14h est expédiée le jour même. Le délai de livraison est de 24h à Dakar et de 48h à 72h dans les régions du Sénégal. Le client doit demeurer joignable sur le numéro fourni.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Délais Dakar & Régions
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('termsText', 'DROIT DE RÉTRACTATION ET RETOURS (14 JOURS) :\nLe client dispose d\'un délai légal de 14 jours francs pour retourner un produit non utilisé dans son emballage d\'origine pour échange ou remboursement.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Droit Rétractation 14 Jours
                      </button>
                    </div>
                  </div>

                  {/* Editor vs Live Preview */}
                  {cmsPreviewMode ? (
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold border-b border-slate-800 pb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aperçu en direct (rendu public client)</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {localSettings.termsText}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Contenu des Conditions Générales de Vente (CGU/CGV)</label>
                      <textarea
                        rows={16}
                        value={localSettings.termsText || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, termsText: e.target.value })}
                        placeholder="Rédigez ici vos conditions d'utilisation et de vente..."
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-sans"
                      />
                    </div>
                  )}

                  {/* Information Callout */}
                  <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-indigo-300">Cadre Juridique E-Commerce</p>
                      <p className="text-slate-400 leading-relaxed">
                        Ces conditions fixent les règles du jeu avec vos acheteurs : engagement ferme dès la commande, modalités de règlement, politique contre les désistements abusifs de commande et encadrement des garanties.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-PAGE 3: POLITIQUE DE RETOUR & REMBOURSEMENT
                 ========================================================= */}
              {cmsSubTab === 'returns' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider">
                          Politique de Retour & Remboursement (14 Jours)
                        </h2>
                        <p className="text-xs text-slate-400">
                          Règles de rétractation, conditions de reprise des articles et délais de remboursement.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetToLegalTemplate('returnPolicyText')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                        title="Rétablir le modèle officiel de retour"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Modèle Officiel</span>
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {localSettings.returnPolicyText?.length || 0} caractères
                      </span>
                    </div>
                  </div>

                  {/* Quick Clause Insertions */}
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ajouter rapidement une clause de retour :</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsertClause('returnPolicyText', 'DROIT DE RÉTRACTATION (14 JOURS) :\nConformément aux dispositions en vigueur, le client bénéficie d\'un délai légal de 14 jours francs à compter de la date de livraison pour demander le retour d\'un article sans pénalité.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Délai 14 Jours Francs
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('returnPolicyText', 'CONDITIONNEMENT & ÉTAT DU PRODUIT :\nL\'article doit obligatoirement être retourné complet, dans son emballage d\'origine non détérioré, avec l\'ensemble de ses accessoires, étiquettes scellées et notices.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + État Neuf d\'Origine
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('returnPolicyText', 'MODALITÉS DE REMBOURSEMENT RAPIDE :\nLe remboursement est émis sous 48h ouvrées maximum suivant la réception et la vérification du produit par nos équipes, directement via virement Mobile Money (Wave ou Orange Money) sur le numéro du client.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Remboursement Wave/OM 48h
                      </button>
                    </div>
                  </div>

                  {/* Editor vs Live Preview */}
                  {cmsPreviewMode ? (
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-bold border-b border-slate-800 pb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aperçu en direct (rendu public client)</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {localSettings.returnPolicyText}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Contenu de la Politique de Retour & Remboursement</label>
                      <textarea
                        rows={14}
                        value={localSettings.returnPolicyText || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, returnPolicyText: e.target.value })}
                        placeholder="Rédigez ici les conditions de retour et de remboursement..."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed font-sans"
                      />
                    </div>
                  )}

                  {/* Callout */}
                  <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-amber-300">Gage de Confiance & Satisfaction Client</p>
                      <p className="text-slate-400 leading-relaxed">
                        Une politique de retour claire et rassurante augmente significativement le taux de conversion de votre boutique en levant les hésitations des nouveaux acheteurs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-PAGE 4: DÉLAIS & POLITIQUE DE LIVRAISON
                 ========================================================= */}
              {cmsSubTab === 'delivery' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider">
                          Délais & Politique de Livraison Express
                        </h2>
                        <p className="text-xs text-slate-400">
                          Informations sur les tournées de coursiers, les délais de livraison à Dakar et dans les régions.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResetToLegalTemplate('deliveryPolicyText')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                        title="Rétablir le modèle officiel de livraison"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Modèle Officiel</span>
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {localSettings.deliveryPolicyText?.length || 0} caractères
                      </span>
                    </div>
                  </div>

                  {/* Quick Clause Insertions */}
                  <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ajouter rapidement une clause de livraison :</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleInsertClause('deliveryPolicyText', 'LIVRAISON EXPRESS DAKAR & BANLIEUE (24H) :\nToute commande validée avant 14h est prise en charge pour une livraison en 24h à Dakar (Plateau, Almadies, Mermoz, Maristes, Guédiawaye, Pikine, Rufisque).')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Express Dakar 24h
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('deliveryPolicyText', 'EXPÉDITION SÉCURISÉE DANS LES RÉGIONS (48H-72H) :\nLes envois vers Thiès, Mbour, Saint-Louis, Touba, Kaolack et Ziguinchor sont acheminés par des transporteurs sécurisés partenaires avec remise contre signature sous 48h à 72h.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Expédition Régions 48h-72h
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInsertClause('deliveryPolicyText', 'AVISAGE & CONTACT LIVREUR :\nLe coursier contacte systématiquement le client par appel vocal ou message WhatsApp avant son passage pour convenir de l\'heure et du point précis de livraison.')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                      >
                        + Avisage WhatsApp Livreur
                      </button>
                    </div>
                  </div>

                  {/* Editor vs Live Preview */}
                  {cmsPreviewMode ? (
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-blue-400 font-bold border-b border-slate-800 pb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aperçu en direct (rendu public client)</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {localSettings.deliveryPolicyText}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Contenu de la Politique de Livraison</label>
                      <textarea
                        rows={14}
                        value={localSettings.deliveryPolicyText || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, deliveryPolicyText: e.target.value })}
                        placeholder="Précisez ici les zones desservies, les délais d'expédition et le fonctionnement des coursiers..."
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed font-sans"
                      />
                    </div>
                  )}

                  {/* Callout */}
                  <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-start gap-3">
                    <Truck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-blue-300">Transparence Logistique</p>
                      <p className="text-slate-400 leading-relaxed">
                        Des explications limpides sur les délais évitent les relances répétées auprès de votre service client et réduisent les refus de colis lors de la présentation du livreur.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-PAGE 4: À PROPOS & HISTOIRE
                 ========================================================= */}
              {cmsSubTab === 'about' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">
                        Histoire & Présentation de la Boutique (À Propos)
                      </h2>
                      <p className="text-xs text-slate-400">
                        Racontez l'histoire, la vision et les engagements de qualité de votre boutique aux visiteurs.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Texte de Présentation "À Propos de Nous"</label>
                    <textarea
                      rows={10}
                      value={localSettings.aboutUsText || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, aboutUsText: e.target.value })}
                      placeholder="Présentez votre entreprise, son expertise et ses garanties..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUB-PAGE 5: COORDONNÉES PUBLIQUES & CONTACT
                 ========================================================= */}
              {cmsSubTab === 'contact' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">
                        Coordonnées Publiques & Liens de Contact
                      </h2>
                      <p className="text-xs text-slate-400">
                        Informations de contact affichées sur les mentions légales, le pied de page et les factures.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Email Officiel de Contact</label>
                      <input
                        type="email"
                        value={localSettings.contactEmail || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Numéro WhatsApp Commercial</label>
                      <input
                        type="text"
                        value={localSettings.whatsappNumber || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Téléphone Appel Direct</label>
                      <input
                        type="text"
                        value={localSettings.contactPhone || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Adresse Physique / Siège</label>
                      <input
                        type="text"
                        value={localSettings.contactAddress || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactAddress: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: EXPLORATEUR DE PAGES */}
          {/* ========================================================================= */}
          {activeTab === 'pages-explorer' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    Explorateur des Vues & Pages Clients
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Accédez directement à chaque page publique pour vérifier son rendu.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { view: 'home', title: 'Page d\'Accueil', desc: 'Hero banner, Ventes Flash & Top Classement' },
                  { view: 'shop', title: 'Catalogue Complet', desc: 'Recherche et filtres avancés' },
                  { view: 'marketing', title: 'Page Marketing & VIP', desc: 'Codes promos, packs groupés, parrainage WhatsApp & fidélité VIP' },
                  { view: 'terms', title: 'Conditions d\'Utilisation & CGV', desc: 'Règles contractuelles, paiements Wave/OM et garanties' },
                  { view: 'privacy', title: 'Politique de Confidentialité', desc: 'Protection des données personnelles (CDP/Sénégal)' },
                  { view: 'delivery', title: 'Livraison & Retours', desc: 'Délais et tarifs' },
                  { view: 'faq', title: 'Centre d\'Aide / FAQ', desc: 'Questions fréquentes' },
                  { view: 'contact', title: 'Support Client', desc: 'Coordonnées & WhatsApp direct' }
                ].map((pg, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentView(pg.view as AppView)}
                    className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-2xl text-left transition cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-black text-sm text-white group-hover:text-indigo-400 transition-colors">{pg.title}</p>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{pg.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: PARAMÈTRES GÉNÉRAUX AVEC SOUS-PAGES INDÉPENDANTES (SUB-PAGES) */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header with Master Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                      <span>Paramètres Généraux</span>
                      <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {settingsSubTab === 'store' ? 'Boutique, Logo & Devise' :
                         settingsSubTab === 'ai' ? 'Multi-LLM & Clés API' :
                         settingsSubTab === 'shipping' ? 'Livraison & Délais' :
                         settingsSubTab === 'legal' ? 'Pages & Textes CMS' :
                         settingsSubTab === 'pages' ? 'Explorateur de Vues' :
                         settingsSubTab === 'smtp' ? 'Serveur Email SMTP' :
                         settingsSubTab === 'telegram' ? 'Alertes Telegram' :
                         settingsSubTab === 'seo' ? 'Référencement & SEO' :
                         settingsSubTab === 'security' ? 'Sécurité du Compte' : 'Maintenance'}
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Espace de contrôle centralisé, divisé en sous-pages indépendantes pour une gestion claire et professionnelle.
                    </p>
                  </div>
                </div>

                {settingsSubTab !== 'security' && (
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les Modifications</span>
                  </button>
                )}
              </div>

              {/* Sous-Pages Navigation Bar (Tabs) */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                {[
                  { id: 'store', label: '1. Boutique & Logo', icon: ShoppingBag, badge: 'FCFA' },
                  { id: 'ai', label: '2. Agent IA & Clés API', icon: Bot, badge: localSettings.aiProvider?.toUpperCase() || 'GEMINI' },
                  { id: 'shipping', label: '3. Tarifs & Livraison', icon: Package, badge: 'Express' },
                  { id: 'legal', label: '4. Pages & Textes Légaux (CMS)', icon: FileText, badge: 'CMS' },
                  { id: 'pages', label: '5. Explorateur de Vues', icon: Globe, badge: 'Vues' },
                  { id: 'smtp', label: '6. Email & Serveur SMTP', icon: Mail, badge: localSettings.smtpEnabled ? 'Actif 🟢' : 'Inactif' },
                  { id: 'telegram', label: '7. Telegram & Alertes', icon: Send, badge: localSettings.telegramEnabled ? 'Actif 🟢' : 'Inactif' },
                  { id: 'seo', label: '8. Référencement & SEO', icon: Search, badge: 'Google 🔍' },
                  { id: 'security', label: '9. Sécurité du Compte', icon: Lock, badge: 'Admin' },
                  { id: 'maintenance', label: '10. Maintenance & Système', icon: AlertTriangle, badge: 'Système' },
                ].map((tab) => {
                  const isActive = settingsSubTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSettingsSubTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ================================================================= */}
              {/* SOUS-PAGE 1: BOUTIQUE & DEVISE */}
              {/* ================================================================= */}
              {settingsSubTab === 'store' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Identité & Coordonnées Publiques</h2>
                      <p className="text-xs text-slate-400">Informations générales affichées sur l'en-tête, le pied de page et le widget client.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Nom Officiel de la Boutique *</label>
                      <input
                        type="text"
                        value={localSettings.storeName || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                        placeholder="Ex: ELITE BOUTIQUE"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Devise Principale du Système</label>
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-950 border border-emerald-500/30 rounded-xl text-xs font-black text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Franc CFA (FCFA) • Fixé & Exclusif</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300">Slogan Commercial</label>
                      <input
                        type="text"
                        value={localSettings.storeSlogan || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, storeSlogan: e.target.value })}
                        placeholder="Ex: L'élégance et le style à votre portée au Sénégal"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Email Officiel de Contact</label>
                      <input
                        type="email"
                        value={localSettings.contactEmail || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                        placeholder="contact@boutique.sn"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Téléphone d'Appel Direct</label>
                      <input
                        type="text"
                        value={localSettings.contactPhone || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                        placeholder="+221 77 000 00 00"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300">Numéro WhatsApp Commercial</label>
                      <input
                        type="text"
                        value={localSettings.whatsappNumber || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                        placeholder="+221770000000"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* Mode Feed Shopping Photo Configuration */}
                  <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-cyan-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold shadow-xs">
                          <Film className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white">Mode Feed Shopping Photo</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              localSettings.tiktokFeedEnabled !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {localSettings.tiktokFeedEnabled !== false ? '● Actif' : '● Désactivé'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Active le bouton flottant et un catalogue photo vertical immersif avec swipe fluide et achat en 1 clic.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            tiktokFeedEnabled: localSettings.tiktokFeedEnabled === false ? true : false,
                          })}
                          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            localSettings.tiktokFeedEnabled !== false ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                          title={localSettings.tiktokFeedEnabled !== false ? 'Désactiver le Feed Shopping' : 'Activer le Feed Shopping'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              localSettings.tiktokFeedEnabled !== false ? 'translate-x-7' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-200">Bouton Flottant Lumineux</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {localSettings.tiktokFeedEnabled !== false 
                              ? 'Visible en bas à gauche de la page d\'accueil et du catalogue.' 
                              : 'Masqué sur toute la boutique.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-start gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-200">Bouton Menu & Navigation</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {localSettings.tiktokFeedEnabled !== false 
                              ? 'Accessible dans la barre supérieure et le tiroir mobile.' 
                              : 'Masqué dans la navigation.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {localSettings.tiktokFeedEnabled !== false && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <p className="text-[11px] text-slate-400">
                          Testez l'expérience utilisateur telle qu'elle apparaît pour vos visiteurs :
                        </p>
                        <button
                          type="button"
                          onClick={() => openFeed()}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Film className="w-3.5 h-3.5 text-rose-400" />
                          <span>Tester le Feed en Direct</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Programme Partenaires & Micro-Franchises Configuration */}
                  <div className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white">Programme Partenaires & Ambassadeurs</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              localSettings.partnerProgramEnabled !== false
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {localSettings.partnerProgramEnabled !== false ? '● Actif' : '● Désactivé'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Permettre aux influenceurs et apporteurs d'affaires de créer leur micro-franchise et toucher des commissions.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            partnerProgramEnabled: localSettings.partnerProgramEnabled === false ? true : false,
                          })}
                          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            localSettings.partnerProgramEnabled !== false ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                          title={localSettings.partnerProgramEnabled !== false ? 'Désactiver le programme partenaire' : 'Activer le programme partenaire'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              localSettings.partnerProgramEnabled !== false ? 'translate-x-7' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Taux de Commission par Défaut (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={localSettings.defaultPartnerCommissionRate ?? 10}
                            onChange={(e) => setLocalSettings({ ...localSettings, defaultPartnerCommissionRate: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-black focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Pourcentage versé sur chaque commande générée par un lien affilié.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Seuil Minimum de Retrait (FCFA)</label>
                        <input
                          type="number"
                          min={1000}
                          step={500}
                          value={localSettings.minPayoutAmount ?? 5000}
                          onChange={(e) => setLocalSettings({ ...localSettings, minPayoutAmount: Number(e.target.value) })}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-black focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500">Montant minimum requis pour demander un virement Wave ou Orange Money.</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <p className="text-xs text-slate-400">
                        Accédez au tableau de bord complet des affiliations, validations de comptes et retraits :
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('partners')}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Ouvrir Gestionnaire Partenaires →</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 2: INTELLIGENCE ARTIFICIELLE (MULTI-LLM & CLÉS API) */}
              {/* ================================================================= */}
              {settingsSubTab === 'ai' && (
                <div className="bg-slate-900 rounded-2xl border border-indigo-500/30 p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <span>Fournisseurs d'IA, Clés API & Modèles Dynamiques</span>
                          <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full uppercase">
                            {localSettings.aiProvider || 'GEMINI'} ACTIF ⚡
                          </span>
                        </h2>
                        <p className="text-xs text-slate-400">Configurez vos clés API de fournisseurs IA pour alimenter la vente autonome 24/7 et la rédaction de fiches articles.</p>
                      </div>
                    </div>

                  </div>

                  {/* 1. Provider Selection Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                      1. Sélectionnez le Fournisseur IA Actif :
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'groq', name: '⚡ Groq', badge: 'Catalogue API', desc: 'Modèles selon votre clé' },
                        { id: 'gemini', name: '🌟 Google Gemini', badge: 'Catalogue API', desc: 'Modèles selon votre clé' },
                        { id: 'openai', name: '🧠 OpenAI', badge: 'Catalogue API', desc: 'Modèles selon votre clé' },
                        { id: 'deepseek', name: '🚀 DeepSeek', badge: 'Catalogue API', desc: 'Modèles selon votre clé' },
                        { id: 'claude', name: '🔮 Anthropic Claude', badge: 'Catalogue API', desc: 'Modèles selon votre clé' },
                        { id: 'glm', name: '🌐 Zhipu AI (GLM)', badge: 'Catalogue API', desc: 'Catalogue non publié par GLM' },
                        { id: 'local', name: '💻 Moteur Local', badge: 'Sans Clé API', desc: 'Réponse locale sans modèle distant' },
                      ].map((prov) => {
                        const isSelected = (localSettings.aiProvider || 'gemini') === prov.id;
                        return (
                          <button
                            key={prov.id}
                            type="button"
                            onClick={() => {
                              const updated = { ...localSettings, aiProvider: prov.id as any, aiModel: '' };
                              setLocalSettings(updated);
                              const key = getActiveApiKey(prov.id, updated);
                              fetchModelsForProvider(prov.id, key);
                            }}
                            className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer shadow-xs ${
                              isSelected
                                ? 'bg-gradient-to-tr from-indigo-900/90 to-teal-900/90 border-indigo-400 text-white ring-2 ring-indigo-500/50'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-black block">{prov.name}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5 block">{prov.desc}</span>
                            </div>
                            <span className={`text-[9px] font-bold mt-2 px-2 py-0.5 rounded-md inline-block w-fit ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-500'
                            }`}>
                              {prov.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. API Key Input Field */}
                  {localSettings.aiProvider !== 'local' && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <span>Clé API pour {localSettings.aiProvider ? localSettings.aiProvider.toUpperCase() : 'FOURNISSEUR'} :</span>
                          {getActiveApiKey(localSettings.aiProvider || 'gemini', localSettings) ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                              <Check className="w-3 h-3" />
                              <span>Clé Configurée</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-md">
                              <span>Clé requise</span>
                            </span>
                          )}
                        </label>

                        {/* Direct Links */}
                        {localSettings.aiProvider === 'groq' && (
                          <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                            <span>Créer une clé sur console.groq.com</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {localSettings.aiProvider === 'gemini' && (
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                            <span>Créer une clé sur Google AI Studio</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {localSettings.aiProvider === 'openai' && (
                          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                            <span>Créer une clé sur platform.openai.com</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {localSettings.aiProvider === 'deepseek' && (
                          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                            <span>Créer une clé sur platform.deepseek.com</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {localSettings.aiProvider === 'claude' && (
                          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                            <span>Créer une clé sur console.anthropic.com</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {localSettings.aiProvider === 'glm' && (
                          <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                            <span>Créer une clé sur Zhipu AI / GLM</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={
                            localSettings.aiProvider === 'groq' ? (localSettings.groqApiKey || '') :
                            localSettings.aiProvider === 'openai' ? (localSettings.openaiApiKey || '') :
                            localSettings.aiProvider === 'deepseek' ? (localSettings.deepseekApiKey || '') :
                            localSettings.aiProvider === 'claude' ? (localSettings.claudeApiKey || '') :
                            localSettings.aiProvider === 'glm' ? (localSettings.glmApiKey || '') :
                            (localSettings.geminiApiKey || '')
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const prov = localSettings.aiProvider || 'gemini';
                            if (prov === 'groq') setLocalSettings({ ...localSettings, groqApiKey: val });
                            else if (prov === 'openai') setLocalSettings({ ...localSettings, openaiApiKey: val });
                            else if (prov === 'deepseek') setLocalSettings({ ...localSettings, deepseekApiKey: val });
                            else if (prov === 'claude') setLocalSettings({ ...localSettings, claudeApiKey: val });
                            else if (prov === 'glm') setLocalSettings({ ...localSettings, glmApiKey: val });
                            else setLocalSettings({ ...localSettings, geminiApiKey: val });
                          }}
                          placeholder={`Collez votre clé API ${localSettings.aiProvider?.toUpperCase() || ''}...`}
                          className="w-full pl-3.5 pr-20 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showApiKey ? 'Masquer' : 'Afficher'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3. Dynamic Model Retrieval & Selection Area */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <label className="text-xs font-black text-slate-200 uppercase tracking-wider">
                          2. Sélection & Récupération Dynamique du Modèle :
                        </label>
                      </div>

                      {/* Dynamic Fetch Button */}
                      <button
                        type="button"
                        disabled={isLoadingModels}
                        onClick={() => {
                          const prov = localSettings.aiProvider || 'gemini';
                          const key = getActiveApiKey(prov, localSettings);
                          fetchModelsForProvider(prov, key);
                        }}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
                        <span>{isLoadingModels ? 'Récupération en cours...' : '🔄 Récupérer les Modèles en Direct'}</span>
                      </button>
                    </div>

                    {/* Status Badge */}
                    {modelFetchSource && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{modelFetchSource} ({availableModels.length} modèles détectés)</span>
                      </div>
                    )}

                    {modelFetchError && (
                      <div className="flex items-center gap-2 text-[11px] text-rose-400 font-medium bg-rose-950/40 border border-rose-900 p-2 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{modelFetchError}</span>
                      </div>
                    )}

                    {localSettings.aiProvider === 'local' ? (
                      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-3 text-xs text-slate-400">
                        Le moteur local ne nécessite aucune clé API et ne possède pas de modèle distant à sélectionner.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Modèle réel retourné par {localSettings.aiProvider?.toUpperCase()}
                        </label>
                        <select
                          value={localSettings.aiModel || ''}
                          onChange={(e) => setLocalSettings(prev => ({ ...prev, aiModel: e.target.value }))}
                          disabled={isLoadingModels || availableModels.length === 0}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-50"
                        >
                          <option value="">
                            {isLoadingModels ? 'Récupération des modèles...' : availableModels.length === 0 ? 'Aucun modèle réel disponible' : 'Sélectionnez un modèle réel'}
                          </option>
                          {availableModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} {m.description ? `— ${m.description}` : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-500">
                          Seuls les identifiants retournés par la clé API active peuvent être enregistrés.
                        </p>
                      </div>
                    )}

                    {/* Temperature Slider */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">Créativité / Température de Réponse :</span>
                        <span className="font-black text-indigo-400 font-mono">{localSettings.aiTemperature ?? 0.7}</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        value={localSettings.aiTemperature ?? 0.7}
                        onChange={(e) => setLocalSettings({ ...localSettings, aiTemperature: parseFloat(e.target.value) })}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        <span>0.1 (Précis, Factuel & Strict)</span>
                        <span>0.7 (Équilibré & Vendeur)</span>
                        <span>1.0 (Créatif & Spontané)</span>
                      </div>
                    </div>

                    {/* Custom Prompt Textarea */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Consignes & Règles Commerciales Spécifiques pour l'IA (System Prompt)
                      </label>
                      <textarea
                        rows={3}
                        value={localSettings.aiCustomInstructions || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, aiCustomInstructions: e.target.value })}
                        placeholder="Ex: Toujours rappeler que la livraison à Dakar est sous 24h, proposer des réductions si la commande dépasse 3 articles..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 3: TARIFS & LIVRAISON */}
              {/* ================================================================= */}
              {settingsSubTab === 'shipping' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Tarification & Délais d'Expédition</h2>
                      <p className="text-xs text-slate-400">Montants appliqués au panier et délais communiqués par l'Agent IA en FCFA.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Frais de Livraison Standard (FCFA)</label>
                      <input
                        type="number"
                        value={localSettings.standardShippingFee ?? 2000}
                        onChange={(e) => setLocalSettings({ ...localSettings, standardShippingFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300">Seuil de Livraison Gratuite (FCFA)</label>
                      <input
                        type="number"
                        value={localSettings.freeShippingThreshold ?? 50000}
                        onChange={(e) => setLocalSettings({ ...localSettings, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300">Texte Explicatif de la Politique de Livraison</label>
                      <textarea
                        rows={4}
                        value={localSettings.deliveryPolicyText || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, deliveryPolicyText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 4: TEXTES LÉGAUX & CMS - SÉPARATION PAR PAGES DÉDIÉES */}
              {/* ================================================================= */}
              {settingsSubTab === 'legal' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Master Header */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Pages de Contenu & Textes Légaux (CMS)
                          </h2>
                          <span className="text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            6 Pages Distinctes
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Toutes vos pages de contenu et mentions obligatoires sont ici séparées et modifiables de façon indépendante.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setLegalPreviewMode(!legalPreviewMode)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                          legalPreviewMode
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        <span>{legalPreviewMode ? 'Mode Édition' : 'Mode Aperçu'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentView(
                          legalSubPageTab === 'about' ? 'about' :
                          legalSubPageTab === 'terms' ? 'terms' :
                          legalSubPageTab === 'privacy' ? 'privacy' :
                          legalSubPageTab === 'returns' ? 'delivery' :
                          legalSubPageTab === 'delivery' ? 'delivery' : 'contact'
                        )}
                        className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                        title="Tester le rendu direct sur la boutique"
                      >
                        <ExternalLink className="w-4 h-4 text-indigo-400" />
                        <span className="hidden sm:inline">Voir sur la Boutique</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Enregistrer</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation Bar: Les Pages Séparées */}
                  <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
                    {[
                      { id: 'about', label: '1. À Propos', fullName: 'À Propos de la Boutique', icon: HelpCircle, badge: 'Histoire ℹ️', count: (localSettings.aboutUsText || '').length },
                      { id: 'terms', label: '2. CGV / Contrat', fullName: 'Conditions Générales de Vente', icon: FileText, badge: 'Contrat 📜', count: (localSettings.termsText || '').length },
                      { id: 'privacy', label: '3. Confidentialité', fullName: 'Protection des Données', icon: Lock, badge: 'CDP Sénégal 🔒', count: (localSettings.privacyText || '').length },
                      { id: 'returns', label: '4. Retours & Remboursements', fullName: 'Retours & Remboursements', icon: RotateCcw, badge: '14 Jours 🔄', count: (localSettings.returnPolicyText || '').length },
                      { id: 'delivery', label: '5. Politique de Livraison', fullName: 'Délais & Expédition', icon: Truck, badge: 'Express 🚚', count: (localSettings.deliveryPolicyText || '').length },
                      { id: 'contact', label: '6. Coordonnées & Support', fullName: 'Coordonnées Officielles', icon: Phone, badge: 'Contact 📞', count: [localSettings.contactEmail, localSettings.whatsappNumber, localSettings.contactPhone, localSettings.contactAddress].filter(Boolean).length },
                    ].map((tab) => {
                      const isActive = legalSubPageTab === tab.id;
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLegalSubPageTab(tab.id as any)}
                          className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}>
                            {tab.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ========================================================================= */}
                  {/* PAGE SÉPARÉE 1: À PROPOS DE LA BOUTIQUE */}
                  {/* ========================================================================= */}
                  {legalSubPageTab === 'about' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">
                              1. Page : À Propos de la Boutique
                            </h3>
                            <p className="text-xs text-slate-400">
                              Histoire de votre marque, vision, valeurs et garanties de qualité présentées à vos clients.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetToLegalTemplate('aboutUsText')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                            title="Rétablir le modèle par défaut"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                            <span>Modèle Recommandé</span>
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            {localSettings.aboutUsText?.length || 0} caractères
                          </span>
                        </div>
                      </div>

                      {/* Insertion rapide de clauses */}
                      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Ajouter des paragraphes de présentation :</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleInsertClause('aboutUsText', 'NOTRE VISION & ENGAGEMENT D\'EXCELLENCE :\nChez nous, chaque article est sélectionné avec une rigueur absolue pour garantir une qualité irréprochable. Notre mission est de vous offrir une expérience d\'achat moderne, fiable et personnalisée à chaque étape.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Vision & Excellence
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('aboutUsText', 'GARANTIE D\'AUTHENTICITÉ CERTIFIÉE :\nTous nos produits sont 100% authentiques, conformes aux normes internationales et rigoureusement inspectés avant chaque expédition par nos experts.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + 100% Authentique
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('aboutUsText', 'SERVICE CLIENT ET ACCOMPAGNEMENT 7J/7 :\nNotre équipe dédiée est joignable tous les jours par WhatsApp ou téléphone pour vous conseiller, suivre vos colis et répondre à toutes vos interrogations avec réactivité.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-purple-950 text-slate-300 hover:text-purple-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Support Réactif 7j/7
                          </button>
                        </div>
                      </div>

                      {/* Editor vs Live Preview */}
                      {legalPreviewMode ? (
                        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                          <div className="flex items-center gap-2 text-xs text-purple-400 font-bold border-b border-slate-800 pb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aperçu public : Page "À Propos"</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                            {localSettings.aboutUsText}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Contenu de la Page "À Propos"</label>
                          <textarea
                            rows={12}
                            value={localSettings.aboutUsText || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, aboutUsText: e.target.value })}
                            placeholder="Rédigez la présentation de votre boutique, votre expertise et vos engagements..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed font-sans"
                          />
                        </div>
                      )}

                      {/* Callout */}
                      <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-purple-300">Construisez la crédibilité de votre marque</p>
                          <p className="text-slate-400 leading-relaxed">
                            Les acheteurs en ligne consultent régulièrement la page À Propos pour s'assurer du sérieux du commerçant avant d'effectuer un premier achat.
                          </p>
                        </div>
                      </div>

                      {/* Pagination Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className="text-xs text-slate-500">Page 1 sur 6</span>
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('terms')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <span>Page Suivante : Conditions Générales (CGV)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* PAGE SÉPARÉE 2: CONDITIONS GÉNÉRALES DE VENTE (CGV) */}
                  {/* ========================================================================= */}
                  {legalSubPageTab === 'terms' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">
                              2. Page : Conditions Générales de Vente (CGV / CGU)
                            </h3>
                            <p className="text-xs text-slate-400">
                              Contrat de vente en ligne régissant les prix en FCFA, les modalités de paiement Wave/OM et les engagements réciproques.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetToLegalTemplate('termsText')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                            title="Rétablir le modèle officiel certifié"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Modèle Officiel</span>
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            {localSettings.termsText?.length || 0} caractères
                          </span>
                        </div>
                      </div>

                      {/* Insertion rapide de clauses */}
                      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Ajouter des clauses contractuelles certifiées :</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleInsertClause('termsText', 'MODALITÉS DE PAIEMENT SÉCURISÉ :\nLe règlement s\'effectue en Francs CFA (FCFA) via Wave, Orange Money ou en espèces à la livraison. En cas de paiement à la livraison, le client s\'engage à préparer le montant exact convenu lors de la venue du coursier.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Modalités Paiement Wave/OM/Espèces
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('termsText', 'DÉLAIS D\'EXPÉDITION ET LIVRAISON EXPRESS :\nToute commande validée avant 14h est expédiée le jour même. Le délai de livraison est de 24h à Dakar et de 48h à 72h dans les régions du Sénégal. Le client doit demeurer joignable sur le numéro fourni.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Délais Dakar & Régions
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('termsText', 'DROIT DE RÉTRACTATION ET RETOURS (14 JOURS) :\nLe client dispose d\'un délai légal de 14 jours francs pour retourner un produit non utilisé dans son emballage d\'origine pour échange ou remboursement.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-950 text-slate-300 hover:text-indigo-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Droit Rétractation 14 Jours
                          </button>
                        </div>
                      </div>

                      {/* Editor vs Live Preview */}
                      {legalPreviewMode ? (
                        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                          <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold border-b border-slate-800 pb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aperçu public : Conditions Générales de Vente</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                            {localSettings.termsText}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Contenu des Conditions Générales de Vente (CGV)</label>
                          <textarea
                            rows={14}
                            value={localSettings.termsText || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, termsText: e.target.value })}
                            placeholder="Rédigez ici vos conditions de vente et d'utilisation..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed font-sans"
                          />
                        </div>
                      )}

                      {/* Callout */}
                      <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
                        <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-indigo-300">Sécurité juridique de votre e-commerce</p>
                          <p className="text-slate-400 leading-relaxed">
                            Les CGV fixent le cadre contractuel impératif pour sécuriser les transactions, définir les obligations du client et encadrer la politique anti-désistement.
                          </p>
                        </div>
                      </div>

                      {/* Pagination Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('about')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Précédent : À Propos</span>
                        </button>
                        <span className="text-xs text-slate-500">Page 2 sur 6</span>
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('privacy')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <span>Suivant : Confidentialité (CDP)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* PAGE SÉPARÉE 3: POLITIQUE DE CONFIDENTIALITÉ */}
                  {/* ========================================================================= */}
                  {legalSubPageTab === 'privacy' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">
                              3. Page : Politique de Confidentialité & Données (Loi CDP)
                            </h3>
                            <p className="text-xs text-slate-400">
                              Texte légal conforme à la législation sénégalaise sur la collecte, l'utilisation et la non-cession des données personnelles.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetToLegalTemplate('privacyText')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                            title="Rétablir le modèle officiel sénégalais"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Modèle Officiel</span>
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            {localSettings.privacyText?.length || 0} caractères
                          </span>
                        </div>
                      </div>

                      {/* Insertion rapide de clauses */}
                      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ajouter rapidement une clause de protection :</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleInsertClause('privacyText', 'CONFORMITÉ LOI CDP SÉNÉGAL (LOI N° 2008-12) :\nLes traitements de données à caractère personnel opérés sur notre plateforme sont conformes aux dispositions de la loi sénégalaise n° 2008-12 relative à la protection des données à caractère personnel. Les utilisateurs peuvent solliciter la CDP ou notre délégué à la protection des données pour toute réclamation.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Loi CDP Sénégal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('privacyText', 'SÉCURITÉ DES PAIEMENTS MOBILE MONEY (WAVE / ORANGE MONEY) :\nLes règlements par Wave, Orange Money ou carte bancaire sont exécutés sur des passerelles chiffrées sécurisées PCI-DSS. Notre boutique n\'a jamais accès à vos codes PIN, mots de passe à usage unique (OTP) ou identifiants bancaires secrets.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Sécurité Wave/OM
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('privacyText', 'POLITIQUE RELATIVE AUX COOKIES & LOCAL STORAGE :\nNous utilisons des cookies et le stockage local sécurisé exclusivement pour sauvegarder votre panier d\'achats, mémoriser vos préférences de navigation et sécuriser vos connexions clients.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Clause Cookies
                          </button>
                        </div>
                      </div>

                      {/* Editor vs Live Preview */}
                      {legalPreviewMode ? (
                        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold border-b border-slate-800 pb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aperçu public : Politique de Confidentialité</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                            {localSettings.privacyText}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Contenu de la Politique de Confidentialité</label>
                          <textarea
                            rows={14}
                            value={localSettings.privacyText || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, privacyText: e.target.value })}
                            placeholder="Rédigez ici votre politique de confidentialité..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed font-sans"
                          />
                        </div>
                      )}

                      {/* Callout */}
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-emerald-300">Obligation Légale & Protection des Acheteurs</p>
                          <p className="text-slate-400 leading-relaxed">
                            Ce texte garantit la conformité avec la Commission de Protection des Données Personnelles (CDP) et rassure les clients sur la non-divulgation de leurs numéros de téléphone.
                          </p>
                        </div>
                      </div>

                      {/* Pagination Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('terms')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Précédent : CGV</span>
                        </button>
                        <span className="text-xs text-slate-500">Page 3 sur 6</span>
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('returns')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <span>Suivant : Retours & Remboursements</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* PAGE SÉPARÉE 4: POLITIQUE DE RETOUR & REMBOURSEMENT */}
                  {/* ========================================================================= */}
                  {legalSubPageTab === 'returns' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                            <RotateCcw className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">
                              4. Page : Retours & Remboursements (Délai 14 Jours)
                            </h3>
                            <p className="text-xs text-slate-400">
                              Règles de rétractation, conditions de reprise des articles non portés et modalités de remboursement client.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetToLegalTemplate('returnPolicyText')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                            title="Rétablir le modèle officiel de retour"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                            <span>Modèle Officiel</span>
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            {localSettings.returnPolicyText?.length || 0} caractères
                          </span>
                        </div>
                      </div>

                      {/* Insertion rapide de clauses */}
                      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ajouter des clauses relatives aux retours :</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleInsertClause('returnPolicyText', 'DROIT DE RÉTRACTATION (14 JOURS) :\nConformément aux dispositions en vigueur, le client bénéficie d\'un délai légal de 14 jours francs à compter de la date de livraison pour demander le retour d\'un article sans pénalité.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Délai 14 Jours Francs
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('returnPolicyText', 'CONDITIONNEMENT & ÉTAT DU PRODUIT :\nL\'article doit obligatoirement être retourné complet, dans son emballage d\'origine non détérioré, avec l\'ensemble de ses accessoires, étiquettes scellées et notices.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + État Neuf d\'Origine
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('returnPolicyText', 'MODALITÉS DE REMBOURSEMENT RAPIDE :\nLe remboursement est émis sous 48h ouvrées maximum suivant la réception et la vérification du produit par nos équipes, directement via virement Mobile Money (Wave ou Orange Money) sur le numéro du client.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Remboursement Wave/OM 48h
                          </button>
                        </div>
                      </div>

                      {/* Editor vs Live Preview */}
                      {legalPreviewMode ? (
                        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold border-b border-slate-800 pb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aperçu public : Retours & Remboursements</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                            {localSettings.returnPolicyText}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Contenu de la Politique de Retour</label>
                          <textarea
                            rows={12}
                            value={localSettings.returnPolicyText || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, returnPolicyText: e.target.value })}
                            placeholder="Rédigez les conditions de retour, d'échange et de remboursement..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed font-sans"
                          />
                        </div>
                      )}

                      {/* Callout */}
                      <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                        <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-amber-300">Levier de Conversion</p>
                          <p className="text-slate-400 leading-relaxed">
                            Une politique claire de retour et de remboursement rassure instantanément les prospects indécis et augmente votre volume de ventes.
                          </p>
                        </div>
                      </div>

                      {/* Pagination Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('privacy')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Précédent : Confidentialité</span>
                        </button>
                        <span className="text-xs text-slate-500">Page 4 sur 6</span>
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('delivery')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <span>Suivant : Livraison Express</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* PAGE SÉPARÉE 5: POLITIQUE DE LIVRAISON */}
                  {/* ========================================================================= */}
                  {legalSubPageTab === 'delivery' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white uppercase tracking-wider">
                              5. Page : Politique & Délais de Livraison Express
                            </h3>
                            <p className="text-xs text-slate-400">
                              Détail des zones desservies, délais moyens (Dakar 24h & Régions 48-72h) et consignes coursiers.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleResetToLegalTemplate('deliveryPolicyText')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                            title="Rétablir le modèle officiel de livraison"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                            <span>Modèle Officiel</span>
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            {localSettings.deliveryPolicyText?.length || 0} caractères
                          </span>
                        </div>
                      </div>

                      {/* Insertion rapide de clauses */}
                      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>Ajouter des clauses de transport et livraison :</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleInsertClause('deliveryPolicyText', 'LIVRAISON EXPRESS DAKAR & BANLIEUE (24H) :\nToute commande validée avant 14h est prise en charge pour une livraison en 24h à Dakar (Plateau, Almadies, Mermoz, Maristes, Guédiawaye, Pikine, Rufisque).')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Express Dakar 24h
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('deliveryPolicyText', 'EXPÉDITION SÉCURISÉE DANS LES RÉGIONS (48H-72H) :\nLes envois vers Thiès, Mbour, Saint-Louis, Touba, Kaolack et Ziguinchor sont acheminés par des transporteurs sécurisés partenaires avec remise contre signature sous 48h à 72h.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Expédition Régions 48h-72h
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertClause('deliveryPolicyText', 'AVISAGE & CONTACT LIVREUR :\nLe coursier contacte systématiquement le client par appel vocal ou message WhatsApp avant son passage pour convenir de l\'heure et du point précis de livraison.')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-700 text-xs rounded-lg transition cursor-pointer"
                          >
                            + Avisage WhatsApp Livreur
                          </button>
                        </div>
                      </div>

                      {/* Editor vs Live Preview */}
                      {legalPreviewMode ? (
                        <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold border-b border-slate-800 pb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Aperçu public : Délais & Politique de Livraison</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                            {localSettings.deliveryPolicyText}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Contenu de la Politique de Livraison</label>
                          <textarea
                            rows={12}
                            value={localSettings.deliveryPolicyText || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, deliveryPolicyText: e.target.value })}
                            placeholder="Précisez les zones de livraison, les délais et les consignes pour la réception..."
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed font-sans"
                          />
                        </div>
                      )}

                      {/* Callout */}
                      <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex items-start gap-3">
                        <Truck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-blue-300">Réduisez les retours et les litiges</p>
                          <p className="text-slate-400 leading-relaxed">
                            Des délais transparents et l'obligation pour l'acheteur de rester joignable diminuent drastiquement les échecs de livraison des coursiers.
                          </p>
                        </div>
                      </div>

                      {/* Pagination Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('returns')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Précédent : Retours</span>
                        </button>
                        <span className="text-xs text-slate-500">Page 5 sur 6</span>
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('contact')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <span>Suivant : Coordonnées & Support</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* PAGE SÉPARÉE 6: COORDONNÉES OFFICIELLES & SUPPORT */}
                  {/* ========================================================================= */}
                  {legalSubPageTab === 'contact' && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white uppercase tracking-wider">
                            6. Page : Coordonnées Officielles & Mentions Légales
                          </h3>
                          <p className="text-xs text-slate-400">
                            Informations administratives et canaux de contact officiels affichés sur les mentions légales et factures.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Email Officiel de Contact</label>
                          <input
                            type="email"
                            value={localSettings.contactEmail || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, contactEmail: e.target.value })}
                            placeholder="contact@votre-boutique.sn"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Numéro WhatsApp Commercial</label>
                          <input
                            type="text"
                            value={localSettings.whatsappNumber || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                            placeholder="+221770000000"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Téléphone Appel Direct</label>
                          <input
                            type="text"
                            value={localSettings.contactPhone || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
                            placeholder="+221338000000"
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">Adresse Physique / Siège Commercial</label>
                          <input
                            type="text"
                            value={localSettings.contactAddress || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, contactAddress: e.target.value })}
                            placeholder="Dakar Plateau, Immeuble Horizon..."
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Callout */}
                      <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl flex items-start gap-3">
                        <Phone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-cyan-300">Identification de l'Entreprise</p>
                          <p className="text-slate-400 leading-relaxed">
                            Ces coordonnées sont automatiquement injectées dans le pied de page du site, sur la page Contact et sur les récépissés de commande générés.
                          </p>
                        </div>
                      </div>

                      {/* Pagination Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('delivery')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Précédent : Politique de Livraison</span>
                        </button>
                        <span className="text-xs text-slate-500">Page 6 sur 6</span>
                        <button
                          type="button"
                          onClick={() => setLegalSubPageTab('about')}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition cursor-pointer"
                        >
                          <span>Retour à la Page 1 : À Propos</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 5: EXPLORATEUR DE VUES CLIENTS */}
              {/* ================================================================= */}
              {settingsSubTab === 'pages' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">
                        Explorateur des Vues & Pages Clients
                      </h2>
                      <p className="text-xs text-slate-400">
                        Accédez directement à chaque page publique du site pour vérifier son rendu.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { view: 'home', title: 'Page d\'Accueil', desc: 'Hero banner, Ventes Flash & Top Classement' },
                      { view: 'shop', title: 'Catalogue Complet', desc: 'Recherche et filtres avancés' },
                      { view: 'marketing', title: 'Page Marketing & VIP', desc: 'Codes promos, packs groupés, parrainage WhatsApp & fidélité VIP' },
                      { view: 'terms', title: 'Conditions d\'Utilisation & CGV', desc: 'Règles contractuelles, paiements Wave/OM et garanties' },
                      { view: 'privacy', title: 'Politique de Confidentialité', desc: 'Protection des données personnelles (CDP/Sénégal)' },
                      { view: 'delivery', title: 'Livraison & Retours', desc: 'Délais et tarifs' },
                      { view: 'faq', title: 'Centre d\'Aide / FAQ', desc: 'Questions fréquentes' },
                      { view: 'contact', title: 'Support Client', desc: 'Coordonnées & WhatsApp direct' }
                    ].map((pg, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentView(pg.view as AppView)}
                        className="p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-2xl text-left transition cursor-pointer shadow-xs group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-black text-sm text-white group-hover:text-indigo-400 transition-colors">{pg.title}</p>
                          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{pg.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 6: EMAIL & SERVEUR SMTP */}
              {/* ================================================================= */}
              {settingsSubTab === 'smtp' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  
                  {/* Master Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <span>Serveur Email (SMTP) & Notifications</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            localSettings.smtpEnabled
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {localSettings.smtpEnabled ? '● SMTP ACTIF' : '○ DÉSACTIVÉ'}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Configurez l'envoi automatique de reçus clients, confirmations de commandes et alertes de vente par email.
                        </p>
                      </div>
                    </div>

                    {/* Master Switch Toggle */}
                    <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(localSettings.smtpEnabled)}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                      <span className="text-xs font-bold text-slate-200">
                        {localSettings.smtpEnabled ? 'Service Actif' : 'Service Inactif'}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Provider Quick-Fill Presets */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <label className="text-xs font-black text-slate-200 uppercase tracking-wider">
                        Préconfigurations Rapides en 1 Clic :
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Sélectionnez votre fournisseur pour remplir automatiquement le serveur hôte et le port recommandé.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                      {[
                        { name: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false, note: 'Mot de passe d\'application requis' },
                        { name: 'Brevo (Sendinblue)', host: 'smtp-relay.brevo.com', port: 587, secure: false, note: 'Clé SMTP v3' },
                        { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: false, note: 'User: apikey' },
                        { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, secure: false, note: 'Port 587' },
                        { name: 'Outlook 365', host: 'smtp.office365.com', port: 587, secure: false, note: 'STARTTLS' },
                        { name: 'cPanel / Hôte', host: 'mail.votredomaine.ci', port: 465, secure: true, note: 'SSL Direct' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setLocalSettings({
                              ...localSettings,
                              smtpHost: preset.host,
                              smtpPort: preset.port,
                              smtpSecure: preset.secure,
                            });
                          }}
                          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-left transition cursor-pointer group"
                        >
                          <span className="text-xs font-black text-white group-hover:text-indigo-400 block">{preset.name}</span>
                          <span className="text-[9px] text-slate-500 block truncate">{preset.host}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Server Connection Parameters */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <span>Paramètres de Connexion au Serveur</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Host */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-300">
                          Hôte du Serveur SMTP <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={localSettings.smtpHost || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpHost: e.target.value })}
                          placeholder="ex: smtp.gmail.com ou smtp-relay.brevo.com"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Port */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Port SMTP <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={localSettings.smtpPort ?? 587}
                          onChange={(e) => {
                            const p = Number(e.target.value);
                            setLocalSettings({
                              ...localSettings,
                              smtpPort: p,
                              smtpSecure: p === 465,
                            });
                          }}
                          placeholder="587 ou 465"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Username */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-300">
                          Nom d'utilisateur / Email Authentifié <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={localSettings.smtpUser || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpUser: e.target.value })}
                          placeholder="ex: contact@eliteboutique.ci ou apikey"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Security Mode */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Protocole de Sécurité</label>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setLocalSettings({ ...localSettings, smtpSecure: false })}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer border ${
                              !localSettings.smtpSecure
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            TLS / STARTTLS (587)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocalSettings({ ...localSettings, smtpSecure: true })}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer border ${
                              localSettings.smtpSecure
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            SSL Direct (465)
                          </button>
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5 sm:col-span-3">
                        <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                          <span>Mot de passe SMTP ou Clé d'application <span className="text-rose-400">*</span></span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            Pour Gmail, activez la validation en 2 étapes puis créez un mot de passe d'application de 16 lettres.
                          </span>
                        </label>
                        <div className="relative">
                          <input
                            type={showSmtpPassword ? 'text' : 'password'}
                            value={localSettings.smtpPass || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, smtpPass: e.target.value })}
                            placeholder="Collez ici votre mot de passe ou clé API SMTP..."
                            className="w-full pl-3.5 pr-24 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded-md hover:bg-slate-800"
                          >
                            {showSmtpPassword ? 'Masquer' : 'Afficher'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sender Identity & Admin Alert Destination */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <span>Identité de l'Expéditeur & Alertes Équipe</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Nom d'Expéditeur Visible</label>
                        <input
                          type="text"
                          value={localSettings.smtpFromName || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpFromName: e.target.value })}
                          placeholder={settings.storeName || 'ELITE BOUTIQUE'}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-slate-500">Nom apparaissant dans la boîte de réception des clients.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Adresse Email d'Expédition</label>
                        <input
                          type="email"
                          value={localSettings.smtpFromEmail || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpFromEmail: e.target.value })}
                          placeholder={localSettings.smtpUser || 'contact@eliteboutique.ci'}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-slate-500">Doit correspondre ou être autorisée par votre serveur SMTP.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Email Alerte Commandes (Admin)</label>
                        <input
                          type="email"
                          value={localSettings.smtpAdminRecipientEmail || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpAdminRecipientEmail: e.target.value })}
                          placeholder={localSettings.contactEmail || 'admin@eliteboutique.ci'}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-slate-500">Reçoit une alerte instantanée pour chaque nouvelle commande validée.</p>
                      </div>
                    </div>
                  </div>

                  {/* Notification Events Toggles */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                      Événements de Déclenchement des Emails
                    </h3>

                    <div className="space-y-2.5">
                      <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-900/60 transition">
                        <input
                          type="checkbox"
                          checked={localSettings.smtpOrderConfirmationCustomer !== false}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpOrderConfirmationCustomer: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded-md border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Confirmation & Reçu Client Automatique</span>
                          <span className="text-[11px] text-slate-400 block">
                            Envoie un récapitulatif élégant avec les articles, le montant en FCFA, l'adresse de livraison et le contact WhatsApp dès validation du panier.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-900/60 transition">
                        <input
                          type="checkbox"
                          checked={localSettings.smtpOrderNotificationAdmin !== false}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpOrderNotificationAdmin: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded-md border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Alerte Nouvelle Vente à l'Administrateur</span>
                          <span className="text-[11px] text-slate-400 block">
                            Prévient immédiatement l'équipe commerciale pour préparer l'expédition ou contacter le coursier.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-900/60 transition">
                        <input
                          type="checkbox"
                          checked={localSettings.smtpOrderStatusUpdateCustomer !== false}
                          onChange={(e) => setLocalSettings({ ...localSettings, smtpOrderStatusUpdateCustomer: e.target.checked })}
                          className="mt-0.5 w-4 h-4 rounded-md border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Suivi & Changement de Statut (Expédié / Livré)</span>
                          <span className="text-[11px] text-slate-400 block">
                            Informe le client par email dès que sa commande passe en statut "Expédié" (coursier en route) ou "Livré".
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Interactive Live Test Tool */}
                  <div className="p-5 bg-gradient-to-tr from-indigo-950/40 via-slate-950 to-purple-950/30 rounded-2xl border border-indigo-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">
                        Tester la Connexion SMTP & Envoyer un Email de Validation
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Vérifie instantanément les identifiants, la connectivité réseau et transmet un email de test complet à l'adresse de votre choix.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="email"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        placeholder="Entrez votre email pour recevoir le test (ex: votre@email.com)..."
                        className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        disabled={isSendingTestEmail}
                        onClick={handleSendTestEmail}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSendingTestEmail ? 'animate-spin' : ''}`} />
                        <span>{isSendingTestEmail ? 'Test de connexion...' : '🚀 Envoyer l\'Email de Test'}</span>
                      </button>
                    </div>

                    {/* Result alert */}
                    {testEmailResult && (
                      <div className={`p-4 rounded-xl text-xs border animate-in fade-in duration-200 ${
                        testEmailResult.success
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                      }`}>
                        <div className="flex items-start gap-2.5">
                          {testEmailResult.success ? (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <span className="font-bold block">
                              {testEmailResult.success ? 'Succès de Connexion :' : 'Échec du Test SMTP :'}
                            </span>
                            <span className="block leading-relaxed">
                              {testEmailResult.message || testEmailResult.error}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ================================================================= */}
              {/* ================================================================= */}
              {/* SOUS-PAGE 7: ALERTES TELEGRAM */}
              {/* ================================================================= */}
              {settingsSubTab === 'telegram' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-7 shadow-sm animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-black text-white uppercase tracking-wider">Alertes de Commandes Telegram</h2>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            localSettings.telegramEnabled
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {localSettings.telegramEnabled ? 'Actif' : 'Désactivé'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Recevez immédiatement chaque nouvelle commande dans votre compte, groupe ou canal Telegram.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(localSettings.telegramEnabled)}
                        onChange={(e) => setLocalSettings({ ...localSettings, telegramEnabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-200">Activer Telegram</span>
                    </label>
                  </div>

                  <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">Identifiants du Bot</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Créez un bot avec <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 underline">@BotFather</a>, copiez son token, puis indiquez le Chat ID qui recevra les alertes. Ces valeurs restent privées et ne sont jamais envoyées aux visiteurs.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Token du Bot Telegram <span className="text-rose-400">*</span></label>
                        <div className="relative">
                          <input
                            type={showTelegramBotToken ? 'text' : 'password'}
                            value={localSettings.telegramBotToken || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, telegramBotToken: e.target.value })}
                            placeholder="123456789:AA..."
                            autoComplete="new-password"
                            className="w-full pl-3.5 pr-24 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowTelegramBotToken(!showTelegramBotToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer px-2 py-1 rounded-md hover:bg-slate-800"
                          >
                            {showTelegramBotToken ? 'Masquer' : 'Afficher'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">Chat ID destinataire <span className="text-rose-400">*</span></label>
                        <input
                          type="text"
                          value={localSettings.telegramChatId || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, telegramChatId: e.target.value.trim() })}
                          placeholder="Ex : 123456789 ou -1001234567890"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                        />
                        <p className="text-[10px] text-slate-500">Pour un groupe ou un canal, le Chat ID commence souvent par <code>-100</code>.</p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition">
                    <input
                      type="checkbox"
                      checked={localSettings.telegramNotifyNewOrder !== false}
                      onChange={(e) => setLocalSettings({ ...localSettings, telegramNotifyNewOrder: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Alerte pour chaque nouvelle commande</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">Le message contient le client, le téléphone, l’adresse, les articles, le total et le mode de paiement.</span>
                    </div>
                  </label>

                  <div className="p-5 bg-gradient-to-tr from-sky-950/40 via-slate-950 to-indigo-950/30 rounded-2xl border border-sky-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Tester la connexion Telegram</h3>
                    </div>
                    <p className="text-[11px] text-slate-400">Enregistrez d’abord vos paramètres, puis envoyez un message de validation pour confirmer le token et le Chat ID.</p>
                    <button
                      type="button"
                      disabled={isSendingTelegramTest}
                      onClick={handleSendTelegramTest}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSendingTelegramTest ? 'animate-pulse' : ''}`} />
                      <span>{isSendingTelegramTest ? 'Envoi du test...' : 'Envoyer un message de test'}</span>
                    </button>

                    {telegramTestResult && (
                      <div className={`p-4 rounded-xl text-xs border animate-in fade-in duration-200 ${
                        telegramTestResult.success
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                      }`}>
                        <div className="flex items-start gap-2.5">
                          {telegramTestResult.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                          <div>
                            <span className="font-bold block">{telegramTestResult.success ? 'Connexion Telegram validée' : 'Échec du test Telegram'}</span>
                            <span className="block leading-relaxed mt-1">{telegramTestResult.message || telegramTestResult.error}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Boutons Interactifs & Commandes Autonomes (Webhook) */}
                  <div className="p-5 bg-gradient-to-tr from-purple-950/40 via-slate-950 to-sky-950/30 rounded-2xl border border-purple-500/30 space-y-4">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Boutons Interactifs & Commandes Autonomes (Webhook)</h3>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Active le webhook Telegram sur votre domaine (<span className="text-purple-300 font-mono font-bold">https://www.ivoireci.com/api/telegram/webhook</span>) pour permettre à votre bot de recevoir vos clics et vos commandes en temps réel :
                    </p>
                    <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-1.5 pl-1">
                      <li><span className="font-bold text-white">Boutons sous chaque alerte de commande :</span> <span className="text-emerald-400">✅ Valider Commande</span>, <span className="text-amber-400">🛵 Assigner Livreur</span>, <span className="text-emerald-300">💬 WhatsApp</span>, <span className="text-rose-400">❌ Refuser</span></li>
                      <li><span className="font-bold text-white">Commandes autonomes dans votre chat Telegram :</span> <code className="text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded">/stats</code> (bilan ventes & encaissements livreurs), <code className="text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded">/stock</code> (alertes rupture), <code className="text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded">/commandes</code> (5 dernières commandes en attente), <code className="text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded">/aide</code></li>
                      <li><span className="font-bold text-white">Alertes de stock critique :</span> Déclenchées automatiquement dès qu’un article passe à 3 unités ou moins</li>
                    </ul>
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={isSettingUpTelegramWebhook}
                        onClick={handleSetupTelegramWebhook}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Bot className={`w-3.5 h-3.5 ${isSettingUpTelegramWebhook ? 'animate-spin' : ''}`} />
                        <span>{isSettingUpTelegramWebhook ? 'Activation du Webhook...' : '🔗 Activer les Boutons & Commandes Telegram (Webhook)'}</span>
                      </button>
                    </div>

                    {telegramWebhookResult && (
                      <div className={`p-4 rounded-xl text-xs border animate-in fade-in duration-200 ${
                        telegramWebhookResult.success
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                          : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                      }`}>
                        <div className="flex items-start gap-2.5">
                          {telegramWebhookResult.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                          <div>
                            <span className="font-bold block">{telegramWebhookResult.success ? 'Webhook activé avec succès' : 'Échec de configuration du Webhook'}</span>
                            <span className="block leading-relaxed mt-1">{telegramWebhookResult.message || telegramWebhookResult.error}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 8: RÉFÉRENCEMENT NATUREL & SEO (GOOGLE & RÉSEAUX SOCIAUX) */}
              {/* ================================================================= */}
              {settingsSubTab === 'seo' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-8 shadow-sm animate-in fade-in duration-200">
                  {/* Header Title Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-black text-white uppercase tracking-wider">
                            Référencement Naturel & SEO
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Indexation Google Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Optimisez la visibilité de votre boutique sur les moteurs de recherche (Google, Bing), le partage social (WhatsApp, Facebook, Twitter) et l'analyse de trafic.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Enregistrer le Référencement</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Meta Tags Principaux */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>1. Balises Méta Globales (Page d'Accueil & Boutique)</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-5">
                      {/* Meta Title */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">
                            Titre de l'onglet du navigateur & Meta Title
                          </label>
                          <span className={`text-[11px] font-mono font-bold ${
                            (localSettings.seoTitle?.length || 0) > 65 ? 'text-amber-400' : 'text-slate-500'
                          }`}>
                            {localSettings.seoTitle?.length || 0} / 60 caractères recommandés
                          </span>
                        </div>
                        <input
                          type="text"
                          value={localSettings.seoTitle || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, seoTitle: e.target.value })}
                          placeholder="Ex: Ma Boutique | Mode & Accessoires"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                        <p className="text-[11px] text-slate-500">
                          C'est le texte affiché dans l'onglet du navigateur, sur Google et lors des partages sur WhatsApp et Facebook.
                        </p>

                        {/* Browser-tab preview matching the title shown to visitors. */}
                        <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                          <div className="flex h-8 items-center gap-2 border-b border-slate-800 bg-slate-900 px-3">
                            <span className="h-2 w-2 rounded-full bg-rose-400" />
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <div className="ml-2 flex min-w-0 max-w-full items-center gap-1.5 rounded-t-lg border border-b-0 border-slate-700 bg-slate-950 px-3 py-1 text-[10px] text-slate-300">
                              <img src="/favicon.svg" alt="" className="h-3 w-3 shrink-0" />
                              <span className="truncate">{localSettings.seoTitle?.trim() || 'Titre de votre boutique'}</span>
                            </div>
                          </div>
                          <p className="px-3 py-2 text-[10px] text-slate-500">
                            Aperçu du titre qui sera visible après l'enregistrement et le rechargement du site.
                          </p>
                        </div>
                      </div>

                      {/* Meta Description */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-300">
                            Meta Description Globale
                          </label>
                          <span className={`text-[11px] font-mono font-bold ${
                            (localSettings.seoDescription?.length || 0) > 160 ? 'text-amber-400' : 'text-slate-500'
                          }`}>
                            {localSettings.seoDescription?.length || 0} / 155 caractères recommandés
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={localSettings.seoDescription || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, seoDescription: e.target.value })}
                          placeholder="Ex: Découvrez les meilleures collections de vêtements, chaussures et accessoires à Dakar. Livraison express en 24h et paiement à la livraison sécurisé."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                        <p className="text-[11px] text-slate-500">
                          Résumé affiché sous le titre dans les résultats de recherche Google pour inciter au clic.
                        </p>
                      </div>

                      {/* Keywords & Canonical URL */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">
                            Mots-clés SEO (séparés par des virgules)
                          </label>
                          <input
                            type="text"
                            value={localSettings.seoKeywords || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, seoKeywords: e.target.value })}
                            placeholder="mode dakar, boutique sénégal, achat en ligne cfa, livraison express"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300">
                            URL Canonique Officielle du Site
                          </label>
                          <input
                            type="text"
                            value={localSettings.seoCanonicalUrl || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, seoCanonicalUrl: e.target.value })}
                            placeholder="https://maboutique.sn"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                          <p className="text-[11px] text-slate-500">
                            Utilisé pour le sitemap.xml et éviter les pénalités de contenu dupliqué par Google.
                          </p>
                        </div>
                      </div>

                      {/* Image OpenGraph */}
                      <div className="space-y-2 p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <label className="text-xs font-bold text-slate-300">
                              Image OpenGraph Sociale (Bannière WhatsApp, Facebook, Twitter)
                            </label>
                            <p className="text-[11px] text-slate-500">
                              Format recommandé : 1200x630 pixels. C'est l'image qui s'affiche lors du partage du lien de votre boutique.
                            </p>
                          </div>
                          {localSettings.seoOgImage && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Image active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={localSettings.seoOgImage || ''}
                            onChange={(e) => setLocalSettings({ ...localSettings, seoOgImage: e.target.value })}
                            placeholder="https://... ou téléversez une image"
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                          <label className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition">
                            <UploadCloud className="w-4 h-4 text-indigo-400" />
                            <span>Téléverser</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const processed = await processUploadedImage(file, 1200, 630);
                                  setLocalSettings({ ...localSettings, seoOgImage: processed });
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {localSettings.seoOgImage && (
                          <div className="mt-2 relative w-full max-w-sm h-32 rounded-xl overflow-hidden border border-slate-800 group">
                            <img
                              src={localSettings.seoOgImage}
                              alt="Aperçu OpenGraph"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => setLocalSettings({ ...localSettings, seoOgImage: '' })}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Outils Webmaster, Suivi & Tracking */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      <span>2. Outils Webmaster, Google & Tracking de Conversion</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Google Search Console */}
                      <div className="space-y-1.5 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span>Google Search Console</span>
                        </label>
                        <input
                          type="text"
                          value={localSettings.seoGoogleVerification || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, seoGoogleVerification: e.target.value })}
                          placeholder="Code de validation (ex: abc123...)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        <p className="text-[10px] text-slate-500">
                          Balise HTML meta google-site-verification pour valider la propriété de votre site.
                        </p>
                      </div>

                      {/* Google Analytics 4 */}
                      <div className="space-y-1.5 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span>Google Analytics 4 (GA4)</span>
                          </label>
                          <span className={`text-[10px] font-bold ${
                            !localSettings.seoGoogleAnalyticsId ? 'text-slate-500' : isValidGoogleAnalyticsId(localSettings.seoGoogleAnalyticsId) ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {!localSettings.seoGoogleAnalyticsId ? 'Non configuré' : isValidGoogleAnalyticsId(localSettings.seoGoogleAnalyticsId) ? 'Format valide' : 'Format invalide'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={localSettings.seoGoogleAnalyticsId || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, seoGoogleAnalyticsId: e.target.value })}
                          placeholder="G-XXXXXXXXXX"
                          className={`w-full bg-slate-900 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono ${
                            localSettings.seoGoogleAnalyticsId && !isValidGoogleAnalyticsId(localSettings.seoGoogleAnalyticsId) ? 'border-rose-500/70' : 'border-slate-800'
                          }`}
                        />
                        {localSettings.seoGoogleAnalyticsId && !isValidGoogleAnalyticsId(localSettings.seoGoogleAnalyticsId) && (
                          <p className="text-[10px] text-rose-400">Utilisez un identifiant de mesure au format G-XXXXXXXXXX.</p>
                        )}
                        <p className="text-[10px] text-slate-500">
                          Identifiant de mesure GA4 pour mesurer le trafic, les visiteurs, les interactions et les ventes.
                        </p>
                      </div>

                      {/* Meta Pixel (Facebook / Instagram) */}
                      <div className="space-y-1.5 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span>Pixel Meta (Facebook / Instagram)</span>
                        </label>
                        <input
                          type="text"
                          value={localSettings.seoFacebookPixelId || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, seoFacebookPixelId: e.target.value })}
                          placeholder="Ex: 123456789012345"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                        <p className="text-[10px] text-slate-500">
                          ID de pixel pour suivre les conversions publicitaires et créer des audiences de retargeting.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Fichiers d'Indexation & Outils d'Audit */}
                  <div className="space-y-3 p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-emerald-400" />
                      <span>3. Fichiers Systèmes & Diagnostics SEO Automatiques</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Votre boutique génère automatiquement les fichiers standards exigés par les moteurs de recherche :
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {/* Sitemap.xml */}
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between group transition cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-white group-hover:text-indigo-400 flex items-center gap-1.5">
                            <span>Sitemap Dynamique</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">/sitemap.xml</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Actif
                        </span>
                      </a>

                      {/* Robots.txt */}
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between group transition cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-white group-hover:text-indigo-400 flex items-center gap-1.5">
                            <span>Directives Robots</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">/robots.txt</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Actif
                        </span>
                      </a>

                      {/* Google Rich Results Test */}
                      <a
                        href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(localSettings.seoCanonicalUrl || 'http://localhost:3000')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between group transition cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-white group-hover:text-blue-400 flex items-center gap-1.5">
                            <span>Test Données Structurées</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />
                          </span>
                          <span className="text-[10px] text-slate-500 block">Google Rich Results</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Tester
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 9: SÉCURITÉ DU COMPTE ADMINISTRATEUR */}
              {/* ================================================================= */}
              {settingsSubTab === 'security' && (
                <AdminPasswordSecurity currentUser={currentUser} />
              )}

              {/* ================================================================= */}
              {/* SOUS-PAGE 10: MAINTENANCE & SYSTÈME */}
              {/* ================================================================= */}
              {settingsSubTab === 'maintenance' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider">Maintenance & Réinitialisation</h2>
                      <p className="text-xs text-slate-400">État du serveur PostgreSQL, conteneurs Docker et gestion des données démo.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Base de Données PostgreSQL</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Connectée et synchronisée via Prisma ORM avec persistance complète des données.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                        <span>Architecture Docker</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Conteneurs `boutique_app` & `boutique_postgres` opérationnels.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-950/30 rounded-2xl border border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-rose-200">Réinitialiser les Données de Démonstration</h4>
                      <p className="text-[11px] text-rose-400 mt-0.5">
                        Rétablit les articles de démo initiaux (vêtements, montres, sneakers).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('Voulez-vous réinitialiser les données de démonstration de la boutique ?')) {
                          await resetToDemoData();
                          alert('Données démo réinitialisées avec succès !');
                        }
                      }}
                      className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-200 font-bold text-xs rounded-xl border border-rose-800 transition cursor-pointer self-start sm:self-auto"
                    >
                      Réinitialiser données démo
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Persistent Action Bar */}
              {settingsSubTab !== 'security' && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-medium">Les réglages sont sauvegardés instantanément sur le serveur PostgreSQL.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Paramètres</span>
                </button>
              </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* TAB: BANNIÈRES & SECTION HERO */}
          {/* ========================================================================= */}
          {activeTab === 'banners' && (
            <AdminBannerStudio
              localSettings={localSettings}
              setLocalSettings={setLocalSettings}
              handleSaveSettings={handleSaveSettings}
              saveSuccessMsg={saveSuccessMsg}
              products={products}
              categories={categories}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB: PARTENAIRES & AFFILIATION */}
          {/* ========================================================================= */}
          {activeTab === 'partners' && (
            <AdminPartnersManager />
          )}

          {/* ========================================================================= */}
          {/* TAB: SYSTÈME DE LIVRAISON AUTONOME (CÔTE D'IVOIRE) */}
          {/* ========================================================================= */}
          {activeTab === 'delivery' && (
            <AdminDeliveryManager />
          )}

          {/* ========================================================================= */}
          {/* TAB: GESTION DE L'ÉQUIPE & RÔLES */}
          {/* ========================================================================= */}
          {activeTab === 'team' && (
            <AdminTeamManager />
          )}

        </main>

      </div>

    </div>
  );
};
