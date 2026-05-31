import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase, useI18n, useToast } from './lib/contexts';
import QualityManagement from './QualityManagement';
import ComplaintsManagement from './ComplaintsManagement';
import ShipmentManagement from './ShipmentManagement';
import DelegatesManagement from './DelegatesManagement';
import ShippingManagementSection from './ShippingManagementSection';
import SecuritySection from './SecuritySection';
import { AIInsightsSection } from './AIInsightsSection';
import { PredictiveOrdersSection } from './PredictiveOrdersSection';
import { ShipmentMap } from './ShipmentMap';
import AccountingSection from './AccountingSection';
import { DeveloperDashboard } from './DeveloperDashboard';
import { ProductManagementSection } from './ProductManagementSection';
import { UserManagementSection } from './UserManagementSection';
import { AdManagementSection } from './AdManagementSection';
import { HomeSectionManagementSection } from './HomeSectionManagementSection';
import { MasterControlPanel } from './MasterControlPanel';
import { CouponManagementSection } from './CouponManagementSection';
import { BranchManagementSection } from './BranchManagementSection';
import { PriceUpdateRequestSection } from './PriceUpdateRequestSection';
import { OperationsView } from './OperationsView';
import { 
  ShoppingCartIcon, UserIcon, PackageIcon, TrendingUpIcon, DollarSignIcon, EditIcon, CheckCircleIcon, XIcon, ShieldCheckIcon, MessageSquareIcon, LayoutIcon, MapPinIcon, TruckIcon, BellIcon, MegaphoneIcon, TicketIcon, MapIcon, MenuIcon, RefreshCwIcon, FingerprintIcon, NavigationIcon, ZapIcon
} from './lib/contexts/Icons';
import { query, collection, orderBy, limit, onSnapshot, where, handleFirestoreError, OperationType } from '@/firebase';
import { OrderManagementSection } from './OrderManagementSection';
import { MarketingView } from './MarketingView';
import { BranchOrdersView } from './BranchOrdersView';
import { WarehouseView } from './WarehouseView';
import { WarehouseControlCenter } from './WarehouseControlCenter';
import { BRANCH_LOCATIONS } from './constants';

interface AdminDashboardPageProps {
  user: any;
  onNavigate: (page: string, params?: any) => void;
}

