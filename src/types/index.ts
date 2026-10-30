export type Role =
  | 'super_admin'
  | 'admin_ops'
  | 'finance'
  | 'cs'
  | 'moderator'
  | 'viewer';

export interface RoleConfig {
  id: Role;
  name: string;
  badge: string;
  allowedMenus: string[];
  canViewFullPhone: boolean;
  canTakeActions: boolean;
  actionRestrictions?: string[]; // notes on what actions are permitted
}

export type MenuKey =
  | 'dashboard'
  | 'users'
  | 'transactions'
  | 'subscriptions'
  | 'plans'
  | 'marketplace'
  | 'moderation'
  | 'notifications'
  | 'settings'
  | 'reports'
  | 'admin_accounts'
  | 'admin_logs';

export type UserStatusLangganan = 'aktif' | 'berakhir' | 'masa_tenggang' | 'trial' | 'none';
export type SubSource = 'Google Play' | 'SDP Telkomsel' | 'SDP Indosat' | 'SDP XL' | '—';

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  statusLangganan: UserStatusLangganan;
  sumber: SubSource;
  tanggalDaftar: string;
  isBlocked: boolean;
  saldoPoin: number;
  deviceModel: string;
  osVersion: string;
  operator: string;
  lastIp: string;
  activePlanName?: string;
  activePlanExpire?: string;
  videotoneCount: number;
}

export type TransactionStatus = 'berhasil' | 'pending' | 'refund' | 'gagal';

export interface TransactionTimeline {
  time: string;
  status: string;
  note: string;
}

export interface Transaction {
  id: string; // GPA.xxxx or SDP.xxxx
  userId: string;
  userName: string;
  userPhone: string;
  productId: string;
  productName: string;
  nominal: number;
  method: 'Google Play' | 'SDP Telkomsel' | 'SDP Indosat' | 'SDP XL';
  status: TransactionStatus;
  createdAt: string;
  verificationStatus: 'Terverifikasi' | 'Menunggu Verifikasi' | 'Gagal Verifikasi';
  acknowledgeStatus: 'Acknowledged' | 'Unacknowledged' | 'N/A';
  expireDate?: string;
  token: string;
  timeline: TransactionTimeline[];
  problemType?: 'sudah_bayar_belum_aktif' | 'menggantung_gt_1jam';
  revokedItems?: string;
}

export type SubscriptionStatus = 'aktif' | 'akan_berakhir' | 'masa_tenggang' | 'berakhir' | 'dibatalkan';

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  planId: string;
  planName: string;
  source: 'Google Play' | 'SDP Telkomsel' | 'SDP Indosat' | 'SDP XL';
  nominal: number;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  gracePeriodUntil?: string;
}

export interface Plan {
  id: string;
  name: string;
  durationDays: number;
  durationLabel: string;
  price: number;
  bonusPoints: number;
  sku: string;
  isActive: boolean;
  isTrialSoon?: boolean;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  artist: string;
  category: string;
  price: number;
  isFree: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  featuredOrder?: number;
  downloadsCount: number;
  usesCount: number;
  durationSec: number;
  colorGradient: string;
  tags: string[];
  createdAt: string;
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface ModerationVideo {
  id: string;
  uploaderId: string;
  uploaderName: string;
  uploaderPhone: string;
  title: string;
  durationSec: number;
  colorGradient: string;
  isPublic: boolean;
  exploreVisible: boolean;
  reportCount: number;
  reportReasons?: string[];
  status: 'approved' | 'pending' | 'takedown';
  shareLinkDisabled: boolean;
  uploadedAt: string;
  moderatedBy?: string;
  moderationReason?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  content: string;
  target: 'all' | 'subs' | 'non_subs' | 'custom';
  targetLabel: string;
  customPhone?: string;
  scheduleType: 'now' | 'scheduled';
  scheduledAt?: string;
  sentAt: string;
  status: 'terkirim' | 'terjadwal' | 'draf';
  readCount: number;
  sentCount: number;
}

export interface AppSettings {
  featureSnapLens: boolean;
  featureFloatingText: boolean;
  featureShareVideo: boolean;
  minAppVersionAndroid: string;
  minAppVersionIos: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  tooltipVideotone: string;
  tooltipVrbt: string;
  textAboutMViCall: string;
  textUploadPage: string;
}

export interface CMSUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleName: string;
  has2FA: boolean;
  lastLogin: string;
  avatarBg: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: Role;
  action: string;
  target: string;
  reason: string;
  timestamp: string;
}

export interface WarningAlert {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info';
  actionTargetMenu?: MenuKey;
  actionLabel?: string;
  actionPayload?: string;
}
