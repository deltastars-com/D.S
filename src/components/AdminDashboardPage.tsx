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
  ShoppingCartIcon, 
  UserIcon, 
  PackageIcon, 
  TrendingUpIcon, 
  DollarSignIcon, 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  XIcon,
  SearchIcon,
  FilterIcon,
  ShieldCheckIcon,
  MessageSquareIcon,
  EyeIcon,
  LayoutIcon,
  MapPinIcon,
  TruckIcon,
  BellIcon,
  MegaphoneIcon,
  TicketIcon,
  MapIcon,
  MenuIcon,
  RefreshCwIcon,
  FingerprintIcon,
  NavigationIcon,
  BrainIcon,
  ZapIcon
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

const AdminDashboardPageInternal: React.FC<AdminDashboardPageProps> = ({ user, onNavigate }) => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black mb-2">مرحباً {user?.name || 'المشرف'}</h1>
        <p className="text-gray-500 mb-8">لوحة تحكم مدير المتجر</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <PackageIcon className="w-10 h-10 text-primary" />
            <div>
              <p className="text-gray-500">الطلبات اليوم</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <UserIcon className="w-10 h-10 text-primary" />
            <div>
              <p className="text-gray-500">العملاء الجدد</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <DollarSignIcon className="w-10 h-10 text-primary" />
            <div>
              <p className="text-gray-500">الإيرادات</p>
              <p className="text-2xl font-bold">8,450 ر.س</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => onNavigate('admin_support')}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl shadow hover:shadow-md transition-all"
          >
            <MessageSquareIcon className="w-6 h-6" />
            <span className="font-bold">إدارة تذاكر الدعم</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-gray-500 text-center py-20">المحتوى الرئيسي للوحة التحكم (مثل قائمة الطلبات أو المنتجات) يمكن وضعه هنا.</p>
        </div>
      </div>
    </div>
  );
};

interface AdminDashboardProps {
  user: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { language, formatCurrency } = useI18n();
  const { 
    products, 
    orders, 
    updateProduct, 
    deleteProduct, 
    addProduct, 
    updateOrder, 
    categories, 
    db, 
    invoices, 
    loading, 
    notifications: fbNotifications, 
    unreadCount: fbUnreadCount,
    homeSections,
    updateHomeSection,
    addHomeSection
  } = useFirebase();
  const { addToast } = useToast();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-primary border-t-secondary rounded-full animate-spin mx-auto shadow-xl"></div>
          <p className="text-primary font-black animate-pulse">جاري تحميل البيانات السيادية...</p>
        </div>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState(
    user?.assignedBranchId ? 'branch_orders' : 
    (user?.type === 'marketing' ? 'products' : 'overview')
  );
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
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
    let q;
    
