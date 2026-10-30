import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Smartphone,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subscription, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PhoneText } from '../components/common/PhoneText';
import { formatRupiah } from '../data/dummy';

export const SubscriptionsPage: React.FC = () => {
  const { subscriptions, plans, setSelectedUserId, setActiveMenu } = useApp();

  const [activeTab, setActiveTab] = useState<
    'aktif' | 'akan_berakhir' | 'masa_tenggang' | 'berakhir' | 'dibatalkan'
  >('aktif');
  const [search, setSearch] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Filter subscriptions based on selected tab and bar filters
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Tab filter
      if (sub.status !== activeTab) return false;

      // Search match
      const matchSearch =
        sub.id.toLowerCase().includes(search.toLowerCase()) ||
        sub.userName.toLowerCase().includes(search.toLowerCase()) ||
        sub.userPhone.includes(search) ||
        sub.planName.toLowerCase().includes(search.toLowerCase());

      // Plan match
      const matchPlan =
        planFilter === 'all' || sub.planId === planFilter;

      // Source match
      const matchSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'gp' && sub.source === 'Google Play') ||
        (sourceFilter === 'sdp' && sub.source.startsWith('SDP'));

      return matchSearch && matchPlan && matchSource;
    });
  }, [subscriptions, activeTab, search, planFilter, sourceFilter]);

  // Tab counts
  const countAktif = subscriptions.filter((s) => s.status === 'aktif').length;
  const countAkanBerakhir = subscriptions.filter(
    (s) => s.status === 'akan_berakhir'
  ).length;
  const countMasaTenggang = subscriptions.filter(
    (s) => s.status === 'masa_tenggang'
  ).length;
  const countBerakhir = subscriptions.filter(
    (s) => s.status === 'berakhir'
  ).length;
  const countDibatalkan = subscriptions.filter(
    (s) => s.status === 'dibatalkan'
  ).length;

  const totalActive = countAktif + countAkanBerakhir;
  const googlePlayCount = subscriptions.filter(
    (s) => (s.status === 'aktif' || s.status === 'akan_berakhir') && s.source === 'Google Play'
  ).length;
  const sdpCount = totalActive - googlePlayCount;

  const columns: Column<Subscription>[] = [
    {
      key: 'id',
      header: 'ID Langganan',
      sortable: true,
      render: (s) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {s.id}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Pelanggan',
      sortable: true,
      render: (s) => (
        <div>
          <button
            onClick={() => {
              setSelectedUserId(s.userId);
              setActiveMenu('users');
            }}
            className="font-semibold text-slate-800 hover:text-[#1F4E79] text-left block"
          >
            {s.userName}
          </button>
          <PhoneText phone={s.userPhone} className="text-[11px] text-slate-400" />
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Paket',
      sortable: true,
      render: (s) => (
        <span className="text-xs font-semibold text-slate-800">
          {s.planName}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Sumber Tagihan',
      sortable: true,
      render: (s) => (
        <span className="text-xs font-medium text-slate-600">{s.source}</span>
      ),
    },
    {
      key: 'nominal',
      header: 'Tarif',
      sortable: true,
      align: 'right',
      render: (s) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {formatRupiah(s.nominal)}
        </span>
      ),
    },
    {
      key: 'endDate',
      header: 'Masa Berlaku',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-mono text-xs text-slate-700 block">
            s/d {s.endDate}
          </span>
          {s.gracePeriodUntil && (
            <span className="text-[10px] text-amber-700 font-medium">
              Tenggang s/d {s.gracePeriodUntil}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'autoRenew',
      header: 'Auto-Renew',
      render: (s) => (
        <span
          className={`text-xs font-semibold ${
            s.autoRenew ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          {s.autoRenew ? 'Ya' : 'Tidak'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.status} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Manajemen Langganan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring siklus langganan aktif, perpanjangan otomatis, dan masa tenggang pelanggan MViCall.
          </p>
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">
              Total Langganan Berjalan
            </span>
            <h4 className="text-2xl font-bold text-slate-900 font-mono mt-1">
              {totalActive}{' '}
              <span className="text-xs font-normal text-slate-500">pelanggan</span>
            </h4>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">
              Komposisi Kanal
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-800">
                {googlePlayCount} Google Play
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-sm font-bold text-slate-800">
                {sdpCount} SDP Telco
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-[#1F4E79] rounded-lg">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase">
              Perlu Perhatian (Tenggang / Berakhir)
            </span>
            <h4 className="text-2xl font-bold text-amber-600 font-mono mt-1">
              {countAkanBerakhir + countMasaTenggang}{' '}
              <span className="text-xs font-normal text-slate-500">akun</span>
            </h4>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex border-b border-slate-200 gap-1 bg-white px-2 rounded-t-xl border-x overflow-x-auto">
        {[
          { key: 'aktif', label: 'Aktif', count: countAktif },
          { key: 'akan_berakhir', label: 'Akan Berakhir (7 hari)', count: countAkanBerakhir },
          { key: 'masa_tenggang', label: 'Masa Tenggang', count: countMasaTenggang },
          { key: 'berakhir', label: 'Berakhir', count: countBerakhir },
          { key: 'dibatalkan', label: 'Dibatalkan', count: countDibatalkan },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-[#1F4E79] text-[#1F4E79]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === tab.key
                  ? 'bg-[#1F4E79]/10 text-[#1F4E79] font-bold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari ID Langganan, nama pelanggan, paket..."
        searchValue={search}
        onSearchChange={setSearch}
        productOptions={plans.map((p) => ({ label: p.name, value: p.id }))}
        selectedProduct={planFilter}
        onProductChange={setPlanFilter}
        hasActiveFilters={Boolean(search || planFilter !== 'all' || sourceFilter !== 'all')}
        onReset={() => {
          setSearch('');
          setPlanFilter('all');
          setSourceFilter('all');
        }}
      />

      {/* Table */}
      <DataTable
        data={filteredSubscriptions}
        columns={columns}
        keyExtractor={(s) => s.id}
        pageSize={10}
      />
    </div>
  );
};
