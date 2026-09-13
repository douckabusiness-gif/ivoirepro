'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  CreditCard,
  Eye,
  MousePointerClick,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
  UserRound,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type AnalyticsResponse = {
  metrics: {
    totalEvents: number;
    visitsToday: number;
    uniqueVisitors: number;
    uniqueVisitorsToday: number;
    pageViews: number;
    clicks: number;
    productViews: number;
    addToCart: number;
    checkoutStarted: number;
    purchases: number;
  };
  topPages: { path: string; count: number }[];
  topProducts: { productId: string | null; productTitle: string; interactions: number }[];
  daily: { date: string; visits: number; clicks: number; productViews: number; addToCart: number }[];
  recentEvents: {
    id: string;
    eventType: string;
    path: string;
    productId: string | null;
    productTitle: string | null;
    label: string | null;
    createdAt: string;
  }[];
};

const eventLabels: Record<string, string> = {
  page_view: 'Visite de page',
  click: 'Clic',
  product_view: 'Vue produit',
  add_to_cart: 'Ajout panier',
  checkout_started: 'Paiement ouvert',
  purchase: 'Commande confirmée',
  whatsapp_click: 'Clic WhatsApp',
  wishlist_toggle: 'Favori',
  search: 'Recherche',
};

const formatDay = (date: string) => {
  const value = new Date(`${date}T00:00:00`);
  return value.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

const formatTime = (date: string) => new Date(date).toLocaleString('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export const AdminAnalyticsDashboard = () => {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/analytics?days=${days}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Impossible de charger les statistiques.');
      setData(payload);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les statistiques.');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void loadAnalytics();
    const refreshTimer = window.setInterval(() => void loadAnalytics(), 60_000);
    return () => window.clearInterval(refreshTimer);
  }, [loadAnalytics]);

  const metrics = data?.metrics;
  const metricCards = [
    { label: "Visites aujourd'hui", value: metrics?.visitsToday || 0, note: `${metrics?.uniqueVisitorsToday || 0} visiteurs uniques`, icon: Eye, color: 'text-cyan-400', border: 'border-cyan-500' },
    { label: 'Visiteurs uniques', value: metrics?.uniqueVisitors || 0, note: `Sur les ${days} derniers jours`, icon: Users, color: 'text-indigo-400', border: 'border-indigo-500' },
    { label: 'Pages vues', value: metrics?.pageViews || 0, note: `${metrics?.clicks || 0} clics enregistrés`, icon: BarChart3, color: 'text-emerald-400', border: 'border-emerald-500' },
    { label: 'Vues produits', value: metrics?.productViews || 0, note: `${metrics?.addToCart || 0} ajout(s) au panier`, icon: Package, color: 'text-amber-400', border: 'border-amber-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Analytics de la boutique</h1>
              <p className="text-xs text-slate-400 mt-0.5">Suivi des visites, clics et interactions produits.</p>
            </div>
          </div>
          {lastUpdated && <p className="text-[11px] text-slate-500 mt-3">Dernière actualisation: {lastUpdated.toLocaleTimeString('fr-FR')}</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-950 border border-slate-700 rounded-xl">
            {[7, 30, 90].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDays(value as 7 | 30 | 90)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition ${days === value ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {value} jours
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition"
            title="Actualiser les statistiques"
            aria-label="Actualiser les statistiques"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`bg-slate-900 rounded-2xl p-5 border border-slate-800 border-t-4 ${card.border} shadow-sm`}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-3xl font-black text-white mt-3">{card.value.toLocaleString('fr-FR')}</p>
              <p className={`text-[11px] ${card.color} font-semibold mt-1`}>{card.note}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Clics', value: metrics?.clicks || 0, icon: MousePointerClick },
          { label: 'Ajouts panier', value: metrics?.addToCart || 0, icon: ShoppingCart },
          { label: 'Paiements ouverts', value: metrics?.checkoutStarted || 0, icon: CreditCard },
          { label: 'Commandes', value: metrics?.purchases || 0, icon: UserRound },
        ] as Array<{ label: string; value: number; icon: React.ComponentType<{ className?: string }> }>).map(({ label, value, icon: MetricIcon }) => {
          return (
            <div key={String(label)} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <MetricIcon className="w-4 h-4 text-slate-400" />
              <div><p className="text-[10px] uppercase font-bold text-slate-500">{label}</p><p className="text-lg font-black text-white">{Number(value).toLocaleString('fr-FR')}</p></div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div><h2 className="text-lg font-black text-white">Activité quotidienne</h2><p className="text-xs text-slate-400">Visites et interactions sur la période.</p></div>
          {isLoading && <span className="text-[11px] text-cyan-400 font-bold">Chargement...</span>}
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.daily || []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
                <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} /><stop offset="95%" stopColor="#818cf8" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tickFormatter={formatDay} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} minTickGap={22} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#fff', fontSize: 12 }} labelFormatter={(value) => formatDay(String(value))} />
              <Area type="monotone" dataKey="visits" name="Visites" stroke="#22d3ee" fill="url(#visitsFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="clicks" name="Clics" stroke="#818cf8" fill="url(#clicksFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-black text-white">Pages les plus visitées</h2><p className="text-xs text-slate-400">Classement par vues.</p></div><Eye className="w-5 h-5 text-cyan-400" /></div>
          <div className="space-y-3">
            {(data?.topPages || []).length === 0 && <p className="text-xs text-slate-500 py-4">Aucune visite enregistrée pour cette période.</p>}
            {(data?.topPages || []).map((page, index) => (
              <div key={`${page.path}-${index}`} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-black flex items-center justify-center">{index + 1}</span>
                <span className="flex-1 truncate text-sm font-semibold text-slate-200">{page.path}</span>
                <span className="text-xs font-black text-cyan-400">{page.count.toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-black text-white">Produits les plus touchés</h2><p className="text-xs text-slate-400">Vues, clics et actions cumulés.</p></div><Package className="w-5 h-5 text-amber-400" /></div>
          <div className="space-y-3">
            {(data?.topProducts || []).length === 0 && <p className="text-xs text-slate-500 py-4">Aucune interaction produit pour cette période.</p>}
            {(data?.topProducts || []).map((product, index) => (
              <div key={`${product.productId || product.productTitle}-${index}`} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-black flex items-center justify-center">{index + 1}</span>
                <span className="flex-1 truncate text-sm font-semibold text-slate-200">{product.productTitle}</span>
                <span className="text-xs font-black text-amber-400">{product.interactions.toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-black text-white">Activité récente</h2><p className="text-xs text-slate-400">Les derniers événements reçus.</p></div><Activity className="w-5 h-5 text-indigo-400" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b border-slate-800 text-[10px] uppercase text-slate-500"><th className="pb-3 pr-3">Événement</th><th className="pb-3 pr-3">Page</th><th className="pb-3 pr-3">Produit / action</th><th className="pb-3 text-right">Date</th></tr></thead>
            <tbody className="divide-y divide-slate-800/70">
              {(data?.recentEvents || []).length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Aucune activité récente.</td></tr>}
              {(data?.recentEvents || []).map((event) => (
                <tr key={event.id} className="text-slate-300">
                  <td className="py-3 pr-3"><span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold whitespace-nowrap">{eventLabels[event.eventType] || event.eventType}</span></td>
                  <td className="py-3 pr-3 max-w-[180px] truncate text-slate-400">{event.path}</td>
                  <td className="py-3 pr-3 max-w-[220px] truncate">{event.productTitle || event.label || '—'}</td>
                  <td className="py-3 text-right text-slate-500 whitespace-nowrap">{formatTime(event.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