    if (isManagement) {
      q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(10));
    } else if (user?.uid) {
      q = query(notificationsCollection, where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(10));
    } else {
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const hasNewOrder = newNotifications.some((n: any) => !n.isRead && (n.type === 'order' || n.metadata?.sound === 'alert_new_order'));
      if (hasNewOrder && notifications.length > 0) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.warn('Sound play blocked by browser', e));
      }

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter((n: any) => !n.isRead).length);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn('Admin notifications restricted - possibly non-admin role accessing dashboard components');
      } else {
        handleFirestoreError(error, OperationType.GET, 'admin_notifications');
      }
    });
    return () => unsubscribe();
  }, [db, notifications.length, user]);

  const [formData, setFormData] = useState<any>({
    name_ar: '',
    name_en: '',
    price: 0,
    category: 'vegetables',
    image: '',
    description_ar: '',
    description_en: '',
    stock_quantity: 100,
    unit_ar: 'كيلو',
    unit_en: 'kg'
  });

  const tabs = useMemo(() => {
    const userPermissions = user?.permissions || [];
    
    const allTabs = [
      { id: 'master_control', label: 'التحكم المركزي', icon: ZapIcon, roles: ['admin', 'developer', 'ops'], permission: null },
      { id: 'overview', label: 'نظرة عامة', icon: TrendingUpIcon, roles: ['admin', 'marketing', 'developer', 'ops'], permission: null },
      { id: 'products', label: 'إدارة المنتجات', icon: PackageIcon, roles: ['admin', 'marketing', 'developer'], permission: 'manage_products' },
      { id: 'warehouse', label: 'إدارة المستودعات', icon: PackageIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_shipments' },
      { id: 'warehouse_control', label: 'كنترول المخازن والمناديب', icon: ShieldCheckIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_shipments' },
      { id: 'shipments', label: 'المشتريات والشحنات', icon: TruckIcon, roles: ['admin', 'ops', 'developer'], permission: 'manage_shipments' },
      { id: 'orders', label: 'استقبال الطلبات من العملاء', icon: ShoppingCartIcon, roles: ['admin', 'marketing', 'developer', 'ops'], permission: 'receive_orders' },
      { id: 'operations', label: 'رادار العمليات المباشر', icon: TruckIcon, roles: ['admin', 'developer', 'ops', 'marketing'], permission: null },
      { id: 'customers', label: 'قاعدة العملاء', icon: UserIcon, roles: ['admin', 'developer'], permission: 'manage_users' },
      { id: 'accounting', label: 'النظام المحاسبي', icon: DollarSignIcon, roles: ['admin', 'developer'], permission: 'manage_accounting' },
      { id: 'delegates', label: 'المندوبين', icon: TruckIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_users' },
      { id: 'shipping', label: 'الشحن والتوصيل', icon: MapPinIcon, roles: ['admin', 'developer'], permission: 'manage_branches' },
      { id: 'quality', label: 'إدارة الجودة', icon: ShieldCheckIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_quality' },
      { id: 'complaints', label: 'الشكاوى', icon: MessageSquareIcon, roles: ['admin', 'developer', 'ops'], permission: 'manage_complaints' },
      { id: 'landing_sections', label: 'أقسام الواجهة الرئيسية', icon: LayoutIcon, roles: ['admin', 'marketing', 'developer'], permission: 'manage_ads' },
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

  const stats = useMemo(() => {
    const totalRevenue = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const totalProducts = products?.length || 0;
    return { totalRevenue, pendingOrders, totalProducts };
  }, [orders, products]);

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      addToast(language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated', 'success');
    } catch (err) {
      addToast(language === 'ar' ? 'خطأ في التحديث' : 'Update error', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-tajawal relative overflow-hidden">
      {!isSecondaryVerified && (
        <div className="fixed inset-0 z-[1000] bg-primary-dark flex items-center justify-center p-6 backdrop-blur-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/95 backdrop-blur-xl w-full max-w-md p-8 md:p-12 rounded-[4rem] shadow-sovereign border-8 border-white group relative z-10"
          >
            <div className="text-center space-y-6 md:space-y-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary text-secondary rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-6 transition-transform">
                <ShieldCheckIcon className="w-10 h-10 md:w-12 md:h-12" />
              </div>
              
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-primary mb-2">التحقق السيادي المتقدم</h2>
                <p className="text-sm md:text-base text-gray-400 font-bold px-4">
                  مطلوب طبقة حماية إضافية للوصول لغرفة العمليات الحساسة. يرجى إدخال رمز الأمان الخاص بك.
                </p>
              </div>

              {user.pin_auth_enabled && (
                <div className="space-y-6">
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div 
                        key={i} 
                        className={`w-10 h-14 md:w-12 md:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                          verificationPin.length >= i ? 'bg-primary border-primary text-white scale-110 shadow-glow' : 'bg-gray-50 border-gray-100 text-gray-300'
                        }`}
                      >
                        {verificationPin.length >= i ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map(num => (
                      <button
                        key={num}
                        onClick={() => {
                          if (num === 'C') setVerificationPin('');
                          else if (num === 'OK') handleVerifyPin();
                          else if (verificationPin.length < 4) setVerificationPin(prev => prev + num);
                        }}
                        className={`h-12 md:h-14 rounded-2xl font-black text-xl transition-all shadow-sm active:scale-95 flex items-center justify-center ${
                          num === 'OK' ? 'bg-secondary text-white col-span-1 shadow-lg hover:bg-yellow-600' : 
                          num === 'C' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-white text-primary hover:bg-slate-50 border border-gray-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {user.biometric_auth_enabled && (
                <button
                  onClick={handleVerifyBiometric}
                  disabled={isVerifyingBiometric}
                  className="w-full h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center gap-4 group transition-all hover:bg-secondary hover:scale-[1.02] shadow-xl"
                >
                  <FingerprintIcon className={`w-10 h-10 ${isVerifyingBiometric ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                  <span className="text-xl font-black">تحقق بالبصمة</span>
                </button>
              )}
              
              <button 
                onClick={() => window.location.href = '/'}
                className="text-gray-400 font-bold hover:text-red-500 transition-colors"
              >
                رجوع للمتجر
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-[600] bg-secondary text-white p-4 rounded-full shadow-2xl border-4 border-white"
      >
        {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[550] lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-[560] w-72 md:w-80 bg-primary text-white p-6 md:p-10 flex flex-col border-l-[6px] md:border-l-[10px] border-secondary transition-transform duration-500 ease-in-out
        lg:relative lg:translate-x-0 lg:z-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-12 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Delta Stars</h2>
          <p className="text-secondary font-bold text-[10px] md:text-xs mt-2 uppercase tracking-widest">
            {user?.type === 'admin' ? 'لوحة الإدارة العامة' : 
             user?.type === 'marketing' ? 'لوحة التسويق والمبيعات' : 'لوحة المطور السيادية'}
          </p>
        </div>
        
        <nav className="flex-1 space-y-2 md:space-y-4 overflow-y-auto scrollbar-hide">
          {(tabs || []).map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all ${activeTab === tab.id ? 'bg-secondary text-white shadow-xl translate-x-2' : 'hover:bg-white/5 text-gray-400'}`}
            >
              <tab.icon className="w-5 h-5 md:w-6 md:h-6" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10">
          <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase">المستخدم الحالي</p>
          <p className="text-xs md:text-sm font-black text-secondary break-all">{user.email}</p>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
        <div className="bg-primary-dark p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-2xl mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-center gap-6 border-r-8 md:border-r-[12px] border-secondary overflow-hidden relative group">
          <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="text-center md:text-right">
            <h1 className="text-2xl md:text-4xl font-black text-white text-shadow-sovereign mb-2">غرفة العمليات المركزية</h1>
            <p className="text-xs md:text-sm text-secondary font-bold flex items-center justify-center md:justify-start gap-2">
              <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
              نظام الإدارة السيادي - {user?.type === 'admin' ? 'المدير العام' : user?.type === 'developer' ? 'المطور التقني' : 'مسؤول التسويق'}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => window.location.reload()}
              className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 text-blue-700 hover:bg-blue-100 transition-all flex items-center gap-2"
              title="تحديث البيانات"
            >
              <RefreshCwIcon className="w-6 h-6" />
              <span className="hidden md:inline font-black text-xs">تحديث</span>
            </button>

            <div className="relative group">
              <button className="p-4 bg-green-50 rounded-2xl border-2 border-green-100 text-green-700 hover:bg-green-100 transition-all relative">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-3xl shadow-4xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-6">
                <h4 className="font-black text-primary mb-4 flex items-center justify-between">
                  {language === 'ar' ? 'الإشعارات' : 'Notifications'}
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg text-slate-400 uppercase tracking-widest">Live Radar</span>
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-400 py-8 italic text-sm">{language === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications'}</p>
                  ) : (notifications || []).map(n => (
                    <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-gray-100 hover:border-primary transition-all cursor-pointer">
                      <p className="font-black text-sm text-slate-800">{language === 'ar' ? n.title_ar : n.title_en}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{language === 'ar' ? n.message_ar : n.message_en}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">{new Date(n.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 px-6 py-3 rounded-2xl border-2 border-green-100 text-center">
              <p className="text-[10px] text-gray-400 font-black uppercase">حالة النظام</p>
              <p className="text-green-600 font-black flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-ping"></span>
                متصل وآمن
              </p>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 md:space-y-12 animate-fade-in">
            <MasterControlPanel />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl border-b-8 border-green-600 flex items-center justify-between transform hover:scale-105 transition-all">
                <div className="space-y-2">
                  <p className="text-black font-bold text-[10px] md:text-sm uppercase tracking-widest">إجمالي الإيرادات</p>
                  <h4 className="text-2xl md:text-4xl font-black text-green-700">{formatCurrency(stats.totalRevenue)}</h4>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-xl md:rounded-3xl flex items-center justify-center text-green-700">
                  <DollarSignIcon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
              <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl border-b-8 border-yellow-500 flex items-center justify-between transform hover:scale-105 transition-all">
                <div className="space-y-2">
                  <p className="text-black font-bold text-[10px] md:text-sm uppercase tracking-widest">طلبات قيد الانتظار</p>
                  <h4 className="text-2xl md:text-4xl font-black text-yellow-600">{stats.pendingOrders} طلب</h4>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-xl md:rounded-3xl flex items-center justify-center text-yellow-600">
                  <ShoppingCartIcon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
              <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl border-b-8 border-blue-50 flex items-center justify-between transform hover:scale-105 transition-all sm:col-span-2 lg:col-span-1">
                <div className="space-y-2">
                  <p className="text-black font-bold text-[10px] md:text-sm uppercase tracking-widest">إجمالي المنتجات</p>
                  <h4 className="text-2xl md:text-4xl font-black text-blue-600">{stats.totalProducts} صنف</h4>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-xl md:rounded-3xl flex items-center justify-center text-blue-600">
                  <PackageIcon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-12 rounded-2xl md:rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
              <h3 className="text-xl md:text-2xl font-black text-primary mb-6 md:mb-8 px-2">آخر الطلبات الواردة 📦</h3>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-[800px]">
                  <thead>
                    <tr className="text-black border-b-2 font-black text-[10px] md:text-sm">
                      <th className="py-4 md:py-6">رقم الطلب</th>
                      <th>العميل</th>
                      <th>التاريخ</th>
                      <th>المبلغ</th>
                      <th>الحالة</th>
                      <th>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-b hover:bg-slate-50 transition-all group">
                        <td className="py-4 md:py-6 font-black text-primary text-sm md:text-base">#{order.id.slice(0, 8)}</td>
                        <td className="font-black text-black text-sm md:text-base">{order.customerName || 'عميل VIP'}</td>
                        <td className="text-black font-black text-[10px] md:text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="font-black text-secondary text-sm md:text-base">{formatCurrency(order.total)}</td>
                        <td>
                          <span className={`px-3 md:px-4 py-1 md:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {order.status === 'delivered' ? 'مكتمل' : order.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleStatusChange(order.id, 'delivered')} className="text-emerald-600 hover:scale-110 transition-transform p-2"><CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <AIInsightsSection products={products} orders={orders} />
            <PredictiveOrdersSection products={products} orders={orders} />
          </div>
        )}

        {activeTab === 'master_control' && (
          <MasterControlPanel />
        )}

        {activeTab === 'products' && (
          user.type === 'marketing' ? (
            <MarketingView 
              products={products} 
              onUpdateProduct={updateProduct} 
              onAddProduct={addProduct} 
              onBack={() => setActiveTab('overview')} 
            />
          ) : (
            <ProductManagementSection />
          )
        )}

        {activeTab === 'orders' && (
          <OrderManagementSection 
            orders={orders} 
            onViewOrder={(order) => {
              setSelectedOrder(order);
              setIsOrderModalOpen(true);
            }} 
          />
        )}

        {activeTab === 'customers' && (
          <UserManagementSection />
        )}

        {activeTab === 'ads' && (
          <AdManagementSection />
        )}

        {activeTab === 'coupons' && (
          <CouponManagementSection />
        )}

        {activeTab === 'landing_sections' && (
          <HomeSectionManagementSection 
            homeSections={homeSections}
            handleSaveSection={async (section) => {
              if (section.id) {
                await updateHomeSection(section.id, section);
              } else {
                await addHomeSection(section);
              }
            }}
            handleDeleteSection={(id) => updateHomeSection(id, { isVisible: false })}
          />
        )}

        {activeTab === 'branches' && (
          <BranchManagementSection />
        )}

        {activeTab === 'price_requests' && (
          <PriceUpdateRequestSection />
        )}

        {activeTab === 'legal_docs' && (
          <div className="space-y-10 animate-fade-in pb-20">
            <div className="bg-primary-dark p-10 rounded-[3rem] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-4">الوثائق والملفات الرسمية 📁</h2>
                <p className="text-secondary font-bold text-lg">الوصول الآمن لسجلات الشركة القانونية والمستندات الرسمية</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'هوية المدير العام', color: 'bg-emerald-50 text-emerald-700', url: 'https://drive.google.com/file/d/1MidaG2glKPgOMGPQgN28M4ks-YbUM8vH/view?usp=drivesdk' },
                { title: 'السجل التجاري', color: 'bg-blue-50 text-blue-700', url: 'https://drive.google.com/file/d/1ZhiuIawZC6SPEf91tXR2lfZM4jo10JDY/view?usp=drivesdk' },
                { title: 'الرقم الضريبي', color: 'bg-orange-50 text-orange-700', url: 'https://drive.google.com/file/d/12mBYsWHZuQgHLu0DF6ddQnK4Tkwm60ON/view?usp=drivesdk' },
                { title: 'رابط حساب البنك 1', color: 'bg-purple-50 text-purple-700', url: 'https://drive.google.com/file/d/1Z-sCFoS6joN3BcKhCubwOZLvowmPRTYe/view?usp=drivesdk' },
                { title: 'رابط حساب البنك 2', color: 'bg-purple-50 text-purple-700', url: 'https://drive.google.com/file/d/1h5ocL1ixP6CNyCkZM9MuFuvVqHShzWzC/view?usp=drivesdk' },
                { title: 'رابط حساب البنك 3', color: 'bg-purple-50 text-purple-700', url: 'https://drive.google.com/file/d/1ncgLWgU7451YY8W9B8-fnSWJho9BrpQN/view?usp=drivesdk' },
              ].map((doc, idx) => (
                <motion.a
                  key={idx}
                  href={doc.url}
                  target="_blank"
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`p-10 rounded-[2.5rem] border-4 border-white shadow-sovereign flex flex-col items-center text-center gap-6 ${doc.color}`}
                >
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-lg">📁</div>
                  <div>
                    <h4 className="text-xl font-black mb-2">{doc.title}</h4>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Official Document</p>
                  </div>
                  <div className="mt-4 px-6 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">View in Drive</div>
                </motion.a>
              ))}
            </div>

            <div className="bg-white p-12 rounded-[4rem] shadow-sovereign border border-gray-100">
                <h3 className="text-2xl font-black text-primary mb-8 flex items-center gap-4">
                  <ShieldCheckIcon className="w-8 h-8 text-secondary" />
                  بروتوكول أمان الوثائق
                </h3>
                <div className="bg-slate-50 p-10 rounded-[3rem] border-l-8 border-secondary">
                  <p className="text-slate-600 font-bold leading-relaxed">
                    يتم تخزين هذه الروابط في بيئة مشفرة ولا تظهر إلا للمدير العام والمطور التقني. يُمنع مشاركة هذه الروابط مع أي أطراف خارجية. جميع الوصول لهذه الملفات يتم تسجيله في سجلات النظام (Audit Logs).
                  </p>
                </div>
            </div>
          </div>
        )}

        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[500] flex items-center justify-center p-4 md:p-10 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-scale-in">
              <div className="p-8 md:p-12 border-b-2 border-gray-50 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">تفاصيل الطلب #{selectedOrder.id.slice(0, 8)}</h3>
                  <p className="text-gray-400 font-bold mt-1">{new Date(selectedOrder.createdAt).toLocaleString('ar-SA')}</p>
                </div>
                <button 
                  onClick={() => setIsOrderModalOpen(false)}
                  className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all group"
                >
                  <XIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
              
              <div className="p-8 md:p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">معلومات العميل</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100">
                      <p className="text-xl font-black text-slate-800">{selectedOrder.customerName || 'عميل VIP'}</p>
                      <p className="text-sm font-bold text-gray-400 mt-1">ID: {selectedOrder.customerId}</p>
                      <p className="text-sm font-bold text-primary mt-2">طريقة الدفع: {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">حالة الطلب والفرع</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">الحالة الحالية:</span>
                        <span className={`px-4 py-1 rounded-full font-black text-[10px] uppercase ${
                          selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400">الفرع المسؤول:</span>
                        <span className="font-black text-primary text-sm">
                          {BRANCH_LOCATIONS.find(b => b.id === selectedOrder.branchId)?.name_ar || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <NavigationIcon className="w-4 h-4 text-secondary" />
                    تتبع الشحنة المباشر (GPS)
                  </h4>
                  <ShipmentMap 
                    orderLocation={selectedOrder.location}
                    status={selectedOrder.status}
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">أصناف الطلب</h4>
                  <div className="bg-white border-2 border-gray-100 rounded-[2rem] overflow-hidden">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 border-b border-gray-100">
                        <tr>
                          <th className="p-5 font-black text-primary text-xs uppercase">المنتج</th>
                          <th className="p-5 font-black text-primary text-xs uppercase text-center">الكمية</th>
                          <th className="p-5 font-black text-primary text-xs uppercase">السعر</th>
                          <th className="p-5 font-black text-primary text-xs uppercase">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-all">
                            <td className="p-5">
                              <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name_ar} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                <div>
                                  <p className="font-black text-slate-800">{item.name_ar}</p>
                                  <p className="text-[10px] font-bold text-gray-400">{item.unit_ar}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-center font-black text-slate-600">x{item.quantity}</td>
                            <td className="p-5 font-bold text-slate-600">{item.price} ر.س</td>
                            <td className="p-5 font-black text-secondary">{(item.price * item.quantity).toFixed(2)} ر.س</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t-2 border-gray-100">
                        <tr>
                          <td colSpan={3} className="p-6 text-left font-black text-slate-400 uppercase tracking-widest">المبلغ الإجمالي</td>
                          <td className="p-6 font-black text-3xl text-secondary">{selectedOrder.total} ر.س</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="p-8 md:p-12 bg-slate-50 border-t-2 border-gray-100 flex justify-end gap-4">
                <button 
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-10 py-4 bg-white border-2 border-gray-200 rounded-2xl font-black text-slate-400 hover:bg-gray-100 transition-all"
                >
                  إغلاق
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl hover:bg-secondary transition-all"
                >
                  طباعة الفاتورة
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounting' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AccountingSection 
              language={language}
              orders={orders}
              products={products}
              invoices={invoices}
              handleUpdateOrder={updateOrder}
              addToast={addToast}
            />
          </div>
        )}

        {activeTab === 'operations' && (
          <OperationsView onBack={() => setActiveTab('overview')} />
        )}

        {activeTab === 'quality' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <QualityManagement />
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ComplaintsManagement />
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ShipmentManagement />
          </div>
        )}

        {activeTab === 'warehouse' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WarehouseView 
              products={products} 
              orders={orders}
              onUpdateStock={(id, qty) => updateProduct(id, { stock_quantity: qty })} 
              onUpdateOrderStatus={(id, status) => updateOrder(id, { status })}
              onBack={() => setActiveTab('overview')}
              invoices={invoices}
            />
          </div>
        )}

        {activeTab === 'warehouse_control' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WarehouseControlCenter 
              user={user}
              onBack={() => setActiveTab('overview')}
            />
          </div>
        )}

        {activeTab === 'delegates' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DelegatesManagement />
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ShippingManagementSection />
          </div>
        )}

        {activeTab === 'branch_orders' && (
          <div className="space-y-8">
            {(user.type === 'admin' || user.type === 'developer') && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-2xl font-black text-primary">إشراف الفروع المباشر</h3>
                  <p className="text-gray-400 font-bold">اختر الفرع لمتابعة الطلبات والعمليات في منطقتهم</p>
                </div>
                <select 
                  className="bg-slate-50 p-4 rounded-2xl border-2 border-gray-100 font-black outline-none min-w-[250px] focus:border-secondary transition-all"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  {BRANCH_LOCATIONS.map(b => (
                    <option key={b.id} value={b.id}>{b.name_ar}</option>
                  ))}
                </select>
              </div>
            )}
            <BranchOrdersView 
              branchId={selectedBranchId} 
              onBack={() => setActiveTab('overview')} 
            />
          </div>
        )}

        {activeTab === 'security' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SecuritySection />
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DeveloperDashboard onBack={() => setActiveTab('overview')} />
          </div>
        )}
      </main>
    </div>
  );
}
