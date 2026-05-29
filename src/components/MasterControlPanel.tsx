
import React from 'react';
import { motion } from 'motion/react';
import { 
  ActivityIcon, ShieldCheckIcon, TruckIcon, 
  DatabaseIcon, WalletIcon, BellIcon, 
  RefreshCcwIcon, ZapIcon 
} from './lib/contexts/Icons';
import { useI18n, useFirebase } from '../components/lib/contexts';

interface SystemStatus {
  id: string;
  name_ar: string;
  name_en: string;
  status: 'online' | 'warning' | 'offline';
  load: number;
  icon: React.ReactNode;
}

export const MasterControlPanel: React.FC = () => {
    const { language } = useI18n();
    const { products, ads } = useFirebase();

    const systems: SystemStatus[] = [
        { id: 'auth', name_ar: 'نظام الهوية والاستحقاق', name_en: 'Identity & Auth', status: 'online', load: 12, icon: <ShieldCheckIcon className="w-6 h-6" /> },
        { id: 'db', name_ar: 'قاعدة البيانات السيادية', name_en: 'Sovereign Database', status: 'online', load: 34, icon: <DatabaseIcon className="w-6 h-6" /> },
        { id: 'logistics', name_ar: 'نظام التتبع اللوجستي', name_en: 'Logistics Tracking', status: 'online', load: 56, icon: <TruckIcon className="w-6 h-6" /> },
        { id: 'finance', name_ar: 'التكامل المالي (Onyx)', name_en: 'Financial Integration', status: 'online', load: 5, icon: <WalletIcon className="w-6 h-6" /> },
        { id: 'notif', name_ar: 'محرك الإشعارات الذكي', name_en: 'Smart Notification Engine', status: 'online', load: 89, icon: <BellIcon className="w-6 h-6" /> },
        { id: 'ai', name_ar: 'مساعد الذكاء الاصطناعي', name_en: 'AI Core Assistant', status: 'online', load: 22, icon: <ZapIcon className="w-6 h-6 text-secondary" /> }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systems.map((sys, idx) => (
                    <motion.div 
                        key={sys.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-[3rem] shadow-sovereign border border-slate-50 relative overflow-hidden group hover:scale-[1.02] transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                {sys.icon}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${sys.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sys.status}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xl font-black text-slate-800">{language === 'ar' ? sys.name_ar : sys.name_en}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Automation Priority: High</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase">
                                    <span>System Load</span>
                                    <span>{sys.load}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sys.load}%` }}
                                        className={`h-full ${sys.load > 80 ? 'bg-red-500' : 'bg-primary'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-primary-dark p-10 md:p-14 rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full border border-white/10 shadow-lg">
                            <RefreshCcwIcon className="w-4 h-4 text-emerald-400 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global Status: Synchronized</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                            {language === 'ar' ? 'الأتمتة الكاملة للنظام السيادي' : 'Sovereign Protocol Full Automation'}
                        </h3>
                        <p className="text-white/60 font-medium text-lg leading-relaxed max-w-2xl">
                            {language === 'ar' 
                                ? 'جميع الأنظمة الداخلية مرتبطة وتعمل بتكامل لحظي. يتم مراقبة حركة المبيعات، المخزون، والجودة عبر محرك الذكاء الاصطناعي "عدي" لضمان الكفاءة القصوى.'
                                : 'All internal systems are linked and operating with real-time integration. Sales, inventory, and quality are monitored via AI Core "Adi" to ensure maximum efficiency.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center bg-white/5 p-6 rounded-3xl border border-white/10">
                            <div className="text-4xl font-black text-secondary">99.9%</div>
                            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Uptime</div>
                        </div>
                        <div className="text-center bg-white/5 p-6 rounded-3xl border border-white/10">
                            <div className="text-4xl font-black text-emerald-400">1.2s</div>
                            <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Dispatch</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
