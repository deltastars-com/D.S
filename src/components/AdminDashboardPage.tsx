import React, { useState } from 'react';
import { useFirebase } from './lib/contexts';
// استيراد كافة المكونات بشكل مباشر
import ProductManagementSection from './ProductManagementSection';
import OrderManagementSection from './OrderManagementSection';
import MarketingView from './MarketingView';
import MasterControlPanel from './MasterControlPanel';
import WarehouseView from './WarehouseView';
import AccountingSection from './AccountingSection';

export default function AdminDashboard({ user }: { user: any }) {
  const { products, orders, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');

  // تعريف التابات مع مطابقة دقيقة للاسم
  const tabs = [
    { id: 'overview', label: 'الرئيسية' },
    { id: 'products', label: 'المنتجات' },
    { id: 'orders', label: 'الطلبات' },
    { id: 'marketing', label: 'صالة العروض' },
    { id: 'warehouse', label: 'المستودعات' },
    { id: 'accounting', label: 'المحاسبة' }
  ];

  if (loading) return <div className="p-20 text-center">جاري استعادة كامل النظام...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-slate-900 text-white p-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
            className={`w-full p-3 mb-2 rounded ${activeTab === tab.id ? 'bg-blue-600' : 'hover:bg-slate-700'}`}>
            {tab.label}
          </button>
        ))}
      </aside>

      {/* منطقة المحتوى: ربط مباشر بدون شروط معقدة */}
      <main className="flex-1 p-8">
        {activeTab === 'overview' && <MasterControlPanel />}
        {activeTab === 'products' && <ProductManagementSection />}
        {activeTab === 'orders' && <OrderManagementSection orders={orders} />}
        {activeTab === 'marketing' && <MarketingView />}
        {activeTab === 'warehouse' && <WarehouseView products={products} orders={orders} />}
        {activeTab === 'accounting' && <AccountingSection />}
      </main>
    </div>
  );
}
