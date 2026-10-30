import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Percent,
  RotateCcw,
  Users,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FilterBar } from '../components/common/FilterBar';
import { formatRupiah } from '../data/dummy';

export const ReportsPage: React.FC = () => {
  const { plans, transactions } = useApp();
  const [dateRange, setDateRange] = useState<string>('30d');

  // Breakdown revenue per plan for the report
  const planReports = [
    {
      planId: 'subs_monthly',
      name: 'Paket Bulanan Reguler (Rp15.000)',
      orders: 342,
      grossRevenue: 5130000,
      share: 34.5,
      refundCount: 3,
      growth: '+14.2%',
    },
    {
      planId: 'subs_30days',
      name: 'Paket Hemat 30 Hari (Rp10.000)',
      orders: 410,
      grossRevenue: 4100000,
      share: 27.6,
      refundCount: 2,
      growth: '+22.8%',
    },
    {
      planId: 'subs_3month',
      name: 'Paket 3 Bulan VIP (Rp40.000)',
      orders: 58,
      grossRevenue: 2320000,
      share: 15.6,
      refundCount: 1,
      growth: '+8.4%',
    },
    {
      planId: 'subs_weekly',
      name: 'Paket Mingguan (Rp5.000)',
      orders: 310,
      grossRevenue: 1550000,
      share: 10.4,
      refundCount: 3,
      growth: '+5.1%',
    },
    {
      planId: 'subs_1year',
      name: 'Paket 1 Tahun Ultimate (Rp149.000)',
      orders: 7,
      grossRevenue: 1043000,
      share: 7.0,
      refundCount: 0,
      growth: '+33.0%',
    },
    {
      planId: 'subs_6month',
      name: 'Paket 6 Bulan Platinum (Rp75.000)',
      orders: 9,
      grossRevenue: 675000,
      share: 4.5,
      refundCount: 1,
      growth: '+12.0%',
    },
  ];

  const totalReportGross = planReports.reduce((s, p) => s + p.grossRevenue, 0);

  const handleExportCsv = () => {
    const headers = [
      'Paket Langganan',
      'Total Pesanan',
      'Pendapatan Kotor (Rp)',
      'Pangsa Pasar (%)',
      'Jumlah Refund',
      'Pertumbuhan MoM',
    ];
    const rows = planReports.map((p) => [
      `"${p.name}"`,
      p.orders,
      p.grossRevenue,
      p.share,
      p.refundCount,
      `"${p.growth}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mvicall_laporan_pendapatan_okt_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Laporan Keuangan & Analisis Retensi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikhtisar analitik pendapatan per paket, rasio konversi corong langganan, dan tingkat churn MViCall.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1F4E79] hover:bg-[#163a5c] rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor CSV Laporan</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Pendapatan Kotor
          </span>
          <h4 className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {formatRupiah(totalReportGross)}
          </h4>
          <span className="text-xs text-emerald-600 font-semibold mt-2 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +19.4% vs bulan lalu
          </span>
        </div>

        {/* Funnel Conversion */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Konversi Popup → VIP
          </span>
          <h4 className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            14.8%
          </h4>
          <span className="text-xs text-slate-500 mt-2 block">
            6.690 langganan dari 45.200 tayangan
          </span>
        </div>

        {/* Churn Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Tingkat Churn (Batal)
          </span>
          <h4 className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            3.8%
          </h4>
          <span className="text-xs text-emerald-600 font-semibold mt-2 inline-flex items-center gap-1">
            -0.6% (Retensi membaik)
          </span>
        </div>

        {/* Refund Rate */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Rasio Refund / Dispute
          </span>
          <h4 className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            0.7%
          </h4>
          <span className="text-xs text-slate-500 mt-2 block">
            10 kasus dari 1.136 transaksi
          </span>
        </div>
      </div>

      {/* Revenue Per Plan Breakdown Table & Visual Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#1F4E79]" />
              Rincian Pendapatan Berdasarkan Paket (Bulan Ini)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi nominal kotor yang dihasilkan oleh masing-masing SKU produk paket MViCall.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Oktober 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <th className="px-4 py-3">Paket Langganan</th>
                <th className="px-4 py-3 text-right">Pesanan Sukses</th>
                <th className="px-4 py-3 text-right">Nominal Kotor (Rp)</th>
                <th className="px-4 py-3">Distribusi Kontribusi</th>
                <th className="px-4 py-3 text-center">Refund</th>
                <th className="px-4 py-3 text-right">Tren MoM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {planReports.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-bold text-slate-800">
                    {p.name}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                    {p.orders.toLocaleString('id-ID')} order
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(p.grossRevenue)}
                  </td>
                  <td className="px-4 py-3.5 w-60">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#1F4E79] h-full rounded-full"
                          style={{ width: `${p.share}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-700 w-10 text-right">
                        {p.share}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-rose-600 font-medium">
                    {p.refundCount}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600">
                    {p.growth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2 Columns: Conversion Funnel & Churn Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Corong Konversi (Popup In-App → Berlangganan)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Efektivitas promosi popup saat pengguna memutar preview video di aplikasi.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Step 1 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-slate-800">
                  1. Tayangan Modal Promo Premium (Impression)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  45.200 (100%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                <div className="bg-[#1F4E79] h-full rounded-full w-full" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-slate-800">
                  2. Klik Tombol "Pilih Paket"
                </span>
                <span className="font-mono font-bold text-slate-900">
                  12.800 (28.3%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                <div className="bg-[#1F4E79] h-full rounded-full w-[28.3%]" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-slate-800">
                  3. Inisiasi Checkout Google Play / SDP
                </span>
                <span className="font-mono font-bold text-slate-900">
                  8.100 (17.9%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                <div className="bg-[#1F4E79] h-full rounded-full w-[17.9%]" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-emerald-900">
                  4. Pembayaran Berhasil & VIP Aktif
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  6.690 (14.8%)
                </span>
              </div>
              <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2">
                <div className="bg-emerald-600 h-full rounded-full w-[14.8%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Churn & Cancellation Reasons */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Analisis Retensi & Alasan Pembatalan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Faktor penyebab berhentinya siklus langganan otomatis pelanggan.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  Berhasil Perpanjang Otomatis (Retained)
                </p>
                <p className="text-[11px] text-slate-500">
                  Pelanggan tetap aktif memperbarui paket bulanan/mingguan
                </p>
              </div>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                82.4%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  Kegagalan Penagihan (Billing Failed)
                </p>
                <p className="text-[11px] text-slate-500">
                  Pulsa operator tidak cukup atau kartu e-wallet expired
                </p>
              </div>
              <span className="font-mono font-bold text-amber-600 text-sm">
                13.8%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  Pembatalan Manual oleh Pengguna
                </p>
                <p className="text-[11px] text-slate-500">
                  Melalui Google Play Subscription Manager atau SMS SDP STOP
                </p>
              </div>
              <span className="font-mono font-bold text-rose-600 text-sm">
                3.8%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
