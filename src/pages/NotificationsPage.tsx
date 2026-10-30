import React, { useState } from 'react';
import {
  Bell,
  Send,
  Calendar,
  Smartphone,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PushNotification, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    sendNotification,
    requestConfirmation,
    canPerformAction,
    role,
  } = useApp();

  const [title, setTitle] = useState<string>('Ada Videotone Koplo Baru Untukmu! 🎵');
  const [content, setContent] = useState<string>(
    'Yuk cek lagu Rungkad remix dan 20+ video viral terbaru di marketplace MViCall hari ini.'
  );
  const [target, setTarget] = useState<'all' | 'subs' | 'non_subs' | 'custom'>('all');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduledAt, setScheduledAt] = useState<string>('30 Okt 2026 10:00');

  const isAllowedToSend = canPerformAction();

  const targetLabels: Record<string, string> = {
    all: 'Semua Pengguna (~95.000 akun)',
    subs: 'Pelanggan Aktif (~14.000 akun)',
    non_subs: 'Pengguna Non-Pelanggan (~52.000 akun)',
    custom: `Nomor Tertentu (${customPhone || '08xx'})`,
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    requestConfirmation({
      title: `${scheduleType === 'now' ? 'Kirim Notifikasi Push Sekarang' : 'Jadwalkan Notifikasi Push'}?`,
      description: `Notifikasi push "${title}" akan disiarkan ke ${targetLabels[target]}.`,
      confirmLabel: scheduleType === 'now' ? 'Kirim Sekarang' : 'Jadwalkan',
      isDestructive: false,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan penyiaran pesan push...',
      suggestedReasons: [
        'Kampanye pengumuman konten viral terbaru',
        'Promosi diskon perpanjangan paket VIP',
        'Pemberitahuan pembaruan versi aplikasi penting',
      ],
      onConfirm: (reason) => {
        sendNotification(
          {
            title: title.trim(),
            content: content.trim(),
            target,
            targetLabel: targetLabels[target],
            customPhone: target === 'custom' ? customPhone : undefined,
            scheduleType,
            scheduledAt: scheduleType === 'scheduled' ? scheduledAt : undefined,
            status: scheduleType === 'now' ? 'terkirim' : 'terjadwal',
          },
          reason
        );
        // Reset form
        setTitle('');
        setContent('');
      },
    });
  };

  const columns: Column<PushNotification>[] = [
    {
      key: 'title',
      header: 'Judul & Pesan Notifikasi',
      sortable: true,
      render: (n) => (
        <div className="max-w-md">
          <span className="font-semibold text-slate-900 block text-xs">
            {n.title}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {n.content}
          </p>
        </div>
      ),
    },
    {
      key: 'targetLabel',
      header: 'Sasaran Pengguna',
      sortable: true,
      render: (n) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
          {n.targetLabel}
        </span>
      ),
    },
    {
      key: 'sentAt',
      header: 'Waktu Kirim / Jadwal',
      sortable: true,
      render: (n) => (
        <span className="font-mono text-xs text-slate-600 tabular-nums">
          {n.scheduleType === 'scheduled' ? `Jadwal: ${n.scheduledAt}` : n.sentAt}
        </span>
      ),
    },
    {
      key: 'delivery',
      header: 'Penerima / Dibaca',
      align: 'center',
      render: (n) => (
        <div className="text-xs font-mono">
          <span className="font-bold text-slate-800">
            {n.readCount.toLocaleString('id-ID')}
          </span>
          <span className="text-slate-400">
            {' '}/ {n.sentCount.toLocaleString('id-ID')}
          </span>
          {n.sentCount > 0 && n.readCount > 0 && (
            <span className="block text-[10px] text-emerald-600 font-semibold">
              {((n.readCount / n.sentCount) * 100).toFixed(1)}% rasio buka
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (n) => <StatusBadge status={n.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Notifikasi Push Broadcast
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kirim pengumuman langsung ke notification drawer ponsel pengguna Android & iOS MViCall.
        </p>
      </div>

      {/* Top 2-Column Section: Form + Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1F4E79]" />
            Buat Notifikasi Baru
          </h3>

          <form onSubmit={handleSendSubmit} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Judul Notifikasi
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tuliskan judul singkat yang menarik perhatian..."
                required
                maxLength={65}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 block text-right mt-0.5 font-mono">
                {title.length}/65 karakter
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Isi Pesan Notifikasi
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan isi pesan promosi atau pemberitahuan..."
                required
                maxLength={180}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 block text-right mt-0.5 font-mono">
                {content.length}/180 karakter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Audiens
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                >
                  <option value="all">Semua Pengguna</option>
                  <option value="subs">Hanya Pelanggan Aktif</option>
                  <option value="non_subs">Pengguna Non-Langganan</option>
                  <option value="custom">Nomor Tertentu (Khusus)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Waktu Penyiaran
                </label>
                <select
                  value={scheduleType}
                  onChange={(e) => setScheduleType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                >
                  <option value="now">Kirim Sekarang</option>
                  <option value="scheduled">Jadwalkan Kirim</option>
                </select>
              </div>
            </div>

            {target === 'custom' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor HP Penerima (08xx / 628xx)
                </label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Contoh: 08129841284"
                  required
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                />
              </div>
            )}

            {scheduleType === 'scheduled' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Waktu Jadwal Pengiriman
                </label>
                <input
                  type="text"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  placeholder="Contoh: 31 Okt 2026 09:00"
                  required
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!isAllowedToSend}
                className={`inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-semibold text-white shadow-xs transition-colors ${
                  !isAllowedToSend
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-[#1F4E79] hover:bg-[#163a5c] cursor-pointer'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {scheduleType === 'now'
                    ? 'Kirim Notifikasi Push'
                    : 'Jadwalkan Notifikasi'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Phone Notification Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#1F4E79]" />
                Pratinjau Layar Ponsel Pengguna
              </div>
              <span className="text-[10px] font-mono text-slate-400">Android 14 UI</span>
            </h3>

            {/* Mobile Mock Container */}
            <div className="mt-4 max-w-xs mx-auto bg-slate-900 rounded-3xl p-3 border-4 border-slate-800 shadow-xl text-white">
              {/* Phone Status bar */}
              <div className="flex items-center justify-between px-2 pt-1 pb-3 text-[10px] font-mono text-slate-300">
                <span>21:09</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span>98%</span>
                </div>
              </div>

              {/* Notification Banner */}
              <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-3 border border-slate-700/60 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#1F4E79] flex items-center justify-center text-[9px] font-bold text-white">
                      M
                    </div>
                    <span className="font-semibold text-slate-200">MViCall</span>
                    <span className="text-[10px] text-slate-400">· baru saja</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-white leading-tight">
                    {title || 'Judul notifikasi akan muncul di sini...'}
                  </h5>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {content || 'Pesan notifikasi Anda akan terlihat seperti ini pada layar pengguna.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded">
                    Buka Aplikasi
                  </span>
                  <span className="text-[10px] text-slate-400">Abaikan</span>
                </div>
              </div>

              <div className="py-8 text-center text-slate-600 text-[10px]">
                Layar Terkunci (Lock Screen)
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            Tampilan disesuaikan otomatis dengan antarmuka sistem Android dan iOS.
          </p>
        </div>
      </div>

      {/* Notification History Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-800">
          Riwayat Pengiriman Notifikasi
        </h3>
        <DataTable
          data={notifications}
          columns={columns}
          keyExtractor={(n) => n.id}
          pageSize={6}
        />
      </div>
    </div>
  );
};
