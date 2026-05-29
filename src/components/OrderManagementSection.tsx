import React, { useState } from 'react';
import { useFirebase, useToast, useI18n } from './lib/contexts';
import { 
  CheckCircleIcon, 
  TrashIcon, 
  EyeIcon, 
  TruckIcon, 
  FilterIcon,
  SearchIcon,
  MapPinIcon,
  PackageIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
  NavigationIcon,
  PhoneIcon
} from './lib/contexts/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { BRANCH_LOCATIONS } from '../constants';
import { formatCurrency } from './lib/utils';
import { Order } from '../types';

interface OrderManagementSectionProps {
  orders: Order[];
  onViewOrder?: (order: Order) => void;
}

export const OrderManagementSection: React.FC<OrderManagementSectionProps> = ({ orders: initialOrders, onViewOrder }) => {
  const { updateOrder, deleteOrder, products } = useFirebase();
  const { addToast } = useToast();
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredOrders = initialOrders?.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesBranch = selectedBranch === 'all' || order.branchId === selectedBranch;
    return matchesSearch && matchesStatus && matchesBranch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { 
        status: newStatus as any,
        updatedAt: new Date().toISOString()
      });
      addToast(language === 'ar' ? `تم تحديث حالة الطلب إلى ${newStatus}` : `Order status updated to ${newStatus}`, 'success');
      
      if (newStatus === 'shipped') {
        addToast(language === 'ar' ? 'تم إرسال إشعار تتبع للعميل' : 'Tracking notification sent to customer', 'info');
      }
    } catch (error) {
      addToast(language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status', 'error');
    }
  };

  const handleAssignBranch = async (orderId: string, branchId: string) => {
    try {
      await updateOrder(orderId, { branchId });
      addToast(language === 'ar' ? 'تم تحويل الطلب للفرع' : 'Order transferred to branch', 'success');
    } catch (error) {
      addToast(language === 'ar' ? 'فشل تحويل الطلب' : 'Failed to transfer order', 'error');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Control Panel Header */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sovereign border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <PackageIcon className="w-8 h-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">مركز إدارة العمليات السيادي</h2>
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">مزامنة لحظية مع جميع فروع ومخازن المملكة</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative group flex-grow lg:flex-grow-0">
            <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="البحث عن طلب..."
              className="w-full lg:w-64 pr-10 pl-6 py-3 bg-slate-50 border-2 border-transparent focus:border-primary rounded-2xl font-black outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleRefresh}
            className={`p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCwIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Logic Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        {(['all', 'pending', 'preparing', 'shipped', 'delivered', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${filterStatus === status ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:bg-slate-50'}`}
          >
            {status}
          </button>
        ))}
        <div className="flex-grow" />
        <select 
          className="bg-white border-2 border-slate-100 px-4 py-2 rounded-xl font-black text-xs outline-none"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value="all">جميع فروع المملكة</option>
          {BRANCH_LOCATIONS.map(b => (
            <option key={b.id} value={b.id}>{language === 'ar' ? b.name_ar : b.name_en}</option>
          ))}
        </select>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[1000px]">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest text-center">
                <th className="px-8 py-6">ID الطلب</th>
                <th>العميل</th>
                <th>قيمة الفاتورة</th>
                <th>الفرع</th>
                <th>حالة المعالجة</th>
                <th className="pr-8">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders?.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-all group text-center">
                  <td className="px-8 py-6">
                    <span className="font-black text-primary text-xs">#{order.id.slice(-8)}</span>
                  </td>
                  <td className="py-6">
                    <div className="text-right inline-block">
                      <p className="font-black text-slate-800 text-sm">{order.customerName || 'عميل VIP'}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{order.customerPhone}</p>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="text-base font-black text-secondary">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="py-6">
                    <select 
                      value={order.branchId || ''}
                      onChange={(e) => handleAssignBranch(order.id, e.target.value)}
                      className="bg-slate-100 px-3 py-2 rounded-xl font-black text-[10px] border-none outline-none focus:ring-1 ring-primary"
                    >
                      <option value="">غير محدد</option>
                      {BRANCH_LOCATIONS.map(b => (
                        <option key={b.id} value={b.id}>{language === 'ar' ? b.name_ar : b.name_en}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-6">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 transition-all cursor-pointer ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}
                    >
                      <option value="pending">⏳ قيد الانتظار</option>
                      <option value="preparing">📦 جاري التجهيز</option>
                      <option value="shipped">🚚 تم الشحن</option>
                      <option value="delivered">✅ تم التسليم</option>
                      <option value="cancelled">❌ ملغي</option>
                    </select>
                  </td>
                  <td className="py-6 pr-8">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onViewOrder ? onViewOrder(order) : setSelectedOrder(order)}
                        className="p-2.5 bg-white shadow-md rounded-xl text-primary hover:bg-primary hover:text-white transition-all border border-gray-100"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {order.status === 'shipped' && (
                        <button 
                          onClick={() => window.open(`/tracking/${order.id}`, '_blank')}
                          className="p-2.5 bg-white shadow-md rounded-xl text-secondary hover:bg-secondary hover:text-white transition-all border border-gray-100"
                        >
                          <NavigationIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-2.5 bg-white shadow-md rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-gray-100"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Side Panel Logic / Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               className="bg-white w-full max-w-lg h-full ml-auto shadow-2xl p-10 overflow-y-auto"
            >
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-800">تفاصيل الطلبات</h3>
                  <button onClick={() => setSelectedOrder(null)}><ArrowLeftIcon className="w-8 h-8 text-gray-300" /></button>
               </div>
               
               <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-gray-100 mb-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">رقم الفاتورة السيادية</p>
                  <p className="text-xl font-black text-primary">#{selectedOrder.id}</p>
               </div>

               <div className="space-y-6">
                  {selectedOrder.items?.map((item: any, idx: number) => {
                    const product = products.find(p => p.id === item.productId || p.id === item.id);
                    return (
                      <div key={idx} className="flex gap-4 items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <img src={product?.image} className="w-16 h-16 rounded-xl object-cover" alt="" />
                        <div className="flex-grow">
                          <p className="font-black text-slate-800 text-sm">{product?.name_ar}</p>
                          <p className="text-[10px] text-gray-400">{item.quantity} {product?.unit_ar}</p>
                        </div>
                        <p className="font-black text-primary">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    );
                  })}
               </div>

               <div className="mt-10 pt-10 border-t-2 border-slate-50 space-y-4">
                  <div className="flex justify-between font-black text-slate-800">
                    <span>الإجمالي الفرعي</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between font-black text-secondary text-2xl">
                    <span>القيمة النهائية</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
               </div>

               <button 
                  onClick={() => window.open(`/tracking/${selectedOrder.id}`, '_blank')}
                  className="w-full mt-10 bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary transition-all"
               >
                 <TruckIcon className="w-6 h-6" /> تتبع الشحنة الآن
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
