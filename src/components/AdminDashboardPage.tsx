import React, { useState } from 'react';
import { useFirebase } from './lib/contexts';
// استيراد كافة المكونات بشكل مباشر وصريح
import ProductManagementSection from './ProductManagementSection';
import OrderManagementSection from './OrderManagementSection';
import MarketingView from './MarketingView';
import MasterControlPanel from './MasterControlPanel';
import WarehouseView from './WarehouseView';
import AccountingSection from './AccountingSection';

export default function AdminDashboard({ user }: { user: any }) {
  const { products, orders, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <div className="p-20 text-center font-black">جاري تحميل أركان النظام السيادي...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-black mb-10">التحكم السيادي</h2>
        <nav className="space-y-3">
          <button onClick={() => setActiveTab('overview')} className="block w-full text-right p-3 hover:bg-blue-600 rounded">الرئيسية</button>
          <button onClick={() => setActiveTab('products')} className="block w-full text-right p-3 hover:bg-blue-600 rounded">المنتجات</button>
          <button onClick={() => setActiveTab('orders')} className="block w-full text-right p-3 hover:bg-blue-600 rounded">الطلبات والسلة</button>
          <button onClick={() => setActiveTab('marketing')} className="block w-full text-right p-3 hover:bg-blue-600 rounded">التسويق</button>
        </nav>
      </aside>

      {/* منطقة العرض */}
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
