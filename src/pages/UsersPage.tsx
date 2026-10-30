import React, { useState, useMemo } from 'react';
import {
  User as UserIcon,
  Smartphone,
  Calendar,
  CreditCard,
  Ban,
  LogOut,
  Coins,
  Video,
  ShoppingBag,
  ExternalLink,
  X,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PhoneText } from '../components/common/PhoneText';
import { formatRupiah } from '../data/dummy';

export const UsersPage: React.FC = () => {
  const {
    users,
    transactions,
    selectedUserId,
    setSelectedUserId,
    blockUser,
    unblockUser,
    forceLogoutUser,
    requestConfirmation,
    canPerformAction,
    role,
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'purchases' | 'content' | 'points' | 'videotone'>('profile');

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search) ||
        u.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || u.statusLangganan === statusFilter;

      const matchSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'gp' && u.sumber === 'Google Play') ||
        (sourceFilter === 'sdp' && u.sumber.startsWith('SDP')) ||
        (sourceFilter === 'none' && u.sumber === '—');

      return matchSearch && matchStatus && matchSource;
    });
  }, [users, search, statusFilter, sourceFilter]);

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // User's transactions
  const userTransactions = useMemo(() => {
    if (!selectedUser) return [];
    return transactions.filter((t) => t.userId === selectedUser.id);
  }, [transactions, selectedUser]);

  // Actions with Confirmation & Alasan
  const handleBlockToggle = (u: User) => {
    if (u.isBlocked) {
      requestConfirmation({
        title: `Buka Blokir Akun ${u.name}?`,
        description: `Pengguna ${u.name} (${u.id}) akan dapat kembali masuk dan menggunakan layanan videotone MViCall.`,
        confirmLabel: 'Buka Blokir',
        isDestructive: false,
        requireReason: true,
        reasonPlaceholder: 'Contoh: Verifikasi identitas selesai, pengguna telah menyetujui pedoman.',
        suggestedReasons: [
          'Verifikasi kepemilikan nomor telepon telah valid via CS',
          'Sanksi pembekuan sementara telah selesai',
          'Permintaan pembukaan blokir disetujui tim Trust & Safety',
        ],
        onConfirm: (reason) => unblockUser(u.id, reason),
      });
    } else {
      requestConfirmation({
        title: `Blokir Akun ${u.name}?`,
        description: `Pengguna ${u.name} (${u.id}) akan diblokir dari sistem. Pengguna tidak akan dapat melakukan panggilan videotone atau login.`,
        confirmLabel: 'Blokir Akun',
        isDestructive: true,
        requireReason: true,
        reasonPlaceholder: 'Tuliskan alasan pemblokiran akun...',
        suggestedReasons: [
          'Pelanggaran pedoman komunitas & upload konten terlarang',
          'Terindikasi aktivitas fraud / spam panggilan berulang',
          'Laporan penyalahgunaan dari multiple operator telekomunikasi',
        ],
        onConfirm: (reason) => blockUser(u.id, reason),
      });
    }
  };

  const handleForceLogout = (u: User) => {
    requestConfirmation({
      title: `Logout Paksa Akun ${u.name}?`,
      description: `Seluruh refresh token dan sesi login pengguna ${u.name} (${u.id}) di semua perangkat akan dicabut seketika.`,
      confirmLabel: 'Logout Paksa Sesi',
      isDestructive: true,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan pemutusan sesi...',
      suggestedReasons: [
        'Deteksi login mencurigakan pada perangkat baru',
        'Permintaan pengguna via CS akibat ponsel hilang/dicuri',
        'Reset keamanan berkala sesi pengguna',
      ],
      onConfirm: (reason) => forceLogoutUser(u.id, reason),
    });
  };

  // Columns definition
  const columns: Column<User>[] = [
    {
      key: 'id',
      header: 'ID Pengguna',
      sortable: true,
      width: '120px',
      render: (u) => (
        <span className="font-mono text-xs font-semibold text-slate-800">
          {u.id}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Nomor Telepon',
      sortable: true,
      render: (u) => <PhoneText phone={u.phone} className="text-xs font-semibold" />,
    },
    {
      key: 'name',
      header: 'Nama Pengguna',
      sortable: true,
      render: (u) => (
        <div>
          <span className="font-semibold text-slate-900 block">{u.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
        </div>
      ),
    },
    {
      key: 'statusLangganan',
      header: 'Status Langganan',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge status={u.statusLangganan} />
          {u.isBlocked && (
            <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-mono">
              Diblokir
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'sumber',
      header: 'Sumber Pembayaran',
      sortable: true,
      render: (u) => (
        <span className="text-xs font-medium text-slate-700">
          {u.sumber}
        </span>
      ),
    },
    {
      key: 'tanggalDaftar',
      header: 'Tanggal Daftar',
      sortable: true,
      render: (u) => (
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          {u.tanggalDaftar}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (u) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUserId(u.id);
          }}
          className="px-2.5 py-1 text-xs font-semibold text-[#1F4E79] hover:bg-[#1F4E79]/10 rounded-md transition-colors"
        >
          Lihat Detail
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Pengguna</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar seluruh akun pengguna MViCall, status langganan, dan verifikasi profil pemanggil.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total Terdaftar:{' '}
          <span className="font-bold text-slate-900">{users.length}</span> user
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari berdasarkan nama, nomor telepon (08xx), atau ID..."
        searchValue={search}
        onSearchChange={setSearch}
        statusOptions={[
          { label: 'Aktif', value: 'aktif' },
          { label: 'Masa Tenggang', value: 'masa_tenggang' },
          { label: 'Berakhir', value: 'berakhir' },
          { label: 'Trial', value: 'trial' },
          { label: 'Non-Aktif', value: 'none' },
        ]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        productOptions={[
          { label: 'Google Play', value: 'gp' },
          { label: 'SDP Operator (Telkomsel/Indosat/XL)', value: 'sdp' },
          { label: 'Tanpa Langganan (—)', value: 'none' },
        ]}
        selectedProduct={sourceFilter}
        onProductChange={setSourceFilter}
        hasActiveFilters={Boolean(search || statusFilter !== 'all' || sourceFilter !== 'all')}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setSourceFilter('all');
        }}
      />

      {/* Data Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        pageSize={10}
        onRowClick={(u) => setSelectedUserId(u.id)}
      />

      {/* User Detail Slide-over / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header profile info */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#1F4E79] text-white flex items-center justify-center text-lg font-bold shadow-xs">
                  {selectedUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedUser.name}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">
                      {selectedUser.id}
                    </span>
                    <StatusBadge status={selectedUser.statusLangganan} />
                    {selectedUser.isBlocked && (
                      <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded uppercase">
                        Akun Diblokir
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <PhoneText phone={selectedUser.phone} className="font-semibold text-slate-700" />
                    <span>·</span>
                    <span>{selectedUser.operator}</span>
                    <span>·</span>
                    <span>Daftar: {selectedUser.tanggalDaftar}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons (Subject to role permissions) */}
              <div className="flex items-center gap-2">
                {canPerformAction() && (
                  <>
                    <button
                      onClick={() => handleBlockToggle(selectedUser)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                        selectedUser.isBlocked
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{selectedUser.isBlocked ? 'Buka Blokir' : 'Blokir'}</span>
                    </button>
                    <button
                      onClick={() => handleForceLogout(selectedUser)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-500" />
                      <span>Logout Paksa</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedUserId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200 px-5 gap-1 bg-white overflow-x-auto">
              {[
                { key: 'profile', label: 'Profil' },
                { key: 'subscription', label: 'Langganan' },
                { key: 'purchases', label: `Pembelian (${userTransactions.length})` },
                { key: 'content', label: `Konten Dimiliki (${selectedUser.videotoneCount})` },
                { key: 'points', label: `Poin (${selectedUser.saldoPoin})` },
                { key: 'videotone', label: 'Videotone / VRBT' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-[#1F4E79] text-[#1F4E79]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: PROFIL */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Informasi Kontak & Akun
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {selectedUser.email}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Nomor Telepon:</span>
                        <PhoneText phone={selectedUser.phone} className="font-semibold" />
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Operator Seluler:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedUser.operator}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Tanggal Terdaftar:</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {selectedUser.tanggalDaftar}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Perangkat & Keamanan
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Model Perangkat:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedUser.deviceModel}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">Sistem Operasi:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedUser.osVersion}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/50">
                        <span className="text-slate-500">IP Terakhir Terdeteksi:</span>
                        <span className="font-mono text-slate-800 font-semibold">
                          {selectedUser.lastIp}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Status Keamanan:</span>
                        <span
                          className={`font-semibold ${
                            selectedUser.isBlocked ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {selectedUser.isBlocked ? 'Terblokir' : 'Normal / Terverifikasi'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LANGGANAN */}
              {activeTab === 'subscription' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500">
                          Paket Langganan Aktif
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {selectedUser.activePlanName || 'Tidak Ada Paket Aktif'}
                        </h4>
                      </div>
                      <StatusBadge status={selectedUser.statusLangganan} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400 block">Metode Pembayaran</span>
                        <span className="font-semibold text-slate-800 mt-0.5 block">
                          {selectedUser.sumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Berakhir Pada</span>
                        <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                          {selectedUser.activePlanExpire || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Perpanjangan Otomatis</span>
                        <span className="font-semibold text-emerald-600 mt-0.5 block">
                          {selectedUser.statusLangganan === 'aktif' ? 'Aktif (Auto-Renew)' : 'Non-Aktif'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Status Gateway</span>
                        <span className="font-semibold text-slate-800 mt-0.5 block">
                          Sinkron (200 OK)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PEMBELIAN */}
              {activeTab === 'purchases' && (
                <div className="space-y-3">
                  {userTransactions.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">
                      Belum ada riwayat transaksi untuk pengguna ini.
                    </p>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                          <tr>
                            <th className="px-3 py-2.5">Order ID</th>
                            <th className="px-3 py-2.5">Produk</th>
                            <th className="px-3 py-2.5">Nominal</th>
                            <th className="px-3 py-2.5">Metode</th>
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-3 py-2.5">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {userTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50">
                              <td className="px-3 py-2.5 font-semibold text-slate-800">
                                {tx.id}
                              </td>
                              <td className="px-3 py-2.5 font-sans font-medium text-slate-700">
                                {tx.productName}
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-slate-900">
                                {formatRupiah(tx.nominal)}
                              </td>
                              <td className="px-3 py-2.5 font-sans text-slate-600">
                                {tx.method}
                              </td>
                              <td className="px-3 py-2.5">
                                <StatusBadge status={tx.status} />
                              </td>
                              <td className="px-3 py-2.5 text-slate-500 tabular-nums">
                                {tx.createdAt}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: KONTEN DIMILIKI */}
              {activeTab === 'content' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Sialan (Cover Akustik)
                        </span>
                        <span className="text-[11px] text-slate-500">Mahalini · Pop Indonesia</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                        Aktif Ringtone
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Komang (Official Videotone)
                        </span>
                        <span className="text-[11px] text-slate-500">Raim Laode · Pop</span>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        Tersimpan di Galeri
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: POIN */}
              {activeTab === 'points' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-[#1F4E79] to-blue-900 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-blue-200 block">Saldo Poin MViCall Reward</span>
                      <h4 className="text-2xl font-bold font-mono tabular-nums mt-0.5">
                        {selectedUser.saldoPoin} Poin
                      </h4>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <Coins className="w-6 h-6 text-amber-300" />
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
                    <h5 className="font-bold text-slate-700">Riwayat Perolehan Poin</h5>
                    <div className="divide-y divide-slate-100">
                      <div className="py-2 flex justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">Bonus Perpanjangan Paket Bulanan</p>
                          <p className="text-[10px] text-slate-400">28 Okt 2026 14:10</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">+40 Poin</span>
                      </div>
                      <div className="py-2 flex justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">Daily Login Reward Streak 7 Hari</p>
                          <p className="text-[10px] text-slate-400">25 Okt 2026 08:30</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">+10 Poin</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: VIDEOTONE/VRBT */}
              {activeTab === 'videotone' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Konfigurasi Videotone Pemanggil (Outgoing Ringtone)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Video yang otomatis diputar di layar teman ketika pengguna ini menelepon:
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#1F4E79] text-white flex items-center justify-center font-bold text-xs">
                          MP4
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Sialan (Cover Akustik)</p>
                          <p className="text-[11px] text-slate-500">Durasi: 28 Detik · Resolusi 1080x1920 (9:16)</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">Aktif untuk Semua Panggilan</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Video Ring Back Tone (VRBT Incoming)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Video yang dilihat oleh orang lain saat menghubungi nomor pengguna ini:
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-indigo-700 text-white flex items-center justify-center font-bold text-xs">
                          VRBT
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Default Telkomsel SDP Visualizer</p>
                          <p className="text-[11px] text-slate-500">Standard Audio-Visual Sync</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">Aktif</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedUserId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
