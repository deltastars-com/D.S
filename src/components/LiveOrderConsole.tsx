
import React, { useState, useEffect } from 'react';
import { Order, Branch } from '../types';
import { useI18n, useToast, ShoppingBagIcon, CheckCircleIcon, ClockIcon, MapPinIcon, UserIcon, PhoneIcon } from './lib/contexts';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, onSnapshot, orderBy, updateDoc, doc, handleFirestoreError, OperationType, where, limit, addDoc } from '@/firebase';

interface LiveOrderConsoleProps {
  branchId?: string;
}

export const LiveOrderConsole: React.FC<LiveOrderConsoleProps> = ({ branchId }) => {
  const { language, formatCurrency, t } = useI18n();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ordersRef = collection(db, 'orders');
    // If branchId is provided, query specifically for that branch to avoid permission denied on other branches
    const q = branchId 
      ? query(ordersRef, where('branchId', '==', branchId), orderBy('createdAt', 'desc'), limit(100))
      : query(ordersRef, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn('Live Order Console restricted: Permission denied for this query.');
      } else {
        handleFirestoreError(error, OperationType.GET, 'orders_live');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [branchId]);

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status,
        updatedAt: new Date().toISOString()
      });

      // Automated Notification Logic
      if (status === 'preparing') {
        const order = orders.find(o => o.id === orderId);
        const branchName = order?.branchId || 'الرئيسي';
        
        // CREATE REAL NOTIFICATION DOCUMENT
        await addDoc(collection(db, 'notifications'), {
          title_ar: `طلب جديد لتجهيزه - فرع ${branchName}`,
          title_en: `New Order for Prep - Branch ${branchName}`,
          message_ar: `الرجاء البدء في تجهيز الطلب رقم #${orderId.slice(-6)} فوراً`,
          message_en: `Please start preparing order #${orderId.slice(-6)} immediately`,
          type: 'order',
          orderId,
          status: 'unread',
          createdAt: new Date().toISOString(),
          branchId: order?.branchId || 'all',
          metadata: { sound: 'alert_new_order', priority: 'high' }
        });

        addToast(
          language === 'ar' 
            ? `تم إخطار مندوب فرع ${branchName} آلياً لتجهيز الطلب` 
            : `Branch delegate notified automatically for order preparation`, 
          'success'
        );
        
        // Dispatch event for Real-time Dashboard
        const event = new CustomEvent('delegate-dispatch', { detail: { orderId, branchId: order?.branchId } });
        window.dispatchEvent(event);
      }

      if (status === 'shipped') {
        const order = orders.find(o => o.id === orderId);
        
        // CREATE REAL NOTIFICATION DOCUMENT FOR DISPATCH
        await addDoc(collection(db, 'notifications'), {
          title_ar: 'جاهز للتوصيل 🚛',
          title_en: 'Ready for Delivery 🚛',
          message_ar: `الطلب رقم #${orderId.slice(-6)} جاهز للاستلام والتوصبل للعميل ${order?.customerName}`,
          message_en: `Order #${orderId.slice(-6)} is ready for pickup and delivery to ${order?.customerName}`,
          type: 'dispatch',
          orderId,
          status: 'unread',
          createdAt: new Date().toISOString(),
          branchId: order?.branchId || 'all',
          metadata: { sound: 'alert_ready_dispatch' }
        });
      }

      // Play notification sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (err) {
      addToast(t('admin.userManagement.updateFailed'), 'error');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const processingOrders = orders.filter(o => o.status === 'preparing');

  return (
    <div className="space-y-8 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl flex justify-between items-center border-b-8 border-secondary">
        <div>
          <h2 className="text-4xl font-black mb-2">
            {t('admin.liveConsole.title')} 📡
          </h2>
          <p className="text-secondary font-bold uppercase tracking-widest text-xs">
            {branchId ? `Branch ID: ${branchId}` : (language === 'ar' ? 'مركز العمليات العالمي' : 'Global Operations Center')}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] text-white/40 uppercase font-black">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</p>
            <p className="text-2xl font-black text-secondary">{pendingOrders.length}</p>
          </div>
          <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] text-white/40 uppercase font-black">{language === 'ar' ? 'قيد التجهيز' : 'Preparing'}</p>
            <p className="text-2xl font-black text-white">{processingOrders.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* New Orders Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-primary flex items-center gap-3 px-4">
            <ClockIcon className="w-6 h-6 text-secondary animate-pulse" />
            {t('admin.liveConsole.awaiting')}
          </h3>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pendingOrders.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"
                >
                  <ShoppingBagIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">{t('admin.liveConsole.noNew')}</p>
                </motion.div>
              ) : (
                pendingOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -100 }}
                    className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-secondary/20 relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 ${language === 'ar' ? 'right-0' : 'left-0'} w-2 h-full bg-secondary`}></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black bg-secondary/10 text-secondary px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                          #{order.id.slice(-6)}
                        </span>
                        <h4 className="text-xl font-black text-primary">{order.customerName}</h4>
                      </div>
                      <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                        <p className="text-2xl font-black text-primary">{formatCurrency(order.total)}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 text-secondary" />
                        <span className="truncate">{order.address || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 text-secondary" />
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="flex-1 bg-primary text-white py-3 rounded-xl font-black hover:bg-secondary transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        {t('admin.liveConsole.accept')}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black hover:bg-red-500 hover:text-white transition-all"
                      >
                        {t('admin.liveConsole.reject')}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Processing Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-primary flex items-center gap-3 px-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            {t('admin.liveConsole.inPrep')}
          </h3>
          
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {processingOrders.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"
                >
                  <p className="text-gray-400 font-bold">{t('admin.liveConsole.noPrep')}</p>
                </motion.div>
              ) : (
                processingOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-black text-primary">{order.customerName}</h4>
                          <p className="text-[10px] text-gray-400 font-bold">#{order.id.slice(-6)}</p>
                        </div>
                      </div>
                      <div className="bg-green-50 text-green-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {language === 'ar' ? 'قيد التجهيز' : 'Preparing'}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                      <p className="text-xs font-bold text-gray-500 mb-2">{t('admin.liveConsole.contents')}</p>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-black">
                            <span>{language === 'ar' ? item.name_ar : item.name_en} x {item.quantity}</span>
                            <span className="text-primary">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'shipped')}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl font-black hover:bg-primary transition-all flex items-center justify-center gap-2"
                    >
                      {t('admin.liveConsole.ready')}
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
