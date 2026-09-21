'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { 
  Product, 
  Category, 
  Subcategory, 
  Order, 
  StoreSettings, 
  CartItem, 
  CartToastInfo,
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod,
  ChatMessage,
  ChatConversation,
  ActiveReferral,
  Customer,
  DeliveryPerson,
  DeliveryPersonStatus,
  DeliveryStatus,
  DeliveryZone,
  UserRole,
  TeamMember,
  ROLE_DEFINITIONS,
  WebCallState,
  WebCallStatus,
  WebCallTarget
} from './types';
import { webCallAudio } from './webCallAudio';
import { webRtcVoice } from './webRtcVoice';
import { trackAnalyticsEvent } from './analytics';
import { getUnitPriceForQuantity } from './tierPricing';
import { 
  initialCategories, 
  initialProducts, 
  initialStoreSettings,
  initialDeliveryPersons,
  IVORY_COAST_COMMUNES
} from './initialData';

const readApiError = async (response: Response, fallback: string): Promise<string> => {
  const payload = await response.json().catch(() => null);
  return typeof payload?.error === 'string' && payload.error.trim()
    ? payload.error.trim()
    : fallback;
};

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'admin' 
  | 'about' 
  | 'contact' 
  | 'faq' 
  | 'terms' 
  | 'privacy'
  | 'delivery'
  | 'order-success'
  | 'marketing'
  | 'partenaire'
  | 'compte'
  | 'livreur';

interface StoreContextType {
  // Navigation & Views
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (categoryId: string | null) => void;
  selectedSubcategoryFilter: string | null;
  setSelectedSubcategoryFilter: (subcategoryId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Partner & Affiliate Referral
  activeReferral: ActiveReferral | null;
  setActiveReferral: (referral: ActiveReferral | null) => void;
  clearActiveReferral: () => void;
  
  // Data

  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  /** True once the public store settings request has completed. */
  isSettingsLoaded: boolean;
  
  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartShippingFee: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string, openDrawer?: boolean) => void;
  removeFromCart: (productId: string, selectedColor?: string, selectedSize?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  clearCart: () => void;
  
  // Cart Toast Notifications
  cartToasts: CartToastInfo[];
  showCartToast: (toast: Omit<CartToastInfo, 'id' | 'timestamp'>) => void;
  dismissCartToast: (id: string) => void;
  clearCartToasts: () => void;
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  // Last created order for success screen
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;

  // Theme (Dark / Light mode across entire store)
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean | ((prev: boolean) => boolean)) => void;
  toggleDarkMode: () => void;

  // Checkout modal
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  
  // Quick View Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // TikTok Shoppable Feed Modal
  isFeedOpen: boolean;
  setIsFeedOpen: (open: boolean) => void;
  openFeed: (initialProductId?: string) => void;
  feedActiveProductId: string | null;
  setFeedActiveProductId: (id: string | null) => void;

  // Customer Account & Authentication
  customer: Customer | null;
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;
  customerAuthInitialMode: 'login' | 'register';
  openCustomerAuth: (mode?: 'login' | 'register') => void;
  customerLogin: (identifier: string, password?: string, isDemo?: boolean) => Promise<{ success: boolean; error?: string }>;
  customerRegister: (data: { fullName: string; phone: string; email?: string; password: string; city?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  customerLogout: () => Promise<void>;
  refreshCustomerSession: () => Promise<void>;
  updateCustomerProfile: (data: Partial<Customer>) => Promise<{ success: boolean; error?: string }>;

  // Admin & Auth
  currentUser: { id?: string; email?: string; name?: string; role?: UserRole; isDemo?: boolean } | null;
  isAdminAuthenticated: boolean;
  adminEmail: string;
  loginWithGoogle: () => Promise<boolean>;
  loginWithPassword?: (password: string, email?: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoAdmin: () => Promise<boolean>;
  logoutAdmin: () => Promise<void>;

  // Team & Role Management
  teamMembers: TeamMember[];
  effectiveRole: UserRole;
  fetchTeamMembers: () => Promise<void>;
  createTeamMember: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<{ success: boolean; error?: string; member?: TeamMember }>;
  updateTeamMemberRole: (id: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  deleteTeamMember: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // WhatsApp Link Utilities
  generateWhatsAppProductLink: (product: Product, customMsg?: string) => string;
  generateWhatsAppOrderLink: (order: Order) => string;
  generateWhatsAppGeneralLink: (customText?: string) => string;
  
  // Helpers
  formatPrice: (amount: number) => string;
  
  // Admin Operations
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<string>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (newCategory: Omit<Category, 'id'>) => Promise<string>;
  updateCategory: (id: string, updated: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (categoryId: string, subcategory: Omit<Subcategory, 'id' | 'categoryId' | 'slug'> & { slug?: string }) => Promise<string>;
  updateSubcategory: (categoryId: string, subcategoryId: string, updated: Partial<Subcategory>) => Promise<void>;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => Promise<void>;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  
  // Sync status
  isSyncing: boolean;

  // Live Chat System
  visitorId: string;
  isChatDrawerOpen: boolean;
  setIsChatDrawerOpen: (open: boolean) => void;
  visitorChatMessages: ChatMessage[];
  chatConversations: ChatConversation[];
  unreadAdminChatCount: number;
  unreadVisitorChatCount: number;
  sendVisitorChatMessage: (text: string, visitorName?: string, visitorPhone?: string) => Promise<boolean>;
  sendAdminChatMessage: (conversationId: string, text: string) => Promise<void>;
  fetchVisitorChatMessages: () => Promise<void>;
  fetchAdminChatConversations: () => Promise<void>;
  markChatAsRead: (conversationId: string, reader: 'admin' | 'visitor') => Promise<void>;
  deleteChatConversation: (conversationId: string) => Promise<void>;

  // In-Browser VoIP Web Call System & Sonneries
  activeCall: WebCallState | null;
  startWebCall: (target?: WebCallTarget, contactName?: string, contactSubtitle?: string) => void;
  acceptIncomingCall: () => void;
  rejectIncomingCall: () => void;
  endWebCall: () => void;
  toggleCallMute: () => void;
  toggleCallSpeaker: () => void;
  simulateIncomingCall: (contactName?: string, contactSubtitle?: string) => void;
  sendCallAudioVoiceNote: (spokenText: string) => Promise<void>;

  // Autonomous Delivery Fleet (Côte d'Ivoire)
  deliveryPersons: DeliveryPerson[];
  assignOrderDelivery: (orderId: string, deliveryPersonId: string, notes?: string) => Promise<void>;
  updateOrderDeliveryStatus: (orderId: string, deliveryStatus: DeliveryStatus, cashCollected?: number) => Promise<void>;
  autoAssignOrderDelivery: (orderId: string) => Promise<{ success: boolean; deliveryPerson?: DeliveryPerson }>;
  reconcileCourierCash: (courierId: string) => Promise<void>;
  addDeliveryPerson: (person: Omit<DeliveryPerson, 'id' | 'createdAt'>) => void;
  updateDeliveryPerson: (id: string, updated: Partial<DeliveryPerson>) => void;
  deleteDeliveryPerson: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Browser notification helper (module-level: no component state needed)
function showBrowserCallNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/favicon.ico' });
    } catch {}
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        try {
          new Notification(title, { body, icon: '/favicon.ico' });
        } catch {}
      }
    });
  }
}

export interface StoreInitialData {
  settings?: StoreSettings;
  products?: Product[];
  categories?: Category[];
}

