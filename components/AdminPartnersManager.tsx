'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/storeContext';
import { Partner, PartnerPayout } from '@/lib/types';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Percent, 
  Wallet, 
  DollarSign, 
  MousePointerClick, 
  ShoppingBag, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  Store, 
  Check, 
  X, 
  AlertTriangle, 
  Sparkles,
  Phone,
  Mail,
  Sliders,
  Send,
  MessageCircle
} from 'lucide-react';

export const AdminPartnersManager = () => {
  const { formatPrice, settings, updateSettings } = useStore();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [payouts, setPayouts] = useState<PartnerPayout[]>([]);
  const [metrics, setMetrics] = useState<{
    totalPartners: number;
    pendingPartners: number;
    activePartners: number;
    pendingPayoutsCount: number;
    totalEarnings: number;
    totalPaidOut: number;
    totalPendingBalance: number;
  }>({
    totalPartners: 0,
    pendingPartners: 0,
    activePartners: 0,
    pendingPayoutsCount: 0,
    totalEarnings: 0,
    totalPaidOut: 0,
    totalPendingBalance: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'active' | 'payouts' | 'settings'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // Edit Partner Commission Rate Modal
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(10);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  // Settings State
  const [programEnabled, setProgramEnabled] = useState<boolean>(settings.partnerProgramEnabled !== false);
  const [defaultRate, setDefaultRate] = useState(settings.defaultPartnerCommissionRate || 10);
  const [minPayout, setMinPayout] = useState(settings.minPayoutAmount || 5000);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (settings.partnerProgramEnabled !== undefined) {
      setProgramEnabled(settings.partnerProgramEnabled);
    }
  }, [settings.partnerProgramEnabled]);

  // Fetch partners and payouts data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resPartners, resPayouts] = await Promise.allSettled([
        fetch('/api/partners/admin').then((r) => r.json()),
        fetch('/api/partners/admin/payouts').then((r) => r.json()),
      ]);

      if (resPartners.status === 'fulfilled' && resPartners.value?.partners) {
        setPartners(resPartners.value.partners);
        if (resPartners.value.metrics) {
          setMetrics(resPartners.value.metrics);
        }
      }

      if (resPayouts.status === 'fulfilled' && Array.isArray(resPayouts.value)) {
        setPayouts(resPayouts.value);
      }
    } catch (err) {
      console.error('Error fetching admin partner data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Approve Partner
  const handleApprovePartner = async (partnerId: string, partnerName: string) => {
    try {
      const res = await fetch(`/api/partners/admin/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      if (res.ok) {
        setActionSuccessMsg(`Partenaire "${partnerName}" validé avec succès ! Son compte est désormais actif.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Erreur lors de la validation.');
    }
  };

  // Reject / Suspend Partner
  const handleUpdatePartnerStatus = async (partnerId: string, status: string, name: string) => {
    try {
      const res = await fetch(`/api/partners/admin/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setActionSuccessMsg(`Statut du partenaire "${name}" mis à jour (${status}).`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Erreur lors de la mise à jour.');
    }
  };

  // Delete Partner
  const handleDeletePartner = async (partnerId: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le partenaire "${name}" ?`)) return;

    try {
      const res = await fetch(`/api/partners/admin/${partnerId}`, { method: 'DELETE' });
      if (res.ok) {
        setActionSuccessMsg(`Partenaire "${name}" supprimé.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Erreur lors de la suppression.');
    }
  };

  // Save Commission Rate
  const handleSaveCommissionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    setIsUpdatingRate(true);

    try {
      const res = await fetch(`/api/partners/admin/${editingPartner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: Number(newCommissionRate) }),
      });

      if (res.ok) {
        setActionSuccessMsg(`Taux de commission de "${editingPartner.name}" mis à ${newCommissionRate}%.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        setEditingPartner(null);
        fetchData();
      }
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Erreur');
    } finally {
      setIsUpdatingRate(false);
    }
  };

  // Process Payout (Complete or Reject)
  const handleProcessPayout = async (payoutId: string, status: 'completed' | 'rejected') => {
    const actionLabel = status === 'completed' ? 'marquer comme Payé (Wave/OM)' : 'Refuser et rembourser';
    if (!confirm(`Confirmer l'action : ${actionLabel} ?`)) return;

    try {
      const res = await fetch('/api/partners/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, status }),
      });

      if (res.ok) {
        setActionSuccessMsg(`Demande de retrait ${status === 'completed' ? 'marquée comme payée' : 'refusée et remboursée au partenaire'}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchData();
      }
    } catch (err: any) {
      setActionErrorMsg(err?.message || 'Erreur lors du traitement du retrait.');
    }
  };

  // Save Global Affiliate Settings
  const handleSaveGlobalSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSettings({
        partnerProgramEnabled: programEnabled,
        defaultPartnerCommissionRate: Number(defaultRate),
        minPayoutAmount: Number(minPayout),
      });
      setActionSuccessMsg('Paramètres du programme d\'affiliation sauvegardés !');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Direct Toggle Partner Program (Active / Inactive)
  const handleToggleProgramEnabled = async () => {
    const nextState = !programEnabled;
    setProgramEnabled(nextState);
    setIsSavingSettings(true);
    try {
      await updateSettings({
        partnerProgramEnabled: nextState,
      });
      setActionSuccessMsg(`Système partenaire ${nextState ? 'activé avec succès !' : 'désactivé (programme mis en pause).'}`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err: any) {
      setProgramEnabled(!nextState); // Rollback
      setActionErrorMsg(err?.message || 'Erreur lors du changement de statut.');
      setTimeout(() => setActionErrorMsg(''), 4000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered partners
  const pendingPartners = partners.filter((p) => p.status === 'pending');
  const activePartners = partners.filter((p) => p.status === 'active' || p.status === 'suspended');

  const filteredActivePartners = activePartners.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.storeName && p.storeName.toLowerCase().includes(q)) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
              Micro-Franchise & Affiliation
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
              programEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {programEnabled ? '● Programme Actif' : '● Programme Désactivé'}
            </span>
            {metrics.pendingPartners > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black animate-pulse">
                {metrics.pendingPartners} en attente
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Gestion du Réseau de Partenaires & Ambassadeurs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Activez ou désactivez le programme, validez les ambassadeurs et gérez les commissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Master Activation Switch */}
          <div className="flex items-center gap-3 bg-slate-950/90 p-2 sm:p-2.5 px-3.5 rounded-2xl border border-slate-800 shadow-inner">
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Système Partenaire :</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${programEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span className={`text-xs font-black uppercase tracking-wider ${programEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {programEnabled ? 'Actif' : 'Désactivé'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleProgramEnabled}
              disabled={isSavingSettings}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                programEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
              title={programEnabled ? 'Cliquer pour désactiver le système partenaire' : 'Cliquer pour activer le système partenaire'}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  programEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Deactivation Alert Banner */}
      {!programEnabled && (
        <div className="p-4 sm:p-5 bg-rose-950/40 border border-rose-800/60 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-rose-200 uppercase tracking-wide">
                Programme Partenaire Actuellement Désactivé
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                L'accès public à l'espace <code>/partenaire</code>, les nouvelles inscriptions et le bouton dans la barre de navigation sont masqués ou suspendus.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleProgramEnabled}
            disabled={isSavingSettings}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Réactiver le Programme</span>
          </button>
        </div>
      )}

      {/* Notifications */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 bg-rose-950/80 border border-rose-700 text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>En attente de validation</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {metrics.pendingPartners}
          </div>
          <p className="text-[10px] text-slate-500">Candidatures à examiner</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Partenaires Actifs</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.activePartners}
          </div>
          <p className="text-[10px] text-slate-500">Sur {metrics.totalPartners} inscrits au total</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Commissions Payées</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">
            {formatPrice(metrics.totalPaidOut)}
          </div>
          <p className="text-[10px] text-slate-500">Versées par Wave & OM</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>Retraits en Attente</span>
            <Wallet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {metrics.pendingPayoutsCount}
          </div>
          <p className="text-[10px] text-slate-500">Demandes de virement à traiter</p>
        </div>

      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>⏳ Demandes en Attente</span>
          {pendingPartners.length > 0 && (
            <span className="px-1.5 py-0.2 bg-black/40 rounded-full text-[10px] font-black text-amber-200">
              {pendingPartners.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'active'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>👥 Partenaires Actifs</span>
          <span className="px-1.5 py-0.2 bg-black/40 rounded-full text-[10px]">
            {activePartners.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('payouts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'payouts'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>💳 Demandes de Retrait</span>
          {metrics.pendingPayoutsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black">
              {metrics.pendingPayoutsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <span>⚙️ Paramètres du Programme</span>
        </button>
      </div>

      {/* =========================================================
          SUB-TAB 1: DEMANDES EN ATTENTE (PENDING APPROVAL)
         ========================================================= */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <span>Candidatures de Partenariat à Valider</span>
              <span className="text-xs font-normal text-slate-400">({pendingPartners.length})</span>
            </h3>
          </div>

          {pendingPartners.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">Toutes les demandes ont été traitées !</p>
              <p className="text-xs text-slate-400">Aucun nouveau partenaire n'est actuellement en attente d'approbation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPartners.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 p-5 rounded-2xl border border-amber-500/30 shadow-md space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                        En attente d'approbation
                      </span>
                      <h4 className="text-base font-black text-white mt-1">{p.name}</h4>
                      <p className="text-xs text-indigo-400 font-bold">{p.storeName || `${p.name}'s Boutique`}</p>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{p.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{p.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-slate-500" />
                      <span className="capitalize">
                        Retrait : {p.payoutMethod === 'wave' ? '🌊 Wave' : '🍊 Orange Money'} ({p.payoutPhone || p.phone})
                      </span>
                    </div>
                    {p.bio && (
                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                        « {p.bio} »
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApprovePartner(p.id, p.name)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approuver & Activer</span>
                    </button>

                    <button
                      onClick={() => handleUpdatePartnerStatus(p.id, 'rejected', p.name)}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                      title="Refuser la candidature"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          SUB-TAB 2: LISTE DES PARTENAIRES ACTIFS
         ========================================================= */}
      {activeSubTab === 'active' && (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un partenaire par nom, email ou slug..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              {filteredActivePartners.length} partenaire(s)
            </span>
          </div>

          {/* Table */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Partenaire & Vitrine</th>
                    <th className="px-6 py-4">Coordonnées</th>
                    <th className="px-6 py-4">Taux Commission</th>
                    <th className="px-6 py-4">Clics</th>
                    <th className="px-6 py-4">Ventes</th>
                    <th className="px-6 py-4">Gains Totaux</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredActivePartners.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-black text-white text-sm">{p.name}</p>
                          <p className="text-xs text-indigo-400 font-semibold">{p.storeName || `${p.name}'s Boutique`}</p>
                          <a
                            href={`/p/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-mono"
                          >
                            <span>/p/{p.slug}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        <div className="space-y-0.5">
                          <p>{p.email}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[11px] text-slate-400">{p.phone}</p>
                            {p.phone && (
                              <a
                                href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${p.name} ! C'est l'équipe ${settings.storeName}. Nous faisons le point sur votre vitrine partenaire !`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                                title="Discuter sur WhatsApp"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 capitalize">{p.payoutMethod} : {p.payoutPhone || p.phone}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setEditingPartner(p);
                            setNewCommissionRate(p.commissionRate);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 text-xs font-black transition cursor-pointer flex items-center gap-1"
                        >
                          <span>{p.commissionRate}%</span>
                          <Edit3 className="w-3 h-3 opacity-70" />
                        </button>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-300">
                        {p.clicksCount.toLocaleString('fr-FR')}
                      </td>

                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {p.orders?.length ?? 0}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-black text-amber-400">{formatPrice(p.totalEarnings)}</p>
                          <p className="text-[10px] text-slate-500">Solde : {formatPrice(p.pendingBalance)}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          p.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {p.status === 'active' ? '● Actif' : '● Suspendu'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === 'active' ? (
                            <button
                              onClick={() => handleUpdatePartnerStatus(p.id, 'suspended', p.name)}
                              className="p-1.5 text-amber-400 hover:bg-amber-950/60 rounded-lg transition cursor-pointer"
                              title="Suspendre le compte"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdatePartnerStatus(p.id, 'active', p.name)}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950/60 rounded-lg transition cursor-pointer"
                              title="Réactiver le compte"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeletePartner(p.id, p.name)}
                            className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg transition cursor-pointer"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* =========================================================
          SUB-TAB 3: DEMANDES DE RETRAIT
         ========================================================= */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white">Demandes de Retraits de Commissions</h3>
            <span className="text-xs text-slate-400">{payouts.length} demande(s) au total</span>
          </div>

          {payouts.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 text-center space-y-2">
              <Wallet className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">Aucune demande de retrait</p>
              <p className="text-xs text-slate-400">Les demandes de retraits Wave & Orange Money des partenaires apparaîtront ici.</p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Partenaire</th>
                      <th className="px-6 py-4">Montant</th>
                      <th className="px-6 py-4">Moyen de Paiement</th>
                      <th className="px-6 py-4">Numéro Destinataire</th>
                      <th className="px-6 py-4">Date Demande</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-4 font-black text-white">
                          {payout.partner?.name || 'Partenaire'}
                          <p className="text-[11px] text-slate-400 font-normal">{payout.partner?.email}</p>
                        </td>

                        <td className="px-6 py-4 font-black text-emerald-400 text-sm">
                          {formatPrice(payout.amount)}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-300 capitalize">
                          {payout.payoutMethod === 'wave' ? '🌊 Wave Mobile' : '🍊 Orange Money'}
                        </td>

                        <td className="px-6 py-4 font-mono font-bold text-amber-300">
                          {payout.payoutTarget}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {new Date(payout.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            payout.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : payout.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}>
                            {payout.status === 'completed' ? '✓ Payé' : payout.status === 'rejected' ? '✕ Refusé' : '● En Attente'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {payout.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleProcessPayout(payout.id, 'completed')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Payer</span>
                              </button>

                              <button
                                onClick={() => handleProcessPayout(payout.id, 'rejected')}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
                              >
                                Refuser
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[11px] text-emerald-400 font-bold">Traité ✓</span>
                              {payout.payoutTarget && (
                                <a
                                  href={`https://wa.me/${payout.payoutTarget.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ! 🌟 Votre retrait de ${formatPrice(payout.amount)} via ${payout.payoutMethod.toUpperCase()} (${payout.payoutTarget}) a bien été transféré par ${settings.storeName}. Merci pour vos ventes !`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                                  title="Notifier le partenaire sur WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          SUB-TAB 4: PARAMÈTRES DU PROGRAMME D'AFFILIATION
         ========================================================= */}
      {activeSubTab === 'settings' && (
        <div className="max-w-xl bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-white">Configuration du Programme d'Affiliation</h3>
            <p className="text-xs text-slate-400">Réglez les paramètres par défaut pour tous les nouveaux partenaires</p>
          </div>

          <form onSubmit={handleSaveGlobalSettings} className="space-y-4">
            {/* Activation Switch Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">Activer le Programme Partenaire & Affiliés</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    programEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {programEnabled ? 'Actif' : 'Désactivé'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Autorise les inscriptions d'ambassadeurs, l'accès public au portail et l'attribution des commissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setProgramEnabled(!programEnabled)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  programEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
                title={programEnabled ? 'Désactiver' : 'Activer'}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    programEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Taux de Commission par Défaut (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-black text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500">Attribué automatiquement aux nouveaux comptes lors de l'inscription.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Seuil Minimum de Retrait (FCFA)</label>
              <input
                type="number"
                min={1000}
                step={500}
                value={minPayout}
                onChange={(e) => setMinPayout(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-black text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">Montant minimum requis dans le solde pour pouvoir faire une demande de retrait.</p>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Sauvegarder les Réglages</span>}
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL: EDIT COMMISSION RATE
         ========================================================= */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white">Modifier la Commission</h3>
              <button
                onClick={() => setEditingPartner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Définir un taux personnalisé pour <strong>{editingPartner.name}</strong> ({editingPartner.storeName}) :
            </p>

            <form onSubmit={handleSaveCommissionRate} className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-lg font-black text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3.5 top-3 text-sm text-slate-400 font-bold">%</span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRate}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {isUpdatingRate ? 'Enregistrement...' : 'Valider le Taux'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
