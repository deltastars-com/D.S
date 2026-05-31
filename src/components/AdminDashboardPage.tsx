import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase, useI18n } from './lib/contexts';
// استيراد كافة المكونات بالكامل
import ProductManagementSection from './ProductManagementSection';
import OrderManagementSection from './OrderManagementSection';
import MasterControlPanel from './MasterControlPanel';
import MarketingView from './MarketingView';
import WarehouseView from './WarehouseView';
import AccountingSection from './AccountingSection';
import QualityManagement from './QualityManagement';
import ComplaintsManagement from './ComplaintsManagement';
import AdManagementSection from './AdManagementSection';
import HomeSectionManagementSection from './HomeSectionManagementSection';
import CouponManagementSection from './CouponManagementSection';
import BranchManagementSection from './BranchManagementSection';
import SecuritySection from './SecuritySection';
import DeveloperDashboard from './DeveloperDashboard';
import DelegatesManagement from './DelegatesManagement';
import { 
  ShoppingCartIcon, PackageIcon, TrendingUpIcon, DollarSignIcon, ZapIcon, 
  MessageSquareIcon, LayoutIcon, MegaphoneIcon, TicketIcon, MapIcon, ShieldCheckIcon, TruckIcon
} from './lib/contexts/Icons';

export default function AdminDashboard({ user }: { user: any }) {
  const { products, orders, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'الرئيسية', icon: TrendingUpIcon },
    { id: 'products', label: 'المنتجات', icon: PackageIcon },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCartIcon },
    { id: 'marketing', label: 'التسويق', icon: MegaphoneIcon },
    { id: 'warehouse', label: 'المستودعات', icon: PackageIcon },
    { id: 'home_sections', label: 'أقسام الواجهة', icon: LayoutIcon },
    { id: 'accounting', label: 'المحاسبة', icon: DollarSignIcon },
    { id: 'quality', label: 'الجودة', icon: ShieldCheckIcon },
    { id: 'complaints', label: 'الشكاوى', icon: MessageSquareIcon },
    { id: 'coupons', label: 'الكوبونات', icon: TicketIcon },
    { id: 'branches', label: 'الفروع', icon: MapIcon },
    { id: 'delegates', label: 'المندوبين', icon: TruckIcon },
    { id: 'security', label: 'الحماية', icon: ShieldCheckIcon },
    { id: 'control', label: 'التحكم المركزي', icon: ZapIcon }
  ];

  if (loading) return <div className="h-screen flex items-center justify-center font-black">جاري تحميل أركان النظام...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal text-right" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-72 bg-slate-900 text-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black mb-10 text-secondary">لوحة التحكم</h2>
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`w-full flex items-center gap-4 p-4 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8 border-b pb-6">
          <h1 className="text-3xl font-black">{tabs.find(t => t.id === activeTab)?.label}</h1>
        </div>

        {/* عرض كافة الأقسام بناءً على التاب النشط */}
        <div className="space-y-6">
          {activeTab === 'overview' && <MasterControlPanel />}
          {activeTab === 'products' && <ProductManagementSection />}
          {activeTab === 'orders' && <OrderManagementSection orders={orders} />}
          {activeTab === 'marketing' && <MarketingView />}
          {activeTab === 'warehouse' && <WarehouseView products={products} orders={orders} />}
          {activeTab === 'home_sections' && <HomeSectionManagementSection />}
          {activeTab === 'accounting' && <AccountingSection />}
          {activeTab === 'quality' && <QualityManagement />}
          {activeTab === 'complaints' && <ComplaintsManagement />}
          {activeTab === 'coupons' && <CouponManagementSection />}
          {activeTab === 'branches' && <BranchManagementSection />}
          {activeTab === 'delegates' && <DelegatesManagement />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'control' && <MasterControlPanel />}
        </div>
      </main>
    </div>
  );
}
