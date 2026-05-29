import AdminGuard from './admin/AdminGuard';
import AdminDashboard from './admin/Dashboard';
import TicketDetails from './admin/TicketDetails';
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './components/HomePage';
import { useFirebase, useI18n, AdiSparklesIcon, BotIcon, WhatsappIcon, PhoneIcon } from './components/lib/contexts';
import { LoginPage } from './components/LoginPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { VipLoginPage } from './components/VipLoginPage';
import { ShowroomPage } from './components/ShowroomPage';
import { OperationsView as OperationsPage } from './components/OperationsView';
import { WarehouseView as WarehousePage } from './components/WarehouseView';
import { PrivacyPolicyPage, TermsPage, ReturnsPage, ShippingPolicyPage } from './components/LegalPages';
import { DevConsolePage } from './components/DevConsolePage';
import { TrackOrderPage } from './components/TrackOrderPage';
import { UnitsPage } from './components/UnitsPage';
import { ContactPage } from './components/ContactPage';
import { useAuth } from './contexts/AuthContext';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';

import { COMPANY_INFO, SYSTEM_CONFIG } from './constants';
import { motion, AnimatePresence } from 'framer-motion';

import { ErrorBoundary } from './components/ErrorBoundary';
import { SplashScreen } from './components/SplashScreen';
import Checkout from './components/Checkout';
import AiAssistant from './components/AiAssistant';

// Heavy UI Components - Lazy Loaded
const AdminDashboardPage = lazy(() => import('./components/AdminDashboardPage').then(module => ({ default: module.default })));
const VipDashboardPage = lazy(() => import('./components/VipDashboardPage').then(module => ({ default: module.VipDashboardPage })));
const DriverDashboardPage = lazy(() => import('./components/DriverDashboardPage').then(module => ({ default: module.DriverDashboardPage })));
const LiveTrackingPage = lazy(() => import('./components/LiveTrackingPage').then(module => ({ default: module.default })));

import { SplashScreen as CapSplashScreen } from '@capacitor/splash-screen';

const LoadingOverlay = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
      <p className="text-gray-400 font-bold animate-pulse">{t('vip.loading')}</p>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showSplash, setShowSplash] = useState(true);
  const [pageParams, setPageParams] = useState<any>(null);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { products } = useProducts();
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const { language } = useI18n();
  const { ads, units, updateProduct, categories, homeSections } = useFirebase();

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    // Hide native splash screen if it's running
    CapSplashScreen.hide().catch(() => {
      // Ignore if not running in a native environment
    });
  }, []);

  const handleNavigate = useCallback((page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const isLoginPage = ['login', 'vip_login', 'admin_login'].includes(currentPage);
      if (isLoginPage) {
        if (user.role === 'driver') setCurrentPage('driver_dashboard');
        else if (['admin', 'developer', 'marketing', 'branch_agent', 'ops'].includes(user.role)) setCurrentPage('admin_dashboard');
        else if (user.role === 'vip') setCurrentPage('vip_dashboard');
        else setCurrentPage('home');
      }
    }
  }, [isAuthenticated, user, currentPage]);

  const renderedPage = useMemo(() => {
    const commonProps = {
      SYSTEM_CONFIG: {
        BRAND_NAME: language === 'ar' ? SYSTEM_CONFIG.BRAND_NAME : SYSTEM_CONFIG.BRAND_NAME_EN,
        SLOGAN: language === 'ar' ? SYSTEM_CONFIG.SLOGAN : SYSTEM_CONFIG.SLOGAN_EN
      }
    };

    switch (currentPage) {
      case 'home': return (
        <HomePage
          setCurrentPage={handleNavigate}
          SYSTEM_CONFIG={commonProps.SYSTEM_CONFIG}
          ads={ads || []}
          homeSections={homeSections || []}
        />
      );
      case 'login': return <LoginPage onLoginSuccess={() => handleNavigate('home')} onNavigate={handleNavigate} />;
      case 'admin_login': return (
        <AdminLoginPage
          onSuccess={() => handleNavigate('admin_dashboard')}
          onBack={() => handleNavigate('home')}
        />
      );
      case 'vip_login': return <VipLoginPage onLoginSuccess={() => handleNavigate('vip_dashboard')} />;
      case 'vip_dashboard': return <VipDashboardPage user={user as any} onLogout={() => { logout(); handleNavigate('home'); }} onNavigate={handleNavigate} />;
      case 'showroom': return (
        <ShowroomPage
          items={products}
          showroomBanner="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1920"
          setPage={handleNavigate as any}
          initialCategory={pageParams?.initialCategory}
        />
      );
      case 'contact': return <ContactPage />;
      case 'admin_dashboard': return <AdminDashboardPage user={user as any} onNavigate={handleNavigate} />;
      case 'driver_dashboard': return <DriverDashboardPage onLogout={() => { logout(); handleNavigate('home'); }} />;
      case 'checkout': return <Checkout />;
      case 'privacy': return <PrivacyPolicyPage onBack={() => handleNavigate('home')} />;
      case 'terms': return <TermsPage onBack={() => handleNavigate('home')} />;
      case 'returns': return <ReturnsPage onBack={() => handleNavigate('home')} />;
      case 'shipping': return <ShippingPolicyPage onBack={() => handleNavigate('home')} />;
      case 'track_order': return <TrackOrderPage />;
      case 'live_tracking': return <LiveTrackingPage orderId={pageParams?.orderId || ''} onBack={() => handleNavigate('vip_dashboard')} />;
      case 'dev_console': return <DevConsolePage onBack={() => handleNavigate('home')} />;
      case 'operations': return <OperationsPage onBack={() => handleNavigate('admin_dashboard')} />;
      case 'warehouse': return (
        <WarehousePage
          onBack={() => handleNavigate('admin_dashboard')}
          products={products}
          orders={[]}
          onUpdateStock={(id, qty) => updateProduct(id, { stock_quantity: qty })}
          onUpdateOrderStatus={(id, status) => updateProduct(id as any, { status } as any)}
          invoices={[]}
        />
      );
      case 'units': return <UnitsPage units={units || []} />;

      // === صفحات الدعم الجديدة (Support Tickets) ===
      case 'admin_support':
        return <AdminDashboard user={user as any} />;
      case 'admin_ticket':
        return <TicketDetails ticketId={pageParams?.id} />;

      default: return (
        <HomePage
          setCurrentPage={handleNavigate}
          SYSTEM_CONFIG={commonProps.SYSTEM_CONFIG}
          ads={ads || []}
        />
      );
    }
  }, [currentPage, handleNavigate, language, ads, products, user, logout, pageParams, units, updateProduct, homeSections]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full animate-pulse opacity-20"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-600 selection:text-white">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        onToggleAiAssistant={() => setIsAiOpen(true)}
      />

      <main className="pt-24 min-h-[85vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingOverlay />}>
                {renderedPage}
              </Suspense>
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default AppContent;
