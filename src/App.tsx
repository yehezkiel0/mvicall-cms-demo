import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { PlansPage } from './pages/PlansPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { VideoModerationPage } from './pages/VideoModerationPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AppSettingsPage } from './pages/AppSettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';

const MainContent: React.FC = () => {
  const { activeMenu, isLoading } = useApp();

  const renderActivePage = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardPage />;
      case 'users':
        return <UsersPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'plans':
        return <PlansPage />;
      case 'marketplace':
        return <MarketplacePage />;
      case 'moderation':
        return <VideoModerationPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <AppSettingsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'admin_accounts':
      case 'admin_logs':
        return <AdminPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      <TopBar />
      <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-slate-200/70 rounded-lg w-1/3" />
            <div className="h-28 bg-slate-200/70 rounded-xl" />
            <div className="h-64 bg-slate-200/70 rounded-xl" />
          </div>
        ) : (
          renderActivePage()
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
        <Sidebar />
        <MainContent />
        <ConfirmationModal />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
