import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Ban,
  Link2,
  Link2Off,
  Play,
  Pause,
  AlertTriangle,
  User,
  Clock,
  Eye,
  EyeOff,
  Filter,
  X,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModerationVideo, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PhoneText } from '../components/common/PhoneText';

export const VideoModerationPage: React.FC = () => {
  const {
    moderationVideos,
    approveVideo,
    takedownVideo,
    toggleShareLinkVideo,
    requestConfirmation,
    canPerformAction,
    setSelectedUserId,
    setActiveMenu,
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportedOnly, setReportedOnly] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<ModerationVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const isAllowedToModerate = canPerformAction();

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return moderationVideos.filter((v) => {
      const matchSearch =
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.uploaderName.toLowerCase().includes(search.toLowerCase()) ||
        v.uploaderPhone.includes(search) ||
        v.id.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || v.status === statusFilter;

      const matchReport = !reportedOnly || v.reportCount > 0;

      return matchSearch && matchStatus && matchReport;
    });
  }, [moderationVideos, search, statusFilter, reportedOnly]);

  const pendingCount = moderationVideos.filter((v) => v.status === 'pending').length;
  const reportedCount = moderationVideos.filter((v) => v.reportCount > 0).length;

  const handleApprove = (v: ModerationVideo) => {
    requestConfirmation({
      title: `Setujui Video "${v.title}"?`,
      description: `Video karya ${v.uploaderName} akan ditandai 'Disetujui' dan diizinkan tampil di feed Explore publik MViCall.`,
      confirmLabel: 'Setujui Video',
      isDestructive: false,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan persetujuan...',
      suggestedReasons: [
        'Konten orisinal, memenuhi pedoman komunitas MViCall',
        'Audio bebas dari klaim hak cipta dan ramah pengguna',
        'Laporan pengguna tidak terbukti melanggar ketentuan',
      ],
      onConfirm: (reason) => approveVideo(v.id, reason),
    });
  };

  const handleTakedown = (v: ModerationVideo) => {
    requestConfirmation({
      title: `Takedown Video "${v.title}"?`,
      description: `Video akan segera ditarik dari feed Explore publik dan link berbagi eksternal akan dinonaktifkan secara otomatis.`,
      confirmLabel: 'Takedown Video',
      isDestructive: true,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan penindakan takedown...',
      suggestedReasons: [
        'Pelanggaran hak cipta musik / rekaman tanpa lisensi',
        'Konten membahayakan, spam, atau materi terlarang (UU ITE)',
        'Laporan valid dari pengguna lebih dari 10 laporan',
      ],
      onConfirm: (reason) => takedownVideo(v.id, reason),
    });
  };

  const handleToggleShareLink = (v: ModerationVideo) => {
    const nextDisabled = !v.shareLinkDisabled;
    requestConfirmation({
      title: `${nextDisabled ? 'Nonaktifkan' : 'Aktifkan'} Link Share?`,
      description: nextDisabled
        ? `Tautan eksternal ke video "${v.title}" tidak akan dapat diakses oleh publik.`
        : `Tautan eksternal ke video "${v.title}" dapat kembali diakses.`,
      confirmLabel: nextDisabled ? 'Nonaktifkan Link' : 'Aktifkan Link',
      isDestructive: nextDisabled,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan perubahan status tautan...',
      suggestedReasons: [
        'Investigasi sementara terkait hak cipta',
        'Penyelesaian sengketa kepemilikan video',
      ],
      onConfirm: (reason) => toggleShareLinkVideo(v.id, reason),
    });
  };

  const columns: Column<ModerationVideo>[] = [
    {
      key: 'title',
      header: 'Pratinjau Video & Judul',
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPreviewVideo(v);
              setIsPlaying(false);
            }}
            className={`w-14 h-14 rounded-lg bg-gradient-to-br ${v.colorGradient} flex items-center justify-center text-white shrink-0 shadow-2xs group relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/45 transition-colors">
              <Play className="w-5 h-5 fill-white text-white opacity-90 group-hover:scale-110 transition-transform" />
            </div>
            <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 px-1 rounded">
              {v.durationSec}s
            </span>
          </button>
          <div>
            <span className="font-semibold text-slate-900 block text-xs">
              {v.title}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">ID: {v.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'uploaderName',
      header: 'Pengunggah (User)',
      sortable: true,
      render: (v) => (
        <div>
          <button
            onClick={() => {
              setSelectedUserId(v.uploaderId);
              setActiveMenu('users');
            }}
            className="font-semibold text-slate-800 hover:text-[#1F4E79] text-left block text-xs"
          >
            {v.uploaderName}
          </button>
          <PhoneText phone={v.uploaderPhone} className="text-[11px] text-slate-400" />
        </div>
      ),
    },
    {
      key: 'isPublic',
      header: 'Visibilitas',
      render: (v) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-medium text-slate-700 block">
            {v.isPublic ? 'Publik' : 'Pribadi'}
          </span>
          <span
            className={`text-[10px] block ${
              v.exploreVisible ? 'text-emerald-600 font-medium' : 'text-slate-400'
            }`}
          >
            {v.exploreVisible ? '✓ Masuk Explore' : '— Explore Off'}
          </span>
        </div>
      ),
    },
    {
      key: 'reportCount',
      header: 'Laporan Pengguna',
      sortable: true,
      align: 'center',
      render: (v) => (
        <div>
          {v.reportCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-mono font-bold">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              {v.reportCount} laporan
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-mono">0</span>
          )}
        </div>
      ),
    },
    {
      key: 'shareLinkDisabled',
      header: 'Link Berbagi',
      render: (v) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            v.shareLinkDisabled ? 'text-rose-600' : 'text-emerald-700'
          }`}
        >
          {v.shareLinkDisabled ? (
            <>
              <Link2Off className="w-3 h-3" /> Dinonaktifkan
            </>
          ) : (
            <>
              <Link2 className="w-3 h-3" /> Aktif
            </>
          )}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Moderasi',
      sortable: true,
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: 'actions',
      header: 'Tindakan',
      align: 'right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          {isAllowedToModerate && (
            <>
              {v.status !== 'approved' && (
                <button
                  onClick={() => handleApprove(v)}
                  className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                  title="Setujui video untuk tayang publik"
                >
                  Setujui
                </button>
              )}
              {v.status !== 'takedown' && (
                <button
                  onClick={() => handleTakedown(v)}
                  className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                  title="Takedown video karena pelanggaran"
                >
                  Takedown
                </button>
              )}
              <button
                onClick={() => handleToggleShareLink(v)}
                className="p-1 text-slate-500 hover:text-slate-800 rounded border border-slate-200 hover:bg-slate-50"
                title={
                  v.shareLinkDisabled
                    ? 'Aktifkan tautan share'
                    : 'Nonaktifkan tautan share'
                }
              >
                {v.shareLinkDisabled ? (
                  <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Link2Off className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Moderasi Konten Video Pengguna
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit keamanan video unggahan pengguna, kepatuhan hak cipta, laporan komunitas, dan kontrol Explore feed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 font-semibold px-2.5 py-1 rounded-lg font-mono">
            {pendingCount} Menunggu Tindakan
          </span>
          <span className="text-xs bg-rose-50 text-rose-800 border border-rose-200 font-semibold px-2.5 py-1 rounded-lg font-mono">
            {reportedCount} Dilaporkan
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari judul video, nama pengunggah, atau nomor telepon..."
        searchValue={search}
        onSearchChange={setSearch}
        statusOptions={[
          { label: 'Pending Moderasi', value: 'pending' },
          { label: 'Disetujui (Approved)', value: 'approved' },
          { label: 'Ditakedown', value: 'takedown' },
        ]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        extraActions={
          <button
            onClick={() => setReportedOnly(!reportedOnly)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
              reportedOnly
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Hanya Dilaporkan</span>
          </button>
        }
        hasActiveFilters={Boolean(
          search || statusFilter !== 'all' || reportedOnly
        )}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setReportedOnly(false);
        }}
      />

      {/* Table */}
      <DataTable
        data={filteredVideos}
        columns={columns}
        keyExtractor={(v) => v.id}
        pageSize={10}
        onRowClick={(v) => {
          setPreviewVideo(v);
          setIsPlaying(false);
        }}
      />

      {/* Video Player Modal Preview */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#1F4E79]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pratinjau & Audit Video: {previewVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Simulated 9:16 Mobile Video Screen Player */}
                <div
                  className={`h-72 rounded-xl bg-gradient-to-br ${previewVideo.colorGradient} p-4 flex flex-col justify-between text-white shadow-inner relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded">
                      MViCall Ringtone Preview
                    </span>
                    <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded">
                      9:16 Vertikal
                    </span>
                  </div>

                  {/* Play / Pause button */}
                  <div className="flex flex-col items-center justify-center z-10">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md hover:bg-white/40 flex items-center justify-center transition-transform hover:scale-105 shadow-lg cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 text-white fill-white" />
                      ) : (
                        <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                      )}
                    </button>
                    <p className="text-[11px] font-medium mt-2 text-white/90">
                      {isPlaying ? 'Memutar simulasi audio...' : 'Klik untuk memutar'}
                    </p>
                  </div>

                  {/* Sound Wave simulator */}
                  <div className="z-10">
                    <div className="flex items-center gap-1 h-6 mb-1 justify-center">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full bg-white/70 transition-all ${
                            isPlaying
                              ? 'animate-pulse'
                              : 'h-2'
                          }`}
                          style={{
                            height: isPlaying ? `${Math.sin(i * 0.8) * 12 + 14}px` : '6px',
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                      <span>00:00</span>
                      <span>00:{previewVideo.durationSec}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata & Reports Details */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Informasi Pengunggah
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {previewVideo.uploaderName}
                    </p>
                    <p className="text-slate-500">
                      Telepon: <PhoneText phone={previewVideo.uploaderPhone} />
                    </p>
                    <p className="text-slate-500 font-mono text-[11px]">
                      Diupload: {previewVideo.uploadedAt}
                    </p>
                  </div>

                  {/* Reports list */}
                  {previewVideo.reportCount > 0 ? (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5 text-rose-900">
                      <span className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Detail Laporan Komunitas ({previewVideo.reportCount})
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800">
                        {previewVideo.reportReasons?.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tidak ada laporan pelanggaran dari pengguna.</span>
                    </div>
                  )}

                  {/* Moderation notes if already moderated */}
                  {previewVideo.moderatedBy && (
                    <div className="p-2.5 bg-slate-100 rounded text-[11px] text-slate-600">
                      <span className="font-semibold block text-slate-700">
                        Catatan Moderator ({previewVideo.moderatedBy}):
                      </span>
                      {previewVideo.moderationReason}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Status saat ini: <StatusBadge status={previewVideo.status} />
              </span>

              <div className="flex items-center gap-2">
                {isAllowedToModerate && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(previewVideo);
                        setPreviewVideo(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={() => {
                        handleTakedown(previewVideo);
                        setPreviewVideo(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Takedown Konten
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPreviewVideo(null)}
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
