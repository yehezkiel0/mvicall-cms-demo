import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  UserCheck,
  Search,
  Bell,
  HelpCircle,
  Shield,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { ROLE_CONFIGS } from '../../data/dummy';

export const TopBar: React.FC = () => {
  const {
    role,
    setRole,
    showFullPhone,
    setShowFullPhone,
    canToggleFullPhone,
    cmsUsers,
    activeMenu,
    setActiveMenu,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const currentRoleCfg = ROLE_CONFIGS[role];
  const currentUser = cmsUsers.find((u) => u.role === role) || cmsUsers[0];

  const roleList: { id: Role; label: string; desc: string }[] = [
    {
      id: 'super_admin',
      label: 'Super Admin',
      desc: 'Akses penuh ke seluruh menu dan tindakan administratif',
    },
    {
      id: 'admin_ops',
      label: 'Admin Operasional',
      desc: 'Dashboard, Marketplace, Paket & Harga, Pengaturan, Notifikasi',
    },
    {
      id: 'finance',
      label: 'Finance',
      desc: 'Dashboard, Transaksi, Langganan, Laporan (Read-only)',
    },
    {
      id: 'cs',
      label: 'Customer Service (CS)',
      desc: 'User, Transaksi, Langganan (Aksi khusus: Verifikasi Ulang)',
    },
    {
      id: 'moderator',
      label: 'Moderator Konten',
      desc: 'Moderasi Video & Konten Marketplace',
    },
    {
      id: 'viewer',
      label: 'Viewer',
      desc: 'Hanya melihat Dashboard & Laporan (Read-only)',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
      {/* Left side: Context title / Search hint */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-slate-400">Panel Administrasi</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold uppercase tracking-wider text-[11px]">
            {activeMenu.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Toggle Tampilkan Nomor Lengkap */}
        <div className="relative">
          <button
            onClick={() => {
              if (canToggleFullPhone) {
                setShowFullPhone(!showFullPhone);
              }
            }}
            disabled={!canToggleFullPhone}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !canToggleFullPhone
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                : showFullPhone
                ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title={
              canToggleFullPhone
                ? showFullPhone
                  ? 'Klik untuk menyamarkan kembali nomor telepon'
                  : 'Klik untuk menampilkan nomor telepon lengkap'
                : 'Hanya Super Admin & CS yang dapat membuka privasi nomor telepon'
            }
          >
            {showFullPhone ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="whitespace-nowrap">
              {showFullPhone ? 'Nomor Lengkap: Terbuka' : 'Nomor Disamarkan'}
            </span>
            {!canToggleFullPhone && (
              <span className="text-[10px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-mono">
                Terkunci
              </span>
            )}
          </button>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Role Switcher Demo Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#1F4E79]" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block leading-tight font-medium">
                Simulasi Peran
              </span>
              <span className="font-semibold text-slate-800 leading-tight">
                {currentRoleCfg.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Peran Akses (Demo)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Menu dan tombol aksi akan otomatis menyesuaikan izin peran.
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto p-1 space-y-0.5">
                  {roleList.map((r) => {
                    const isSelected = r.id === role;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setRole(r.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between ${
                          isSelected
                            ? 'bg-[#1F4E79]/10 text-[#1F4E79]'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="pr-2">
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {r.label}
                            {isSelected && (
                              <span className="text-[10px] text-[#1F4E79] font-bold">
                                (Aktif)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {r.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#1F4E79] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile avatar pill */}
        <div className="flex items-center gap-2.5 pl-2">
          <div
            className={`w-8 h-8 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
          >
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-semibold text-slate-800 block leading-tight">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-400 block leading-tight font-medium font-mono">
              {currentUser.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
