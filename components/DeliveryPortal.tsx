'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { DeliveryPerson, DeliveryStatus, Order } from '@/lib/types';
import { 
  Bike, 
  Car, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Banknote, 
  UserCheck, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  Package, 
  ArrowLeft,
  DollarSign,
  Search,
  SlidersHorizontal,
  Send,
  Calendar
} from 'lucide-react';

export const DeliveryPortal: React.FC = () => {
  const { 
    orders, 
    deliveryPersons, 
    updateOrderDeliveryStatus, 
    assignOrderDelivery, 
    reconcileCourierCash,
    updateDeliveryPerson,
    settings,
    formatPrice,
    setCurrentView 
  } = useStore();

  // Active courier state (default to courier-1: Koffi Kouamé)
  const [selectedCourierId, setSelectedCourierId] = useState<string>(
    deliveryPersons[0]?.id || 'courier-1'
  );

  const [activeTab, setActiveTab] = useState<'my_runs' | 'available' | 'history' | 'cash'>('my_runs');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Cash collection modal
  const [cashModalOrder, setCashModalOrder] = useState<Order | null>(null);
  const [cashCollectedInput, setCashCollectedInput] = useState<number>(0);

  const activeCourier = useMemo(() => {
    return deliveryPersons.find(dp => dp.id === selectedCourierId) || deliveryPersons[0];
  }, [deliveryPersons, selectedCourierId]);

  // Filter orders
  const myActiveOrders = useMemo(() => {
    return orders.filter(o => 
      o.deliveryPersonId === activeCourier?.id && 
      o.deliveryStatus !== 'delivered' &&
      o.orderStatus !== 'cancelled'
    );
  }, [orders, activeCourier]);

  const availableOrders = useMemo(() => {
    return orders.filter(o => 
      !o.deliveryPersonId && 
      o.orderStatus !== 'delivered' && 
      o.orderStatus !== 'cancelled'
    );
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter(o => 
      o.deliveryPersonId === activeCourier?.id && 
      (o.deliveryStatus === 'delivered' || o.orderStatus === 'delivered')
    );
  }, [orders, activeCourier]);

  // Flash toast helper
  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Status toggle for active courier
  const handleToggleStatus = (nextStatus: 'available' | 'busy' | 'offline') => {
    if (activeCourier) {
      updateDeliveryPerson(activeCourier.id, { status: nextStatus });
      showToast(`Statut mis à jour : ${nextStatus === 'available' ? 'Disponible 🟢' : nextStatus === 'busy' ? 'En course 🟡' : 'Déconnecté 🔴'}`);
    }
  };

  // Status progression
  const handleStartRun = async (orderId: string) => {
    await updateOrderDeliveryStatus(orderId, 'in_transit');
    showToast('Course passée en statut "En cours d\'acheminement 🛵" !');
  };

  const handleOpenCashModal = (order: Order) => {
    setCashModalOrder(order);
    setCashCollectedInput(order.totalAmount);
  };

  const handleConfirmDelivered = async () => {
    if (!cashModalOrder) return;
    await updateOrderDeliveryStatus(cashModalOrder.id, 'delivered', cashCollectedInput);
    setCashModalOrder(null);
    showToast(`✅ Commande #${cashModalOrder.orderNumber} marquée comme livrée !`);
  };

  const handleClaimOrder = async (orderId: string) => {
    if (!activeCourier) return;
    await assignOrderDelivery(orderId, activeCourier.id);
    showToast('Course prise en charge avec succès !');
  };

  const handleReconcile = async () => {
    if (!activeCourier) return;
    const amount = activeCourier.collectedCashToday;
    await reconcileCourierCash(activeCourier.id);
    showToast(`Caisse réconciliée avec succès (${formatPrice(amount)} remis au gérant) !`);
  };

  // Google Maps helper
  const getMapsUrl = (address: string, city: string) => {
    const fullQuery = `${address}, ${city}, Côte d'Ivoire`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
  };

  // WhatsApp quick contact
  const getWhatsAppClientUrl = (order: Order) => {
    let cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('225') && cleanPhone.length === 10) {
      cleanPhone = `225${cleanPhone}`;
    }
    const msg = `Bonjour ${order.customerName} ! C'est ${activeCourier?.name || 'votre coursier'}, je suis en route pour vous livrer votre commande ${order.orderNumber} (${formatPrice(order.totalAmount)}) à ${order.customerCity}. Êtes-vous bien disponible pour me recevoir ?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Manager WhatsApp report
  const getManagerReconciliationUrl = () => {
    let managerPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    if (!managerPhone.startsWith('225') && managerPhone.length === 10) {
      managerPhone = `225${managerPhone}`;
    }
    const msg = `🛵 *RAPPORT DE CAISSE LIVREUR - ${new Date().toLocaleDateString('fr-FR')}*\n👤 *Livreur :* ${activeCourier?.name}\n📞 *Téléphone :* ${activeCourier?.phone}\n📍 *Secteur :* ${activeCourier?.zone}\n\n📦 *Courses achevées :* ${deliveredOrders.length}\n💰 *Total Espèces à reverser :* ${formatPrice(activeCourier?.collectedCashToday || 0)}\n\nMerci de valider la réception du versement !`;
    return `https://wa.me/${managerPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentView('home')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Retour à la boutique"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 font-black text-sm text-white tracking-tight">
                <Bike className="w-4 h-4 text-amber-400" />
                <span>PORTAIL LIVREUR 🇨🇮</span>
              </div>
              <p className="text-[11px] text-slate-400">Système Autonome de Dispatch Abidjan</p>
            </div>
          </div>

          {/* Courier profile switcher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCourierId}
              onChange={(e) => setSelectedCourierId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden cursor-pointer"
            >
              {deliveryPersons.map((dp) => (
                <option key={dp.id} value={dp.id}>
                  {dp.name} ({dp.zone.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Floating alert toast */}
      {actionSuccessMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-slate-950 px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">

        {/* Courier Status Card */}
        {activeCourier && (
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
                  {activeCourier.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{activeCourier.name}</h2>
                    <span className="text-[10px] bg-slate-700 text-slate-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      {activeCourier.vehicleType === 'moto' ? <Bike className="w-3 h-3 text-amber-400" /> : <Car className="w-3 h-3 text-sky-400" />}
                      {activeCourier.vehicleType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{activeCourier.zone}</span>
                    <span className="text-slate-600">•</span>
                    <span>{activeCourier.phone}</span>
                  </p>
                </div>
              </div>

              {/* Status Switcher Buttons */}
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => handleToggleStatus('available')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeCourier.status === 'available'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En Service</span>
                </button>
                <button
                  onClick={() => handleToggleStatus('busy')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeCourier.status === 'busy'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>En Course</span>
                </button>
                <button
                  onClick={() => handleToggleStatus('offline')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    activeCourier.status === 'offline'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Pause</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/60">
              <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Courses En Cours</span>
                <span className="text-lg font-black text-amber-400">{myActiveOrders.length}</span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Livrées (Total)</span>
                <span className="text-lg font-black text-emerald-400">{activeCourier.totalCompletedDeliveries}</span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Caisse Espèces</span>
                <span className="text-sm sm:text-base font-black text-sky-400">{formatPrice(activeCourier.collectedCashToday)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/60 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('my_runs')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'my_runs'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Mes Courses ({myActiveOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'available'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Disponibles ({availableOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Historique ({deliveredOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cash')}
            className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cash'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Caisse</span>
          </button>
        </div>

        {/* Tab 1: Mes Courses Actives */}
        {activeTab === 'my_runs' && (
          <div className="space-y-3">
            {myActiveOrders.length === 0 ? (
              <div className="bg-slate-800/40 rounded-2xl p-8 text-center border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Aucune livraison en cours</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Consultez l'onglet "Disponibles" pour prendre en charge une commande à Abidjan !
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Voir les commandes disponibles
                </button>
              </div>
            ) : (
              myActiveOrders.map((order) => {
                const isCOD = order.paymentMethod === 'cod';
                const isEnRoute = order.deliveryStatus === 'in_transit';

                return (
                  <div 
                    key={order.id} 
                    className="bg-slate-800 rounded-2xl border border-slate-700/80 p-4 shadow-lg space-y-3 transition hover:border-amber-500/50"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm">{order.orderNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isEnRoute ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}>
                            {isEnRoute ? '🛵 En route' : '📌 Assignée'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{order.customerName}</h3>
                      </div>

                      {/* Payment Mode Badge */}
                      <div className="text-right">
                        <span className="text-sm font-black text-white block">{formatPrice(order.totalAmount)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                          isCOD ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isCOD ? 'À encaisser (Cash)' : 'Déjà Payé en Ligne'}
                        </span>
                      </div>
                    </div>

                    {/* Address & Commune */}
                    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/40 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{order.customerCity}</span>
                      </div>
                      <p className="text-xs text-slate-300 pl-5">
                        {order.customerAddress}
                      </p>
                      {order.customerNotes && (
                        <p className="text-[11px] text-slate-400 italic pl-5 border-t border-slate-800 pt-1.5 mt-1.5">
                          💬 Note client : "{order.customerNotes}"
                        </p>
                      )}
                    </div>

                    {/* Items preview */}
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.items.map(i => `${i.quantity}x ${i.productTitle}`).join(', ')}</span>
                    </div>

                    {/* Action Bar (Calls, Maps, Progression) */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60">
                      {/* Direct Phone Call */}
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Appeler</span>
                      </a>

                      {/* WhatsApp Client */}
                      <a
                        href={getWhatsAppClientUrl(order)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Google Maps GPS Route */}
                      <a
                        href={getMapsUrl(order.customerAddress, order.customerCity)}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS Maps</span>
                      </a>
                    </div>

                    {/* Delivery Status Buttons */}
                    <div className="pt-1">
                      {!isEnRoute ? (
                        <button
                          onClick={() => handleStartRun(order.id)}
                          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                        >
                          <Bike className="w-4 h-4" />
                          <span>Démarrer la course / En route</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenCashModal(order)}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isCOD ? 'Valider Livraison & Encaisser le Cash' : 'Valider la Livraison Remise'}</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Commandes Disponibles à Prendre */}
        {activeTab === 'available' && (
          <div className="space-y-3">
            {availableOrders.length === 0 ? (
              <div className="bg-slate-800/40 rounded-2xl p-8 text-center border border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Toutes les commandes sont assignées !</h3>
                <p className="text-xs text-slate-400">
                  Dès qu'un client passe commande sur le site à Abidjan, elle apparaîtra ici en direct.
                </p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-amber-400 text-xs">{order.orderNumber}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{order.customerName}</h4>
                      <p className="text-xs text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{order.customerCity}</span>
                        <span className="text-slate-400 font-normal">({order.customerAddress})</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-white">{formatPrice(order.totalAmount)}</span>
                      <span className="text-[10px] text-slate-400 block">{order.paymentMethod.toUpperCase()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimOrder(order.id)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>Prendre en charge cette course 🛵</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Historique Livré */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {deliveredOrders.length === 0 ? (
              <div className="bg-slate-800/40 rounded-2xl p-8 text-center border border-slate-800">
                <p className="text-xs text-slate-400">Aucune commande livrée enregistrée pour le moment.</p>
              </div>
            ) : (
              deliveredOrders.map((order) => (
                <div key={order.id} className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{order.orderNumber}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                        Livré ✅
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">{order.customerName} - {order.customerCity}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">{formatPrice(order.totalAmount)}</span>
                    <span className="text-[10px] text-slate-400 block">{order.paymentMethod === 'cod' ? 'Cash encaissé' : 'Payé d\'avance'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Caisse & Réconciliation */}
        {activeTab === 'cash' && activeCourier && (
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Caisse Du Jour</h3>
                  <p className="text-xs text-slate-400">Espèces physiques en possession du coursier</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Montant Total à Reverser</span>
                <span className="text-3xl font-black text-amber-400">{formatPrice(activeCourier.collectedCashToday)}</span>
              </div>

              <div className="space-y-2">
                <a
                  href={getManagerReconciliationUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Envoyer le Rapport WhatsApp au Gérant</span>
                </a>

                <button
                  onClick={handleReconcile}
                  disabled={activeCourier.collectedCashToday === 0}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réinitialiser la Caisse (Versement Effectué)</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Cash Collection Modal */}
      {cashModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Banknote className="w-5 h-5" />
              <span>Confirmation de Livraison & Encaissement</span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Commande :</span>
                <strong className="font-mono text-white">{cashModalOrder.orderNumber}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Client :</span>
                <strong className="text-white">{cashModalOrder.customerName}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Mode :</span>
                <strong className="text-amber-300">{cashModalOrder.paymentMethod === 'cod' ? 'Cash à la livraison' : 'Prépayé'}</strong>
              </div>
            </div>

            {cashModalOrder.paymentMethod === 'cod' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Montant Cash Encaissé (FCFA) :</label>
                <input
                  type="number"
                  value={cashCollectedInput}
                  onChange={(e) => setCashCollectedInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-lg focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCashModalOrder(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelivered}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Confirmer ✅
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
