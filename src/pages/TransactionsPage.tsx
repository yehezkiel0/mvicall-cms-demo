import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  X,
  Info,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PhoneText } from '../components/common/PhoneText';
import { formatRupiah } from '../data/dummy';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    selectedTxId,
    setSelectedTxId,
    subView,
    setSubView,
    recheckTransaction,
    processRefundRevoke,
    requestConfirmation,
    canPerformAction,
    role,
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');

  // Filter transactions based on current subview and bar filters
  const currentFilteredTx = useMemo(() => {
    return transactions.filter((t) => {
      // Subview filter
      if (subView === 'refund' && t.status !== 'refund') return false;
      if (subView === 'problems' && !t.problemType) return false;

      // Search match
      const matchSearch =
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.userName.toLowerCase().includes(search.toLowerCase()) ||
        t.userPhone.includes(search) ||
        t.productName.toLowerCase().includes(search.toLowerCase());

      // Status match
      const matchStatus =
        statusFilter === 'all' || t.status === statusFilter;

      // Method match
      const matchMethod =
        methodFilter === 'all' ||
        (methodFilter === 'gp' && t.method === 'Google Play') ||
        (methodFilter === 'sdp' && t.method.startsWith('SDP'));

      // Product match
      const matchProduct =
        productFilter === 'all' || t.productId === productFilter;

      return matchSearch && matchStatus && matchMethod && matchProduct;
    });
  }, [transactions, subView, search, statusFilter, methodFilter, productFilter]);

  const selectedTx = useMemo(() => {
    return transactions.find((t) => t.id === selectedTxId) || null;
  }, [transactions, selectedTxId]);

  // CSV Export feature
  const handleExportCsv = () => {
    const headers = [
      'Order ID',
      'ID User',
      'Nama User',
      'Nomor HP',
      'Produk',
      'Nominal (Rp)',
      'Metode',
      'Status',
      'Status Verifikasi',
      'Acknowledge',
      'Waktu Transaksi',
    ];

    const rows = currentFilteredTx.map((t) => [
      `"${t.id}"`,
      `"${t.userId}"`,
      `"${t.userName}"`,
      `"${t.userPhone}"`,
      `"${t.productName}"`,
      t.nominal,
      `"${t.method}"`,
      `"${t.status}"`,
      `"${t.verificationStatus}"`,
      `"${t.acknowledgeStatus}"`,
      `"${t.createdAt}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `mvicall_transaksi_${subView}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Re-verify action with Confirmation & Alasan
  const handleRecheck = (tx: Transaction) => {
    requestConfirmation({
      title: `Verifikasi Ulang Transaksi ${tx.id}?`,
      description: `Sistem akan memicu sinkronisasi manual ke API Google Play Store / Gateway SDP untuk memvalidasi token dan memulihkan akses produk '${tx.productName}' untuk ${tx.userName}.`,
      confirmLabel: 'Jalankan Verifikasi Ulang',
      isDestructive: false,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan verifikasi ulang...',
      suggestedReasons: [
        'Komplain pelanggan melalui CS: bukti bayar sah',
        'Rekonsiliasi gateway: delay webhook Google Play',
        'Penyelesaian tiket investigasi kendala SDP',
      ],
      onConfirm: (reason) => recheckTransaction(tx.id, reason),
    });
  };

  const handleRevokeRefund = (tx: Transaction) => {
    requestConfirmation({
      title: `Proses Pencabutan Aset Refund ${tx.id}?`,
      description: `Akses fitur VIP atau bonus koin yang telah diberikan sebelumnya akan dibekukan / dicabut secara permanen.`,
      confirmLabel: 'Cabut Aset',
      isDestructive: true,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan pencabutan hak akses...',
      suggestedReasons: [
        'Google Play Chargeback resmi diverifikasi oleh tim Finance',
        'Klaim pengembalian dana disetujui tanpa pengembalian produk',
      ],
      onConfirm: (reason) => processRefundRevoke(tx.id, reason),
    });
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Order ID',
      sortable: true,
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">
            {t.id}
          </span>
          {t.problemType && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded mt-0.5 inline-block">
              {t.problemType === 'sudah_bayar_belum_aktif'
                ? 'Sudah Bayar, Belum Aktif'
                : 'Menggantung > 1 Jam'}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'Pengguna',
      sortable: true,
      render: (t) => (
        <div>
          <span className="font-semibold text-slate-800 block">{t.userName}</span>
          <PhoneText phone={t.userPhone} className="text-[11px] text-slate-500" />
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'Produk',
      sortable: true,
      render: (t) => (
        <span className="text-xs font-medium text-slate-700 block max-w-xs truncate">
          {t.productName}
        </span>
      ),
    },
    {
      key: 'nominal',
      header: 'Nominal',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {formatRupiah(t.nominal)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Metode',
      sortable: true,
      render: (t) => (
        <span className="text-xs font-medium text-slate-600">
          {t.method}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'createdAt',
      header: 'Waktu Transaksi',
      sortable: true,
      render: (t) => (
        <span className="font-mono text-xs text-slate-500 tabular-nums">
          {t.createdAt}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      align: 'right',
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedTxId(t.id);
          }}
          className="px-2.5 py-1 text-xs font-semibold text-[#1F4E79] hover:bg-[#1F4E79]/10 rounded-md transition-colors"
        >
          {t.problemType ? 'Tindak Lanjut' : 'Detail'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Riwayat Transaksi & Pembayaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen order in-app purchase Google Play Billing & SDP Operator (Telkomsel, Indosat, XL Axiata).
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          <button
            onClick={() => setSubView('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subView === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Transaksi
          </button>
          <button
            onClick={() => setSubView('refund')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              subView === 'refund'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Refund ({transactions.filter((t) => t.status === 'refund').length})
          </button>
          <button
            onClick={() => setSubView('problems')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              subView === 'problems'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Kasus Bermasalah</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-1.5 py-0.2 rounded font-bold">
              {transactions.filter((t) => t.problemType).length}
            </span>
          </button>
        </div>
      </div>

      {/* Info notice for Problem Cases if active */}
      {subView === 'problems' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Antrian Kasus Transaksi Bermasalah</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Terdapat pesanan dengan indikasi "Sudah bayar, belum aktif" atau webhook "Menggantung &gt; 1 jam". Gunakan tombol <strong>Tindak Lanjut</strong> untuk memeriksa detail order dan menjalankan <strong>Verifikasi Ulang</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari Order ID (GPA.xxxx / SDP.xxxx), nama user, produk..."
        searchValue={search}
        onSearchChange={setSearch}
        statusOptions={
          subView === 'refund' || subView === 'problems'
            ? undefined
            : [
                { label: 'Berhasil', value: 'berhasil' },
                { label: 'Pending', value: 'pending' },
                { label: 'Refund', value: 'refund' },
                { label: 'Gagal', value: 'gagal' },
              ]
        }
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        productOptions={[
          { label: 'Mingguan 7 Hari', value: 'subs_weekly' },
          { label: 'Hemat 30 Hari', value: 'subs_30days' },
          { label: 'Bulanan Reguler', value: 'subs_monthly' },
          { label: '3 Bulan VIP', value: 'subs_3month' },
          { label: 'Koin 3.000 IAP', value: 'gpay_3000' },
          { label: 'Pack Populer IAP', value: 'gpay_10000' },
        ]}
        selectedProduct={productFilter}
        onProductChange={setProductFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportCsv={handleExportCsv}
        hasActiveFilters={Boolean(
          search ||
            statusFilter !== 'all' ||
            methodFilter !== 'all' ||
            productFilter !== 'all'
        )}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setMethodFilter('all');
          setProductFilter('all');
        }}
      />

      {/* Data Table */}
      <DataTable
        data={currentFilteredTx}
        columns={columns}
        keyExtractor={(t) => t.id}
        pageSize={12}
        onRowClick={(t) => setSelectedTxId(t.id)}
      />

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    {selectedTx.id}
                  </h3>
                  <StatusBadge status={selectedTx.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Transaksi dilakukan oleh <strong>{selectedTx.userName}</strong> (
                  <PhoneText phone={selectedTx.userPhone} />)
                </p>
              </div>

              <button
                onClick={() => setSelectedTxId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Status Banner if Problem */}
              {selectedTx.problemType && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {selectedTx.problemType === 'sudah_bayar_belum_aktif'
                        ? 'Indikasi: Pembayaran berhasil terpotong namun callback API belum mengaktifkan langganan.'
                        : 'Indikasi: Transaksi menggantung lebih dari 1 jam tanpa acknowledgment.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Grid detail */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block">Produk Pembelian</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedTx.productName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nominal Tagihan</span>
                  <span className="font-semibold font-mono text-slate-900 mt-0.5 block">
                    {formatRupiah(selectedTx.nominal)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kanal Pembayaran</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedTx.method}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status Verifikasi</span>
                  <span
                    className={`font-semibold mt-0.5 block ${
                      selectedTx.verificationStatus === 'Terverifikasi'
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {selectedTx.verificationStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Google Acknowledge</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                    {selectedTx.acknowledgeStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Masa Berlaku Paket</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                    {selectedTx.expireDate || 'Satu Kali Pembelian (IAP)'}
                  </span>
                </div>
              </div>

              {/* Purchase Token */}
              <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono break-all text-slate-600">
                <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block mb-1">
                  Purchase Token Gateway (Secure Hash)
                </span>
                {selectedTx.token}
              </div>

              {/* Refund revocation info if refund */}
              {selectedTx.status === 'refund' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                  <p className="font-bold text-rose-900 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Pencabutan Aset / Revocation Status
                  </p>
                  <p className="text-rose-800 mt-1">
                    {selectedTx.revokedItems ||
                      'Aset belum dicabut secara otomatis oleh sistem.'}
                  </p>
                  {canPerformAction() && !selectedTx.revokedItems && (
                    <button
                      onClick={() => handleRevokeRefund(selectedTx)}
                      className="mt-2 px-3 py-1 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700"
                    >
                      Cabut Hak Akses Manual
                    </button>
                  )}
                </div>
              )}

              {/* Timeline of Status Changes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Kronologi Perubahan Status (Audit Trail)
                </h4>

                <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                  {selectedTx.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-[#1F4E79] border-2 border-white shadow-xs" />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {step.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                            {step.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {step.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Terverifikasi via SHA256 API Handshake
              </span>

              <div className="flex items-center gap-2">
                {/* CS / Super Admin can perform "Verifikasi Ulang" */}
                {canPerformAction('recheck_transaction') && (
                  <button
                    onClick={() => handleRecheck(selectedTx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1F4E79] hover:bg-[#163a5c] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Verifikasi Ulang</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedTxId(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
