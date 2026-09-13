'use client';

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Order } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface AdminAnalyticsChartProps {
  orders: Order[];
  formatPrice: (amount: number) => string;
  isDarkMode?: boolean;
}

// Standalone Custom Tooltip Component for Recharts
const AnalyticsCustomTooltip = ({ active, payload, formatPrice }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 backdrop-blur-md text-xs space-y-2 min-w-[200px]">
        <p className="font-bold text-slate-300 pb-1 border-b border-slate-800">
          📅 {data.displayDate}
        </p>
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <DollarSign className="w-3.5 h-3.5" /> Chiffre d'Affaires :
            </span>
            <span className="font-black text-white">{formatPrice ? formatPrice(data.revenue) : `${data.revenue} FCFA`}</span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <ShoppingBag className="w-3.5 h-3.5" /> Commandes :
            </span>
            <span className="font-black text-emerald-400">{data.ordersCount} cmd</span>
          </div>

          {data.ordersCount > 0 && (
            <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Panier moyen :</span>
              <span className="font-semibold text-slate-200">{formatPrice ? formatPrice(data.avgOrderValue) : `${data.avgOrderValue} FCFA`}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const AdminAnalyticsChart: React.FC<AdminAnalyticsChartProps> = ({
  orders,
  formatPrice,
  isDarkMode = false
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [chartType, setChartType] = useState<'combo' | 'revenue' | 'orders' | 'distribution'>('combo');

  // Process data for daily revenue and order trends
  const analyticsData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const now = new Date();
    
    // Generate dates map for the selected range
    const daysMap: { [key: string]: {
      dateKey: string;
      displayDate: string;
      shortDay: string;
      revenue: number;
      ordersCount: number;
      paidRevenue: number;
      pendingOrders: number;
      completedOrders: number;
      avgOrderValue: number;
    } } = {};

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      
      const shortDay = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const displayDate = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      
      daysMap[dateKey] = {
        dateKey,
        displayDate: `${shortDay} ${displayDate}`,
        shortDay: shortDay.charAt(0).toUpperCase() + shortDay.slice(1),
        revenue: 0,
        ordersCount: 0,
        paidRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        avgOrderValue: 0
      };
    }

    // Populate with actual orders
    orders.forEach((order) => {
      if (!order.createdAt) return;
      const orderDateKey = new Date(order.createdAt).toISOString().split('T')[0];
      
      if (daysMap[orderDateKey]) {
        daysMap[orderDateKey].revenue += order.totalAmount || 0;
        daysMap[orderDateKey].ordersCount += 1;
        
        if (order.paymentStatus === 'paid') {
          daysMap[orderDateKey].paidRevenue += order.totalAmount || 0;
        }
        
        if (order.orderStatus === 'delivered' || order.orderStatus === 'shipped') {
          daysMap[orderDateKey].completedOrders += 1;
        } else if (order.orderStatus === 'pending' || order.orderStatus === 'processing') {
          daysMap[orderDateKey].pendingOrders += 1;
        }
      }
    });

    // Calculate averages and format list
    const chartList = Object.values(daysMap).map((day) => ({
      ...day,
      avgOrderValue: day.ordersCount > 0 ? Math.round(day.revenue / day.ordersCount) : 0
    }));

    // Summary metrics for the active period
    const totalPeriodRevenue = chartList.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalPeriodOrders = chartList.reduce((acc, curr) => acc + curr.ordersCount, 0);
    const dailyAvgRevenue = Math.round(totalPeriodRevenue / daysCount);
    const avgBasket = totalPeriodOrders > 0 ? Math.round(totalPeriodRevenue / totalPeriodOrders) : 0;

    return {
      chartList,
      totalPeriodRevenue,
      totalPeriodOrders,
      dailyAvgRevenue,
      avgBasket
    };
  }, [orders, timeRange]);

  // Payment methods distribution data for Pie Chart
  const paymentDistribution = useMemo(() => {
    const counts: { [key: string]: { count: number; total: number; label: string; color: string } } = {
      wave: { count: 0, total: 0, label: 'Wave Mobile Money', color: '#0ea5e9' },
      orange_money: { count: 0, total: 0, label: 'Orange Money', color: '#f97316' },
      whatsapp: { count: 0, total: 0, label: 'WhatsApp Direct', color: '#22c55e' },
      cod: { count: 0, total: 0, label: 'Paiement à la Livraison', color: '#eab308' },
      card: { count: 0, total: 0, label: 'Carte Bancaire / En Ligne', color: '#6366f1' },
      bank_transfer: { count: 0, total: 0, label: 'Virement Bancaire', color: '#a855f7' }
    };

    orders.forEach((o) => {
      const method = o.paymentMethod || 'whatsapp';
      if (!counts[method]) {
        counts[method] = { count: 0, total: 0, label: method, color: '#94a3b8' };
      }
      counts[method].count += 1;
      counts[method].total += o.totalAmount || 0;
    });

    return Object.entries(counts)
      .filter(([_, data]) => data.count > 0)
      .map(([key, data]) => ({
        name: data.label,
        value: data.total,
        count: data.count,
        color: data.color,
        key
      }));
  }, [orders]);

  // Colors based on dark mode
  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
      
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Analyse des Revenus & Tendances des Commandes
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualisation graphique quotidienne propulsée par Recharts avec métriques d'activité.
          </p>
        </div>

        {/* Filters and View Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Chart View Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType('combo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'combo'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vue Complète
            </button>
            <button
              type="button"
              onClick={() => setChartType('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'revenue'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Revenus
            </button>
            <button
              type="button"
              onClick={() => setChartType('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'orders'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Commandes
            </button>
            <button
              type="button"
              onClick={() => setChartType('distribution')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartType === 'distribution'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Paiements
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {range === '7d' ? '7 Jours' : range === '14d' ? '14 Jours' : '30 Jours'}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Mini KPI Cards for the Selected Period */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            CA Période ({timeRange === '7d' ? '7j' : timeRange === '14d' ? '14j' : '30j'})
          </span>
          <p className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
            {formatPrice(analyticsData.totalPeriodRevenue)}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Commandes Générées
          </span>
          <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
            {analyticsData.totalPeriodOrders}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Moyenne / Jour
          </span>
          <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-200">
            {formatPrice(analyticsData.dailyAvgRevenue)}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Panier Moyen
          </span>
          <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
            {formatPrice(analyticsData.avgBasket)}
          </p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="w-full pt-2">
        
        {/* COMBO CHART (Revenues + Orders) */}
        {chartType === 'combo' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={analyticsData.chartList}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="shortDay" 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#10b981" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  allowDecimals={false}
                />
                <Tooltip content={<AnalyticsCustomTooltip formatPrice={formatPrice} />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</span>}
                />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Chiffre d'Affaires (FCFA)" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Bar 
                  yAxisId="right"
                  dataKey="ordersCount" 
                  name="Nombre de Commandes" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                  barSize={timeRange === '30d' ? 10 : 20}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* REVENUE ONLY AREA CHART */}
        {chartType === 'revenue' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={analyticsData.chartList}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenueOnly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: gridColor }}
                  tickFormatter={(val) => val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                />
                <Tooltip content={<AnalyticsCustomTooltip formatPrice={formatPrice} />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</span>}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Revenus Totaux (FCFA)" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenueOnly)" 
                />
                <Line
                  type="monotone"
                  dataKey="paidRevenue"
                  name="Paiements Encaissés"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ORDERS COUNT BAR CHART */}
        {chartType === 'orders' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={analyticsData.chartList}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="displayDate" 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  allowDecimals={false}
                />
                <Tooltip content={<AnalyticsCustomTooltip formatPrice={formatPrice} />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  formatter={(val) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{val}</span>}
                />
                <Bar 
                  dataKey="completedOrders" 
                  name="Livrées / Expédiées" 
                  fill="#10b981" 
                  stackId="a"
                  radius={[0, 0, 0, 0]} 
                  barSize={timeRange === '30d' ? 12 : 24}
                />
                <Bar 
                  dataKey="pendingOrders" 
                  name="En Attente / Traitement" 
                  fill="#f59e0b" 
                  stackId="a"
                  radius={[6, 6, 0, 0]} 
                  barSize={timeRange === '30d' ? 12 : 24}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* DISTRIBUTION PIE CHART */}
        {chartType === 'distribution' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatPrice(Number(value)), 'Montant Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Répartition des Ventes par Moyen de Paiement
              </h4>
              <div className="space-y-2">
                {paymentDistribution.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.count} commande{item.count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {formatPrice(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
