'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/storeContext';
import { DeliveryPerson, DeliveryPersonStatus, DeliveryStatus, DeliveryVehicleType, Order } from '@/lib/types';
import { 
  Bike, 
  Car, 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Banknote, 
  UserCheck, 
  UserPlus, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Zap, 
  Sliders, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Send,
  Navigation,
  DollarSign,
  ShieldCheck,
  Check,
  X,
  Plus
} from 'lucide-react';

export const AdminDeliveryManager: React.FC = () => {
  const { 
    orders, 
    deliveryPersons, 
    assignOrderDelivery, 
    updateOrderDeliveryStatus, 
    autoAssignOrderDelivery, 
    reconcileCourierCash,
    addDeliveryPerson,
    updateDeliveryPerson,
    deleteDeliveryPerson,
    settings,
    updateSettings,
    formatPrice 
  } = useStore();

  const [activeSubtab, setActiveSubtab] = useState<'dispatch' | 'fleet' | 'cash' | 'zones'>('dispatch');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Courier Modal State
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [editingCourierId, setEditingCourierId] = useState<string | null>(null);
  const [courierName, setCourierName] = useState('');
  const [courierPhone, setCourierPhone] = useState('+225 ');
  const [courierVehicle, setCourierVehicle] = useState<DeliveryVehicleType>('moto');
  const [courierZone, setCourierZone] = useState('Abidjan Nord & Centre');
  const [courierStatus, setCourierStatus] = useState<DeliveryPersonStatus>('available');
  const [courierNotes, setCourierNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingCourierId(null);
    setCourierName('');
    setCourierPhone('+225 ');
    setCourierVehicle('moto');
    setCourierZone('Abidjan Nord & Centre');
    setCourierStatus('available');
    setCourierNotes('');
    setIsCourierModalOpen(true);
  };

  const handleOpenEditModal = (courier: DeliveryPerson) => {
    setEditingCourierId(courier.id);
    setCourierName(courier.name);
    setCourierPhone(courier.phone);
    setCourierVehicle(courier.vehicleType);
    setCourierZone(courier.zone);
    setCourierStatus(courier.status);
    setCourierNotes(courier.notes || '');
    setIsCourierModalOpen(true);
  };

  const handleCourierFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierName.trim() || !courierPhone.trim()) return;

    if (editingCourierId) {
      updateDeliveryPerson(editingCourierId, {
        name: courierName.trim(),
        phone: courierPhone.trim(),
        vehicleType: courierVehicle,
        zone: courierZone,
        status: courierStatus,
        notes: courierNotes.trim() || undefined
      });
      showToast(`Livreur "${courierName.trim()}" mis à jour avec succès !`);
    } else {
      addDeliveryPerson({
        name: courierName.trim(),
        phone: courierPhone.trim(),
        vehicleType: courierVehicle,
        zone: courierZone,
        status: courierStatus,
        currentDeliveriesCount: 0,
        totalCompletedDeliveries: 0,
        collectedCashToday: 0,
        rating: 5.0,
        notes: courierNotes.trim() || undefined
      });
      showToast(`Nouveau livreur "${courierName.trim()}" ajouté à la flotte avec succès !`);
      setActiveSubtab('fleet');
    }

    setIsCourierModalOpen(false);
  };

  // KPIs
  const totalFleetCount = deliveryPersons.length;
  const availableCouriersCount = deliveryPersons.filter(dp => dp.status === 'available').length;
  const busyCouriersCount = deliveryPersons.filter(dp => dp.status === 'busy').length;
  
  const pendingOrders = useMemo(() => {
    return orders.filter(o => 
      !o.deliveryPersonId && 
      o.orderStatus !== 'delivered' && 
      o.orderStatus !== 'cancelled'
    );
  }, [orders]);

  const inTransitOrders = useMemo(() => {
    return orders.filter(o => 
      o.deliveryStatus === 'in_transit' || 
      (o.deliveryPersonId && o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled')
    );
  }, [orders]);

  const totalCashHeldByCouriers = useMemo(() => {
    return deliveryPersons.reduce((acc, dp) => acc + (dp.collectedCashToday || 0), 0);
  }, [deliveryPersons]);

  // Filtered orders for dispatch tab
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = 
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.deliveryPersonName && o.deliveryPersonName.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (filterStatus === 'pending') return !o.deliveryPersonId && o.orderStatus !== 'delivered';
      if (filterStatus === 'assigned') return o.deliveryStatus === 'assigned';
      if (filterStatus === 'in_transit') return o.deliveryStatus === 'in_transit';
      if (filterStatus === 'delivered') return o.deliveryStatus === 'delivered' || o.orderStatus === 'delivered';
      return true;
    });
  }, [orders, searchQuery, filterStatus]);

  // Bulk Auto-Dispatch
  const handleBulkAutoDispatch = async () => {
    let assignedCount = 0;
    for (const order of pendingOrders) {
      const res = await autoAssignOrderDelivery(order.id);
      if (res.success) assignedCount++;
    }
    showToast(`⚡ Dispatching IA terminé : ${assignedCount} commande(s) assignée(s) automatiquement aux coursiers par zone !`);
  };

  // Single assign
  const handleManualAssign = async (orderId: string, courierId: string) => {
    if (!courierId) return;
    await assignOrderDelivery(orderId, courierId);
    showToast('Course assignée au livreur avec succès.');
  };

  // WhatsApp Mission to Courier
  const handleSendMissionToCourier = (order: Order) => {
    const courier = deliveryPersons.find(dp => dp.id === order.deliveryPersonId);
    if (!courier) return;

    let cleanPhone = courier.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('225') && cleanPhone.length === 10) {
      cleanPhone = `225${cleanPhone}`;
    }

    const itemsSummary = order.items.map(i => `- ${i.quantity}x ${i.productTitle}`).join('\n');
    const paymentInfo = order.paymentMethod === 'cod' 
      ? `💵 À ENCAISSER EN CASH : ${formatPrice(order.totalAmount)}`
      : `✅ DÉJÀ PAYÉ EN LIGNE (${order.paymentMethod.toUpperCase()}) - Ne pas encaisser`;

    const msg = `🛵 *NOUVELLE MISSION DE LIVRAISON - ${settings.storeName}*\n\n` +
      `📦 *Commande :* ${order.orderNumber}\n` +
      `👤 *Client :* ${order.customerName}\n` +
      `📞 *Téléphone Client :* ${order.customerPhone}\n` +
      `📍 *Commune / Ville :* ${order.customerCity}\n` +
      `🏠 *Adresse :* ${order.customerAddress}\n` +
      (order.customerNotes ? `💬 *Note :* "${order.customerNotes}"\n` : '') +
      `\n🛒 *Articles :*\n${itemsSummary}\n\n` +
      `${paymentInfo}\n\n` +
      `👉 *Portail Livreur :* ${window.location.origin}/livreur\n` +
      `Merci de confirmer la prise en charge !`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Toggle Auto-dispatch setting
  const handleToggleAutoDispatch = async () => {
    const nextVal = !(settings.autoDispatchEnabled !== false);
    await updateSettings({ autoDispatchEnabled: nextVal });
    showToast(`Dispatching automatique IA ${nextVal ? 'activé ⚡' : 'désactivé ⏸️'}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wide uppercase">
              <Bike className="w-3.5 h-3.5" />
              <span>Système Autonome de Livraison 🇨🇮 Côte d'Ivoire</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Logistique, Flotte & Dispatching Abidjan
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Attribution intelligente des commandes par commune, gestion de la flotte de coursiers motorisés, missions WhatsApp et réconciliation des encaissements en espèces en temps réel.
            </p>
          </div>

          {/* Quick Actions with Prominent Add Courier Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg cursor-pointer hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Ajouter un Livreur 🛵</span>
            </button>

            <a
              href="/livreur"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Portail Mobile (/livreur)</span>
            </a>

            <button
              onClick={handleBulkAutoDispatch}
              disabled={pendingOrders.length === 0}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition shadow-lg cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Auto-Dispatch IA ({pendingOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Livreurs Disponibles</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{availableCouriersCount}</span>
              <span className="text-xs text-slate-400">/ {totalFleetCount} actifs</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Courses En Attente</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{pendingOrders.length}</span>
              <span className="text-xs text-slate-400">à dispatcher</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">En Transit 🛵</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-sky-400">{inTransitOrders.length}</span>
              <span className="text-xs text-slate-400">sur la route</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cash en Circulation</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg sm:text-xl font-black text-amber-300">{formatPrice(totalCashHeldByCouriers)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-400 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subtabs Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubtab('dispatch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubtab === 'dispatch'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Centre de Dispatching ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubtab('fleet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubtab === 'fleet'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-indigo-500" />
            <span>Flotte de Livreurs ({deliveryPersons.length})</span>
          </button>

          <button
            onClick={() => setActiveSubtab('cash')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubtab === 'cash'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
            <span>Caisse & Réconciliation</span>
          </button>

          <button
            onClick={() => setActiveSubtab('zones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeSubtab === 'zones'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Zones Abidjan & Tarifs</span>
          </button>
        </div>

        {/* Dedicated Always-Visible Add Courier Button */}
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Ajouter un Livreur</span>
        </button>
      </div>

      {/* SUBTAB 1: CENTRE DE DISPATCHING */}
      {activeSubtab === 'dispatch' && (
        <div className="space-y-4">
          
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par commune, N° commande, client..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:text-white cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">Non Assignées (En attente)</option>
                <option value="assigned">Assignées au livreur</option>
                <option value="in_transit">En cours de livraison 🛵</option>
                <option value="delivered">Livrées ✅</option>
              </select>

              <button
                onClick={handleBulkAutoDispatch}
                disabled={pendingOrders.length === 0}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Dispatch ({pendingOrders.length})</span>
              </button>
            </div>
          </div>

          {/* Orders Dispatch Table / List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3.5 px-4">Commande</th>
                    <th className="py-3.5 px-4">Client & Contact</th>
                    <th className="py-3.5 px-4">Commune & Adresse</th>
                    <th className="py-3.5 px-4">Paiement</th>
                    <th className="py-3.5 px-4">Livreur Assigné</th>
                    <th className="py-3.5 px-4">Statut Course</th>
                    <th className="py-3.5 px-4 text-right">Actions Mission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Aucune commande correspondant aux critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isCOD = order.paymentMethod === 'cod';
                      const assignedCourier = deliveryPersons.find(dp => dp.id === order.deliveryPersonId);
                      const isDelivered = order.deliveryStatus === 'delivered' || order.orderStatus === 'delivered';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                          {/* Order Number & Items */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-black text-slate-900 dark:text-white block">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {order.items.length} article(s) • {formatPrice(order.totalAmount)}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {order.customerName}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                              {order.customerPhone}
                            </span>
                          </td>

                          {/* City & Address */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{order.customerCity}</span>
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                              {order.customerAddress}
                            </span>
                          </td>

                          {/* Payment */}
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isCOD 
                                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300' 
                                : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              {isCOD ? 'Cash Livraison' : order.paymentMethod.toUpperCase()}
                            </span>
                          </td>

                          {/* Assigned Courier Selector */}
                          <td className="py-3.5 px-4">
                            {isDelivered ? (
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {order.deliveryPersonName || 'Livreur assigné'}
                              </span>
                            ) : (
                              <select
                                value={order.deliveryPersonId || ''}
                                onChange={(e) => handleManualAssign(order.id, e.target.value)}
                                className="w-full min-w-[140px] px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden dark:text-white cursor-pointer"
                              >
                                <option value="">-- Assigner livreur --</option>
                                {deliveryPersons.map((dp) => (
                                  <option key={dp.id} value={dp.id}>
                                    {dp.name} ({dp.zone.split(' ')[0]})
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* Delivery Status Badge */}
                          <td className="py-3.5 px-4">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              order.deliveryStatus === 'delivered' || order.orderStatus === 'delivered'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : order.deliveryStatus === 'in_transit'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                                : order.deliveryPersonId
                                ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {order.deliveryStatus === 'delivered' || order.orderStatus === 'delivered'
                                ? '✅ Livré'
                                : order.deliveryStatus === 'in_transit'
                                ? '🛵 En route'
                                : order.deliveryPersonId
                                ? '📌 Assigné'
                                : '⏳ En attente'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.deliveryPersonId && !isDelivered && (
                                <button
                                  onClick={() => handleSendMissionToCourier(order)}
                                  title="Envoyer la fiche mission par WhatsApp au coursier"
                                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                              )}

                              {!isDelivered && (
                                <button
                                  onClick={() => updateOrderDeliveryStatus(order.id, 'delivered')}
                                  title="Marquer manuellement comme livré"
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: FLOTTE DE LIVREURS */}
      {activeSubtab === 'fleet' && (
        <div className="space-y-4">
          
          {/* Subtab Fleet Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Flotte de Coursiers ({deliveryPersons.length} actifs)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gérez vos livreurs, assignez leurs véhicules et suivez leur disponibilité à Abidjan.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nouveau Livreur</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Dedicated Quick-Add Courier Card */}
            <div
              onClick={handleOpenAddModal}
              className="border-2 border-dashed border-indigo-400/50 hover:border-indigo-500 dark:border-indigo-500/40 dark:hover:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer group transition min-h-[240px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <UserPlus className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-black text-sm text-indigo-950 dark:text-indigo-300 block">
                  + Ajouter un Livreur
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Enregistrer un coursier moto ou voiture pour Abidjan
                </p>
              </div>
              <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                Créer profil livreur 🛵
              </span>
            </div>

            {deliveryPersons.map((courier) => {
              const isAvailable = courier.status === 'available';
              const isBusy = courier.status === 'busy';

              return (
                <div 
                  key={courier.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4 relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-lg">
                          {courier.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{courier.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            {courier.vehicleType === 'moto' ? <Bike className="w-3 h-3 text-amber-500" /> : <Car className="w-3 h-3 text-sky-500" />}
                            <span className="capitalize">{courier.vehicleType}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isAvailable 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                          : isBusy 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-ping' : isBusy ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span>{isAvailable ? 'Disponible' : isBusy ? 'En course' : 'Hors ligne'}</span>
                      </span>
                    </div>

                    {/* Zone & Phone */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Zone : <strong>{courier.zone}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                        <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-mono">{courier.phone}</span>
                      </div>
                      {courier.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-800">
                          {courier.notes}
                        </p>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">En cours</span>
                        <span className="font-black text-amber-500 text-sm">{courier.currentDeliveriesCount}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Total livrées</span>
                        <span className="font-black text-emerald-500 text-sm">{courier.totalCompletedDeliveries}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Cash en main</span>
                        <span className="font-black text-sky-500 text-xs truncate block">{formatPrice(courier.collectedCashToday)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer with Edit & Delete */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <a
                      href={`tel:${courier.phone}`}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Appeler</span>
                    </a>

                    <a
                      href={`https://wa.me/${courier.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleOpenEditModal(courier)}
                      title="Modifier les informations du livreur"
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer définitivement le livreur "${courier.name}" de la flotte ?`)) {
                          deleteDeliveryPerson(courier.id);
                          showToast(`Livreur "${courier.name}" retiré de la flotte.`);
                        }
                      }}
                      title="Supprimer le livreur de la flotte"
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CAISSE & FINANCE */}
      {activeSubtab === 'cash' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Cash in Hand Banner Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-900/40 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Total Espèces en Circulation</span>
                  <h2 className="text-3xl font-black mt-1 text-white">{formatPrice(totalCashHeldByCouriers)}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Somme totale des paiements à la livraison (COD) perçus par les coursiers aujourd'hui à Abidjan.
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Banknote className="w-7 h-7" />
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Procédure de Caisse</span>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Le coursier encaisse les espèces lors de la remise du colis au client.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>En fin de journée, le coursier effectue le versement au siège ou par Wave Business.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Cliquez sur "Clôturer Versement" pour remettre le solde du livreur à 0 FCFA.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Breakdown per Courier */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Répartition de la Caisse par Livreur</h3>
              <span className="text-xs text-slate-500">{deliveryPersons.length} livreur(s) actifs</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {deliveryPersons.map((courier) => (
                <div key={courier.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
                      {courier.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{courier.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {courier.zone} • {courier.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        {formatPrice(courier.collectedCashToday)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {courier.collectedCashToday > 0 ? 'Espèces à reverser' : 'Caisse à jour'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        reconcileCourierCash(courier.id);
                        showToast(`Versement de ${courier.name} enregistré et caisse clôturée !`);
                      }}
                      disabled={courier.collectedCashToday === 0}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Clôturer Versement</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: ZONES DE LIVRAISON ABIDJAN */}
      {activeSubtab === 'zones' && (
        <div className="space-y-4">
          
          {/* Dispatch Mode Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Attribution Automatique des Commandes (Auto-Dispatch)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                Lorsqu'un client passe commande sur le site, le système sélectionne instantanément le coursier disponible assigné à sa commune d'Abidjan.
              </p>
            </div>

            <button
              onClick={handleToggleAutoDispatch}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                settings.autoDispatchEnabled !== false
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{settings.autoDispatchEnabled !== false ? 'Activé ⚡' : 'Désactivé ⏸️'}</span>
            </button>
          </div>

          {/* Zones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Zone 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Zone 1 : Abidjan Nord & Centre</h4>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                  1 500 FCFA • 24h chrono
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Communes couvertes : Cocody (Angré, Riviera, 2 Plateaux), Le Plateau, Adjamé, Attécoubé, Abobo.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
                Livreur dédié : <strong>Koffi Kouamé (Moto)</strong>
              </div>
            </div>

            {/* Zone 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Zone 2 : Abidjan Sud & Ouest</h4>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                  2 000 FCFA • 24h chrono
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Communes couvertes : Marcory (Zone 4, Biétry), Yopougon, Koumassi, Treichville, Port-Bouët (Aéroport).
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
                Livreur dédié : <strong>Bakary Koné (Moto)</strong>
              </div>
            </div>

            {/* Zone 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Zone 3 : Périphérie Grand Abidjan</h4>
                </div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                  2 500 FCFA • 24h à 48h
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Communes couvertes : Bingerville, Songon, Grand-Bassam.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
                Livreur dédié : <strong>Yao Franck (Voiture)</strong>
              </div>
            </div>

            {/* Zone 4 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">Zone 4 : Villes de l'Intérieur</h4>
                </div>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                  4 000 FCFA • 48h à 72h
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expédition sécurisée par compagnie de transport : Yamoussoukro, Bouaké, San-Pédro, Korhogo, Daloa, Man, Gagnoa.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-700/60">
                Partenaire logistique : <strong>Compagnies UTB / CTE / SBTA</strong>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Courier Modal */}
      {isCourierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{editingCourierId ? 'Modifier les Informations du Livreur' : 'Ajouter un Nouveau Livreur à la Flotte'}</span>
              </div>
              <button 
                onClick={() => setIsCourierModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCourierFormSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nom & Prénom du Livreur *</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Ex: Bakayoko Souleymane"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Numéro Téléphone / WhatsApp (+225) *</label>
                <input
                  type="tel"
                  required
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  placeholder="+225 07 12 34 56 78"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Type de Véhicule</label>
                  <select
                    value={courierVehicle}
                    onChange={(e) => setCourierVehicle(e.target.value as DeliveryVehicleType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold cursor-pointer"
                  >
                    <option value="moto">Moto 🛵</option>
                    <option value="tricycle">Tricycle 🛺</option>
                    <option value="voiture">Voiture 🚗</option>
                    <option value="compagnie">Compagnie 🚛</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Statut Initial</label>
                  <select
                    value={courierStatus}
                    onChange={(e) => setCourierStatus(e.target.value as DeliveryPersonStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold cursor-pointer"
                  >
                    <option value="available">Disponible 🟢</option>
                    <option value="busy">En course 🟡</option>
                    <option value="offline">Hors ligne / Pause 🔴</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Zone Principale d'Acheminement</label>
                <select
                  value={courierZone}
                  onChange={(e) => setCourierZone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-semibold cursor-pointer"
                >
                  <option value="Abidjan Nord & Centre">Zone 1 : Abidjan Nord & Centre (Cocody, Plateau, Adjamé, Abobo)</option>
                  <option value="Abidjan Sud & Ouest">Zone 2 : Abidjan Sud & Ouest (Marcory, Yopougon, Koumassi, Port-Bouët)</option>
                  <option value="Périphérie Grand Abidjan">Zone 3 : Périphérie Grand Abidjan (Bingerville, Bassam, Songon)</option>
                  <option value="Villes de l'Intérieur">Zone 4 : Villes de l'Intérieur (Yamoussoukro, Bouaké, San-Pédro...)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notes & Secteurs préférés</label>
                <input
                  type="text"
                  value={courierNotes}
                  onChange={(e) => setCourierNotes(e.target.value)}
                  placeholder="Ex: Secteur Angré 8e tranche, Riviera 3, disponible samedi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCourierModalOpen(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition cursor-pointer shadow-md"
                >
                  {editingCourierId ? 'Mettre à Jour le Livreur' : 'Enregistrer le Livreur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
