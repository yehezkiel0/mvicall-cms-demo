import React from 'react';

export type StatusVariant =
  | 'aktif'
  | 'berhasil'
  | 'approved'
  | 'terkirim'
  | 'pending'
  | 'menunggu'
  | 'terjadwal'
  | 'akan_berakhir'
  | 'masa_tenggang'
  | 'gagal'
  | 'refund'
  | 'takedown'
  | 'diblokir'
  | 'berakhir'
  | 'dibatalkan'
  | 'draf'
  | 'none'
  | 'trial';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
}) => {
  const norm = status.toLowerCase().replace(/\s+/g, '_');

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';
  let displayText = label || status;

  // Green = aktif / berhasil / disetujui / terkirim
  if (['aktif', 'berhasil', 'approved', 'terkirim', 'disetujui'].includes(norm)) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    dotClass = 'bg-emerald-600';
    if (!label) {
      if (norm === 'aktif') displayText = 'Aktif';
      else if (norm === 'berhasil') displayText = 'Berhasil';
      else if (norm === 'approved' || norm === 'disetujui') displayText = 'Disetujui';
      else if (norm === 'terkirim') displayText = 'Terkirim';
    }
  }
  // Yellow = pending / akan berakhir / masa tenggang / terjadwal
  else if (
    ['pending', 'menunggu', 'menunggu_verifikasi', 'akan_berakhir', 'masa_tenggang', 'terjadwal'].includes(
      norm
    )
  ) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotClass = 'bg-amber-500';
    if (!label) {
      if (norm === 'pending') displayText = 'Pending';
      else if (norm === 'menunggu_verifikasi') displayText = 'Menunggu Verifikasi';
      else if (norm === 'akan_berakhir') displayText = 'Akan Berakhir';
      else if (norm === 'masa_tenggang') displayText = 'Masa Tenggang';
      else if (norm === 'terjadwal') displayText = 'Terjadwal';
    }
  }
  // Red = gagal / refund / takedown / diblokir
  else if (['gagal', 'refund', 'takedown', 'diblokir', 'gagal_verifikasi'].includes(norm)) {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200/80';
    dotClass = 'bg-rose-600';
    if (!label) {
      if (norm === 'gagal') displayText = 'Gagal';
      else if (norm === 'refund') displayText = 'Refund';
      else if (norm === 'takedown') displayText = 'Takedown';
      else if (norm === 'diblokir') displayText = 'Diblokir';
      else if (norm === 'gagal_verifikasi') displayText = 'Gagal Verifikasi';
    }
  }
  // Gray = berakhir / dibatalkan / draf / none
  else if (['berakhir', 'dibatalkan', 'draf', 'none'].includes(norm)) {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
    dotClass = 'bg-slate-400';
    if (!label) {
      if (norm === 'berakhir') displayText = 'Berakhir';
      else if (norm === 'dibatalkan') displayText = 'Dibatalkan';
      else if (norm === 'draf') displayText = 'Draf';
      else if (norm === 'none') displayText = 'Non-Aktif';
    }
  } else if (norm === 'trial') {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200/80';
    dotClass = 'bg-blue-600';
    if (!label) displayText = 'Trial';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${px} ${colorClasses} tracking-tight select-none whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{displayText}</span>
    </span>
  );
};
