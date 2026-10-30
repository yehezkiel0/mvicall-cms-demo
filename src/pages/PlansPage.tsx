import React, { useState } from 'react';
import {
  Tag,
  Edit2,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Plan, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatRupiah } from '../data/dummy';

export const PlansPage: React.FC = () => {
  const {
    plans,
    updatePlan,
    togglePlanActive,
    requestConfirmation,
    canPerformAction,
    role,
  } = useApp();

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formDurationDays, setFormDurationDays] = useState<number>(0);
  const [formBonusPoints, setFormBonusPoints] = useState<number>(0);
  const [formSku, setFormSku] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const openEditDrawer = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormPrice(plan.price);
    setFormDurationDays(plan.durationDays);
    setFormBonusPoints(plan.bonusPoints);
    setFormSku(plan.sku);
    setFormIsActive(plan.isActive);
  };

  const handleToggleActive = (plan: Plan) => {
    const nextState = !plan.isActive;
    requestConfirmation({
      title: `${nextState ? 'Aktifkan' : 'Nonaktifkan'} ${plan.name}?`,
      description: nextState
        ? `Paket ini akan kembali ditampilkan di antarmuka pembelian aplikasi MViCall.`
        : `Paket ini akan disembunyikan dari aplikasi pengguna. Pelanggan lama yang sudah aktif tetap dapat menikmati masa berlakunya.`,
      confirmLabel: nextState ? 'Aktifkan Paket' : 'Nonaktifkan',
      isDestructive: !nextState,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan perubahan status paket...',
      suggestedReasons: [
        'Rotasi promo paket bulanan reguler',
        'Penyesuaian strategi harga Q4',
        'Penarikan sementara untuk maintenance SKU',
      ],
      onConfirm: (reason) => togglePlanActive(plan.id, reason),
    });
  };

  const handleSaveDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    requestConfirmation({
      title: `Simpan Perubahan ${editingPlan.name}?`,
      description: `Perubahan nama, harga (${formatRupiah(formPrice)}), dan bonus poin (${formBonusPoints}) akan langsung diterapkan pada katalog paket.`,
      confirmLabel: 'Simpan Perubahan',
      isDestructive: false,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan perubahan data paket...',
      suggestedReasons: [
        'Penyesuaian harga promo akhir tahun',
        'Koreksi SKU Google Play Billing Library',
        'Peningkatan bonus poin loyalitas pengguna',
      ],
      onConfirm: (reason) => {
        updatePlan(
          {
            ...editingPlan,
            name: formName,
            price: Number(formPrice),
            durationDays: Number(formDurationDays),
            bonusPoints: Number(formBonusPoints),
            sku: formSku,
            isActive: formIsActive,
          },
          reason
        );
        setEditingPlan(null);
      },
    });
  };

  const isAllowedToEdit = canPerformAction();

  const columns: Column<Plan>[] = [
    {
      key: 'name',
      header: 'Nama Paket',
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-semibold text-slate-900 block text-xs">
            {p.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
        </div>
      ),
    },
    {
      key: 'durationDays',
      header: 'Durasi Masa Aktif',
      sortable: true,
      render: (p) => (
        <span className="text-xs text-slate-700 font-medium">
          {p.durationLabel} ({p.durationDays} hari)
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Harga (Rupiah)',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {formatRupiah(p.price)}
        </span>
      ),
    },
    {
      key: 'bonusPoints',
      header: 'Bonus Poin',
      sortable: true,
      align: 'center',
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-mono">
          <Sparkles className="w-3 h-3" />+{p.bonusPoints}
        </span>
      ),
    },
    {
      key: 'sku',
      header: 'SKU Google Play',
      render: (p) => (
        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {p.sku}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status Aktif',
      align: 'center',
      render: (p) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isAllowedToEdit) handleToggleActive(p);
          }}
          disabled={!isAllowedToEdit}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            !isAllowedToEdit ? 'opacity-50 cursor-not-allowed' : ''
          } ${p.isActive ? 'bg-[#1F4E79]' : 'bg-slate-300'}`}
          title={isAllowedToEdit ? 'Klik untuk mengubah status' : 'Izin terbatas'}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              p.isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (p) => (
        <button
          onClick={() => isAllowedToEdit && openEditDrawer(p)}
          disabled={!isAllowedToEdit}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
            isAllowedToEdit
              ? 'text-[#1F4E79] hover:bg-[#1F4E79]/10'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Paket & Penyesuaian Harga
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar paket berlangganan MViCall, durasi masa aktif, bonus poin reward, dan sinkronisasi SKU Google Play Console.
          </p>
        </div>
      </div>

      {/* Info Notice about Google Play sync */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
        <Layers className="w-4 h-4 text-[#1F4E79] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">
            Kebijakan Perubahan Paket & Harga
          </p>
          <p className="text-slate-600 leading-relaxed">
            Perubahan harga pada paket berlangganan harus sinkron dengan produk langganan di Google Play Console. Semua perubahan status dan tarif dicatat dalam Log Audit CMS beserta alasan tindakan.
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={plans}
        columns={columns}
        keyExtractor={(p) => p.id}
        pageSize={10}
      />

      {/* Slide-over Side Drawer for Editing Plan */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#1F4E79]/10 text-[#1F4E79] rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit {editingPlan.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {editingPlan.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDrawer} className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Tampilan Paket
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Harga (Rupiah)
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Durasi (Hari)
                  </label>
                  <input
                    type="number"
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bonus Poin Loyalitas
                  </label>
                  <input
                    type="number"
                    value={formBonusPoints}
                    onChange={(e) => setFormBonusPoints(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product SKU (Google Play Console)
                </label>
                <input
                  type="text"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Status Aktif Paket</p>
                  <p className="text-[11px] text-slate-400">Tampilkan pada antarmuka beli aplikasi</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsActive ? 'bg-[#1F4E79]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Disabled Free Trial Field (Segera) */}
              <div className="p-3 bg-slate-100/70 border border-dashed border-slate-300 rounded-lg opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">
                      Uji Coba Gratis / Free Trial
                    </span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                      Segera
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    disabled
                    checked={false}
                    className="cursor-not-allowed opacity-50"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Fitur masa percobaan otomatis 3 hari untuk pengguna baru akan tersedia pada update backend versi 2.5 (Segera hadir).
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#1F4E79] hover:bg-[#163a5c] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Lanjut ke Konfirmasi
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
