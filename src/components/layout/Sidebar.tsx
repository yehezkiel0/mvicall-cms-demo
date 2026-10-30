import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  Tag,
  ShoppingBag,
  ShieldAlert,
  Bell,
  Settings,
  BarChart3,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronRight,
  PhoneCall,
  Video,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuKey } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeMenu,
    setActiveMenu,
    subView,
    setSubView,
    canAccessMenu,
    transactions,
    moderationVideos,
  } = useApp();

  // Submenu toggle states
  const [transaksiOpen, setTransaksiOpen] = useState<boolean>(true);
  const [adminOpen, setAdminOpen] = useState<boolean>(true);

  // Badge counts
  const problemTxCount = transactions.filter((t) => t.problemType).length;
  const pendingModCount = moderationVideos.filter(
    (v) => v.status === 'pending' || v.reportCount > 0
  ).length;

  const handleMenuClick = (menu: MenuKey, defaultSubView = 'all') => {
    setActiveMenu(menu);
    setSubView(defaultSubView);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-screen sticky top-0 select-none z-20 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1F4E79] flex items-center justify-center text-white shadow-xs font-black tracking-tight">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#1F4E79] text-base tracking-tight">
                MViCall
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#1F4E79]/10 text-[#1F4E79] rounded">
                CMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
              Videotone & VRBT Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard */}
        {canAccessMenu('dashboard') && (
          <button
            onClick={() => handleMenuClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'dashboard'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="truncate">Dashboard</span>
          </button>
        )}

        {/* User */}
        {canAccessMenu('users') && (
          <button
            onClick={() => handleMenuClick('users')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'users'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">User</span>
          </button>
        )}

        {/* Transaksi (with submenus: Semua, Refund, Kasus Bermasalah) */}
        {canAccessMenu('transactions') && (
          <div className="space-y-0.5">
            <button
              onClick={() => {
                setTransaksiOpen(!transaksiOpen);
                if (activeMenu !== 'transactions') {
                  handleMenuClick('transactions', 'all');
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMenu === 'transactions'
                  ? 'bg-slate-100 text-[#1F4E79]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-4 h-4 shrink-0" />
                <span className="truncate">Transaksi</span>
              </div>
              <div className="flex items-center gap-1.5">
                {problemTxCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono tabular-nums">
                    {problemTxCount}
                  </span>
                )}
                {transaksiOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {transaksiOpen && (
              <div className="pl-9 pr-1 py-1 space-y-1">
                <button
                  onClick={() => handleMenuClick('transactions', 'all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeMenu === 'transactions' && subView === 'all'
                      ? 'bg-[#1F4E79] text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Semua Transaksi
                </button>
                <button
                  onClick={() => handleMenuClick('transactions', 'refund')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeMenu === 'transactions' && subView === 'refund'
                      ? 'bg-[#1F4E79] text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Refund
                </button>
                <button
                  onClick={() => handleMenuClick('transactions', 'problems')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeMenu === 'transactions' && subView === 'problems'
                      ? 'bg-[#1F4E79] text-white'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>Kasus Bermasalah</span>
                  {problemTxCount > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        activeMenu === 'transactions' && subView === 'problems'
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {problemTxCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Langganan */}
        {canAccessMenu('subscriptions') && (
          <button
            onClick={() => handleMenuClick('subscriptions')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'subscriptions'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span className="truncate">Langganan</span>
          </button>
        )}

        {/* Paket & Harga */}
        {canAccessMenu('plans') && (
          <button
            onClick={() => handleMenuClick('plans')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'plans'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">Paket & Harga</span>
          </button>
        )}

        {/* Konten Marketplace */}
        {canAccessMenu('marketplace') && (
          <button
            onClick={() => handleMenuClick('marketplace')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'marketplace'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="truncate">Konten Marketplace</span>
          </button>
        )}

        {/* Moderasi Video */}
        {canAccessMenu('moderation') && (
          <button
            onClick={() => handleMenuClick('moderation')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'moderation'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="truncate">Moderasi Video</span>
            </div>
            {pendingModCount > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  activeMenu === 'moderation'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {pendingModCount}
              </span>
            )}
          </button>
        )}

        {/* Notifikasi */}
        {canAccessMenu('notifications') && (
          <button
            onClick={() => handleMenuClick('notifications')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'notifications'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="truncate">Notifikasi</span>
          </button>
        )}

        {/* Pengaturan App */}
        {canAccessMenu('settings') && (
          <button
            onClick={() => handleMenuClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'settings'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="truncate">Pengaturan App</span>
          </button>
        )}

        {/* Laporan */}
        {canAccessMenu('reports') && (
          <button
            onClick={() => handleMenuClick('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMenu === 'reports'
                ? 'bg-[#1F4E79] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="truncate">Laporan</span>
          </button>
        )}

        {/* Admin Section (Akun & Peran, Log Aktivitas) */}
        {(canAccessMenu('admin_accounts') || canAccessMenu('admin_logs')) && (
          <div className="pt-2 border-t border-slate-100 mt-2 space-y-0.5">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="uppercase text-[11px] tracking-wider">Admin</span>
              </div>
              {adminOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {adminOpen && (
              <div className="pl-9 pr-1 py-1 space-y-1">
                {canAccessMenu('admin_accounts') && (
                  <button
                    onClick={() => handleMenuClick('admin_accounts')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeMenu === 'admin_accounts'
                        ? 'bg-[#1F4E79] text-white'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Akun & Peran
                  </button>
                )}
                {canAccessMenu('admin_logs') && (
                  <button
                    onClick={() => handleMenuClick('admin_logs')}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activeMenu === 'admin_logs'
                        ? 'bg-[#1F4E79] text-white'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Log Aktivitas
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-slate-600">
            MViCall Core v2.4.1
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Lingkungan Simulasi In-Memory
        </p>
      </div>
    </aside>
  );
};
