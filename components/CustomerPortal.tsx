'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/storeContext';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Gift, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  ArrowRight, 
  MessageCircle, 
  Sparkles,
  Phone,
  Mail,
  Edit3,
  Save,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomerPortal = () => {
  const { 
    customer, 
    customerLogout, 
    updateCustomerProfile, 
    products, 
    formatPrice, 
    setCurrentView,
    addToCart,
    toggleWishlist,
    isInWishlist,
    settings,
    openCustomerAuth
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'rewards'>('orders');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(customer?.fullName || '');
  const [editEmail, setEditEmail] = useState(customer?.email || '');
  const [editCity, setEditCity] = useState(customer?.city || 'Dakar');
  const [editAddress, setEditAddress] = useState(customer?.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!customer) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mx-auto">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Espace Client Privilège</h2>
          <p className="text-xs text-slate-500">Connectez-vous pour accéder à vos commandes, vos favoris et vos points fidélité.</p>
        </div>
        <button
          onClick={() => openCustomerAuth('login')}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Se Connecter / S'inscrire</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateCustomerProfile({
      fullName: editName,
      email: editEmail,
      city: editCity,
      address: editAddress,
    });
    setIsSaving(false);
    if (res.success) {
      setIsEditingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      confetti({ particleCount: 40, spread: 60 });
    }
  };

  const wishlistProducts = products.filter(p => customer.wishlist?.includes(p.id) || isInWishlist(p.id));
  const customerOrders = customer.orders || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Customer Header Identity Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-lg shrink-0">
              {customer.fullName.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Client Privilège
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  {customer.loyaltyPoints} Points VIP
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white">
                {customer.fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {customer.phone}
                </span>
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {customer.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentView('shop')}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Faire du Shopping</span>
            </button>

            <button
              onClick={customerLogout}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-rose-600/80 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>

        </div>

        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mes Commandes ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>Mes Favoris ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 text-indigo-500" />
          <span>Coordonnées & Adresses</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-300" />
          <span>Points VIP ({customer.loyaltyPoints} pts)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MES COMMANDES (LIVE ORDER TRACKING) */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {customerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Aucune commande pour le moment</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Découvrez nos ventes flash et nouveautés pour passer votre première commande !</p>
              <button
                onClick={() => setCurrentView('shop')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Explorer la Boutique
              </button>
            </div>
          ) : (
            customerOrders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={order.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-4 p-6">
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                          {order.orderNumber}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {order.orderStatus === 'delivered' ? '✓ Livré' : order.orderStatus === 'cancelled' ? 'Annulé' : '⏳ En cours de livraison'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Passée le {orderDate}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total Commande</p>
                        <p className="font-black text-base text-slate-900 dark:text-white">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/${(settings.whatsappNumber || '221770000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour, j'ai une question concernant ma commande ${order.orderNumber} (${order.customerName}).`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition cursor-pointer"
                        title="Assistance WhatsApp pour cette commande"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Delivery Timeline Step */}
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      <div className="space-y-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs">✓</div>
                        <span className="text-slate-800 dark:text-slate-200">Reçue</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs ${
                          order.orderStatus !== 'pending' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'
                        }`}>●</div>
                        <span className="text-slate-800 dark:text-slate-200">Préparation</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>🚚</div>
                        <span className="text-slate-500">Expédition</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs ${
                          order.orderStatus === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>🏠</div>
                        <span className="text-slate-500">Livrée</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-3 pt-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
                        <div className="flex items-center gap-3 min-w-0">
                          {item.productImage && (
                            <img src={item.productImage} alt={item.productTitle} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.productTitle}</p>
                            <p className="text-[10px] text-slate-500">
                              Qté : {item.quantity} {item.selectedColor ? `• Coul: ${item.selectedColor}` : ''} {item.selectedSize ? `• T: ${item.selectedSize}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-xs text-slate-900 dark:text-white shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MES FAVORIS (WISHLIST) */}
      {/* ========================================================================= */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-500 mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">Votre liste de favoris est vide</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Cliquez sur le cœur d'un produit pour le sauvegarder et le retrouver ici à tout moment.</p>
              <button
                onClick={() => setCurrentView('shop')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Découvrir les Articles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((prod) => (
                <div key={prod.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={prod.images[0] || '/favicon.svg'} alt={prod.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="absolute top-2 right-2 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 text-rose-500 shadow-sm cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white truncate">{prod.title}</h4>
                  <p className="font-black text-sm text-indigo-600 dark:text-indigo-400">{formatPrice(prod.price)}</p>
                  <button
                    onClick={() => addToCart(prod, 1, undefined, undefined, true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ajouter au Panier</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COORDONNÉES & ADRESSES */}
      {/* ========================================================================= */}
      {activeTab === 'addresses' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Coordonnées de Livraison par Défaut</h3>
              <p className="text-xs text-slate-500">Ces informations seront pré-remplies automatiquement lors de vos prochaines commandes.</p>
            </div>
            {saveSuccess && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold animate-in fade-in">
                ✓ Enregistré !
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nom complet</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Téléphone WhatsApp (non modifiable)</label>
                <input
                  type="text"
                  disabled
                  value={customer.phone}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email (facultatif)</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ville / Quartier</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="ex: Dakar, Almadies"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Adresse exacte / Repère</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="ex: Rue 12 en face pharmacie"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Sauvegarder mes Coordonnées</span>
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROGRAMME VIP & POINTS DE FIDÉLITÉ */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                Solde Privilège
              </span>
              <h3 className="text-3xl sm:text-4xl font-black">
                {customer.loyaltyPoints} Points
              </h3>
              <p className="text-xs text-amber-100">
                Équivalent à une remise immédiate de <strong>{formatPrice(customer.loyaltyPoints * 50)}</strong> sur vos prochaines commandes.
              </p>
            </div>

            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs space-y-1">
              <p className="font-bold">Comment gagner plus de points ?</p>
              <p className="text-[11px] text-amber-100">
                • 1 Point VIP offert pour chaque tranche de 1 000 FCFA commandé.<br/>
                • Des bonus spéciaux lors des ventes flash !
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-white">Vos Avantages Membre VIP</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Expédition Prioritaire</p>
                  <p className="text-[11px] text-slate-500">Vos commandes sont préparées et confiées aux livreurs en priorité absolue.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Cadeaux & Offres Secrètes</p>
                  <p className="text-[11px] text-slate-500">Accès anticipé aux ventes privées et remises exclusives réservées aux membres.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">Conseiller WhatsApp Dédié</p>
                  <p className="text-[11px] text-slate-500">Support client prioritaire 7j/7 pour toutes vos demandes.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
