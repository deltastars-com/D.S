import React, { useState, useEffect, useMemo } from 'react';
import { useFirebase, useI18n, useToast } from './lib/contexts';
import { useDriverTracking } from '../hooks/useDriverTracking';
import { useLocation } from '../hooks/useLocation';
import { 
  TruckIcon, PackageIcon, MapPinIcon, 
  CheckCircleIcon, ClockIcon, PhoneIcon,
  NavigationIcon
} from './lib/contexts/Icons';

interface DriverDashboardPageProps {
  onLogout: () => void;
}

export const DriverDashboardPage: React.FC<DriverDashboardPageProps> = ({ onLogout }) => {
  const { user, orders, updateOrder } = useFirebase();
  const { language, formatCurrency } = useI18n();
  const { location, startWatching, stopWatching } = useLocation();
  const { updateMyLocation } = useDriverTracking();
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState(false);

  const activeOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => o.driverId === user.id && o.status !== 'delivered' && o.status !== 'cancelled');
  }, [orders, user]);

  const completedToday = useMemo(() => {
    if (!user) return 0;
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(o => 
      o.driverId === user.id && 
      o.status === 'delivered' && 
      o.createdAt.startsWith(today)
    ).length;
  }, [orders, user]);

  useEffect(() => {
    if (isOnline) {
      startWatching();
    } else {
      stopWatching();
    }
  }, [isOnline, startWatching, stopWatching]);

  useEffect(() => {
    if (isOnline && location) {
      updateMyLocation(location.lat, location.lng);
    }
  }, [location, isOnline, updateMyLocation]);

  const toggleOnline = () => {
    setIsOnline(!isOnline);
    addToast(
      language === 'ar' 
        ? (isOnline ? 'أنت الآن غير متصل' : 'أنت الآن متصل وجاهز لاستلام الطلبات')
        : (isOnline ? 'You are now offline' : 'You are now online and ready for orders'),
      isOnline ? 'info' : 'success'
    );
  };

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      await updateOrder(orderId, { status });
      addToast(
        language === 'ar' ? 'تم تحديث حالة الشحنة' : 'Shipment status updated',
        'success'
      );
    } catch (err) {
      addToast(
        language === 'ar' ? 'فشل في تحديث الحالة' : 'Failed to update status',
        'error'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-tajawal text-right" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl shadow-xl flex justify-between items-center border-b-4 border-green-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <TruckIcon className="w-10 h-10 text-green-800" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-green-900">{language === 'ar' ? 'لوحة المندوب' : 'Driver Dashboard'}</h1>
              <p className="text-sm font-bold text-gray-500">{user?.full_name || user?.name}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-red-600 font-black text-sm hover:bg-red-50 p-2 px-4 rounded-xl transition-all"
          >
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>

        {/* Status Card */}
        <div className={`p-8 rounded-3xl shadow-xl transition-all ${isOnline ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black mb-2">
                {isOnline 
                  ? (language === 'ar' ? 'متصل الآن' : 'Online Now')
                  : (language === 'ar' ? 'غير متصل' : 'Offline')}
              </h2>
              <p className="font-bold opacity-80">
                {isOnline 
                  ? (language === 'ar' ? 'يتم تتبع موقعك حالياً لتسهيل وصول الطلبات' : 'Your location is being tracked to facilitate orders')
                  : (language === 'ar' ? 'قم بتفعيل الوضع المتصل لاستقبال الطلبات' : 'Enable online mode to receive orders')}
              </p>
            </div>
            <button 
              onClick={toggleOnline}
              className={`px-8 py-4 rounded-2xl font-black text-lg shadow-2xl transition-all transform active:scale-95 ${
                isOnline ? 'bg-white text-green-600 hover:bg-gray-100' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isOnline 
                ? (language === 'ar' ? 'إيقاف التشغيل' : 'Go Offline')
                : (language === 'ar' ? 'بدء العمل 🚀' : 'Start Working 🚀')}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: language === 'ar' ? 'طلبات اليوم' : 'Today Orders', value: completedToday.toString(), icon: PackageIcon, color: 'blue' },
            { label: language === 'ar' ? 'المسافة (كم)' : 'Distance (km)', value: '45.2', icon: MapPinIcon, color: 'purple' },
            { label: language === 'ar' ? 'التقييم' : 'Rating', value: '4.9', icon: CheckCircleIcon, color: 'yellow' },
            { label: language === 'ar' ? 'ساعات العمل' : 'Working Hours', value: '6:30', icon: ClockIcon, color: 'green' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-gray-100">
              <stat.icon className={`w-6 h-6 text-${stat.color}-600 mb-2`} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active Orders */}
        <div className="bg-white p-8 rounded-3xl shadow-xl">
          <h3 className="text-xl font-black text-green-900 mb-6 flex items-center gap-2">
            <PackageIcon className="w-6 h-6" />
            {language === 'ar' ? 'الطلبات النشطة' : 'Active Orders'}
          </h3>
          
          {activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">{language === 'ar' ? 'لا توجد طلبات نشطة حالياً' : 'No active orders at the moment'}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black text-slate-800">#{order.id.slice(-6)}</h4>
                      <p className="text-sm font-bold text-gray-500">{order.customerName}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-black text-primary">{formatCurrency(order.total)}</p>
                      <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                    <MapPinIcon className="w-4 h-4 text-red-500" />
                    {order.address || (language === 'ar' ? 'العنوان غير محدد' : 'Address not specified')}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                      onClick={() => {
                        if (order.customerPhone) window.open(`tel:${order.customerPhone}`);
                      }}
                      className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 p-4 rounded-2xl font-black text-slate-600 hover:bg-gray-100 transition-all"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      {language === 'ar' ? 'اتصال' : 'Call'}
                    </button>
                    <button 
                      className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 p-4 rounded-2xl font-black text-slate-600 hover:bg-gray-100 transition-all"
                    >
                      <NavigationIcon className="w-5 h-5" />
                      {language === 'ar' ? 'خرائط' : 'Maps'}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                      {language === 'ar' ? 'تحديث حالة الشحنة' : 'Update Shipment Status'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['preparing', 'setup', 'shipped', 'delivered'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(order.id, status)}
                          disabled={order.status === status}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            order.status === status
                              ? 'bg-green-600 text-white shadow-lg'
                              : 'bg-white text-gray-400 border border-gray-200 hover:border-green-600 hover:text-green-600'
                          }`}
                        >
                          {status === 'preparing' && (language === 'ar' ? 'تجهيز' : 'Preparing')}
                          {status === 'setup' && (language === 'ar' ? 'تحميل' : 'Setup')}
                          {status === 'shipped' && (language === 'ar' ? 'شحن' : 'Shipped')}
                          {status === 'delivered' && (language === 'ar' ? 'تسليم' : 'Delivered')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
