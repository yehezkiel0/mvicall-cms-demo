import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminLog,
  AppSettings,
  CMSUser,
  MarketplaceItem,
  MenuKey,
  ModerationVideo,
  Plan,
  PushNotification,
  Role,
  Subscription,
  Transaction,
  User,
  WarningAlert,
} from '../types';
import {
  INITIAL_ADMIN_LOGS,
  INITIAL_APP_SETTINGS,
  INITIAL_CMS_USERS,
  INITIAL_MARKETPLACE,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER_VIDEOS,
  INITIAL_USERS,
  INITIAL_WARNINGS,
  ROLE_CONFIGS,
} from '../data/dummy';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  defaultReason?: string;
  reasonPlaceholder?: string;
  suggestedReasons?: string[];
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

interface AppContextType {
  role: Role;
  setRole: (r: Role) => void;
  activeMenu: MenuKey;
  setActiveMenu: (m: MenuKey) => void;
  subView: string;
  setSubView: (v: string) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  selectedTxId: string | null;
  setSelectedTxId: (id: string | null) => void;
  showFullPhone: boolean;
  setShowFullPhone: (val: boolean) => void;
  isLoading: boolean;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Confirmation Modal
  confirmDialog: ConfirmDialogConfig | null;
  requestConfirmation: (config: Omit<ConfirmDialogConfig, 'isOpen' | 'onCancel'>) => void;
  closeConfirmation: () => void;

  // Data states
  users: User[];
  transactions: Transaction[];
  subscriptions: Subscription[];
  plans: Plan[];
  marketplace: MarketplaceItem[];
  moderationVideos: ModerationVideo[];
  notifications: PushNotification[];
  appSettings: AppSettings;
  cmsUsers: CMSUser[];
  adminLogs: AdminLog[];
  warnings: WarningAlert[];

  // Actions
  addAdminLog: (action: string, target: string, reason: string) => void;
  blockUser: (userId: string, reason: string) => void;
  unblockUser: (userId: string, reason: string) => void;
  forceLogoutUser: (userId: string, reason: string) => void;
  recheckTransaction: (txId: string, reason: string) => void;
  resolveProblemCase: (txId: string, reason: string) => void;
  processRefundRevoke: (txId: string, reason: string) => void;
  togglePlanActive: (planId: string, reason: string) => void;
  updatePlan: (plan: Plan, reason: string) => void;
  toggleMarketplaceVisibility: (itemId: string, reason: string) => void;
  addMarketplaceItem: (item: Omit<MarketplaceItem, 'id' | 'createdAt' | 'downloadsCount' | 'usesCount'>, reason: string) => void;
  updateMarketplaceItem: (item: MarketplaceItem, reason: string) => void;
  reorderFeaturedMarketplace: (reorderedItems: MarketplaceItem[], reason: string) => void;
  approveVideo: (videoId: string, reason: string) => void;
  takedownVideo: (videoId: string, reason: string) => void;
  toggleShareLinkVideo: (videoId: string, reason: string) => void;
  sendNotification: (notif: Omit<PushNotification, 'id' | 'sentAt' | 'readCount' | 'sentCount'>, reason: string) => void;
  saveAppSettings: (settings: AppSettings, reason: string) => void;
  addCmsUser: (user: Omit<CMSUser, 'id' | 'lastLogin' | 'avatarBg'>, reason: string) => void;
  toggleCmsUser2FA: (userId: string, reason: string) => void;

