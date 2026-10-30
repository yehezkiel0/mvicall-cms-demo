import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CreditCard,
  DollarSign,
  Receipt,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { formatRupiah } from '../data/dummy';

export const DashboardPage: React.FC = () => {
  const {
    users,
    transactions,
    subscriptions,
    plans,
    warnings,
    setActiveMenu,
    setSubView,
  } = useApp();

  // Metrics
  const activeUsersCount = users.filter((u) => !u.isBlocked).length;
  const newUsersToday = 7;
  const activeSubs = subscriptions.filter((s) => s.status === 'aktif' || s.status === 'akan_berakhir');
  const googlePlaySubsCount = activeSubs.filter((s) => s.source === 'Google Play').length;
  const sdpSubsCount = activeSubs.filter((s) => s.source.startsWith('SDP')).length;

  const successfulTx = transactions.filter((t) => t.status === 'berhasil');
  const pendingTx = transactions.filter((t) => t.status === 'pending');
  const refundTx = transactions.filter((t) => t.status === 'refund');

  const revenueToday = 675000;
  const revenueThisMonth = successfulTx.reduce((sum, t) => sum + t.nominal, 0);

  // Subscribers per plan for bar chart
  const subsByPlan = plans.map((plan) => {
    const count = subscriptions.filter((s) => s.planId === plan.id).length;
    return {
      name: plan.name.replace('Paket ', ''),
      count: count || Math.floor(Math.random() * 8) + 4,
      color: '#1F4E79',
    };
  });
  const maxSubCount = Math.max(...subsByPlan.map((p) => p.count), 1);

  // 30-day simulated revenue data for SVG curve
  const days30 = Array.from({ length: 30 }).map((_, i) => {
    const day = i + 1;
    // trend upwards with realistic variance
    const base = 420000 + i * 18000;
    const noise = ((i * 17) % 7 - 3) * 35000;
    const value = Math.max(300000, base + noise);
    return { day: `${day} Okt`, value };
  });

  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; value: number; x: number; y: number } | null>(null);

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const effectiveW = chartWidth - paddingX * 2;
  const effectiveH = chartHeight - paddingY * 2;

  const minVal = 250000;
  const maxVal = Math.max(...days30.map((d) => d.value)) * 1.1;

  const points = days30.map((d, i) => {
    const x = paddingX + (i / (days30.length - 1)) * effectiveW;
    const y = chartHeight - paddingY - ((d.value - minVal) / (maxVal - minVal)) * effectiveH;
    return { ...d, x, y };
  });

  const svgPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${svgPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ringkasan Operasional MViCall
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Metrik performa aplikasi video ringtone, konversi langganan, dan pemantauan sistem per 29 Oktober 2026.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Gateway SDP & Google Play Normal
          </span>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="User Aktif"
          value={activeUsersCount.toLocaleString('id-ID')}
          subtitle="dari 60 akun terdaftar"
          change="+8.4% bln ini"
          icon={Users}
        />
        <StatCard
          title="User Baru Hari Ini"
          value={`+${newUsersToday}`}
          subtitle="rata-rata 8 user/hari"
          change="+12.5% vs kemarin"
          icon={UserPlus}
        />
        <StatCard
          title="Pelanggan Aktif"
          value={activeSubs.length.toString()}
          subtitle={`${googlePlaySubsCount} Google Play · ${sdpSubsCount} SDP`}
          badge="VIP & Trial"
          icon={CreditCard}
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={formatRupiah(revenueThisMonth)}
          subtitle={`Hari ini: ${formatRupiah(revenueToday)}`}
          change="+19.2% MoM"
          icon={DollarSign}
        />
      </div>

      {/* Transaction status strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Transaksi Berhasil</p>
              <p className="text-lg font-bold text-slate-800 font-mono tabular-nums">
                {successfulTx.length} pesanan
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 font-mono">
            {((successfulTx.length / transactions.length) * 100).toFixed(1)}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Transaksi Pending</p>
              <p className="text-lg font-bold text-slate-800 font-mono tabular-nums">
                {pendingTx.length} pesanan
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveMenu('transactions');
              setSubView('problems');
            }}
            className="text-xs font-semibold text-[#1F4E79] hover:underline flex items-center gap-1"
          >
            Tinjau Kasus
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Refund & Chargeback</p>
              <p className="text-lg font-bold text-slate-800 font-mono tabular-nums">
                {refundTx.length} pesanan
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveMenu('transactions');
              setSubView('refund');
            }}
            className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
          >
            Lihat Detail
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Charts & Peringatan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Revenue Trend (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1F4E79]" />
                Tren Pendapatan 30 Hari Terakhir
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Akumulasi harian dari in-app purchase Google Play Store & potong pulsa SDP.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-500 block">Total 30 Hari</span>
              <span className="text-base font-bold font-mono tabular-nums text-slate-900">
                {formatRupiah(days30.reduce((s, d) => s + d.value, 0))}
              </span>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative mt-4 w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                const y = chartHeight - paddingY - ratio * effectiveH;
                const val = minVal + ratio * (maxVal - minVal);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {(val / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Gradient def */}
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F4E79" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1F4E79" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path d={areaPath} fill="url(#revenueGrad)" />

              {/* Line Stroke */}
              <path
                d={svgPath}
                fill="none"
                stroke="#1F4E79"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Interactive Dots */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.day === p.day ? 5 : 2.5}
                  fill={hoveredPoint?.day === p.day ? '#1F4E79' : '#ffffff'}
                  stroke="#1F4E79"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(p)}
                />
              ))}

              {/* X Axis Labels */}
              {points
                .filter((_, i) => i % 5 === 0 || i === points.length - 1)
                .map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-medium"
                  >
                    {p.day}
                  </text>
                ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute pointer-events-none bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl font-mono tabular-nums -translate-x-1/2 -translate-y-full mb-2 z-10"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                }}
              >
                <p className="text-[10px] text-slate-400">{hoveredPoint.day}</p>
                <p className="font-bold text-amber-400">
                  {formatRupiah(hoveredPoint.value)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Rata-rata pendapatan harian: Rp570.000</span>
            <span className="font-semibold text-emerald-600">
              Lonjakan tertinggi: 23 Okt (Rilis Videotone Dangdut)
            </span>
          </div>
        </div>

        {/* Peringatan Sistem List (1 Col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Peringatan Sistem
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-mono">
                {warnings.length} Butuh Tindakan
              </span>
            </div>

            <div className="mt-3 space-y-3">
              {warnings.map((warn) => (
                <div
                  key={warn.id}
                  className={`p-3 rounded-lg border text-xs transition-colors ${
                    warn.type === 'critical'
                      ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                      : 'bg-amber-50/60 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 leading-snug">
                      {warn.title}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0 ${
                        warn.type === 'critical'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {warn.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {warn.description}
                  </p>
                  {warn.actionTargetMenu && (
                    <button
                      onClick={() => {
                        setActiveMenu(warn.actionTargetMenu!);
                        if (warn.actionPayload) setSubView(warn.actionPayload);
                      }}
                      className="mt-2 text-[11px] font-bold text-[#1F4E79] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {warn.actionLabel || 'Tindak lanjuti'}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-400">
            Terakhir diperbarui sistem: 29 Okt 2026 21:05
          </div>
        </div>
      </div>

      {/* Bar Chart: Subscribers per plan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Distribusi Pelanggan Berdasarkan Paket
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan jumlah pelanggan aktif pada masing-masing tingkatan paket langganan MViCall.
            </p>
          </div>
          <button
            onClick={() => setActiveMenu('plans')}
            className="text-xs font-semibold text-[#1F4E79] hover:underline flex items-center gap-1"
          >
            Kelola Paket & Harga
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {subsByPlan.map((plan, idx) => {
            const heightPercent = Math.max(15, (plan.count / maxSubCount) * 100);
            return (
              <div
                key={idx}
                className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/60 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block truncate">
                    {plan.name}
                  </span>
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                    {plan.count}{' '}
                    <span className="text-xs font-normal text-slate-500">user</span>
                  </span>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1F4E79] h-full rounded-full transition-all duration-500"
                      style={{ width: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block text-right font-mono">
                    {((plan.count / activeSubs.length) * 100).toFixed(0)}% pangsa
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
