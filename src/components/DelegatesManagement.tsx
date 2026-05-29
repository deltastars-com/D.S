import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase, useI18n, useToast } from './lib/contexts';
import { 
  TruckIcon, UserIcon, MapPinIcon, PlusIcon, SearchIcon, 
  BarChartIcon, CalendarIcon, StarIcon, DollarSignIcon,
  TrendingUpIcon, CheckCircleIcon, ClockIcon, FilterIcon
} from './lib/contexts/Icons';
import { db, collection, query, getDocs, updateDoc, doc, where } from '@/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function DelegatesManagement() {
  const { language } = useI18n();
  const { addToast } = useToast();
  const [delegates, setDelegates] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'performance'>('list');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchDelegates = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'users'), where('type', '==', 'delegate'));
      const snapshot = await getDocs(q);
      const delegateUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDelegates(delegateUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'orders'));
      const snapshot = await getDocs(q);
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(allOrders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDelegates(), fetchOrders()]);
      setLoading(false);
    };
    loadData();
  }, [db]);

  const handleStatusChange = async (delegateId: string, status: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', delegateId), { delegateStatus: status });
      addToast(language === 'ar' ? 'تم تحديث حالة المندوب' : 'Delegate status updated', 'success');
      fetchDelegates();
    } catch (err) {
      addToast('Error updating status', 'error');
    }
  };

  const performanceData = useMemo(() => {
    return delegates.map(delegate => {
      const delegateOrders = orders.filter(o => 
        (o.driverId === delegate.id || o.assignedDriverId === delegate.id) &&
        o.createdAt >= dateRange.start && o.createdAt <= dateRange.end + 'T23:59:59'
      );

      const completed = delegateOrders.filter(o => o.status === 'delivered');
      const earnings = completed.length * 15; // Assume 15 SAR per delivery
      const ratingTotal = delegateOrders.reduce((acc, curr) => acc + (curr.rating || 5), 0);
      const avgRating = delegateOrders.length > 0 ? (ratingTotal / delegateOrders.length).toFixed(1) : '5.0';

      return {
        ...delegate,
        totalOrders: delegateOrders.length,
        completedCount: completed.length,
        earnings,
        avgRating,
        successRate: delegateOrders.length > 0 ? Math.round((completed.length / delegateOrders.length) * 100) : 100
      };
    });
  }, [delegates, orders, dateRange]);

  const filteredDelegates = (activeTab === 'list' ? delegates : performanceData).filter(d => 
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.phone || '').includes(searchTerm)
  );

  const t = {
    title: language === 'ar' ? 'إدارة المندوبين والموزعين' : 'Delegate & Driver Management',
    sub: language === 'ar' ? 'متابعة أداء المندوبين وحالة التوصيل الميداني' : 'Monitor delegate performance and field delivery status',
    tabList: language === 'ar' ? 'قائمة المناديب' : 'Delegate List',
    tabPerf: language === 'ar' ? 'الأداء والعمولات' : 'Performance & Earnings',
    search: language === 'ar' ? 'بحث عن مندوب...' : 'Search delegate...',
    add: language === 'ar' ? 'إضافة مندوب جديد' : 'Add New Delegate',
    earnings: language === 'ar' ? 'إجمالي الأرباح' : 'Total Earnings',
    orders: language === 'ar' ? 'الطلبات المكتملة' : 'Completed Orders',
    rating: language === 'ar' ? 'التقييم العام' : 'Avg Rating',
    success: language === 'ar' ? 'نسبة النجاح' : 'Success Rate',
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 gap-6">
        <div className="text-center lg:text-right w-full lg:w-auto">
          <h2 className="text-3xl font-black text-primary mb-2 flex items-center justify-center lg:justify-start gap-3">
            <TruckIcon className="w-8 h-8" />
            {t.title}
          </h2>
          <p className="text-gray-400 font-bold">{t.sub}</p>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-2 rounded-3xl w-full lg:w-auto">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'list' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-white/50'}`}
          >
            {t.tabList}
          </button>
          <button 
            onClick={() => setActiveTab('performance')}
            className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'performance' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-white/50'}`}
          >
            {t.tabPerf}
          </button>
        </div>

        <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all text-sm w-full lg:w-auto justify-center">
          <PlusIcon className="w-6 h-6" /> {t.add}
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder={t.search} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-primary/20" 
            />
            <SearchIcon className={`w-6 h-6 absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} />
          </div>

          {activeTab === 'performance' && (
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-gray-100">
               <div className="flex items-center gap-2 px-4">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                    className="bg-transparent font-bold text-xs outline-none"
                  />
                  <span className="text-gray-300">/</span>
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                    className="bg-transparent font-bold text-xs outline-none"
                  />
               </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'list' ? (
            <table className="w-full text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'المندوب' : 'Delegate'}</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'الفرع' : 'Branch'}</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">{language === 'ar' ? 'التحكم' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center font-black text-gray-300 animate-pulse">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</td></tr>
                ) : filteredDelegates.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center font-black text-gray-300">{language === 'ar' ? 'لا يوجد مندوبين مسجلين' : 'No delegates found'}</td></tr>
                ) : filteredDelegates.map(delegate => (
                  <tr key={delegate.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <span className="font-black text-slate-800">{delegate.name || 'غير معروف'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-gray-500">{delegate.phone || '---'}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                        <MapPinIcon className="w-4 h-4 text-primary" />
                        {delegate.assignedBranchId || 'غير معين'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                        delegate.delegateStatus === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                        delegate.delegateStatus === 'busy' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {delegate.delegateStatus === 'active' ? (language === 'ar' ? 'متاح' : 'Active') : 
                         delegate.delegateStatus === 'busy' ? (language === 'ar' ? 'مشغول' : 'Busy') : 
                         (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-primary">
                      {orders.filter(o => o.driverId === delegate.id && o.status !== 'delivered' && o.status !== 'cancelled').length}
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={delegate.delegateStatus || 'inactive'}
                        onChange={(e) => handleStatusChange(delegate.id, e.target.value)}
                        className="bg-slate-100 p-2 rounded-xl text-xs font-bold outline-none border-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="active">{language === 'ar' ? 'متاح' : 'Active'}</option>
                        <option value="busy">{language === 'ar' ? 'مشغول' : 'Busy'}</option>
                        <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10">
               {loading ? (
                 <div className="col-span-full p-20 text-center font-black text-gray-300 animate-pulse">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
               ) : filteredDelegates.length === 0 ? (
                 <div className="col-span-full p-20 text-center font-black text-gray-300">{language === 'ar' ? 'لا يوجد بيانات أداء' : 'No performance data'}</div>
               ) : filteredDelegates.map((perf: any) => (
                 <motion.div 
                   layout
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   key={perf.id} 
                   className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-2xl shadow-md p-1 border-2 border-primary/10">
                             {perf.avatar ? (
                               <img src={perf.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                             ) : (
                               <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-primary">
                                  <UserIcon className="w-6 h-6" />
                               </div>
                             )}
                          </div>
                          <div>
                             <h4 className="font-black text-slate-800">{perf.name}</h4>
                             <p className="text-[10px] font-bold text-gray-400">{perf.phone}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black">
                          <StarIcon className="w-3 h-3 fill-yellow-500" />
                          {perf.avgRating}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-4 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1">
                             <DollarSignIcon className="w-4 h-4 text-emerald-500" />
                             <span className="text-[10px] font-black text-gray-400">{t.earnings}</span>
                          </div>
                          <p className="text-xl font-black text-emerald-600">{perf.earnings} <small className="text-[10px]">ر.س</small></p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1">
                             <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                             <span className="text-[10px] font-black text-gray-400">{t.orders}</span>
                          </div>
                          <p className="text-xl font-black text-blue-600">{perf.completedCount}</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1">
                             <TrendingUpIcon className="w-4 h-4 text-purple-500" />
                             <span className="text-[10px] font-black text-gray-400">{t.success}</span>
                          </div>
                          <p className="text-xl font-black text-purple-600">%{perf.successRate}</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl">
                          <div className="flex items-center gap-2 mb-1">
                             <ClockIcon className="w-4 h-4 text-orange-500" />
                             <span className="text-[10px] font-black text-gray-400">{language === 'ar' ? 'متوسط الزمن' : 'Avg Time'}</span>
                          </div>
                          <p className="text-xl font-black text-orange-600">42 <small className="text-[10px]">د</small></p>
                       </div>
                    </div>

                    <button className="w-full mt-8 bg-slate-900 group-hover:bg-primary text-white py-4 rounded-2xl font-black text-xs transition-all shadow-lg">
                       {language === 'ar' ? 'عرض الكشف التفصيلي' : 'View Detailed Report'}
                    </button>
                 </motion.div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
