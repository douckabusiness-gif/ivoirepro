export type CurrencyCode = 'FCFA';

export type PaymentMethod = 'whatsapp' | 'payment_link' | 'wave' | 'orange_money' | 'mtn_money' | 'moov_money' | 'card' | 'cod' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type DeliveryVehicleType = 'moto' | 'tricycle' | 'voiture' | 'compagnie';
export type DeliveryPersonStatus = 'available' | 'busy' | 'offline';
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'returned';

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleType: DeliveryVehicleType;
  zone: string;
  status: DeliveryPersonStatus;
  currentDeliveriesCount: number;
  totalCompletedDeliveries: number;
  collectedCashToday: number;
  rating?: number;
  notes?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  delay: string;
  communes: string[];
}

export interface ProductOption {
  name: string; // e.g. "Couleur" or "Taille"
  values: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description?: string;
  image?: string;
  itemCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  iconName?: string;
  itemCount?: number;
  subcategories?: Subcategory[];
}

export interface PriceTier {
  minQty: number;
  maxQty?: number;
  price?: number;
  discountPercent?: number;
  label?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  images: string[];
  featured?: boolean;
  isNew?: boolean;
  isFlashSale?: boolean;
  flashSaleEndsAt?: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  badgeText?: string;
  tags?: string[];
  specs?: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  tierPricingEnabled?: boolean;
  priceTiers?: PriceTier[];
  isDubaiPreorder?: boolean;
  dubaiDeliveryDays?: string;
  dubaiBatchDate?: string;
  aedPurchasePrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface CartToastInfo {
  id: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  timestamp: number;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerCity: string;
  customerCountry?: string;
  customerNotes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  directPaymentLinkUsed?: string;
  whatsappMessageSent?: boolean;
  
  // Partner & Affiliate Attribution
  partnerId?: string | null;
  partnerSlug?: string | null;
  partnerCommission?: number;
  partnerCommissionCredited?: boolean;
  partner?: Partner | null;

  // Autonomous Delivery Fields (Côte d'Ivoire)
  deliveryStatus?: DeliveryStatus;
  deliveryPersonId?: string | null;
  deliveryPersonName?: string | null;
  deliveryPersonPhone?: string | null;
  deliveryAssignedAt?: string | null;
  deliveredAt?: string | null;
  deliveryCashCollected?: number | null;
  deliveryZone?: string | null;
  deliveryNotes?: string | null;

  createdAt: string;
  updatedAt?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface HeroSlideItem {
  id: string;
  enabled?: boolean;
  placement?: 'hero' | 'grid';
  title: string;
  highlight?: string;
  subtitle: string;
  badge?: string;
  tag?: string;
  image: string;
  displayMode?: 'graphic' | 'standard';
  textAlignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  linkAction?: 'shop' | 'whatsapp' | 'category' | 'product' | 'link' | string;
  linkUrl?: string;
  targetProductId?: string;
  targetCategoryId?: string;
  whatsappMessage?: string;
  buttonText?: string;
  buttonAction?: 'shop' | 'whatsapp' | 'category' | 'product' | 'link' | string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: 'shop' | 'whatsapp' | 'category' | 'product' | 'link' | string;
  secondaryButtonLink?: string;
  promoDiscount?: string;
  theme?: 'midnight' | 'gold' | 'emerald' | 'sunset' | 'dark' | 'custom' | string;
}

export interface InGridBannerItem {
  id: string;
  enabled?: boolean;
  placement?: 'hero' | 'grid';
  title: string;
  subtitle: string;
  badge?: string;
  buttonText: string;
  buttonAction?: 'flash' | 'whatsapp' | 'category' | 'product' | 'vip' | 'link' | string;
  buttonLink?: string;
  targetProductId?: string;
  targetCategoryId?: string;
  whatsappMessage?: string;
  theme?: 'gold' | 'midnight' | 'emerald' | 'sunset' | 'dark' | 'custom' | string;
  imageUrl?: string;
  displayMode?: 'graphic' | 'standard';
  overlayOpacity?: number;
}

export interface StoreSettings {
  storeName: string;
  storeSlogan: string;
  storeLogoUrl: string;
  storeLogoHeight?: number;
  showLogoText?: boolean;
  pwaIconUrl?: string;
  siteHeaderColor?: string;
  siteFooterColor?: string;
  siteBodyColor?: string;
  homeTheme?: 'midnight' | 'emerald' | 'gold' | 'sunset' | 'graphite' | 'custom' | string;
  currency: CurrencyCode;
  currencySymbol: string;
  
  // WhatsApp Settings
  whatsappNumber: string; // e.g. "221771234567" or "+33612345678"
  whatsappAutoMessage: string;
  whatsappFloatingEnabled: boolean;
  whatsappDirectOrderEnabled: boolean;
  
  // Payment Settings & Links
  enableWavePayment: boolean;
  wavePaymentUrl: string;
  waveMerchantPhone: string;
  
  enableOrangeMoney: boolean;
  orangeMoneyMerchantNumber: string;

  // Côte d'Ivoire Mobile Money (MTN & Moov)
  enableMtnMoney?: boolean;
  mtnMerchantNumber?: string;
  enableMoovMoney?: boolean;
  moovMerchantNumber?: string;
  
  enableCustomPaymentLink: boolean;
  customPaymentLinkUrl: string; // Direct Stripe, Paystack, PayPal or other payment link
  customPaymentLinkLabel: string;
  
  enableBankTransfer: boolean;
  bankDetails: string;
  
  enableCashOnDelivery: boolean;
  codInstructions: string;
  
  // Contact & Social
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  
  // Shipping & Policies
  standardShippingFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: string;
  
  // Header / Top Announcement Banner
  topBannerEnabled: boolean;
  topBannerText: string;
  topBannerLink?: string;

  // TikTok Shoppable Video Feed
  tiktokFeedEnabled?: boolean;

  // In-Grid Interstitial Promotional Banners
  inGridBannerEnabled?: boolean;
  inGridBannerFrequency?: number;
  inGridBannerTitle?: string;
  inGridBannerSubtitle?: string;
  inGridBannerBadge?: string;
  inGridBannerButtonText?: string;
  inGridBannerButtonAction?: 'flash' | 'whatsapp' | 'category' | 'vip' | 'link' | string;
  inGridBannerButtonLink?: string;
  inGridBannerTheme?: 'gold' | 'midnight' | 'emerald' | 'sunset' | 'dark' | 'custom' | string;
  inGridBannerImageUrl?: string;
  inGridBannerSecondaryEnabled?: boolean;
  inGridBannerSecondaryTitle?: string;
  inGridBannerSecondarySubtitle?: string;
  inGridBannerSecondaryBadge?: string;
  inGridBannerSecondaryButtonText?: string;
  inGridBannerSecondaryButtonAction?: 'flash' | 'whatsapp' | 'category' | 'vip' | 'link' | string;
  inGridBannerSecondaryTheme?: 'gold' | 'midnight' | 'emerald' | 'sunset' | 'dark' | 'custom' | string;
  inGridBannerSecondaryImageUrl?: string;
  inGridBannersList?: InGridBannerItem[];
  
  // Hero section settings
  heroTheme?: 'midnight' | 'gold' | 'emerald' | 'sunset' | 'dark' | 'custom' | string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImage: string;
  heroButtonText: string;
  heroSecondaryButtonText: string;
  heroPromoDiscount: string;
  heroSlidesList?: HeroSlideItem[];

  // Hero Slide 2
  heroSlide2Title?: string;
  heroSlide2Highlight?: string;
  heroSlide2Subtitle?: string;
  heroSlide2Badge?: string;
  heroSlide2Image?: string;
  heroSlide2Tag?: string;

  // Hero Slide 3
  heroSlide3Title?: string;
  heroSlide3Highlight?: string;
  heroSlide3Subtitle?: string;
  heroSlide3Badge?: string;
  heroSlide3Image?: string;
  heroSlide3Tag?: string;

  // CMS content
  aboutUsText: string;
  deliveryPolicyText: string;
  returnPolicyText: string;
  termsText: string;
  privacyText: string;
  faqList: FAQItem[];

  // Autonomous Multi-LLM AI Agent Configuration
  aiAgentEnabled?: boolean;
  aiAgentName?: string;
  aiAgentRole?: string;
  aiAgentTone?: 'professionnel' | 'chaleureux' | 'luxe';
  aiAgentAutoReplyDelay?: number;
  aiAgentMaxRecommendations?: number;
  aiProvider?: 'gemini' | 'openai' | 'claude' | 'groq' | 'deepseek' | 'glm' | 'local';
  aiModel?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  claudeApiKey?: string;
  groqApiKey?: string;
  deepseekApiKey?: string;
  glmApiKey?: string;
  aiTemperature?: number;
  aiCustomInstructions?: string;
  customAgents?: SpecializedAgent[];

  // Partner / Affiliate Program Settings
  partnerProgramEnabled?: boolean;
  defaultPartnerCommissionRate?: number;
  minPayoutAmount?: number;

  // Autonomous Delivery & Fleet Management (Côte d'Ivoire)
  autoDispatchEnabled?: boolean;
  deliveryZonesList?: DeliveryZone[];

  // SMTP Email Server Configuration
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
  smtpOrderNotificationAdmin?: boolean;
  smtpOrderConfirmationCustomer?: boolean;
  smtpOrderStatusUpdateCustomer?: boolean;
  smtpAdminRecipientEmail?: string;

  // Telegram order notifications
  telegramEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramNotifyNewOrder?: boolean;

  // SEO & Webmaster Configuration
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  seoCanonicalUrl?: string;
  seoGoogleVerification?: string;
  seoGoogleAnalyticsId?: string;
  seoFacebookPixelId?: string;

  // Espace Dubaï Pre-orders Configuration
  dubaiPageEnabled?: boolean;
  dubaiPageTitle?: string;
  dubaiPageSubtitle?: string;
  dubaiNextFlightDate?: string;
  dubaiAedRate?: number;
}

export type SpecializedAgentId = 'orchestrator' | 'sales' | 'support' | 'copywriter' | 'promo' | 'satisfaction' | string;

export interface SpecializedAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  badge: string;
  temperature: number;
  description: string;
  sampleTriggers: string[];
  systemPromptTemplate: string;
  enabled?: boolean;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'visitor' | 'admin' | 'system';
  senderName: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorPhone?: string | null;
  visitorEmail?: string | null;
  lastMessageText: string;
  lastMessageAt: string;
  unreadByAdmin: number;
  unreadByVisitor: number;
  status: 'active' | 'closed';
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type PartnerStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type PayoutMethod = 'wave' | 'orange_money' | 'bank';
export type PayoutStatus = 'pending' | 'completed' | 'rejected';

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  slug: string;
  storeName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  payoutMethod: PayoutMethod | string;
  payoutPhone?: string | null;
  commissionRate: number;
  status: PartnerStatus | string;
  totalEarnings: number;
  pendingBalance: number;
  paidBalance: number;
  clicksCount: number;
  orders?: Order[];
  payouts?: PartnerPayout[];
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerPayout {
  id: string;
  partnerId: string;
  amount: number;
  payoutMethod: string;
  payoutTarget: string;
  status: PayoutStatus | string;
  note?: string | null;
  createdAt: string;
  processedAt?: string | null;
  partner?: {
    name: string;
    email: string;
    phone: string;
    slug: string;
  };
}

export interface ActiveReferral {
  slug: string;
  name: string;
  storeName?: string;
  avatarUrl?: string;
  commissionRate?: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  loyaltyPoints: number;
  wishlist: string[];
  referredByPartnerId?: string | null;
  orders?: Order[];
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 
  | 'admin' 
  | 'vendeur' 
  | 'gestionnaire_stock' 
  | 'support' 
  | 'gestionnaire_livraison';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, {
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
  color: string;
  allowedTabs: string[];
}> = {
  admin: {
    label: 'Directeur / Super Admin',
    shortLabel: 'Super Admin',
    badge: '👑 Super Admin',
    description: 'Accès absolu à tous les modules, paramètres financiers, clés IA et gestion de l\'équipe.',
    color: 'from-purple-600 to-indigo-600',
    allowedTabs: [
      'dashboard', 
      'analytics',
      'orders', 
      'delivery', 
      'dubai',
      'products', 
      'categories', 
      'chat', 
      'agent',
      'banners', 
      'partners', 
      'marketing', 
      'payments', 
      'whatsapp',
      'branding',
      'appearance',
      'team',
      'settings'
    ]
  },
  vendeur: {
    label: 'Vendeur / Commercial',
    shortLabel: 'Vendeur',
    badge: '💼 Vendeur',
    description: 'Traitement des commandes, relance WhatsApp, Live Chat client et gestion du catalogue.',
    color: 'from-emerald-600 to-teal-600',
    allowedTabs: ['dashboard', 'orders', 'chat', 'dubai', 'products', 'categories']
  },
  gestionnaire_stock: {
    label: 'Gestionnaire de Stock / Magasinier',
    shortLabel: 'Stock',
    badge: '📦 Stock',
    description: 'Inventaire, niveaux de stock, alertes rupture, gestion des produits et catégories.',
    color: 'from-blue-600 to-cyan-600',
    allowedTabs: ['dashboard', 'dubai', 'products', 'categories']
  },
  support: {
    label: 'Support Client & SAV',
    shortLabel: 'Support SAV',
    badge: '🎧 Support',
    description: 'Live Chat direct avec les visiteurs, consultation des commandes pour renseigner les clients.',
    color: 'from-amber-600 to-orange-600',
    allowedTabs: ['chat', 'orders']
  },
  gestionnaire_livraison: {
    label: 'Responsable Livraisons / Dispatch',
    shortLabel: 'Livraisons',
    badge: '🛵 Dispatch',
    description: 'Dispatch des commandes, suivi de la flotte de coursiers et contrôle des encaissements COD.',
    color: 'from-rose-600 to-pink-600',
    allowedTabs: ['orders', 'delivery']
  }
};

export type WebCallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
export type WebCallTarget = 'ai_advisor' | 'customer_support' | 'human_agent' | 'direct_visitor';

export interface WebCallState {
  id: string;
  status: WebCallStatus;
  target: WebCallTarget;
  contactName: string;
  contactSubtitle?: string;
  contactAvatar?: string;
  isIncoming: boolean;
  duration: number; // duration in seconds
  isMuted: boolean;
  isSpeakerOn: boolean;
  startedAt?: string;
  conversationId?: string;
  offer?: any;
  answer?: any;
  micError?: string | null;
  connectionQuality?: 'connecting' | 'connected' | 'reconnecting' | 'failed';
}
