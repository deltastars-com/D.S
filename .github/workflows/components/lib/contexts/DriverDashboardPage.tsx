
import React, { useState, useEffect, useMemo } from 'react';
import { useI18n, useToast, DeliveryIcon, SparklesIcon, ShieldCheckIcon, PhoneIcon, XIcon, GlobeAltIcon } from './contexts';
import { DeliveryAgent, Page, Product } from '../../types';
import { useLiveLocation } from './hooks/useLiveLocation';
import { startDriverTracking, stopDriverTracking } from './services/trackingService';
import { sovereignCore } from './SovereignBackend';
import { db, auth } from '@/firebase';
import { doc, updateDoc, collection, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';

interface DriverDashboardProps {
    setPage: (p: Page) => void;
}

export const DriverDashboardPage: React.FC<DriverDashboardProps> = ({ setPage }) => {
    const { language, t } = useI18n();
    const { addToast } = useToast();
    const { location: currentCoords, error: locationError } = useLiveLocation();
    
    const [agent, setAgent] = useState<DeliveryAgent>(() => {
        try {
            const saved = localStorage.getItem('delta-current-driver');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.id) return parsed;
            }
        } catch (e) {
            console.warn("Driver session corrupted");
        }
        // Use authenticated user ID if available
        const userId = auth.currentUser?.uid || 'DS-DRV-99';
        return {
            id: userId,
            name: auth.currentUser?.displayName || (language === 'ar' ? 'أحمد السبيعي' : 'Ahmed Al-Subaie'),
            phone: '0551234567',
            vehicle_type: 'truck',
            status: 'offline',
            rating: 4.8,
            completed_orders: 450,
            location: { lat: 21.5424, lng: 39.2201 }
        };
    });

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        setIsLoading(true);
        // Listen to orders in Firestore
        const q = query(collection(db, 'orders'), where('status', 'in', ['setup', 'shipped']));
        const unsub = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Filter: either unassigned or assigned to this driver
            const driverOrders = fetchedOrders.filter((o: any) => 
                !o.driverId || o.driverId === agent.id
            );
            setOrders(driverOrders);
            setIsLoading(false);
        }, (err) => {
            console.error("Failed to fetch driver orders from Firestore", err);
            setIsLoading(false);
        });

        return () => unsub();
    }, [agent.id, db]);

    useEffect(() => {
        localStorage.setItem('delta-current-driver', JSON.stringify(agent));
        
        if (agent.status === 'online') {
            startDriverTracking(agent.id, agent.name).catch(err => console.error("Tracking failed:", err));
        } else {
            stopDriverTracking(agent.id).catch(err => console.error("Stop tracking failed:", err));
        }

        return () => {
            stopDriverTracking(agent.id).catch(err => console.error("Cleanup tracking failed:", err));
        };
    }, [agent.status, agent.id, agent.name]);

    const toggleStatus = () => {
        const newStatus = agent.status === 'offline' ? 'online' : 'offline';
        setAgent(prev => ({ ...prev, status: newStatus }));
        
        const msg = language === 'ar' 
            ? (newStatus === 'online' ? 'أنت الآن متصل ومتاح لاستقبال الطلبات' : 'تم تسجيل خروجك، لن تظهر للطلبات الجديدة')
            : (newStatus === 'online' ? 'You are now online and available for orders' : 'You are now offline, hidden from new orders');
            
        addToast(msg, newStatus === 'online' ? 'success' : 'info');
    };

    const acceptOrder = async (orderId: string) => {
        try {
            if (!db) return;
            
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'shipped',
                driverId: agent.id,
                updatedAt: serverTimestamp()
            });
            
            addToast(language === 'ar' ? 'تم قبول الطلب، بالتوفيق في التوصيل' : 'Order accepted, good luck with delivery', 'success');
        } catch (err) {
            console.error("Failed to accept order", err);
            addToast(language === 'ar' ? 'فشل في قبول الطلب' : 'Failed to accept order', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <button 
                    onClick={() => setPage('home')}
                    className="flex items-center gap-3 text-primary font-black hover:text-secondary transition-colors"
                >
                    <XIcon className="w-6 h-6" />
                    <span className="uppercase tracking-widest text-sm">{language === 'ar' ? 'خروج' : 'Exit'}</span>
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Sovereign Driver Node v25.0</span>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Profile & Status Header */}
                <div className="bg-primary text-white p-10 md:p-16 rounded-[4rem] shadow-4xl mb-12 relative overflow-hidden border-b-[20px] border-secondary">
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center gap-8">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-5xl md:text-6xl border border-white/20 shadow-2xl">
                                👨‍✈️
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
                                    {agent.name}
                                </h1>
                                <div className="flex flex-wrap gap-4">
                                    <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                                        {agent.id}
                                    </span>
                                    <span className="bg-secondary text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        ⭐ {agent.rating} Rating
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-6 bg-white/5 p-8 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">
                                {language === 'ar' ? 'الحالة الحالية' : 'Current Status'}
                            </p>
                            <button 
                                onClick={toggleStatus}
                                className={`group relative flex items-center gap-4 px-10 py-4 rounded-full font-black text-xl transition-all duration-500 ${agent.status === 'online' ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]' : 'bg-gray-700 text-gray-400'}`}
                            >
                                <span className={`w-4 h-4 rounded-full ${agent.status === 'online' ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></span>
                                {agent.status === 'online' ? (language === 'ar' ? 'متصل الآن' : 'ONLINE NOW') : (language === 'ar' ? 'غير متصل' : 'OFFLINE')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Live Telemetry Card */}
                        <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-4xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/5">📍</div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <GlobeAltIcon className="w-5 h-5 text-secondary animate-spin-slow" />
                                            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Live GPS Coordinates</p>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-mono font-black tracking-tighter">
                                            {currentCoords ? `${currentCoords.lat.toFixed(6)}°N, ${currentCoords.lng.toFixed(6)}°E` : (language === 'ar' ? 'جاري التحديد...' : 'Locating...')}
                                        </h3>
                                        {locationError && <p className="text-red-400 text-[10px] mt-2 font-bold uppercase">{locationError}</p>}
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Network Status</p>
                                    <div className="flex items-center gap-3 justify-center md:justify-end">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="font-black text-sm uppercase tracking-widest">Sovereign Link Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Section */}
                        <div className="bg-white p-10 md:p-12 rounded-[4rem] shadow-sovereign border border-gray-100">
                            <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
                                <h3 className="text-3xl font-black text-primary uppercase tracking-tighter flex items-center gap-4">
                                    <DeliveryIcon className="w-10 h-10 text-secondary" />
                                    {language === 'ar' ? 'الطلبات المتاحة' : 'Available Orders'}
                                </h3>
                                <span className="bg-primary/5 text-primary px-6 py-2 rounded-full font-black text-xs">
                                    {orders.length} {language === 'ar' ? 'طلب نشط' : 'Active Orders'}
                                </span>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center opacity-20">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <p className="font-black uppercase tracking-widest">Synchronizing Orders...</p>
                                </div>
                            ) : orders.length > 0 ? (
                                <div className="space-y-6">
                                    {orders.map((order, idx) => (
                                        <div key={idx} className="group bg-slate-50 p-8 rounded-[2.5rem] border-2 border-transparent hover:border-secondary hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:rotate-12 transition-transform">📦</div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-800">{order.id}</p>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{order.customerName}</p>
                                                </div>
                                            </div>
                                            <div className="text-center md:text-right">
                                                <p className="text-lg font-black text-primary">{order.total} SAR</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                            <button 
                                                onClick={() => acceptOrder(order.id)}
                                                disabled={order.status === 'delivering'}
                                                className={`px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl ${order.status === 'delivering' ? 'bg-green-500 text-white cursor-default' : 'bg-primary text-white hover:bg-secondary'}`}
                                            >
                                                {order.status === 'delivering' 
                                                    ? (language === 'ar' ? 'قيد التوصيل' : 'DELIVERING') 
                                                    : (language === 'ar' ? 'قبول التوصيل' : 'Accept Delivery')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center opacity-30">
                                    <SparklesIcon className="w-20 h-20 mx-auto mb-6 animate-pulse" />
                                    <p className="text-xl font-bold italic">
                                        {language === 'ar' ? 'لا توجد طلبات متاحة حالياً في منطقتك' : 'No orders currently available in your area'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Earnings Card */}
                        <div className="bg-white p-10 rounded-[3.5rem] shadow-sovereign border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full"></div>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-8">Earnings Summary</h4>
                            <div className="space-y-8">
                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Today's Earnings</p>
                                    <p className="text-5xl font-black text-primary tracking-tighter">185.00 <span className="text-lg">SAR</span></p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Deliveries</p>
                                        <p className="text-3xl font-black text-primary">12</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 text-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Hours</p>
                                        <p className="text-3xl font-black text-primary">6.5</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Safety & Support */}
                        <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-4xl border-b-[20px] border-secondary">
                            <h4 className="text-xl font-black mb-8 flex items-center gap-4 text-secondary uppercase tracking-widest">
                                <ShieldCheckIcon className="w-8 h-8" />
                                {language === 'ar' ? 'بروتوكول السلامة' : 'Safety Protocol'}
                            </h4>
                            <ul className="space-y-6">
                                {[
                                    { ar: 'تأكد من تبريد الشاحنة (4°C)', en: 'Ensure truck cooling (4°C)' },
                                    { ar: 'الالتزام بمسار الـ GPS المعتمد', en: 'Follow approved GPS route' },
                                    { ar: 'فحص جودة الصناديق قبل التسليم', en: 'Check box quality before delivery' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 group">
                                        <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black group-hover:bg-secondary group-hover:text-primary transition-colors">{i+1}</span>
                                        <p className="text-sm font-bold text-white/60 italic leading-relaxed">
                                            {language === 'ar' ? item.ar : item.en}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full mt-10 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-4">
                                <PhoneIcon className="w-5 h-5" />
                                {language === 'ar' ? 'دعم العمليات' : 'Ops Support'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