export const StoreProvider = ({
  children,
  initialView,
  initialData,
  initialCategoryFilter,
  initialSubcategoryFilter,
}: {
  children: ReactNode;
  initialView?: AppView;
  /** Données préchargées côté serveur (home) : évite le flash de données démo et 3 requêtes au démarrage. */
  initialData?: StoreInitialData | null;
  initialCategoryFilter?: string | null;
  initialSubcategoryFilter?: string | null;
}) => {
  // Navigation
  const [currentView, setCurrentViewState] = useState<AppView>(initialView || 'home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilterState] = useState<string | null>(initialCategoryFilter ?? null);
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string | null>(initialSubcategoryFilter ?? null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Referral & Partner State
  const [activeReferral, setActiveReferral] = useState<ActiveReferral | null>(null);

  const clearActiveReferral = useCallback(() => {
    setActiveReferral(null);
    try {
      localStorage.removeItem('boutique_partner_ref');
    } catch (e) {}
  }, []);

  // URL synchronization
  const setCurrentView = useCallback((view: AppView) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      try {
        if (view === 'admin') {
          if (window.location.pathname !== '/admin') {
            window.history.pushState({ view: 'admin' }, '', '/admin');
          }
        } else if (view === 'partenaire') {
          if (window.location.pathname !== '/partenaire') {
            window.history.pushState({ view: 'partenaire' }, '', '/partenaire');
          }
        } else if (view === 'livreur') {
          if (window.location.pathname !== '/livreur') {
            window.history.pushState({ view: 'livreur' }, '', '/livreur');
          }
        } else if (view === 'home') {
          if (window.location.pathname === '/admin' || window.location.pathname === '/partenaire' || window.location.pathname === '/livreur') {
            window.history.pushState({ view: 'home' }, '', '/');
          }
        } else {
          if (window.location.pathname === '/admin' || window.location.pathname === '/partenaire' || window.location.pathname === '/livreur') {
            window.history.pushState({ view }, '', `/?view=${view}`);
          }
        }
      } catch (err) {
        console.warn('URL sync error', err);
      }
    }
  }, []);

  // Handle URL detection on mount and back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const detectViewFromUrl = () => {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get('view');
      const hash = window.location.hash;

      // Detect referral code from ?ref= or /p/
      const refParam = searchParams.get('ref');
      let partnerSlug = refParam;
      if (!partnerSlug && pathname.startsWith('/p/')) {
        partnerSlug = pathname.replace('/p/', '').split('/')[0];
      }
      if (!partnerSlug) {
        try {
          partnerSlug = localStorage.getItem('boutique_partner_ref');
        } catch (e) {}
      }

      if (partnerSlug) {
        fetch('/api/partners/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: partnerSlug }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data && data.success && data.partner) {
              setActiveReferral(data.partner);
              try {
                localStorage.setItem('boutique_partner_ref', data.partner.slug);
              } catch (e) {}
            }
          })
          .catch(() => {});
      }

      if (initialView) {
        setCurrentViewState(initialView);
      } else if (pathname === '/admin' || pathname.startsWith('/admin/') || viewParam === 'admin' || hash === '#admin') {
        setCurrentViewState('admin');
      } else if (pathname === '/partenaire' || pathname.startsWith('/partenaire/') || viewParam === 'partenaire' || hash === '#partenaire') {
        setCurrentViewState('partenaire');
      } else if (pathname === '/livreur' || pathname.startsWith('/livreur/') || viewParam === 'livreur' || hash === '#livreur') {
        setCurrentViewState('livreur');
      } else if (viewParam && ['home', 'shop', 'about', 'faq', 'contact', 'delivery', 'terms', 'marketing'].includes(viewParam)) {
        setCurrentViewState(viewParam as AppView);
      }
    };

    detectViewFromUrl();
    const handlePopState = () => detectViewFromUrl();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initialView]);

  const setSelectedCategoryFilter = useCallback((categoryId: string | null) => {
    setSelectedCategoryFilterState(categoryId);
    setSelectedSubcategoryFilter(null);
  }, []);
  
  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [isFeedOpen, setIsFeedOpen] = useState<boolean>(false);
  const [feedActiveProductId, setFeedActiveProductId] = useState<string | null>(null);

  const openFeed = useCallback((initialProductId?: string) => {
    if (initialProductId) {
      setFeedActiveProductId(initialProductId);
    }
    setIsFeedOpen(true);
  }, []);

  // Core Data
  const [products, setProducts] = useState<Product[]>(initialData?.products ?? initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialData?.categories ?? initialCategories);
  // Orders are always loaded from the server. Keeping demo orders in this client
  // bundle would expose customer names, phones and addresses to every visitor.
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(initialData?.settings ?? initialStoreSettings);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(Boolean(initialData?.settings));
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Autonomous Delivery Fleet (Côte d'Ivoire)
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boutique_delivery_persons');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return initialDeliveryPersons;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boutique_delivery_persons', JSON.stringify(deliveryPersons));
    }
  }, [deliveryPersons]);
  
  // Customer Auth & Account State
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState<boolean>(false);
  const [customerAuthInitialMode, setCustomerAuthInitialMode] = useState<'login' | 'register'>('login');

  const openCustomerAuth = useCallback((mode: 'login' | 'register' = 'login') => {
    setCustomerAuthInitialMode(mode);
    setIsCustomerAuthModalOpen(true);
  }, []);

  // Cart & Wishlist (local persistence)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [cartToasts, setCartToasts] = useState<CartToastInfo[]>([]);

  // Cart Toast Handlers
  const showCartToast = useCallback((toastData: Omit<CartToastInfo, 'id' | 'timestamp'>) => {
    const newToast: CartToastInfo = {
      ...toastData,
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };
    setCartToasts((prev) => [newToast, ...prev.slice(0, 2)]);
  }, []);

  const dismissCartToast = useCallback((id: string) => {
    setCartToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearCartToasts = useCallback(() => {
    setCartToasts([]);
  }, []);
  
  // Auth & Team State
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; name?: string; role?: UserRole; isDemo?: boolean } | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const adminEmail = '';
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const effectiveRole: UserRole = currentUser?.role || 'admin';

  // Live Chat System State
  const [visitorId, setVisitorId] = useState<string>('');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [visitorChatMessages, setVisitorChatMessages] = useState<ChatMessage[]>([]);
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [unreadAdminChatCount, setUnreadAdminChatCount] = useState<number>(0);
  const [unreadVisitorChatCount, setUnreadVisitorChatCount] = useState<number>(0);

  // Initialize Visitor ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let vid = localStorage.getItem('boutique_visitor_id');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
        localStorage.setItem('boutique_visitor_id', vid);
      }
      setVisitorId(vid);
    }
  }, []);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('boutique_theme_mode') || localStorage.getItem('admin_dark_mode');
      if (savedTheme !== null) {
        const isDark = savedTheme === 'true' || savedTheme === 'dark';
        setIsDarkMode(isDark);
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        if (prefersDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Dark mode error', e);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('boutique_theme_mode', 'dark');
          localStorage.setItem('admin_dark_mode', 'true');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('boutique_theme_mode', 'light');
          localStorage.setItem('admin_dark_mode', 'false');
        }
      } catch (e) {}
      return next;
    });
  }, []);

  // Fetch all data from backend API.
  // Les commandes ne sont chargées que pour une session admin : un visiteur
  // n'a pas besoin de cet appel (il répondait 401 et gaspillait une requête).
  const isAdminRef = useRef(false);
  useEffect(() => {
    isAdminRef.current = isAdminAuthenticated;
  }, [isAdminAuthenticated]);
  const refreshBackendData = useCallback(async (options?: { includeOrders?: boolean }) => {
    const includeOrders = options?.includeOrders ?? isAdminRef.current;
    try {
      setIsSyncing(true);
      const [resSettings, resProducts, resCategories, resOrders] = await Promise.allSettled([
        fetch('/api/settings').then(r => r.ok ? r.json() : null),
        fetch('/api/products').then(r => r.ok ? r.json() : null),
        fetch('/api/categories').then(r => r.ok ? r.json() : null),
        includeOrders ? fetch('/api/orders').then(r => r.ok ? r.json() : null) : Promise.resolve(null),
      ]);

      if (resSettings.status === 'fulfilled' && resSettings.value) {
        setSettings(resSettings.value);
      }
      if (resProducts.status === 'fulfilled' && Array.isArray(resProducts.value)) {
        setProducts(resProducts.value);
      }
      if (resCategories.status === 'fulfilled' && Array.isArray(resCategories.value)) {
        setCategories(resCategories.value);
      }
      if (resOrders.status === 'fulfilled' && Array.isArray(resOrders.value)) {
        setOrders(resOrders.value);
      }
    } catch (err) {
      console.warn('API sync warning:', err);
    } finally {
      // Do not let brand fallbacks flash before the real settings are known.
      setIsSettingsLoaded(true);
      setIsSyncing(false);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.team)) {
          setTeamMembers(data.team);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch team members:', e);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    // The server-side session cookie is the only source of truth for admin auth.
    setIsAdminAuthenticated(false);
    setCurrentUser(null);
    try {
      const savedCart = localStorage.getItem('boutique_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      
      const savedWishlist = localStorage.getItem('boutique_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      // Remove the legacy marker without ever trusting it for authentication.
      localStorage.removeItem('boutique_admin_session');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Check server session & load PostgreSQL data
    fetch('/api/auth/me')
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.authenticated) {
          setIsAdminAuthenticated(true);
          setCurrentUser(data.user);
          await Promise.all([fetchTeamMembers(), refreshBackendData({ includeOrders: true })]);
        } else {
          setIsAdminAuthenticated(false);
          setCurrentUser(null);
          setTeamMembers([]);
          localStorage.removeItem('boutique_admin_session');
        }
      })
      .catch(() => {
        setIsAdminAuthenticated(false);
        setCurrentUser(null);
        setTeamMembers([]);
        try {
          localStorage.removeItem('boutique_admin_session');
        } catch {
          // Ignore storage failures; the server session remains authoritative.
        }
      });

    // Si le serveur a déjà fourni paramètres/produits/catégories, inutile de les redemander.
    const hasServerData = Boolean(initialData?.settings && initialData?.products && initialData?.categories);
    if (!hasServerData) {
      refreshBackendData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTeamMembers, refreshBackendData]);

  // Persist cart & wishlist in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('boutique_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('boutique_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  // Cart Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => {
    const unitPrice = getUnitPriceForQuantity(item.product, item.quantity);
    return total + unitPrice * item.quantity;
  }, 0);
  const cartShippingFee = cartSubtotal >= settings.freeShippingThreshold || cartSubtotal === 0 ? 0 : settings.standardShippingFee;
  const cartTotal = cartSubtotal + cartShippingFee;

  // Cart Operations
  const addToCart = useCallback((product: Product, quantity = 1, selectedColor?: string, selectedSize?: string, openDrawer = false) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => 
          item.product.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor, selectedSize }];
      }
    });

    showCartToast({
      product,
      quantity,
      selectedColor,
      selectedSize
    });

    trackAnalyticsEvent({
      eventType: 'add_to_cart',
      productId: product.id,
      productTitle: product.title,
      label: 'Ajouter au panier',
      metadata: { quantity, selectedColor, selectedSize },
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }
  }, [showCartToast]);

  const removeFromCart = useCallback((productId: string, selectedColor?: string, selectedSize?: string) => {
    setCart((prev) => 
      prev.filter(
        (item) => 
          !(item.product.id === productId && 
            item.selectedColor === selectedColor && 
            item.selectedSize === selectedSize)
      )
    );
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number, selectedColor?: string, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, selectedSize);
      return;
    }
    setCart((prev) => 
      prev.map((item) => {
        if (
          item.product.id === productId && 
          item.selectedColor === selectedColor && 
          item.selectedSize === selectedSize
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Wishlist
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => 
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  // Auth Operations
  const loginWithGoogle = async (): Promise<boolean> => {
    return loginAsDemoAdmin();
  };

  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        setCurrentUser(data.user);
        await Promise.all([fetchTeamMembers(), refreshBackendData({ includeOrders: true })]);
        return { success: true };
      }
      return { success: false, error: data.error || 'Email ou mot de passe incorrect.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur de connexion au serveur.' };
    }
  };

  const loginAsDemoAdmin = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        setCurrentUser(data.user);
        await Promise.all([fetchTeamMembers(), refreshBackendData({ includeOrders: true })]);
        return true;
      }
    } catch (e) {
      console.warn('Demo login note:', e);
    }
    setIsAdminAuthenticated(false);
    setCurrentUser(null);
    return false;
  };

  const logoutAdmin = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setIsAdminAuthenticated(false);
    setCurrentUser(null);
    setTeamMembers([]);
    localStorage.removeItem('boutique_admin_session');
  };

  // Team & Role Management Handlers
  const createTeamMember = async (data: { name: string; email: string; password: string; role: UserRole }) => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Erreur de création du collaborateur' };
      }
      setTeamMembers((prev) => [...prev, result.member]);
      return { success: true, member: result.member };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur réseau' };
    }
  };

  const updateTeamMemberRole = async (id: string, role: UserRole) => {
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Erreur de mise à jour du rôle' };
      }
      setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
      if (currentUser?.id === id) {
        setCurrentUser((prev) => (prev ? { ...prev, role } : null));
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur réseau' };
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Erreur de suppression' };
      }
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Erreur réseau' };
    }
  };

  // Customer Account Handlers
  const refreshCustomerSession = useCallback(async () => {
    try {
      const res = await fetch('/api/customer/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomer(data.customer);
          return;
        }
      }
      setCustomer(null);
    } catch (e) {
      setCustomer(null);
    }
  }, []);

  const customerLogin = async (identifier: string, password?: string, isDemo?: boolean) => {
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, isDemo }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Identifiants incorrects.' };
      }
      setCustomer(data.customer);
      setIsCustomerAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erreur de connexion.' };
    }
  };

  const customerRegister = async (regData: { fullName: string; phone: string; email?: string; password: string; city?: string; address?: string }) => {
    try {
      const res = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Erreur d'inscription." };
      }
      setCustomer(data.customer);
      setIsCustomerAuthModalOpen(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Erreur d'inscription." };
    }
  };

  const customerLogout = async () => {
    try {
      await fetch('/api/customer/logout', { method: 'POST' });
    } catch (e) {}
    setCustomer(null);
    if (currentView === 'compte') {
      setCurrentView('home');
    }
  };

  const updateCustomerProfile = async (profileData: Partial<Customer>) => {
    try {
      const res = await fetch('/api/customer/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Erreur mise à jour.' };
      }
      setCustomer(data.customer);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Erreur mise à jour.' };
    }
  };

  // Check customer session on mount
  useEffect(() => {
    refreshCustomerSession();
  }, [refreshCustomerSession]);

  // WhatsApp Link Generator
  const cleanPhone = (phone: string) => {
    return phone.replace(/[^0-9]/g, '');
  };

  const generateWhatsAppGeneralLink = useCallback((customText?: string) => {
    const phone = cleanPhone(settings.whatsappNumber || '221778901234');
    const msg = customText || `Bonjour ${settings.storeName}, j'aimerais avoir des informations sur vos produits et services disponibles.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }, [settings.whatsappNumber, settings.storeName]);

  // Helpers for resolving public links & images in WhatsApp messages
  const getPublicBaseUrl = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    if (settings.seoCanonicalUrl) {
      return settings.seoCanonicalUrl.replace(/\/+$/, '');
    }
    return 'https://www.ivoireci.com';
  }, [settings.seoCanonicalUrl]);

  const resolvePublicImageUrl = useCallback((rawImage?: string) => {
    if (!rawImage) return '';
    if (rawImage.startsWith('data:')) return ''; // Omit heavy base64 strings from WhatsApp text
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage;
    }
    const base = getPublicBaseUrl();
    const cleanPath = rawImage.startsWith('/') ? rawImage : `/${rawImage}`;
    return `${base}${cleanPath}`;
  }, [getPublicBaseUrl]);

  const generateWhatsAppProductLink = useCallback((product: Product, customMsg?: string) => {
    const phone = cleanPhone(settings.whatsappNumber || '221778901234');
    const formattedPrice = `${product.price.toLocaleString('fr-FR')} ${settings.currency}`;
    const base = getPublicBaseUrl();
    const productUrl = `${base}/produit/${product.slug || product.id}`;
    const rawImg = product.images?.[0];
    const imageUrl = resolvePublicImageUrl(rawImg);

    let text = customMsg;
    if (!text) {
      if (product.isDubaiPreorder) {
        text = `Bonjour ${settings.storeName} !\n\n✈️ Je souhaite *PRÉCOMMANDER* cet article d'importation Dubaï :\n👉 *${product.title}*\n💰 Prix : *${formattedPrice}*\n⏱️ Délai de livraison estimé : *${product.dubaiDeliveryDays || '7 à 10 jours ouvrés'}*\n🔗 Lien : ${productUrl}`;
        if (imageUrl) {
          text += `\n🖼️ Photo : ${imageUrl}`;
        }
        text += `\n\nMerci de m'indiquer la procédure de paiement (Wave/Orange Money/MTN) pour valider ma précommande Dubaï !`;
      } else {
        text = `Bonjour ${settings.storeName} !\n\nJe souhaite commander l'article suivant :\n👉 *${product.title}*\n💰 Prix : *${formattedPrice}*\n🔗 Lien produit : ${productUrl}`;
        if (imageUrl) {
          text += `\n🖼️ Photo : ${imageUrl}`;
        }
        text += `\n\nPouvez-vous me confirmer la disponibilité et le délai de livraison ? Merci !`;
      }
    } else {
      if (!text.includes(productUrl) && !text.includes('Lien produit')) {
        text += `\n🔗 Lien produit : ${productUrl}`;
      }
      if (imageUrl && !text.includes(imageUrl) && !text.includes('Photo')) {
        text += `\n🖼️ Photo : ${imageUrl}`;
      }
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }, [settings.whatsappNumber, settings.storeName, settings.currency, getPublicBaseUrl, resolvePublicImageUrl]);

  const generateWhatsAppOrderLink = useCallback((order: Order) => {
    const phone = cleanPhone(settings.whatsappNumber || '221778901234');
    const base = getPublicBaseUrl();

    const itemsList = order.items
      .map((it, idx) => {
        const prod = products.find((p) => p.id === it.productId);
        const prodSlug = prod?.slug || it.productId;
        const prodUrl = `${base}/produit/${prodSlug}`;
        const rawImg = it.productImage || prod?.images?.[0];
        const imgUrl = resolvePublicImageUrl(rawImg);

        let itemStr = `  ${idx + 1}. 🛍️ *${it.productTitle}*\n     📦 Quantité : *${it.quantity}*`;
        if (it.selectedColor) itemStr += ` | Couleur : ${it.selectedColor}`;
        if (it.selectedSize) itemStr += ` | Taille : ${it.selectedSize}`;
        itemStr += `\n     💰 Prix : ${(it.price * it.quantity).toLocaleString('fr-FR')} ${order.currency}`;
        itemStr += `\n     🔗 Lien : ${prodUrl}`;
        if (imgUrl) {
          itemStr += `\n     🖼️ Image : ${imgUrl}`;
        }
        return itemStr;
      })
      .join('\n\n');

    let template = settings.whatsappAutoMessage || initialStoreSettings.whatsappAutoMessage;
    let message = template
      .replace('{order_number}', order.orderNumber)
      .replace('{items_list}', itemsList)
      .replace('{total_amount}', order.totalAmount.toLocaleString('fr-FR'))
      .replace('{currency}', order.currency)
      .replace('{customer_name}', order.customerName)
      .replace('{customer_phone}', order.customerPhone)
      .replace('{customer_address}', order.customerAddress)
      .replace('{customer_city}', order.customerCity);

    let paymentNote = `\n\n💳 *Moyen de paiement choisi :* ${
      order.paymentMethod === 'wave' ? 'Wave Mobile' :
      order.paymentMethod === 'orange_money' ? 'Orange Money' :
      order.paymentMethod === 'payment_link' ? 'Lien de Paiement Sécurisé' :
      order.paymentMethod === 'cod' ? 'Paiement à la livraison (Espèces)' :
      order.paymentMethod === 'bank_transfer' ? 'Virement Bancaire' : 'WhatsApp Direct Pay'
    }`;
    message += paymentNote;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [settings.whatsappNumber, settings.whatsappAutoMessage, getPublicBaseUrl, resolvePublicImageUrl, products]);

  // Helpers - Exclusively in FCFA
  const formatPrice = useCallback((amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }, []);

  // Admin CRUD Operations to Next.js API
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    setIsSyncing(true);
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      // Media data URLs are persisted separately by the branding form. Keeping
      // them out of the general settings request prevents oversized payloads
      // when a logo and a PWA icon are saved together.
      const { storeLogoUrl: _storeLogoUrl, pwaIconUrl: _pwaIconUrl, ...settingsPayload } = updated;
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsPayload),
      });
      if (res.ok) {
        const saved = await res.json();
        setSettings(saved);
        return true;
      }
      const errorBody = await res.json().catch(() => null);
      console.warn('Failed to update settings on API:', errorBody?.error || res.statusText);
      setSettings(settings);
      return false;
    } catch (e) {
      console.warn('Failed to update settings on API:', e);
      setSettings(settings);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const addProduct = async (newProduct: Omit<Product, 'id'>): Promise<string> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de publier le produit.'));
      }
      const created: Product = await res.json();
      setProducts((prev) => [created, ...prev.filter((product) => product.id !== created.id)]);
      return created.id;
    } catch (e) {
      console.warn('Failed to add product on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de publier le produit.');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de modifier le produit.'));
      }
      const saved: Product = await res.json();
      setProducts((prev) => prev.map((product) => (product.id === id ? saved : product)));
    } catch (e) {
      console.warn('Failed to update product on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de modifier le produit.');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de supprimer le produit.'));
      }
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (e) {
      console.warn('Failed to delete product on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de supprimer le produit.');
    } finally {
      setIsSyncing(false);
    }
  };

  const addCategory = async (newCategory: Omit<Category, 'id'>): Promise<string> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de créer la catégorie.'));
      }
      const created: Category = await res.json();
      setCategories((prev) => [...prev.filter((category) => category.id !== created.id), created]
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')));
      return created.id;
    } catch (e) {
      console.warn('Failed to add category on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de créer la catégorie.');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateCategory = async (id: string, updated: Partial<Category>) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de modifier la catégorie.'));
      }
      const saved: Category = await res.json();
      setCategories((prev) => prev
        .map((category) => (category.id === id ? saved : category))
        .sort((a, b) => a.name.localeCompare(b.name, 'fr')));
      if (updated.name) {
        setProducts((prev) => prev.map((product) => (
          product.categoryId === id ? { ...product, categoryName: saved.name } : product
        )));
      }
    } catch (e) {
      console.warn('Failed to update category on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de modifier la catégorie.');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de supprimer la catégorie.'));
      }
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (e) {
      console.warn('Failed to delete category on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de supprimer la catégorie.');
    } finally {
      setIsSyncing(false);
    }
  };

  const addSubcategory = async (
    categoryId: string, 
    newSub: Omit<Subcategory, 'id' | 'categoryId' | 'slug'> & { slug?: string }
  ): Promise<string> => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSub, categoryId }),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de créer la sous-catégorie.'));
      }
      const created: Subcategory = await res.json();
      setCategories((prev) => prev.map((category) => {
        if (category.id !== categoryId) return category;
        const subcategories = [...(category.subcategories || []), created]
          .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        return { ...category, subcategories };
      }));
      return created.id;
    } catch (e) {
      console.warn('Failed to add subcategory on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de créer la sous-catégorie.');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSubcategory = async (
    categoryId: string, 
    subcategoryId: string, 
    updated: Partial<Subcategory>
  ) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/subcategories/${subcategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de modifier la sous-catégorie.'));
      }
      const saved: Subcategory = await res.json();
      setCategories((prev) => prev.map((category) => {
        if (category.id !== categoryId) return category;
        const subcategories = (category.subcategories || [])
          .map((subcategory) => (subcategory.id === subcategoryId ? saved : subcategory))
          .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        return { ...category, subcategories };
      }));
      if (updated.name) {
        setProducts((prev) => prev.map((product) => (
          product.subcategoryId === subcategoryId ? { ...product, subcategoryName: saved.name } : product
        )));
      }
    } catch (e) {
      console.warn('Failed to update subcategory on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de modifier la sous-catégorie.');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/subcategories/${subcategoryId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Impossible de supprimer la sous-catégorie.'));
      }
      setCategories((prev) => prev.map((category) => {
        if (category.id !== categoryId) return category;
        const subcategories = (category.subcategories || []).filter((subcategory) => subcategory.id !== subcategoryId);
        return { ...category, subcategories };
      }));
      setProducts((prev) => prev.map((product) => (
        product.subcategoryId === subcategoryId
          ? { ...product, subcategoryId: undefined, subcategoryName: undefined }
          : product
      )));
    } catch (e) {
      console.warn('Failed to delete subcategory on API:', e);
      throw e instanceof Error ? e : new Error('Impossible de supprimer la sous-catégorie.');
    } finally {
      setIsSyncing(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
    setIsSyncing(true);
    const tempId = `ord-${Date.now()}`;
    const orderNumber = `CMD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const enrichedOrderData = {
      ...orderData,
      partnerSlug: orderData.partnerSlug || activeReferral?.slug || null,
      partnerCommission: activeReferral ? Math.round(orderData.subtotal * ((activeReferral.commissionRate || 10) / 100)) : (orderData.partnerCommission || 0),
    };

    // Autonomous Delivery Auto-Dispatch for Côte d'Ivoire
    let autoAssignedCourier: DeliveryPerson | null = null;
    if (settings.autoDispatchEnabled !== false) {
      const city = (orderData.customerCity || '').toLowerCase();
      autoAssignedCourier = deliveryPersons.find(dp => 
        dp.status === 'available' && 
        (dp.zone.toLowerCase().includes(city) ||
         (city.includes('cocody') || city.includes('plateau') || city.includes('adjamé') || city.includes('abobo') ? dp.zone.includes('Nord') :
          city.includes('marcory') || city.includes('koumassi') || city.includes('yopougon') || city.includes('port-bouët') ? dp.zone.includes('Sud') :
          city.includes('bingerville') || city.includes('bassam') || city.includes('songon') ? dp.zone.includes('Grand Abidjan') :
          dp.zone.includes('Intérieur')
         ))
      ) || deliveryPersons.find(dp => dp.status === 'available') || null;
    }

    const newOrder: Order = {
      ...enrichedOrderData,
      id: tempId,
      orderNumber,
      deliveryStatus: autoAssignedCourier ? 'assigned' : (enrichedOrderData.deliveryStatus || 'pending'),
      deliveryPersonId: autoAssignedCourier?.id || enrichedOrderData.deliveryPersonId || null,
      deliveryPersonName: autoAssignedCourier?.name || enrichedOrderData.deliveryPersonName || null,
      deliveryPersonPhone: autoAssignedCourier?.phone || enrichedOrderData.deliveryPersonPhone || null,
      deliveryAssignedAt: autoAssignedCourier ? new Date().toISOString() : null,
      createdAt: new Date().toISOString()
    };

    if (autoAssignedCourier) {
      setDeliveryPersons(prev => prev.map(dp => {
        if (dp.id === autoAssignedCourier!.id) {
          return {
            ...dp,
            currentDeliveriesCount: (dp.currentDeliveriesCount || 0) + 1,
            status: 'busy'
          };
        }
        return dp;
      }));
    }

    setOrders((prev) => [newOrder, ...prev]);
    setLastCreatedOrder(newOrder);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
      if (res.ok) {
        const savedOrder = await res.json();
        setOrders((prev) => prev.map(o => o.id === tempId ? savedOrder : o));
        setLastCreatedOrder(savedOrder);
        setProducts((prev) => prev.map((product) => {
          const sold = savedOrder.items
            .filter((item: Order['items'][number]) => item.productId === product.id)
            .reduce((sum: number, item: Order['items'][number]) => sum + item.quantity, 0);
          if (!sold) return product;
          const stockCount = Math.max(0, product.stockCount - sold);
          return { ...product, stockCount, inStock: stockCount > 0 };
        }));
        clearCart();
        trackAnalyticsEvent({
          eventType: 'purchase',
          path: '/checkout',
          label: 'Commande confirmée',
          metadata: { orderId: savedOrder.id, itemCount: savedOrder.items.length, totalAmount: savedOrder.totalAmount },
        });
        return savedOrder;
      }
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorBody?.error || 'La commande n’a pas pu être enregistrée.');
    } catch (e) {
      console.warn('Failed to save order via API:', e);
      setOrders((prev) => prev.filter((order) => order.id !== tempId));
      setLastCreatedOrder(null);
      throw e;
    } finally {
      setIsSyncing(false);
    }
  };


  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsSyncing(true);
    setOrders((prev) => 
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status, updatedAt: new Date().toISOString() } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
    } catch (e) {
      console.warn('Failed to update order status on API:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    setIsSyncing(true);
    setOrders((prev) => 
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status, updatedAt: new Date().toISOString() } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });
    } catch (e) {
      console.warn('Failed to update payment status on API:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setIsSyncing(true);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete order on API:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const resetToDemoData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await refreshBackendData();
      }
    } catch (e) {
      console.warn('Reset to demo data error:', e);
      setProducts(initialProducts);
      setCategories(initialCategories);
      setOrders([]);
      setSettings(initialStoreSettings);
    } finally {
      setIsSyncing(false);
    }
  };

  // Autonomous Delivery Methods (Côte d'Ivoire)
  const assignOrderDelivery = async (orderId: string, deliveryPersonId: string, notes?: string) => {
    const courier = deliveryPersons.find(dp => dp.id === deliveryPersonId);
    if (!courier) return;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: o.orderStatus === 'pending' ? 'processing' : o.orderStatus,
          deliveryStatus: 'assigned',
          deliveryPersonId: courier.id,
          deliveryPersonName: courier.name,
          deliveryPersonPhone: courier.phone,
          deliveryZone: courier.zone,
          deliveryAssignedAt: new Date().toISOString(),
          deliveryNotes: notes !== undefined ? notes : o.deliveryNotes
        };
      }
      return o;
    }));

    setDeliveryPersons(prev => prev.map(dp => {
      if (dp.id === deliveryPersonId) {
        return {
          ...dp,
          currentDeliveriesCount: (dp.currentDeliveriesCount || 0) + 1,
          status: 'busy'
        };
      }
      return dp;
    }));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryStatus: 'assigned',
          deliveryPersonId: courier.id,
          deliveryPersonName: courier.name,
          deliveryPersonPhone: courier.phone,
          deliveryZone: courier.zone,
          deliveryAssignedAt: new Date().toISOString(),
        })
      });
    } catch (e) {
      console.warn('API delivery assign err', e);
    }
  };

  const updateOrderDeliveryStatus = async (orderId: string, deliveryStatus: DeliveryStatus, cashCollected?: number) => {
    const isDelivered = deliveryStatus === 'delivered';
    const targetOrder = orders.find(o => o.id === orderId);

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          deliveryStatus,
          orderStatus: isDelivered ? 'delivered' : o.orderStatus,
          paymentStatus: isDelivered && o.paymentMethod === 'cod' ? 'paid' : o.paymentStatus,
          deliveredAt: isDelivered ? new Date().toISOString() : o.deliveredAt,
          deliveryCashCollected: cashCollected !== undefined ? cashCollected : (isDelivered && o.paymentMethod === 'cod' ? o.totalAmount : o.deliveryCashCollected)
        };
      }
      return o;
    }));

    if (targetOrder?.deliveryPersonId) {
      setDeliveryPersons(prev => prev.map(dp => {
        if (dp.id === targetOrder.deliveryPersonId) {
          const collected = (isDelivered && targetOrder.paymentMethod === 'cod') ? (cashCollected ?? targetOrder.totalAmount) : 0;
          const nextCount = isDelivered || deliveryStatus === 'failed' || deliveryStatus === 'returned'
            ? Math.max(0, (dp.currentDeliveriesCount || 1) - 1)
            : dp.currentDeliveriesCount;
          return {
            ...dp,
            currentDeliveriesCount: nextCount,
            totalCompletedDeliveries: isDelivered ? (dp.totalCompletedDeliveries || 0) + 1 : dp.totalCompletedDeliveries,
            collectedCashToday: (dp.collectedCashToday || 0) + collected,
            status: nextCount === 0 ? 'available' : dp.status
          };
        }
        return dp;
      }));
    }

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryStatus,
          orderStatus: isDelivered ? 'delivered' : undefined,
          paymentStatus: isDelivered && targetOrder?.paymentMethod === 'cod' ? 'paid' : undefined,
          deliveredAt: isDelivered ? new Date().toISOString() : undefined,
          deliveryCashCollected: cashCollected
        })
      });
    } catch (e) {
      console.warn('API delivery status update err', e);
    }
  };

  const autoAssignOrderDelivery = async (orderId: string): Promise<{ success: boolean; deliveryPerson?: DeliveryPerson }> => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return { success: false };

    const city = (targetOrder.customerCity || '').toLowerCase();
    const courier = deliveryPersons.find(dp => 
      dp.status === 'available' && 
      (dp.zone.toLowerCase().includes(city) ||
       (city.includes('cocody') || city.includes('plateau') || city.includes('adjamé') || city.includes('abobo') ? dp.zone.includes('Nord') :
        city.includes('marcory') || city.includes('koumassi') || city.includes('yopougon') || city.includes('port-bouët') ? dp.zone.includes('Sud') :
        city.includes('bingerville') || city.includes('bassam') || city.includes('songon') ? dp.zone.includes('Grand Abidjan') :
        dp.zone.includes('Intérieur')
       ))
    ) || deliveryPersons.find(dp => dp.status === 'available') || deliveryPersons[0];

    if (!courier) return { success: false };

    await assignOrderDelivery(orderId, courier.id);
    return { success: true, deliveryPerson: courier };
  };

  const reconcileCourierCash = async (courierId: string) => {
    setDeliveryPersons(prev => prev.map(dp => {
      if (dp.id === courierId) {
        return {
          ...dp,
          collectedCashToday: 0
        };
      }
      return dp;
    }));
  };

  const addDeliveryPerson = (person: Omit<DeliveryPerson, 'id' | 'createdAt'>) => {
    const newPerson: DeliveryPerson = {
      ...person,
      id: `courier-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setDeliveryPersons(prev => [newPerson, ...prev]);
  };

  const updateDeliveryPerson = (id: string, updated: Partial<DeliveryPerson>) => {
    setDeliveryPersons(prev => prev.map(dp => dp.id === id ? { ...dp, ...updated } : dp));
  };

  const deleteDeliveryPerson = (id: string) => {
    setDeliveryPersons(prev => prev.filter(dp => dp.id !== id));
  };

  // Live Chat Operations
  const fetchVisitorChatMessages = useCallback(async () => {
    if (!visitorId) return;
    try {
      const res = await fetch(`/api/chat/messages?visitorId=${encodeURIComponent(visitorId)}`);
      if (res.ok) {
        const data = await res.json();
        setVisitorChatMessages(data.messages || []);
        if (data.conversation) {
          setUnreadVisitorChatCount(data.conversation.unreadByVisitor || 0);
        }
      }
    } catch {
      // ignore network errors
    }
  }, [visitorId]);

  const fetchAdminChatConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        const convs: ChatConversation[] = data.conversations || [];
        setChatConversations(convs);
        const totalUnread = convs.reduce((acc, c) => acc + (c.unreadByAdmin || 0), 0);
        setUnreadAdminChatCount(totalUnread);
      }
    } catch {
      // ignore network errors
    }
  }, []);

  const sendVisitorChatMessage = async (text: string, visitorName?: string, visitorPhone?: string): Promise<boolean> => {
    if (!visitorId || !text.trim()) return false;
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          text: text.trim(),
          sender: 'visitor',
          visitorName,
          visitorPhone
        })
      });
      if (res.ok) {
        await fetchVisitorChatMessages();
        return true;
      }
      console.error('Error sending message:', await res.text());
      return false;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  };

  const sendAdminChatMessage = async (conversationId: string, text: string) => {
    if (!conversationId || !text.trim()) return;
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          text: text.trim(),
          sender: 'admin',
          senderName: 'Support Boutique'
        })
      });
      if (res.ok) {
        await fetchAdminChatConversations();
      }
    } catch (err) {
      console.error('Error sending admin reply:', err);
    }
  };

  const markChatAsRead = async (conversationId: string, reader: 'admin' | 'visitor') => {
    try {
      await fetch('/api/chat/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, reader, visitorId: reader === 'visitor' ? visitorId : undefined })
      });
      if (reader === 'admin') {
        await fetchAdminChatConversations();
      } else {
        await fetchVisitorChatMessages();
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteChatConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations?id=${conversationId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchAdminChatConversations();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Chat Polling
  useEffect(() => {
    if (visitorId) {
      fetchVisitorChatMessages();
      if (isAdminAuthenticated) {
        fetchAdminChatConversations();
      }
      const interval = setInterval(() => {
        fetchVisitorChatMessages();
        if (isAdminAuthenticated) {
          fetchAdminChatConversations();
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [visitorId, isAdminAuthenticated, fetchVisitorChatMessages, fetchAdminChatConversations]);

  // Unlock Web Audio API on user interaction in browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unlockAudio = () => {
      webCallAudio.unlock();
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // In-Browser VoIP Web Call System & Sonneries
  const [activeCall, setActiveCall] = useState<WebCallState | null>(null);
  const visitorCandidateIndexRef = useRef<number>(0);
  const adminCandidateIndexRef = useRef<number>(0);

  // Call duration counter
  useEffect(() => {
    if (!activeCall || activeCall.status !== 'connected') return;
    const interval = setInterval(() => {
      setActiveCall(prev => (prev && prev.status === 'connected' ? { ...prev, duration: prev.duration + 1 } : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  // Polling for incoming calls in admin and managing live WebRTC media when connected
  useEffect(() => {
    if (!isAdminAuthenticated) return;

    let isMounted = true;
    const checkIncomingCalls = async () => {
      try {
        const res = await fetch('/api/calls?role=admin');
        if (!res.ok) return;
        const data = await res.json();
        const serverCall = data.activeCall;

        if (!isMounted) return;

        if (serverCall && serverCall.status === 'ringing') {
          setActiveCall(prev => {
            if (prev && prev.id === serverCall.id) {
              if (!prev.offer && serverCall.offer) {
                return { ...prev, offer: serverCall.offer };
              }
              return prev;
            }
            webCallAudio.playIncomingRingtone();
            showBrowserCallNotification(
              '📞 Appel Web Entrant',
              `${serverCall.visitorName || 'Un client'} vous appelle en direct depuis la boutique !`
            );

            return {
              id: serverCall.id,
              status: 'ringing',
              target: 'human_agent',
              contactName: serverCall.visitorName || 'Client Boutique',
              contactSubtitle: serverCall.visitorPhone ? `📞 Tél: ${serverCall.visitorPhone}` : 'Appel en direct depuis la boutique',
              contactAvatar: '🎧',
              isIncoming: true,
              duration: 0,
              isMuted: false,
              isSpeakerOn: true,
              startedAt: new Date(serverCall.startedAt).toISOString(),
              offer: serverCall.offer || null,
              connectionQuality: 'connecting'
            };
          });
        } else if (serverCall && serverCall.status === 'connected') {
          // If admin is connected, drain visitor ICE candidates
          if (Array.isArray(serverCall.candidateFromVisitor)) {
            for (let i = adminCandidateIndexRef.current; i < serverCall.candidateFromVisitor.length; i++) {
              webRtcVoice.addRemoteCandidate(serverCall.candidateFromVisitor[i]);
            }
            adminCandidateIndexRef.current = serverCall.candidateFromVisitor.length;
          }
        } else if (!serverCall || serverCall.status === 'ended' || serverCall.status === 'rejected') {
          setActiveCall(prev => {
            if (prev && prev.isIncoming) {
              webRtcVoice.cleanup();
              webCallAudio.stopAll();
              webCallAudio.playCallEnded();
              return null;
            }
            return prev;
          });
        }
      } catch {
        // network poll error
      }
    };

    checkIncomingCalls();
    const interval = setInterval(checkIncomingCalls, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdminAuthenticated]);

  // Polling for visitor during outgoing call and connected audio session
  useEffect(() => {
    if (!activeCall || activeCall.isIncoming || activeCall.target === 'ai_advisor') {
      return;
    }

    let isMounted = true;
    const checkOutgoingCallStatus = async () => {
      try {
        const callQuery = activeCall.id ? `callId=${encodeURIComponent(activeCall.id)}` : `visitorId=${encodeURIComponent(visitorId)}`;
        const res = await fetch(`/api/calls?${callQuery}`);
        if (!res.ok) return;
        const data = await res.json();
        const serverCall = data.activeCall;

        if (!isMounted) return;

        if (serverCall) {
          if (serverCall.status === 'connected') {
            if (activeCall.status === 'calling') {
              webCallAudio.stopAll();
              webCallAudio.playCallConnected();
              setActiveCall(prev => prev ? { ...prev, status: 'connected', id: serverCall.id } : null);
            }

            // Apply WebRTC answer if not yet set
            if (serverCall.answer) {
              await webRtcVoice.handleAnswerFromCallee(serverCall.answer);
            }

            // Drain ICE candidates from admin
            if (Array.isArray(serverCall.candidateFromAdmin)) {
              for (let i = visitorCandidateIndexRef.current; i < serverCall.candidateFromAdmin.length; i++) {
                await webRtcVoice.addRemoteCandidate(serverCall.candidateFromAdmin[i]);
              }
              visitorCandidateIndexRef.current = serverCall.candidateFromAdmin.length;
            }
          } else if (serverCall.status === 'rejected') {
            webRtcVoice.cleanup();
            webCallAudio.stopAll();
            webCallAudio.playCallEnded();
            setActiveCall(prev => prev ? { ...prev, status: 'ended', contactSubtitle: 'Le conseiller est actuellement indisponible' } : null);
            setTimeout(() => {
              setActiveCall(null);
            }, 2500);
          } else if (serverCall.status === 'ended') {
            webRtcVoice.cleanup();
            webCallAudio.stopAll();
            webCallAudio.playCallEnded();
            setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
            setTimeout(() => {
              setActiveCall(null);
            }, 1500);
          }
        }
      } catch {
        // network poll error
      }
    };

    const pollInterval = setInterval(checkOutgoingCallStatus, 1000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [activeCall?.status, activeCall?.isIncoming, activeCall?.target, activeCall?.id, visitorId]);

  // Speech synthesis for AI voice
  const speakAiText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_~`#\[\]]/g, ' ').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang.startsWith('fr') || v.lang.includes('FR'));
      if (frVoice) utterance.voice = frVoice;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  const startWebCall = async (
    target: WebCallTarget = 'ai_advisor',
    contactName?: string,
    contactSubtitle?: string
  ) => {
    // Unlock browser audio output synchronously during this click event
    webRtcVoice.prepareAudioOutput();
    webCallAudio.stopAll();

    const defaultName = target === 'ai_advisor'
      ? (settings.aiAgentName || 'Amara (Conseillère shopping)')
      : 'Service Client & Support Direct';
    const defaultSubtitle = target === 'ai_advisor'
      ? 'Conseillère vocale 24/7'
      : 'Équipe commerciale & Support en direct';

    const tempCallId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newCall: WebCallState = {
      id: tempCallId,
      status: 'calling',
      target,
      contactName: contactName || defaultName,
      contactSubtitle: contactSubtitle || defaultSubtitle,
      contactAvatar: target === 'ai_advisor' ? '✨' : '🎧',
      isIncoming: false,
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      startedAt: new Date().toISOString(),
      connectionQuality: 'connecting'
    };

    setActiveCall(newCall);
    webCallAudio.playOutgoingDialtone();

    // If calling AI advisor, automatically pick up after realistic ringing interval (2.4s)
    if (target === 'ai_advisor') {
      setTimeout(() => {
        setActiveCall(prev => {
          if (prev && prev.status === 'calling') {
            webCallAudio.playCallConnected();
            setTimeout(() => {
              speakAiText(`Bonjour ! Je suis ${defaultName}. Bienvenue sur ${settings.storeName}. Comment puis-je vous guider ou vous conseiller aujourd'hui ?`);
            }, 500);
            return { ...prev, status: 'connected', connectionQuality: 'connected' };
          }
          return prev;
        });
      }, 2400);
    } else {
      // Real WebRTC Voice Call to Human Agent
      visitorCandidateIndexRef.current = 0;

      webRtcVoice.setOnConnectionStateChange((state) => {
        const quality = state.connectionState === 'connected' ? 'connected' 
          : state.connectionState === 'failed' ? 'failed' 
          : 'connecting';
        setActiveCall(prev => prev ? { ...prev, connectionQuality: quality } : null);
      });

      // 1. First register the call on server so incoming candidates are never 404'd
      try {
        await fetch('/api/calls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            callId: tempCallId,
            visitorId,
            visitorName: contactName || 'Client Boutique',
            visitorPhone: contactSubtitle?.includes('Tél:') ? contactSubtitle.replace('Tél:', '').trim() : undefined,
            target: 'human_agent'
          })
        });
      } catch (err) {
        console.error('Error starting server call initial registration:', err);
      }

      // 2. Start WebRTC caller, acquire local mic, create offer, and stream ICE candidates
      let localOffer: RTCSessionDescriptionInit | null = null;
      let localMicError: string | null = null;

      try {
        const rtcInit = await webRtcVoice.startCallAsCaller(tempCallId, (candidate) => {
          const candJson = typeof candidate.toJSON === 'function'
            ? candidate.toJSON()
            : { candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex };

          fetch('/api/calls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'signal',
              callId: tempCallId,
              role: 'visitor',
              signal: { candidate: candJson }
            })
          }).catch(() => {});
        });

        localOffer = rtcInit.offer;
        localMicError = rtcInit.micError;
      } catch (err: any) {
        console.warn('Microphone / WebRTC init error:', err);
        localMicError = "Microphone non accessible. Veuillez autoriser le micro dans votre navigateur pour parler.";
      }

      if (localMicError) {
        setActiveCall(prev => prev ? { ...prev, micError: localMicError } : null);
      }

      // 3. Send offer to server
      if (localOffer) {
        try {
          await fetch('/api/calls', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'signal',
              callId: tempCallId,
              role: 'visitor',
              signal: localOffer
            })
          });
          setActiveCall(prev => prev ? { ...prev, offer: localOffer } : null);
        } catch (err) {
          console.error('Error signaling caller offer:', err);
        }
      }
    }
  };

  const acceptIncomingCall = async () => {
    if (!activeCall) return;
    const callId = activeCall.id;

    // 1. Synchronously prepare and unlock audio output on this user click
    webRtcVoice.prepareAudioOutput();
    webCallAudio.stopAll();
    webCallAudio.playCallConnected();
    setActiveCall(prev => prev ? { ...prev, status: 'connected', connectionQuality: 'connecting' } : null);
    adminCandidateIndexRef.current = 0;

    webRtcVoice.setOnConnectionStateChange((state) => {
      const quality = state.connectionState === 'connected' ? 'connected' 
        : state.connectionState === 'failed' ? 'failed' 
        : 'connecting';
      setActiveCall(prev => prev ? { ...prev, connectionQuality: quality } : null);
    });

    try {
      // 2. Fetch the latest call record to get the offer AND all accumulated visitor candidates
      let offer = activeCall.offer;
      let visitorCandidates: any[] = [];

      try {
        const res = await fetch(`/api/calls?callId=${encodeURIComponent(callId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.activeCall) {
            offer = data.activeCall.offer || offer;
            visitorCandidates = data.activeCall.candidateFromVisitor || [];
          }
        }
      } catch (e) {
        console.warn('Could not fetch latest call record before accepting:', e);
      }

      adminCandidateIndexRef.current = visitorCandidates.length;

      let localAnswer: RTCSessionDescriptionInit | null = null;
      let localMicError: string | null = null;

      if (offer) {
        try {
          const rtcInit = await webRtcVoice.acceptCallAsCallee(callId, offer, visitorCandidates, (candidate) => {
            const candJson = typeof candidate.toJSON === 'function'
              ? candidate.toJSON()
              : { candidate: candidate.candidate, sdpMid: candidate.sdpMid, sdpMLineIndex: candidate.sdpMLineIndex };

            fetch('/api/calls', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'signal',
                callId,
                role: 'admin',
                signal: { candidate: candJson }
              })
            }).catch(() => {});
          });

          localAnswer = rtcInit.answer;
          localMicError = rtcInit.micError;
        } catch (err) {
          console.warn('Admin WebRTC callee init error:', err);
          localMicError = "Microphone non accessible. Veuillez autoriser le micro dans votre navigateur pour parler.";
        }
      }

      if (localMicError) {
        setActiveCall(prev => prev ? { ...prev, micError: localMicError } : null);
      }

      // 3. Send answer to server to notify visitor
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          callId,
          role: 'admin',
          answer: localAnswer
        })
      });
    } catch (err) {
      console.error('Error accepting call:', err);
    }
  };

  const rejectIncomingCall = async () => {
    if (!activeCall) return;
    const callId = activeCall.id;
    webRtcVoice.cleanup();
    webCallAudio.stopAll();
    webCallAudio.playCallEnded();
    setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);

    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', callId, role: 'admin' })
      });
    } catch (err) {
      console.error('Error rejecting call:', err);
    }

    setTimeout(() => {
      setActiveCall(null);
    }, 1200);
  };

  const endWebCall = async () => {
    if (!activeCall) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    webRtcVoice.cleanup();
    webCallAudio.stopAll();
    webCallAudio.playCallEnded();
    const callId = activeCall.id;
    const durationSec = activeCall.duration;
    const name = activeCall.contactName;

    setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);

    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          callId,
          visitorId,
          role: isAdminAuthenticated ? 'admin' : 'visitor'
        })
      });
    } catch (err) {
      console.error('Error ending call:', err);
    }

    if (durationSec > 0 && !isAdminAuthenticated) {
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      sendVisitorChatMessage(`📞 Appel Web VoIP terminé (${timeStr}) avec ${name}`);
    }

    setTimeout(() => {
      setActiveCall(null);
    }, 1400);
  };

  const toggleCallMute = () => {
    setActiveCall(prev => {
      if (!prev) return null;
      const newMuted = !prev.isMuted;
      webRtcVoice.setMute(newMuted);
      return { ...prev, isMuted: newMuted };
    });
  };

  const toggleCallSpeaker = () => {
    setActiveCall(prev => {
      if (!prev) return null;
      const newSpeaker = !prev.isSpeakerOn;
      webRtcVoice.setSpeaker(newSpeaker);
      return { ...prev, isSpeakerOn: newSpeaker };
    });
  };

  const simulateIncomingCall = (contactName?: string, contactSubtitle?: string) => {
    webCallAudio.stopAll();
    const name = contactName || 'Service Commercial & SAV';
    const sub = contactSubtitle || 'Appel VoIP entrant en direct';

    setActiveCall({
      id: `call-in-${Date.now()}`,
      status: 'ringing',
      target: 'customer_support',
      contactName: name,
      contactSubtitle: sub,
      contactAvatar: '📞',
      isIncoming: true,
      duration: 0,
      isMuted: false,
      isSpeakerOn: true,
      startedAt: new Date().toISOString()
    });

    webCallAudio.playIncomingRingtone();
    showBrowserCallNotification(`📞 Appel Web Entrant`, `${name} vous appelle.`);
  };

  const sendCallAudioVoiceNote = async (spokenText: string) => {
    if (!spokenText.trim() || !activeCall) return;
    await sendVisitorChatMessage(spokenText);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, text: spokenText.trim() })
      });
      const data = await res.json();
      if (data.success && data.message?.text) {
        speakAiText(data.message.text);
        await fetchVisitorChatMessages();
      }
    } catch (err) {
      console.error('Error in call voice note:', err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedSubcategoryFilter,
        setSelectedSubcategoryFilter,
        searchQuery,
        setSearchQuery,
        activeReferral,
        setActiveReferral,
        clearActiveReferral,
        products,
        categories,
        orders,
        settings,
        isSettingsLoaded,
        cart,
        cartCount,
        cartSubtotal,
        cartShippingFee,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartToasts,
        showCartToast,
        dismissCartToast,
        clearCartToasts,
        wishlist,
        toggleWishlist,
        isInWishlist,
        lastCreatedOrder,
        setLastCreatedOrder,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        isCheckoutOpen,
        setIsCheckoutOpen,
        quickViewProduct,
        setQuickViewProduct,
        isFeedOpen,
        setIsFeedOpen,
        openFeed,
        feedActiveProductId,
        setFeedActiveProductId,
        customer,
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        customerAuthInitialMode,
        openCustomerAuth,
        customerLogin,
        customerRegister,
        customerLogout,
        refreshCustomerSession,
        updateCustomerProfile,
        currentUser,
        isAdminAuthenticated,
        adminEmail,
        loginWithGoogle,
        loginAdmin,
        loginAsDemoAdmin,
        logoutAdmin,
        teamMembers,
        effectiveRole,
        fetchTeamMembers,
        createTeamMember,
        updateTeamMemberRole,
        deleteTeamMember,
        generateWhatsAppProductLink,
        generateWhatsAppOrderLink,
        generateWhatsAppGeneralLink,
        formatPrice,
        updateSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        deleteOrder,
        resetToDemoData,
        isSyncing,
        visitorId,
        isChatDrawerOpen,
        setIsChatDrawerOpen,
        visitorChatMessages,
        chatConversations,
        unreadAdminChatCount,
        unreadVisitorChatCount,
        sendVisitorChatMessage,
        sendAdminChatMessage,
        fetchVisitorChatMessages,
        fetchAdminChatConversations,
        markChatAsRead,
        deleteChatConversation,
        // In-Browser VoIP Web Call System & Sonneries
        activeCall,
        startWebCall,
        acceptIncomingCall,
        rejectIncomingCall,
        endWebCall,
        toggleCallMute,
        toggleCallSpeaker,
        simulateIncomingCall,
        sendCallAudioVoiceNote,
        // Autonomous Delivery Fleet (Côte d'Ivoire)
        deliveryPersons,
        assignOrderDelivery,
        updateOrderDeliveryStatus,
        autoAssignOrderDelivery,
        reconcileCourierCash,
        addDeliveryPerson,
        updateDeliveryPerson,
        deleteDeliveryPerson,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