  // Permissions helpers
  canAccessMenu: (menu: MenuKey) => boolean;
  canPerformAction: (actionKey?: string) => boolean;
  canToggleFullPhone: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>('super_admin');
  const [activeMenu, setActiveMenuState] = useState<MenuKey>('dashboard');
  const [subView, setSubView] = useState<string>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [showFullPhone, setShowFullPhone] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null);

  // Entities state (in-memory)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE);
  const [moderationVideos, setModerationVideos] = useState<ModerationVideo[]>(INITIAL_USER_VIDEOS);
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_APP_SETTINGS);
  const [cmsUsers, setCmsUsers] = useState<CMSUser[]>(INITIAL_CMS_USERS);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(INITIAL_ADMIN_LOGS);
  const [warnings] = useState<WarningAlert[]>(INITIAL_WARNINGS);

  const roleConfig = ROLE_CONFIGS[role];
  const canToggleFullPhone = roleConfig.canViewFullPhone;

  // If role changes to one that cannot view full phone, reset to masked
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    const newCfg = ROLE_CONFIGS[newRole];
    if (!newCfg.canViewFullPhone) {
      setShowFullPhone(false);
    }
    // If active menu is not allowed, switch to first allowed menu
    if (!newCfg.allowedMenus.includes(activeMenu)) {
      setActiveMenuState(newCfg.allowedMenus[0] as MenuKey);
    }
    showToast(`Peran dialihkan ke: ${newCfg.name}`, 'info');
  };

  const setActiveMenu = (menu: MenuKey) => {
    setIsLoading(true);
    setActiveMenuState(menu);
    setSelectedUserId(null);
    setSelectedTxId(null);
    setSubView('all');
    setTimeout(() => {
      setIsLoading(false);
    }, 180);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const requestConfirmation = (config: Omit<ConfirmDialogConfig, 'isOpen' | 'onCancel'>) => {
    setConfirmDialog({
      ...config,
      isOpen: true,
      onCancel: () => setConfirmDialog(null),
    });
  };

  const closeConfirmation = () => {
    setConfirmDialog(null);
  };

  const currentAdminUser = cmsUsers.find((u) => u.role === role) || cmsUsers[0];

  const addAdminLog = (action: string, target: string, reason: string) => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateFormatted = `${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newLog: AdminLog = {
      id: `log-${Date.now().toString().slice(-6)}`,
      adminId: currentAdminUser.id,
      adminName: currentAdminUser.name,
      adminRole: role,
      action,
      target,
      reason,
      timestamp: dateFormatted,
    };

    setAdminLogs((prev) => [newLog, ...prev]);
  };

  const canAccessMenu = (menu: MenuKey): boolean => {
    return roleConfig.allowedMenus.includes(menu);
  };

  const canPerformAction = (actionKey?: string): boolean => {
    if (role === 'finance' || role === 'viewer') return false;
    if (role === 'cs') {
      return actionKey === 'recheck_transaction';
    }
    return true;
  };

  // User Actions
  const blockUser = (userId: string, reason: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: true } : u))
    );
    addAdminLog('Blokir Pengguna', `User ${user.id} (${user.name})`, reason);
    showToast(`Pengguna ${user.name} berhasil diblokir.`, 'success');
  };

  const unblockUser = (userId: string, reason: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBlocked: false } : u))
    );
    addAdminLog('Buka Blokir Pengguna', `User ${user.id} (${user.name})`, reason);
    showToast(`Blokir pengguna ${user.name} telah dibuka.`, 'success');
  };

  const forceLogoutUser = (userId: string, reason: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    addAdminLog('Logout Paksa Pengguna', `User ${user.id} (${user.name})`, reason);
    showToast(`Sesi akun ${user.name} berhasil di-logout secara paksa di semua perangkat.`, 'success');
  };

  // Transaction Actions
  const recheckTransaction = (txId: string, reason: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    const timeStr = `${pad(now.getDate())} Okt 2026 ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'berhasil',
              verificationStatus: 'Terverifikasi',
              acknowledgeStatus: t.method === 'Google Play' ? 'Acknowledged' : 'N/A',
              problemType: undefined,
              timeline: [
                ...t.timeline,
                {
                  time: timeStr,
                  status: 'Verifikasi Ulang CS',
                  note: `Sinkronisasi ulang oleh ${currentAdminUser.name}: status aktif dipulihkan.`,
                },
              ],
            }
          : t
      )
    );
    addAdminLog('Verifikasi Ulang Transaksi', `Order ${tx.id} (${tx.userName})`, reason);
    showToast(`Transaksi ${tx.id} berhasil diverifikasi ulang dan status aktif dipulihkan!`, 'success');
  };

  const resolveProblemCase = (txId: string, reason: string) => {
    recheckTransaction(txId, reason);
  };

  const processRefundRevoke = (txId: string, reason: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              revokedItems: 'Akses VIP dan bonus koin telah dicabut manual oleh admin.',
            }
          : t
      )
    );
    addAdminLog('Pencabutan Hak Akses Refund', `Order ${tx.id}`, reason);
    showToast(`Pencabutan hak akses untuk transaksi ${tx.id} berhasil diproses.`, 'success');
  };

  // Plan Actions
  const togglePlanActive = (planId: string, reason: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const newStatus = !plan.isActive;
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, isActive: newStatus } : p))
    );
    addAdminLog(
      newStatus ? 'Aktifkan Paket Langganan' : 'Nonaktifkan Paket Langganan',
      `Paket ${plan.name} (${plan.id})`,
      reason
    );
    showToast(`Paket ${plan.name} sekarang ${newStatus ? 'Aktif' : 'Nonaktif'}.`, 'success');
  };

  const updatePlan = (updatedPlan: Plan, reason: string) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    addAdminLog('Perbarui Detail Paket', `Paket ${updatedPlan.name}`, reason);
    showToast(`Paket ${updatedPlan.name} berhasil diperbarui.`, 'success');
  };

  // Marketplace Actions
  const toggleMarketplaceVisibility = (itemId: string, reason: string) => {
    const item = marketplace.find((m) => m.id === itemId);
    if (!item) return;
    const newVis = !item.isVisible;
    setMarketplace((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, isVisible: newVis } : m))
    );
    addAdminLog(
      newVis ? 'Tampilkan Konten Marketplace' : 'Sembunyikan Konten Marketplace',
      `Item ${item.title} (${item.id})`,
      reason
    );
    showToast(`Item "${item.title}" sekarang ${newVis ? 'Ditampilkan' : 'Disembunyikan'}.`, 'success');
  };

  const addMarketplaceItem = (
    itemData: Omit<MarketplaceItem, 'id' | 'createdAt' | 'downloadsCount' | 'usesCount'>,
    reason: string
  ) => {
    const newItem: MarketplaceItem = {
      ...itemData,
      id: `mkt-${Date.now().toString().slice(-4)}`,
      createdAt: '29 Okt 2026',
      downloadsCount: 0,
      usesCount: 0,
    };
    setMarketplace((prev) => [newItem, ...prev]);
    addAdminLog('Tambah Konten Marketplace', `Item "${newItem.title}"`, reason);
    showToast(`Konten "${newItem.title}" berhasil ditambahkan ke marketplace.`, 'success');
  };

  const updateMarketplaceItem = (updatedItem: MarketplaceItem, reason: string) => {
    setMarketplace((prev) =>
      prev.map((m) => (m.id === updatedItem.id ? updatedItem : m))
    );
    addAdminLog('Perbarui Konten Marketplace', `Item "${updatedItem.title}"`, reason);
    showToast(`Item "${updatedItem.title}" berhasil diperbarui.`, 'success');
  };

  const reorderFeaturedMarketplace = (reordered: MarketplaceItem[], reason: string) => {
    setMarketplace(reordered);
    addAdminLog('Atur Urutan Konten Unggulan', 'Marketplace Unggulan', reason);
    showToast('Urutan video unggulan berhasil disimpan.', 'success');
  };

  // Video Moderation Actions
  const approveVideo = (videoId: string, reason: string) => {
    const video = moderationVideos.find((v) => v.id === videoId);
    if (!video) return;
    setModerationVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              status: 'approved',
              exploreVisible: true,
              moderatedBy: currentAdminUser.name,
              moderationReason: reason,
            }
          : v
      )
    );
    addAdminLog('Setujui Video Pengguna', `Video "${video.title}" (${video.id})`, reason);
    showToast(`Video "${video.title}" disetujui & tayang di Explore.`, 'success');
  };

  const takedownVideo = (videoId: string, reason: string) => {
    const video = moderationVideos.find((v) => v.id === videoId);
    if (!video) return;
    setModerationVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              status: 'takedown',
              exploreVisible: false,
              shareLinkDisabled: true,
              moderatedBy: currentAdminUser.name,
              moderationReason: reason,
            }
          : v
      )
    );
    addAdminLog('Takedown Video Pengguna', `Video "${video.title}" (${video.id})`, reason);
    showToast(`Video "${video.title}" berhasil ditakedown.`, 'success');
  };

  const toggleShareLinkVideo = (videoId: string, reason: string) => {
    const video = moderationVideos.find((v) => v.id === videoId);
    if (!video) return;
    const newDisabled = !video.shareLinkDisabled;
    setModerationVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, shareLinkDisabled: newDisabled } : v
      )
    );
    addAdminLog(
      newDisabled ? 'Nonaktifkan Link Share Video' : 'Aktifkan Link Share Video',
      `Video "${video.title}"`,
      reason
    );
    showToast(
      `Link share video "${video.title}" ${newDisabled ? 'dinonaktifkan' : 'diaktifkan'}.`,
      'success'
    );
  };

  // Push Notifications
  const sendNotification = (
    notifData: Omit<PushNotification, 'id' | 'sentAt' | 'readCount' | 'sentCount'>,
    reason: string
  ) => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    const timeStr = `${pad(now.getDate())} Okt 2026 ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newNotif: PushNotification = {
      ...notifData,
      id: `notif-${Date.now().toString().slice(-4)}`,
      sentAt: notifData.scheduleType === 'now' ? timeStr : '—',
      readCount: 0,
      sentCount: notifData.target === 'all' ? 95000 : notifData.target === 'subs' ? 14000 : 1,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    addAdminLog('Kirim Notifikasi Push', `Target: ${notifData.targetLabel}`, reason);
    showToast(
      notifData.scheduleType === 'now'
        ? 'Notifikasi push berhasil disiarkan!'
        : 'Notifikasi push berhasil dijadwalkan!',
      'success'
    );
  };

  // App Settings
  const saveAppSettings = (newSettings: AppSettings, reason: string) => {
    setAppSettings(newSettings);
    addAdminLog('Simpan Pengaturan Aplikasi', 'Konfigurasi Sistem Global', reason);
    showToast('Pengaturan aplikasi MViCall berhasil disimpan.', 'success');
  };

  // Admin CMS Users
  const addCmsUser = (
    userData: Omit<CMSUser, 'id' | 'lastLogin' | 'avatarBg'>,
    reason: string
  ) => {
    const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-purple-600', 'bg-cyan-600'];
    const newCmsUser: CMSUser = {
      ...userData,
      id: `adm-${String(cmsUsers.length + 1).padStart(2, '0')}`,
      lastLogin: 'Belum pernah login',
      avatarBg: colors[cmsUsers.length % colors.length],
    };

    setCmsUsers((prev) => [...prev, newCmsUser]);
    addAdminLog('Tambah Pengguna CMS', `Admin ${newCmsUser.name} (${newCmsUser.roleName})`, reason);
    showToast(`Pengguna CMS ${newCmsUser.name} berhasil ditambahkan.`, 'success');
  };

  const toggleCmsUser2FA = (userId: string, reason: string) => {
    const user = cmsUsers.find((u) => u.id === userId);
    if (!user) return;
    const newStatus = !user.has2FA;
    setCmsUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, has2FA: newStatus } : u))
    );
    addAdminLog(
      newStatus ? 'Aktifkan 2FA Admin' : 'Nonaktifkan 2FA Admin',
      `Admin ${user.name}`,
      reason
    );
    showToast(`2FA untuk ${user.name} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeMenu,
        setActiveMenu,
        subView,
        setSubView,
        selectedUserId,
        setSelectedUserId,
        selectedTxId,
        setSelectedTxId,
        showFullPhone,
        setShowFullPhone,
        isLoading,
        toasts,
        showToast,
        removeToast,
        confirmDialog,
        requestConfirmation,
        closeConfirmation,
        users,
        transactions,
        subscriptions,
        plans,
        marketplace,
        moderationVideos,
        notifications,
        appSettings,
        cmsUsers,
        adminLogs,
        warnings,
        addAdminLog,
        blockUser,
        unblockUser,
        forceLogoutUser,
        recheckTransaction,
        resolveProblemCase,
        processRefundRevoke,
        togglePlanActive,
        updatePlan,
        toggleMarketplaceVisibility,
        addMarketplaceItem,
        updateMarketplaceItem,
        reorderFeaturedMarketplace,
        approveVideo,
        takedownVideo,
        toggleShareLinkVideo,
        sendNotification,
        saveAppSettings,
        addCmsUser,
        toggleCmsUser2FA,
        canAccessMenu,
        canPerformAction,
        canToggleFullPhone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
