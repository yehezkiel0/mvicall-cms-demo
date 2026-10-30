import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  FileText,
  UserPlus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  X,
  Search,
  Filter,
  Clock,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CMSUser, AdminLog, Role, Column } from '../types';
import { DataTable } from '../components/common/DataTable';
import { FilterBar } from '../components/common/FilterBar';
import { ROLE_CONFIGS } from '../data/dummy';

export const AdminPage: React.FC = () => {
  const {
    activeMenu,
    cmsUsers,
    adminLogs,
    addCmsUser,
    toggleCmsUser2FA,
    requestConfirmation,
    canPerformAction,
    role,
  } = useApp();

  // Sub-tabs based on activeMenu ('admin_accounts' or 'admin_logs')
  const isAccountsView = activeMenu === 'admin_accounts';

  // Accounts view states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<Role>('cs');

  // Logs view filter states
  const [logSearch, setLogSearch] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState('all');

  const isAllowedToManageUsers = role === 'super_admin';

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return adminLogs.filter((log) => {
      const matchSearch =
        log.adminName.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.target.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.reason.toLowerCase().includes(logSearch.toLowerCase());

      const matchRole =
        logRoleFilter === 'all' || log.adminRole === logRoleFilter;

      return matchSearch && matchRole;
    });
  }, [adminLogs, logSearch, logRoleFilter]);

  // Handle Add CMS User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const selectedCfg = ROLE_CONFIGS[formRole];

    requestConfirmation({
      title: `Tambah Pengguna CMS Baru?`,
      description: `Akun baru atas nama ${formName} (${formEmail}) akan dibuat dengan peran ${selectedCfg.name}.`,
      confirmLabel: 'Buat Akun CMS',
      isDestructive: false,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan penambahan akun CMS...',
      suggestedReasons: [
        'Onboarding staf baru departemen operasional',
        'Penugasan petugas CS untuk shift monitoring',
        'Audit berkala rotasi personel internal',
      ],
      onConfirm: (reason) => {
        addCmsUser(
          {
            name: formName.trim(),
            email: formEmail.trim(),
            role: formRole,
            roleName: selectedCfg.name,
            has2FA: false,
          },
          reason
        );
        setIsAddUserModalOpen(false);
        setFormName('');
        setFormEmail('');
      },
    });
  };

  // Toggle 2FA with confirmation
  const handleToggle2FA = (user: CMSUser) => {
    const nextStatus = !user.has2FA;
    requestConfirmation({
      title: `${nextStatus ? 'Aktifkan' : 'Nonaktifkan'} 2FA untuk ${user.name}?`,
      description: nextStatus
        ? `Pengguna akan diwajibkan memasukkan kode OTP Authenticator setiap kali login ke CMS.`
        : `Autentikasi dua faktor akan dinonaktifkan sementara untuk akun ini.`,
      confirmLabel: nextStatus ? 'Aktifkan 2FA' : 'Nonaktifkan 2FA',
      isDestructive: !nextStatus,
      requireReason: true,
      reasonPlaceholder: 'Tuliskan alasan perubahan status 2FA...',
      suggestedReasons: [
        'Kepatuhan standar keamanan ISO 27001',
        'Reset perangkat authenticator pengguna',
      ],
      onConfirm: (reason) => toggleCmsUser2FA(user.id, reason),
    });
  };

  // Columns for CMS Users
  const userColumns: Column<CMSUser>[] = [
    {
      key: 'name',
      header: 'Nama & Email Pengguna',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full ${u.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
          >
            {u.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block text-xs">
              {u.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'roleName',
      header: 'Peran Akses CMS',
      sortable: true,
      render: (u) => (
        <span className="text-xs font-semibold px-2.5 py-1 bg-[#1F4E79]/10 text-[#1F4E79] rounded-md inline-block">
          {u.roleName}
        </span>
      ),
    },
    {
      key: 'has2FA',
      header: 'Status 2FA (Keamanan)',
      sortable: true,
      align: 'center',
      render: (u) => (
        <button
          onClick={() => isAllowedToManageUsers && handleToggle2FA(u)}
          disabled={!isAllowedToManageUsers}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
            !isAllowedToManageUsers
              ? 'opacity-60 cursor-not-allowed'
              : u.has2FA
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title={
            isAllowedToManageUsers
              ? 'Klik untuk mengubah status 2FA'
              : 'Hanya Super Admin yang dapat mengubah 2FA'
          }
        >
          {u.has2FA ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>2FA Aktif</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Belum Aktif</span>
            </>
          )}
        </button>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Login Terakhir',
      sortable: true,
      render: (u) => (
        <span className="font-mono text-xs text-slate-500 tabular-nums">
          {u.lastLogin}
        </span>
      ),
    },
  ];

  // Columns for Admin Logs
  const logColumns: Column<AdminLog>[] = [
    {
      key: 'timestamp',
      header: 'Waktu Tindakan',
      sortable: true,
      width: '160px',
      render: (l) => (
        <span className="font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
          {l.timestamp}
        </span>
      ),
    },
    {
      key: 'adminName',
      header: 'Pengguna CMS (Who)',
      sortable: true,
      render: (l) => {
        const cfg = ROLE_CONFIGS[l.adminRole];
        return (
          <div>
            <span className="font-semibold text-slate-900 block text-xs">
              {l.adminName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {cfg?.name || l.adminRole}
            </span>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Tindakan (Action)',
      sortable: true,
      render: (l) => (
        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block">
          {l.action}
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Target / Objek',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-xs font-medium text-slate-700 block max-w-xs truncate" title={l.target}>
          {l.target}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Alasan Otorisasi (Reason)',
      render: (l) => (
        <p className="text-xs text-slate-600 italic bg-amber-50/50 p-1.5 rounded border border-amber-100/60 leading-relaxed max-w-md">
          "{l.reason}"
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isAccountsView ? 'Akun & Peran Pengguna CMS' : 'Log Audit Aktivitas Administratif'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAccountsView
              ? 'Manajemen hak akses staf MViCall, kebijakan 2FA, dan batasan peran operasional.'
              : 'Rekaman riwayat seluruh tindakan otorisasi admin dengan catatan alasan wajib (audit trail).'}
          </p>
        </div>

        {isAccountsView && isAllowedToManageUsers && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1F4E79] hover:bg-[#163a5c] rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna CMS</span>
          </button>
        )}
      </div>

      {/* VIEW: ACCOUNTS */}
      {isAccountsView ? (
        <div className="space-y-4">
          <DataTable
            data={cmsUsers}
            columns={userColumns}
            keyExtractor={(u) => u.id}
            pageSize={10}
          />
        </div>
      ) : (
        /* VIEW: AUDIT LOGS */
        <div className="space-y-4">
          {/* Filter Bar for Logs */}
          <FilterBar
            searchPlaceholder="Cari nama admin, aksi, target, atau alasan..."
            searchValue={logSearch}
            onSearchChange={setLogSearch}
            statusOptions={[
              { label: 'Super Admin', value: 'super_admin' },
              { label: 'Admin Operasional', value: 'admin_ops' },
              { label: 'Finance', value: 'finance' },
              { label: 'CS', value: 'cs' },
              { label: 'Moderator Konten', value: 'moderator' },
            ]}
            selectedStatus={logRoleFilter}
            onStatusChange={setLogRoleFilter}
            hasActiveFilters={Boolean(logSearch || logRoleFilter !== 'all')}
            onReset={() => {
              setLogSearch('');
              setLogRoleFilter('all');
            }}
          />

          <DataTable
            data={filteredLogs}
            columns={logColumns}
            keyExtractor={(l) => l.id}
            pageSize={12}
          />
        </div>
      )}

      {/* Add CMS User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#1F4E79]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Tambah Pengguna CMS Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Perusahaan (@mvicall.id)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Contoh: rian.cs@mvicall.id"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran Akses (Role)
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 focus:border-[#1F4E79]"
                >
                  <option value="super_admin">Super Admin (Akses Penuh)</option>
                  <option value="admin_ops">Admin Operasional</option>
                  <option value="finance">Finance (Keuangan Read-Only)</option>
                  <option value="cs">Customer Service (CS)</option>
                  <option value="moderator">Moderator Konten</option>
                  <option value="viewer">Viewer (Eksekutif Read-Only)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {ROLE_CONFIGS[formRole]?.name} hanya dapat melihat menu yang diizinkan sesuai SOP.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#1F4E79] hover:bg-[#163a5c] text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Lanjut ke Konfirmasi Alasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
