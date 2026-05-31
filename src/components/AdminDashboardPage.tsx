import React, { useState } from 'react';
import { useFirebase } from './lib/contexts';

// استيراد كافة المكونات المهنية (تأكد من وجود هذه الملفات في المجلد)
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

export default function AdminDashboard({ user }: { user: any }) {
  const { products, orders, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <div className="text-center p-20 font-black">جاري تهيئة النظام...</div>;

  return (
    <div className="flex min-h-screen bg-slate-100" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-72 bg-slate-900 text-white p-6">
        <h2 className="text-2xl font-black mb-10 text-blue-400">لوحة التحكم</h2>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('overview')} className="w-full text-right p-4 hover:bg-blue-600 rounded">الرئيسية</button>
          <button onClick={() => setActiveTab('products')} className="w-full text-right p-4 hover:bg-blue-600 rounded">المنتجات</button>
          <button onClick={() => setActiveTab('orders')} className="w-full text-right p-4 hover:bg-blue-600 rounded">الطلبات</button>
          <button onClick={() => setActiveTab('marketing')} className="w-full text-right p-4 hover:bg-blue-600 rounded">التسويق</button>
          <button onClick={() => setActiveTab('accounting')} className="w-full text-right p-4 hover:bg-blue-600 rounded">المحاسبة</button>
        </nav>
      </aside>

      {/* منطقة المحتوى */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'overview' && <MasterControlPanel />}
        {activeTab === 'products' && <ProductManagementSection />}
        {activeTab === 'orders' && <OrderManagementSection orders={orders} />}
        {activeTab === 'marketing' && <MarketingView />}
        {activeTab === 'accounting' && <AccountingSection />}
      </main>
    </div>
  );
}
