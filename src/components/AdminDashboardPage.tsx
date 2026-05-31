import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase, useI18n, useToast } from './lib/contexts';
import { 
  ShoppingCartIcon, UserIcon, PackageIcon, TrendingUpIcon, DollarSignIcon, EditIcon, CheckCircleIcon, XIcon, ShieldCheckIcon, MessageSquareIcon, LayoutIcon, MapPinIcon, TruckIcon, BellIcon, MegaphoneIcon, TicketIcon, MapIcon, MenuIcon, RefreshCwIcon, ZapIcon
} from './lib/contexts/Icons';

// استيراد كافة الأقسام الوظيفية
import { ProductManagementSection } from './ProductManagementSection';
import { OrderManagementSection } from './OrderManagementSection';
import { MasterControlPanel } from './MasterControlPanel';
import { MarketingView } from './MarketingView';
import { BranchOrdersView } from './BranchOrdersView';

interface AdminDashboardPageProps { user: any; onNavigate: (page: string, params?: any) => void; }

export default function AdminDashboard({ user, onNavigate }: AdminDashboardPageProps) {
  const { language, formatCurrency } = useI18n();
  const { products, orders, updateOrder, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = useMemo(() => [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUpIcon },
    { id: 'products', label: 'المنتجات', icon: PackageIcon },
    { id: 'orders', label: 'الطلبات', icon: ShoppingCartIcon },
    { id: 'master_control', label: 'التحكم', icon: ZapIcon }
  ], []);

  if (loading) return <div className="p-20 text-center font-black">جاري تهيئة النظام...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-right" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-full lg:w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-black mb-10">لوحة التحكم</h2>
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`w-full flex items-center gap-3 p-3 rounded-lg font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-6 lg:p-10">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 font-bold">إجمالي المبيعات</p>
              <h3 className="text-2xl font-black">{formatCurrency(orders?.reduce((a, b) => a + (b.total || 0), 0) || 0)}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 font-bold">عدد المنتجات</p>
              <h3 className="text-2xl font-black">{products?.length || 0}</h3>
            </div>
          </div>
        )}

        {activeTab === 'products' && <ProductManagementSection />}
        {activeTab === 'orders' && <OrderManagementSection orders={orders} />}
        {activeTab === 'master_control' && <MasterControlPanel />}
      </main>
    </div>
  );
}