export default function AdminDashboard({ user, onNavigate }: AdminDashboardPageProps) {
  const { language, formatCurrency } = useI18n();
  const { 
    products, orders, updateProduct, deleteProduct, addProduct, updateOrder, categories, db, invoices, loading, notifications: fbNotifications, unreadCount: fbUnreadCount, homeSections, updateHomeSection, addHomeSection
  } = useFirebase();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState(
    user?.assignedBranchId ? 'branch_orders' : 
    (user?.type === 'marketing' ? 'products' : 'overview')
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(user?.assignedBranchId || (BRANCH_LOCATIONS.length > 0 ? BRANCH_LOCATIONS[0].id : ''));
  const [isSecondaryVerified, setIsSecondaryVerified] = useState(!(user?.pin_auth_enabled || user?.biometric_auth_enabled));
  const [verificationPin, setVerificationPin] = useState('');
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleVerifyPin = () => {
    if (verificationPin === user?.security_pin) {
      setIsSecondaryVerified(true);
      addToast(language === 'ar' ? 'تم التحقق بنجاح' : 'Verification successful', 'success');
    } else {
      addToast(language === 'ar' ? 'رمز PIN غير صحيح' : 'Incorrect PIN', 'error');
      setVerificationPin('');
    }
  };

  const handleVerifyBiometric = async () => {
    setIsVerifyingBiometric(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSecondaryVerified(true);
      addToast(language === 'ar' ? 'تم التحقق بالبصمة' : 'Biometric verification successful', 'success');
    } catch (error) {
      addToast(language === 'ar' ? 'فشل التحقق بالبصمة' : 'Biometric verification failed', 'error');
    } finally {
      setIsVerifyingBiometric(false);
    }
  };

  useEffect(() => {
    if (!db || !user) return;
    const isManagement = ['admin', 'developer', 'marketing', 'ops', 'branch_agent'].includes(user?.role || user?.type || '');
    const notificationsCollection = collection(db, 'notifications');
    let q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n: any) => !n.isRead).length);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'admin_notifications');
    });
    return () => unsubscribe();
  }, [db, user]);

  const tabs = useMemo(() => {
    const userPermissions = user?.permissions || [];
    const allTabs = [
      { id: 'master_control', label: 'التحكم المركزي', icon: ZapIcon, roles: ['admin', 'developer', 'ops'], permission: null },
      { id: 'overview', label: 'نظرة عامة', icon: TrendingUpIcon, roles: ['admin', 'marketing', 'developer', 'ops'], permission: null },
      { id: 'products', label: 'إدارة المنتجات', icon: PackageIcon, roles: ['admin', 'marketing', 'developer'], permission: 'manage_products' },
      { id: 'warehouse', label: 'إدارة المستودعات', icon: PackageIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_shipments' },
      { id: 'warehouse_control', label: 'كنترول المخازن والمناديب', icon: ShieldCheckIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_shipments' },
      { id: 'shipments', label: 'المشتريات والشحنات', icon: TruckIcon, roles: ['admin', 'ops', 'developer'], permission: 'manage_shipments' },
      { id: 'orders', label: 'استقبال الطلبات', icon: ShoppingCartIcon, roles: ['admin', 'marketing', 'developer', 'ops'], permission: 'receive_orders' },
      { id: 'operations', label: 'رادار العمليات', icon: TruckIcon, roles: ['admin', 'developer', 'ops', 'marketing'], permission: null },
      { id: 'customers', label: 'قاعدة العملاء', icon: UserIcon, roles: ['admin', 'developer'], permission: 'manage_users' },
      { id: 'accounting', label: 'النظام المحاسبي', icon: DollarSignIcon, roles: ['admin', 'developer'], permission: 'manage_accounting' },
      { id: 'delegates', label: 'المندوبين', icon: TruckIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_users' },
      { id: 'shipping', label: 'الشحن والتوصيل', icon: MapPinIcon, roles: ['admin', 'developer'], permission: 'manage_branches' },
      { id: 'quality', label: 'إدارة الجودة', icon: ShieldCheckIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_quality' },
      { id: 'complaints', label: 'الشكاوى', icon: MessageSquareIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_complaints' },
      { id: 'landing_sections', label: 'أقسام الواجهة', icon: LayoutIcon, roles: ['admin', 'marketing', 'developer'], permission: 'manage_ads' },
      { id: 'ads', label: 'الإعلانات', icon: MegaphoneIcon, roles: ['admin', 'marketing', 'developer'], permission: 'manage_ads' },
      { id: 'coupons', label: 'الكوبونات', icon: TicketIcon, roles: ['admin', 'marketing', 'developer'], permission: 'manage_coupons' },
      { id: 'branches', label: 'الفروع', icon: MapIcon, roles: ['admin', 'developer'], permission: 'manage_branches' },
      { id: 'price_requests', label: 'طلبات الأسعار', icon: TrendingUpIcon, roles: ['admin', 'developer'], permission: 'manage_prices' },
      { id: 'legal_docs', label: 'الوثائق الرسمية', icon: ShieldCheckIcon, roles: ['admin', 'developer'], permission: 'manage_developer' },
      { id: 'branch_orders', label: 'طلبات الفرع', icon: MapPinIcon, roles: ['admin', 'developer', 'ops', 'branch_agent'], permission: 'receive_orders' },
      { id: 'security', label: 'إدارة الحماية', icon: ShieldCheckIcon, roles: ['admin', 'developer'], permission: 'manage_developer' },
      { id: 'developer', label: 'قسم المطور', icon: EditIcon, roles: ['developer'], permission: 'manage_developer' },
    ];
    return allTabs.filter(tab => {
      if (user.type === 'developer') return true;
      if (tab.permission && userPermissions.includes(tab.permission)) return true;
      return tab.roles.includes(user.type);
    });
  }, [user.type, user.permissions]);

  if (loading) return <div className="h-screen flex items-center justify-center">جاري تحميل البيانات...</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex font-tajawal">
      {!isSecondaryVerified && (
        <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm">
            <h2 className="text-2xl font-black mb-6">التحقق الأمني</h2>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[1,2,3,4,5,6,7,8,9,'C',0,'OK'].map(num => (
                <button key={num} onClick={() => { 
                  if (num === 'C') setVerificationPin(''); 
                  else if (num === 'OK') handleVerifyPin(); 
                  else if (verificationPin.length < 4) setVerificationPin(prev => prev + num); 
                }} className="p-4 bg-slate-100 rounded-xl font-black">{num}</button>
              ))}
            </div>
            {user.biometric_auth_enabled && <button onClick={handleVerifyBiometric} className="w-full p-4 bg-primary text-white rounded-xl font-black">تحقق بالبصمة</button>}
          </div>
        </div>
      )}

      <aside className="w-72 bg-primary text-white p-6 hidden lg:block overflow-y-auto">
        <h2 className="text-2xl font-black mb-10 text-secondary">Delta Stars</h2>
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl font-black ${activeTab === tab.id ? 'bg-secondary text-primary' : 'hover:bg-white/10'}`}>
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto w-full">
        {activeTab === 'overview' && <MasterControlPanel />}
        {activeTab === 'products' && (user.type === 'marketing' ? <MarketingView products={products} /> : <ProductManagementSection />)}
        {activeTab === 'orders' && <OrderManagementSection orders={orders} />}
        {activeTab === 'warehouse' && <WarehouseView products={products} orders={orders} />}
        {activeTab === 'warehouse_control' && <WarehouseControlCenter user={user} />}
        {activeTab === 'customers' && <UserManagementSection />}
        {activeTab === 'accounting' && <AccountingSection language={language} orders={orders} products={products} invoices={invoices} />}
        {activeTab === 'delegates' && <DelegatesManagement />}
        {activeTab === 'shipping' && <ShippingManagementSection />}
        {activeTab === 'quality' && <QualityManagement />}
        {activeTab === 'complaints' && <ComplaintsManagement />}
        {activeTab === 'landing_sections' && <HomeSectionManagementSection homeSections={homeSections} />}
        {activeTab === 'ads' && <AdManagementSection />}
        {activeTab === 'coupons' && <CouponManagementSection />}
        {activeTab === 'branches' && <BranchManagementSection />}
        {activeTab === 'price_requests' && <PriceUpdateRequestSection />}
        {activeTab === 'branch_orders' && <BranchOrdersView branchId={selectedBranchId} />}
        {activeTab === 'security' && <SecuritySection />}
        {activeTab === 'developer' && <DeveloperDashboard />}
        {activeTab === 'operations' && <OperationsView />}
      </main>
    </div>
  );
}
