import React, { useState, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Cpu as CpuIcon,
  UserCheck as UserCheckIcon,
  Code as CodeIcon,
  ChevronLeft as ChevronLeftIcon,
  Smartphone as SmartphoneIcon,
  Shield as ShieldIcon,
  Layers as LayersIcon,
  History as HistoryIcon,
  CreditCard as CreditCardIcon,
  Check as CheckIcon
} from 'lucide-react';
import {
  ShieldCheckIcon, 
  DatabaseIcon, 
  FingerprintIcon, 
  EyeIcon, 
  LockIcon,
  SparklesIcon,
  LayoutIcon,
  SettingsIcon,
  GlobeIcon,
  MessageSquareIcon,
  BellIcon,
  ActivityIcon,
  RefreshCwIcon,
  TrashIcon,
  PlusIcon,
  AlertTriangleIcon,
  ZapIcon,
  TruckIcon,
  PackageIcon,
  FileTextIcon,
  DownloadIcon,
  ClockIcon,
  AlertCircleIcon,
  SearchIcon
} from './lib/contexts/Icons';
import { useI18n, useFirebase, useToast } from './lib/contexts';
import { useAuth } from '../contexts/AuthContext';
import { PromotionManagementSection } from './PromotionManagementSection';
import { motion, AnimatePresence } from 'motion/react';
import { authenticateBiometric, isBiometricAvailable, registerBiometric, hasRegisteredKey } from './webAuthn';

/**
 * Delta Stars Sovereign Developer Operating System (DevOS)
 * This is the core management interface for high-level operations.
 * Highly secured via PIN (321666) and Biometric MFA.
 */

// --- Specialized Dashboard Modules ---

const OperationsSection: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
       <div className="bg-slate-900 md:p-12 p-6 rounded-[3rem] md:rounded-[4rem] text-white overflow-hidden relative border-4 border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                <GlobeIcon className="w-10 h-10 text-secondary" />
                Sovereign Logistics Hub
              </h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">تتبع الشحنات والأسطول المبرد عبر المملكة</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-emerald-500/20 text-emerald-400 px-6 py-2 rounded-full text-[10px] font-black border border-emerald-500/30">SAT-LINK: ACTIVE</div>
              <div className="bg-white/5 text-white/40 px-6 py-2 rounded-full text-[10px] font-black border border-white/10">FLEET: 24/24</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'شحنات قيد الحركة', value: '14', icon: TruckIcon, color: 'text-emerald-400' },
              { label: 'طلبات قيد التجهيز', value: '28', icon: PackageIcon, color: 'text-secondary' },
              { label: 'متوسط وقت التسليم', value: '4.2h', icon: HistoryIcon, color: 'text-primary' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 group hover:border-primary transition-all">
                <s.icon className={`w-8 h-8 mb-4 ${s.color}`} />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-4xl font-black">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="aspect-[21/9] bg-white/5 rounded-[3rem] relative flex items-center justify-center border-2 border-white/10 group cursor-crosshair overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i8!2i160!3i106!2m3!1e0!2sm!3i637021676!3m17!2sen!3sSA!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1s1s2!2s3!4m1!1e71!5m1!5f2!23i1301875')] bg-cover opacity-20 group-hover:opacity-40 transition-opacity" />
             <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-ping">
                  <div className="w-8 h-8 bg-secondary rounded-full shadow-glow" />
                </div>
                <p className="text-white font-black tracking-widest uppercase text-lg">Live Interactive Fleet Map</p>
                <p className="text-white/40 font-bold text-xs mt-2 uppercase tracking-[0.3em]">Delta Stars Neural Tracking System</p>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: 'فرع جدة (المقر الرئيسي)', status: 'active', load: '85%', fleet: 12 },
            { name: 'فرع مكة المكرمة', status: 'active', load: '62%', fleet: 8 },
            { name: 'فرع الرياض', status: 'standby', load: '45%', fleet: 10 },
            { name: 'فرع المدينة المنورة', status: 'active', load: '78%', fleet: 6 },
            { name: 'فرع الدمام', status: 'active', load: '55%', fleet: 7 },
            { name: 'فرع أبها', status: 'low', load: '30%', fleet: 4 }
          ].map((branch, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border-2 border-gray-50 shadow-xl hover:border-primary transition-all group">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-xl font-black text-slate-800">{branch.name}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  branch.status === 'active' ? 'bg-emerald-500 shadow-glowEmerald' : 
                  branch.status === 'standby' ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'
                }`} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                   <span className="text-slate-400">الأسطول النشط:</span>
                   <span className="text-slate-800">{branch.fleet} شاحنة</span>
                </div>
                <div className="flex justify-between text-xs font-bold border-b border-gray-50 pb-2">
                   <span className="text-slate-400">سعة المخزون:</span>
                   <span className={`font-black ${parseInt(branch.load) > 80 ? 'text-red-500' : 'text-emerald-500'}`}>{branch.load}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                   <span className="text-slate-400">الاتصال المباشر:</span>
                   <span className="text-slate-800">نشط (Neural)</span>
                </div>
              </div>
              <button className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest group-hover:bg-primary transition-all">
                عرض كنترول الفرع
              </button>
            </div>
          ))}
       </div>
    </div>
  );
};

const QualitySection: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
       <div className="bg-emerald-600 p-10 md:p-16 rounded-[4rem] text-white shadow-sovereign relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex-1">
               <div className="flex items-center gap-4 mb-4">
                 <ShieldCheckIcon className="w-12 h-12" />
                 <h2 className="text-5xl font-black uppercase tracking-tighter">QA Intelligence</h2>
               </div>
               <p className="text-white/70 font-bold uppercase tracking-widest text-sm max-w-xl">
                 نظام فحص الجودة المتقدم - نضمن أن كل صنف يصل للعميل بمعايير دلتا ستارز الصارمة
               </p>
            </div>
            <div className="flex gap-4">
               <div className="px-10 py-6 bg-white/10 rounded-[2.5rem] backdrop-blur-xl border border-white/20 text-center">
                  <p className="text-[10px] font-black opacity-60 uppercase mb-2">Quality Score</p>
                  <p className="text-5xl font-black tracking-tighter">9.8</p>
               </div>
               <div className="px-10 py-6 bg-white/10 rounded-[2.5rem] backdrop-blur-xl border border-white/20 text-center">
                  <p className="text-[10px] font-black opacity-60 uppercase mb-2">Refusal Rate</p>
                  <p className="text-5xl font-black tracking-tighter">0.4%</p>
               </div>
            </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[4rem] border-2 border-gray-100 shadow-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
              <HistoryIcon className="w-8 h-8 text-emerald-600 font-black" />
              آخر سجلات الفحص
            </h3>
            <div className="space-y-4">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-emerald-500 transition-all">
                    <div className="flex gap-4 items-center">
                       <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black">A{i}</div>
                       <div>
                          <p className="font-black text-slate-800">شحنة #{15234 + i}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">المورد: مزارع الجزيرة</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-emerald-600 font-black">EXCELLENT</p>
                       <p className="text-[10px] text-slate-400 font-bold">Today, 09:42 AM</p>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-8 bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase shadow-glowEmerald hover:scale-[1.02] transition-all">
              بدء فحص شحنة جديدة
            </button>
          </div>

          <div className="bg-slate-900 p-10 rounded-[4rem] text-white">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-4">
               <AlertCircleIcon className="w-8 h-8 text-red-500" />
               الإبلاغ عن شكوى فنية/هدر
            </h3>
            <div className="space-y-6">
               <p className="text-gray-400 text-sm font-bold">تقديم بلاغ فوري عن تلف في المخزون أو خلل في التبريد لتنبيه الإدارة والتسويق.</p>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <button className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all text-center">
                        <p className="text-red-500 font-black text-xl">تلف مخزون</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Report Damage</p>
                     </button>
                     <button className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all text-center">
                        <p className="text-secondary font-black text-xl">خلل فني</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Technical Issue</p>
                     </button>
                  </div>
                  <textarea 
                    className="w-full h-32 bg-white/5 border-2 border-white/5 rounded-[2rem] p-6 text-white font-bold placeholder:text-gray-700 focus:border-red-500 outline-none transition-all"
                    placeholder="اكتب تفاصيل الملاحظة هنا..."
                  />
                  <button className="w-full bg-red-600 text-white py-5 rounded-3xl font-black uppercase hover:bg-red-500 transition-all">
                    إرسال البلاغ الفوري للأقسام
                  </button>
               </div>
            </div>
          </div>
       </div>
    </div>
  );
};

const AccountingSection: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
       <div className="bg-slate-900 p-12 md:p-20 rounded-[4rem] text-white relative overflow-hidden border-4 border-secondary/20 shadow-sovereign">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
             <div className="flex-1">
                <h2 className="text-6xl font-black tracking-tighter mb-4">FINANCE CORE</h2>
                <div className="flex items-center gap-4 text-secondary/60 font-black text-xs uppercase tracking-[0.4em]">
                  <CreditCardIcon className="w-4 h-4" />
                  Sovereign Banking Interface
                </div>
             </div>
             <div className="text-center md:text-right">
                <p className="text-secondary text-5xl md:text-7xl font-black tracking-tighter">742,850.50 <span className="text-2xl opacity-40">SAR</span></p>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">إجمالي رصيد الشركة - البنك العربي الوطني</p>
             </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
             {[
               { label: 'رقم الايبان', value: 'SA47 ... 0029' },
               { label: 'ضريبة القيمة المضافة', value: '15%' },
               { label: 'الفواتير المعلقة', value: '1,240 SAR' },
               { label: 'حالة الربط البرمجي', value: 'ACTIVE' },
             ].map((s, i) => (
               <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="font-black text-white uppercase text-sm">{s.value}</p>
               </div>
             ))}
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[4rem] shadow-xl border-2 border-gray-50">
             <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                <FileTextIcon className="w-8 h-8 text-secondary" />
                آخر الفواتير والمقبوضات
             </h3>
             <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-secondary transition-all group">
                     <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200">
                           <FileTextIcon className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                           <p className="font-black text-slate-800 tracking-tighter">INV-2024-00{i}</p>
                           <p className="text-[10px] text-slate-400 font-bold"> شركة دلتا راديو - 24/04/2024</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <p className="font-black text-slate-900">4,250 SAR</p>
                        <button className="p-3 bg-white text-slate-400 rounded-xl hover:bg-secondary hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                           <DownloadIcon className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                ))}
             </div>
             <button className="w-full mt-10 bg-secondary text-primary py-5 rounded-3xl font-black uppercase text-xl hover:scale-[1.02] shadow-xl transition-all">
                كشف حساب تفصيلي
             </button>
          </div>

          <div className="space-y-8">
             <div className="bg-slate-900 p-10 rounded-[4rem] text-white">
                <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-4">
                   <ClockIcon className="w-6 h-6 text-secondary" />
                   المهام المحاسبية المطلوبة
                </h3>
                <div className="space-y-4">
                   {[
                     'مطابقة كشف البنك لشهر أبريل',
                     'إصدار فواتير ضريبية لطلبات الأمس',
                     'تحديث أرصدة العملاء VIP',
                     'إقفال العجز اليومي للفروع'
                   ].map((task, i) => (
                     <div key={i} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-6 h-6 border-2 border-secondary/40 rounded-lg flex items-center justify-center">
                           {i === 2 && <CheckIcon className="w-4 h-4 text-secondary" />}
                        </div>
                        <span className={`font-bold text-sm ${i === 2 ? 'line-through text-gray-500' : ''}`}>{task}</span>
                     </div>
                   ))}
                </div>
             </div>
             <div className="p-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[4rem] text-white shadow-xl flex flex-col justify-between items-start h-64 border-4 border-white/20">
                <div>
                   <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mb-2">Net Income</p>
                   <p className="text-5xl font-black tracking-tighter">+124%</p>
                </div>
                <p className="font-black uppercase tracking-widest text-[10px]">Performance exceeding targets</p>
             </div>
          </div>
       </div>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const { language } = useI18n();
  const { addToast } = useToast();
  const { requestPasswordReset } = useAuth();
  const [resetEmail, setResetEmail] = useState('deltastars777@gmail.com');

  const handleManualReset = async () => {
    try {
      const res = await requestPasswordReset(resetEmail);
      if (res.success) {
        addToast(res.message, 'success');
      }
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="bg-slate-900 p-12 md:p-20 rounded-[4rem] text-white relative overflow-hidden border-4 border-primary/20 shadow-sovereign">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">Security Core Shell</h2>
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs mb-12">التحكم السيادي في كلمات المرور والهوية الرقمية</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="bg-white/5 p-10 rounded-[3rem] border-2 border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-8 text-primary">
                    <RefreshCwIcon className="w-10 h-10" />
                    <h3 className="text-2xl font-black">إعادة تعيين كلمة مرور المسؤول</h3>
                  </div>
                  <div className="space-y-6">
                     <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 px-4">البريد المستهدف</label>
                        <select 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full bg-white/10 border-2 border-white/5 p-6 rounded-2xl font-black text-xl outline-none focus:border-primary transition-all text-white"
                        >
                           <option value="deltastars777@gmail.com">deltastars777@gmail.com (الرئيسي)</option>
                           <option value="marketing@deltastars-ksa.com">marketing@deltastars-ksa.com</option>
                           <option value="deltastars@zoho.mail.com">deltastars@zoho.mail.com (المطور)</option>
                        </select>
                     </div>
                     <button 
                       onClick={handleManualReset}
                       className="w-full bg-primary text-white py-6 rounded-2xl font-black text-2xl shadow-xl hover:scale-105 transition-all"
                     >
                       إرسال رابط استعادة فعلي 📧
                     </button>
                     <p className="text-xs font-bold text-gray-500 italic text-center">سيتم إرسال الرابط الفعلي والمشفر إلى البريد المحدد أعلاه فوراً.</p>
                  </div>
               </div>

               <div className="bg-white/5 p-10 rounded-[3rem] border-2 border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-4 mb-8 text-secondary">
                    <ShieldIcon className="w-10 h-10" />
                    <h3 className="text-2xl font-black">حماية الهوية السيادية</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                           <FingerprintIcon className="w-8 h-8 text-emerald-500" />
                           <span className="font-black">بصمة الوجه والاصبع</span>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-500 px-4 py-1 rounded-full uppercase">Enabled</span>
                     </div>
                     <div className="flex justify-between items-center bg-black/40 p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                           <LockIcon className="w-8 h-8 text-secondary" />
                           <span className="font-black">تشفير AES-256</span>
                        </div>
                        <span className="text-[10px] font-black bg-secondary/20 text-secondary px-4 py-1 rounded-full uppercase">Military Grade</span>
                     </div>
                     <button className="w-full bg-white/10 hover:bg-white/20 text-white py-6 rounded-2xl font-black text-xl transition-all border border-white/10">
                        تحديث بروتوكولات الحماية ⚡
                     </button>
                  </div>
               </div>
            </div>
          </div>
       </div>
    </div>
  );
};

export const DeveloperDashboard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { language } = useI18n();
  const { 
    products, orders, users, promotions, seedLegalPages, user: currentUser, 
    syncProductsToFirestore, categories, units, addCategory, deleteCategory, 
    addUnit, deleteUnit, updateProduct, deleteProduct 
  } = useFirebase();
  const { addToast } = useToast();
  
  // Role Detection
  const isSuperAdmin = currentUser?.email === 'deltastars777@gmail.com';
  const isDeveloper = currentUser?.email === 'vipservicesyemen@outlook.sa';
  const isMarketing = currentUser?.role === 'marketing' || isSuperAdmin;
  const isOps = currentUser?.role === 'ops' || isSuperAdmin;
  const isQA = currentUser?.role === 'qa' || isSuperAdmin;
  const isAccountant = currentUser?.role === 'accountant' || isSuperAdmin;

  const [activeTab, setActiveTab] = useState<'system' | 'catalog' | 'promotions' | 'security' | 'database' | 'logs' | 'architecture' | 'operations' | 'quality' | 'accounting'>('system');
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [logs, setLogs] = useState<{msg: string, type: 'info'|'err'|'warn', time: Date}[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const { t } = useI18n();

  // System Stats
  const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const gregorianDate = new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(new Date());

  useEffect(() => {
    addLog('Developer Core Neural Interface Initialized', 'info');
    if (isDeveloper) performBiometricAuth();
  }, [isDeveloper]);

  const addLog = (msg: string, type: 'info'|'err'|'warn' = 'info') => {
    setLogs(prev => [{msg, type, time: new Date()}, ...prev].slice(0, 50));
  };

  const performBiometricAuth = async () => {
    setIsVerifying(true);
    setBiometricError(null);
    
    try {
      const available = await isBiometricAvailable();
      if (!available) {
        setBiometricError(language === 'ar' ? 'البصمة غير مدعومة' : 'Biometric not supported');
        addLog('Hardware check: Biometric not supported', 'warn');
        setIsVerifying(false);
        return;
      }

      const registered = await hasRegisteredKey(currentUser?.email || 'dev');
      if (!registered) {
        setBiometricError(language === 'ar' ? 'لم يتم تسجيل بصمة' : 'No biometric key registered');
        addLog('Auth check: No key found', 'warn');
        setIsVerifying(false);
        return;
      }

      const success = await authenticateBiometric(currentUser?.email || 'dev');
      if (success) {
        setIsBiometricVerified(true);
        addLog('Biometric identity confirmed (Sovereign Level)', 'info');
        addToast(language === 'ar' ? 'تم التحقق باللحظة' : 'Identity Verified', 'success');
      } else {
        setBiometricError(language === 'ar' ? 'فشل التحقق من البصمة' : 'Biometric verification failed');
      }
    } catch (err: any) {
      console.error('Biometric error:', err);
      setBiometricError(err.message || 'Authentication Error');
      addLog(`Biometric failure: ${err.message}`, 'err');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinVerify = () => {
    if (pin === '321666') {
      setIsBiometricVerified(true);
      addLog('Access granted via Master Developer PIN', 'warn');
      addToast(language === 'ar' ? 'تم الدخول بالرمز السيادي' : 'Sovereign PIN Access Granted', 'success');
    } else {
      addToast(language === 'ar' ? 'الرمز غير صحيح' : 'Invalid Sovereign PIN', 'error');
      addLog('Security breach attempt: Invalid PIN', 'err');
    }
  };

  if (!isBiometricVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-950 p-6 rounded-[4rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-50 animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-3xl p-12 rounded-[5rem] border-2 border-white/10 shadow-sovereign text-center"
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-primary shadow-glow animate-pulse">
            <ShieldIcon className="w-12 h-12 text-primary" />
          </div>
          
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Sovereign Link Access</h2>
          <p className="text-gray-400 font-bold mb-10 tracking-widest text-[10px]">نظام التحقق المطور الحصري (بصمة الوجه والاصبع) لشركة نجوم دلتا للتجارة</p>

          <div className="space-y-6">
            <div className="relative group">
              <LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-primary w-6 h-6 border-r border-white/10 pr-4 box-content group-focus-within:text-white transition-colors" />
              <input 
                type="password"
                placeholder="MASTER_DEV_PIN"
                value={pin}
                onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePinVerify()}
                className="w-full bg-white/5 border-2 border-white/10 p-6 pl-20 rounded-3xl font-black text-3xl tracking-[1.5rem] focus:border-primary outline-none text-white transition-all text-center focus:bg-white/10"
              />
            </div>

            <button 
              onClick={handlePinVerify}
              className="w-full bg-primary text-white py-6 rounded-3xl font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl border-b-8 border-primary-dark"
            >
              {language === 'ar' ? 'تنشيط الدخول' : 'ACTIVATE SOVEREIGN LINK'}
            </button>

            <div className="flex items-center gap-4 py-4">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Recognition</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button 
              onClick={performBiometricAuth}
              disabled={isVerifying}
              className="w-full bg-white/5 border-2 border-white/10 text-white py-6 rounded-3xl font-black text-2xl hover:bg-white/10 flex items-center justify-center gap-4 transition-all disabled:opacity-50"
            >
              {isVerifying ? (
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <FingerprintIcon className="w-8 h-8 text-secondary" />
              )}
              {language === 'ar' ? 'فحص البصمة' : 'BIOMETRIC SCAN'}
            </button>

            {biometricError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-red-500/10 border-2 border-red-500/20 rounded-[2.5rem] text-red-500 text-xs font-bold flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangleIcon className="w-5 h-5" />
                  <span>{biometricError}</span>
                </div>
                {!hasRegisteredKey(currentUser?.email || 'dev') && (
                  <button 
                    onClick={async () => {
                      try {
                        if (!currentUser?.email) throw new Error("Email required for registration");
                        const success = await registerBiometric(currentUser.email);
                        if (success) {
                          addToast('Sovereign Key Registered', 'success');
                          addLog(`Registered biometric ID for ${currentUser.email}`, 'info');
                          performBiometricAuth();
                        } else {
                          addToast('Registration Failed', 'error');
                        }
                      } catch (e: any) {
                        addToast(e.message, 'error');
                        addLog(`Reg-Error: ${e.message}`, 'err');
                      }
                    }}
                    className="px-6 py-2 bg-red-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Register Local Sovereign Key
                  </button>
                )}
              </motion.div>
            )}

            {onBack && (
              <button onClick={onBack} className="text-[10px] text-gray-600 hover:text-white uppercase font-black flex items-center gap-2 mx-auto mt-6 transition-colors">
                <ChevronLeftIcon className="w-3 h-3" /> Exit Control Center
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <div className="bg-white rounded-[4rem] p-12 shadow-xl border border-gray-100 animate-fade-in">
            <h3 className="text-3xl font-black text-primary uppercase mb-10 border-b border-gray-100 pb-6 flex items-center gap-6">
                <SparklesIcon className="w-10 h-10 text-secondary" />
                {language === 'ar' ? 'إدارة الكتالوج المتقدمة' : 'Advanced Catalog Master'}
            </h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b-2 border-primary/10">
                        <tr>
                            <th className="p-6 text-primary font-black uppercase text-xs tracking-widest">{language === 'ar' ? 'المنتج' : 'Product'}</th>
                            <th className="p-6 text-primary font-black uppercase text-xs tracking-widest">{language === 'ar' ? 'السعر (ريال)' : 'Price (SAR)'}</th>
                            <th className="p-6 text-primary font-black uppercase text-xs tracking-widest">{language === 'ar' ? 'المخزون' : 'Inventory'}</th>
                            <th className="p-6 text-primary font-black uppercase text-xs tracking-widest">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.slice(0, 50).map(product => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <img src={product.image} className="w-12 h-12 rounded-xl object-cover shadow-md border-2 border-white" />
                                        <div>
                                            <p className="font-black text-slate-800">{language === 'ar' ? product.name_ar : product.name_en}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{product.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <input 
                                        type="number" 
                                        defaultValue={product.price}
                                        className="w-24 p-3 bg-gray-100 border-2 border-transparent focus:border-secondary rounded-xl font-black text-center text-primary transition-all outline-none"
                                        onBlur={(e) => {
                                            addLog(`Updated Price for ${product.name_en}: ${e.target.value} SAR`, 'info');
                                            addToast(`${product.name_ar}: ${e.target.value} ريال`, 'success');
                                        }}
                                    />
                                </td>
                                <td className="p-6">
                                    <input 
                                        type="number" 
                                        defaultValue={product.stock_quantity || 1000}
                                        className="w-24 p-3 bg-gray-100 border-2 border-transparent focus:border-primary/30 rounded-xl font-black text-center text-slate-600 transition-all outline-none"
                                        onBlur={(e) => addLog(`Inventory Adjustment [${product.name_en}]: ${e.target.value} units`, 'warn')}
                                    />
                                </td>
                                <td className="p-6">
                                    <span className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl group hover:border-primary transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all text-primary">
                <CodeIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Build Environment</h3>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">v63.4.19 Enterprise Stable</p>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Node Engine:</span>
                  <span className="text-primary">v20.12.2</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Database:</span>
                  <span className="text-emerald-500">Firestore Cloud</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Authentication:</span>
                  <span className="text-secondary">Sovereign MFA</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3.5rem] border-2 border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <ZapIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white uppercase mb-4">Neural Analytics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase">Latency</p>
                  <p className="text-xl font-black text-primary">42ms</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase">Uptime</p>
                  <p className="text-xl font-black text-emerald-400">99.9%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl flex flex-col justify-center items-center text-center">
              <SmartphoneIcon className="w-16 h-16 text-slate-200 mb-6" />
              <h3 className="text-xl font-black text-slate-800 uppercase mb-2">Native Build PWA</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">جاهز للتحويل إلى APK / iOS</p>
              <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-tighter hover:scale-105 transition-all text-sm shadow-xl">
                Generate Build
              </button>
            </div>
          </div>
        );
      case 'security':
        return <SecuritySection />;
      case 'database':
        return (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center text-emerald-600">
                  <RefreshCwIcon className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 uppercase">Cloud Product Sync</h3>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">مزامنة كتالوج المنتجات السيادي مع Firestore</p>
                </div>
              </div>
              <button 
                onClick={async () => {
                   try {
                    addLog('Core Sync Initiated: Full Catalog', 'info');
                    await syncProductsToFirestore();
                    addLog('Sync Success: Cloud indices updated', 'info');
                    addToast('Cloud Sync Perfect', 'success');
                  } catch (e: any) {
                    addLog(`Sync Failure: ${e.message}`, 'err');
                  }
                }}
                className="w-full md:w-auto bg-emerald-500 text-white px-12 py-5 rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                DEPLOY CATALOG
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-sovereign text-white relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />
                <DatabaseIcon className="w-12 h-12 text-secondary mb-6" />
                <h4 className="text-2xl font-black uppercase mb-4">Storage Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-gray-500 font-bold text-xs uppercase">Products count</span>
                    <span className="text-xl font-black text-primary">{products?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-gray-500 font-bold text-xs uppercase">Order throughput</span>
                    <span className="text-xl font-black text-primary">{orders?.length || 0}</span>
                  </div>
                </div>
              </div>

               <div className="bg-white p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl">
                 <HistoryIcon className="w-12 h-12 text-primary mb-6" />
                 <h4 className="text-2xl font-black uppercase mb-4">Force Migration</h4>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">تحديث كافة الحقول المفقودة في الوثائق القديمة وإعادة بناء الفهارس</p>
                 <button 
                  onClick={async () => {
                    await seedLegalPages();
                    addToast('Migration Success', 'success');
                  }}
                  className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black hover:bg-primary transition-all"
                 >
                   REBUILD INDICES
                 </button>
               </div>
            </div>
          </div>
        );
      case 'architecture':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-2 border-gray-50">
                <h3 className="text-2xl font-black text-primary uppercase mb-8 flex items-center gap-4">
                    <LayersIcon className="w-8 h-8" /> 
                    {language === 'ar' ? 'إدارة التصنيفات' : 'Category Engine'}
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {categories.map(cat => (
                        <div key={cat.key} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-primary transition-all group">
                            <div>
                                <p className="font-black text-slate-800">{cat.label_ar}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{cat.label_en}</p>
                            </div>
                            <button 
                                onClick={() => deleteCategory(cat.id)}
                                className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => {
                        const ar = prompt('Category Name (Arabic):');
                        const en = prompt('Category Name (English):');
                        if (ar && en) addCategory({ label_ar: ar, label_en: en, key: en.toLowerCase().replace(/\s+/g, '_') as any });
                    }}
                    className="w-full mt-8 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl"
                >
                    <PlusIcon className="w-6 h-6" /> Add Category
                </button>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-2 border-gray-50 flex flex-col">
                <h3 className="text-2xl font-black text-secondary uppercase mb-8 flex items-center gap-4">
                    <ActivityIcon className="w-8 h-8" /> 
                    {language === 'ar' ? 'إدارة الوحدات' : 'Unit Architecture'}
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 flex-1 custom-scrollbar">
                    {units.map(unit => (
                        <div key={unit.key} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-secondary transition-all group">
                            <div>
                                <p className="font-black text-slate-800">{unit.label_ar}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{unit.label_en}</p>
                            </div>
                            <button 
                                onClick={() => deleteUnit(unit.id)}
                                className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => {
                        const ar = prompt('Unit Label (Arabic):');
                        const en = prompt('Unit Label (English):');
                        if (ar && en) addUnit({ 
                            label_ar: ar, 
                            label_en: en, 
                            key: en.toLowerCase().replace(/\s+/g, '_'),
                            code: en.toUpperCase().slice(0, 3),
                            name_ar: ar,
                            name_en: en,
                            base_factor: 1
                        });
                    }}
                    className="w-full mt-8 bg-slate-900 text-white py-5 rounded-3xl font-black uppercase flex items-center justify-center gap-3 hover:bg-secondary transition-all shadow-xl"
                >
                    <PlusIcon className="w-6 h-6" /> Add Unit
                </button>
            </div>
          </div>
        );
      case 'operations':
        return <OperationsSection />;
      case 'quality':
        return <QualitySection />;
      case 'accounting':
        return <AccountingSection />;
      case 'logs':
        return (
          <div className="bg-slate-900 rounded-[4rem] p-10 font-mono text-[10px] md:text-sm border-4 border-white/5 shadow-sovereign overflow-hidden h-[600px] flex flex-col">
             <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-white/20 font-black ml-4">DELTA_STARS_SOVEREIGN_LOGS</span>
              </div>
              <button 
                onClick={() => setLogs([])}
                className="px-6 py-2 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-full font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Clear Buffer
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-white/5 italic">Buffer Empty_</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={`flex gap-6 border-l-4 pl-6 py-2 transition-all hover:bg-white/5 rounded-r-lg ${
                        log.type === 'err' ? 'border-red-500 text-red-500' : 
                        log.type === 'warn' ? 'border-yellow-500 text-yellow-500' : 
                        'border-emerald-500 text-emerald-500'
                    }`}>
                        <span className="opacity-20 font-black">[{log.time.toLocaleTimeString()}]</span>
                        <span className="font-black uppercase tracking-tighter w-16">[{log.type}]</span>
                        <span className="font-bold flex-1">{log.msg}</span>
                    </div>
                  ))
                )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 p-4 md:p-0">
      <div className="bg-slate-900 p-10 md:p-16 rounded-[4rem] md:rounded-[5rem] text-white relative overflow-hidden shadow-sovereign flex flex-col md:flex-row justify-between items-center gap-12 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black tracking-[0.25em] uppercase flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow" />
              Sovereign Console
            </div>
            <div className="px-6 py-2 bg-primary/20 text-primary rounded-full text-[10px] font-black tracking-[0.25em] uppercase">
              Root v.63
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
            <span>{dayName}</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>{gregorianDate} م</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>{hijriDate} هـ</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4 group-hover:scale-[1.02] transition-transform">DELTA DevOS</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm">High-Precision Neural Interface & Store Operations</p>
        </div>

        <div className="flex gap-6 relative z-10 w-full md:w-auto">
          <button onClick={onBack} className="p-6 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-[2.5rem] transition-all border-2 border-white/5 active:scale-95 group/btn shadow-2xl">
            <ChevronLeftIcon className="w-10 h-10 group-hover/btn:-translate-x-2 transition-transform" />
          </button>
          <div className="h-20 w-px bg-white/10 hidden md:block" />
          <button className="flex-1 md:flex-none p-6 bg-white/5 hover:bg-white/10 rounded-[2.5rem] border-2 border-white/5 transition-all text-gray-400 hover:text-white flex flex-col items-center justify-center gap-1">
            <SmartphoneIcon className="w-8 h-8" />
            <span className="text-[8px] font-black uppercase">Build Mobile</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar py-2">
        {(isDeveloper ? [
          { id: 'system', label: 'Core Intel', icon: CpuIcon },
          { id: 'catalog', label: 'Catalog Master', icon: SparklesIcon },
          { id: 'database', label: 'Data Engine', icon: DatabaseIcon },
          { id: 'security', label: 'Sovereign Security', icon: ShieldCheckIcon },
          { id: 'architecture', label: 'Architecture', icon: LayersIcon },
          { id: 'operations', label: 'Operations', icon: GlobeIcon },
          { id: 'quality', label: 'QA Engine', icon: ShieldCheckIcon },
          { id: 'accounting', label: 'Accounting', icon: DatabaseIcon },
          { id: 'promotions', label: 'Promotion Lab', icon: ZapIcon },
          { id: 'logs', label: 'System Logs', icon: HistoryIcon },
        ] : isSuperAdmin ? [
          { id: 'catalog', label: 'Management', icon: SparklesIcon },
          { id: 'operations', label: 'Operations', icon: GlobeIcon },
          { id: 'quality', label: 'Quality', icon: ShieldCheckIcon },
          { id: 'accounting', label: 'Accounting', icon: DatabaseIcon },
          { id: 'promotions', label: 'Marketing', icon: ZapIcon },
        ] : isMarketing ? [
          { id: 'catalog', label: 'Products', icon: SparklesIcon },
          { id: 'promotions', label: 'Marketing', icon: ZapIcon },
        ] : isOps ? [
          { id: 'operations', label: 'Operations', icon: GlobeIcon },
          { id: 'catalog', label: 'Inventory', icon: SparklesIcon },
        ] : isQA ? [
          { id: 'quality', label: 'Quality Control', icon: ShieldCheckIcon },
        ] : isAccountant ? [
          { id: 'accounting', label: 'Accounts', icon: DatabaseIcon },
        ] : []).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-xl border-4 ${
              activeTab === tab.id 
              ? 'bg-primary text-white border-primary-light scale-105 shadow-glow z-10' 
              : 'bg-white text-slate-400 border-transparent hover:border-slate-100 hover:text-slate-600'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -30 }}
           transition={{ duration: 0.4, type: 'spring', damping: 25 }}
           className="min-h-[500px]"
        >
          {activeTab === 'promotions' ? (
            <div className="space-y-8 animate-fade-in">
               {/* Marketing Header */}
               <div className="bg-gradient-to-br from-primary to-primary-dark p-10 rounded-[4rem] text-white shadow-sovereign">
                 <div className="flex justify-between items-start mb-10">
                   <div>
                     <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">Marketing Portal</h2>
                     <p className="text-white/60 font-bold tracking-widest uppercase text-xs">إدارة العروض والترويج والمبيعات</p>
                   </div>
                   <ZapIcon className="w-12 h-12 text-secondary animate-pulse" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                     { label: 'إجمالي المبيعات', value: '45,230 SAR', trend: '+12%', color: 'bg-white/10' },
                     { label: 'الطلبات الجارية', value: '18', trend: 'Active', color: 'bg-emerald-500/20' },
                     { label: 'العروض النشطة', value: '5', trend: 'LIVE', color: 'bg-secondary/20' },
                     { label: 'نقاط الولاء', value: '1,250', trend: 'Total', color: 'bg-white/10' },
                   ].map((stat, i) => (
                     <div key={i} className={`${stat.color} p-6 rounded-3xl backdrop-blur-xl border border-white/10`}>
                       <p className="text-[10px] font-black uppercase opacity-60 mb-2">{stat.label}</p>
                       <p className="text-2xl font-black">{stat.value}</p>
                       <p className="text-[10px] font-black mt-2 text-secondary">{stat.trend}</p>
                     </div>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Promotions Section */}
                 <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100">
                      <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                        <SparklesIcon className="w-8 h-8 text-secondary" />
                        إدارة العروض والحملات
                      </h3>
                      <PromotionManagementSection />
                   </div>

                   {/* Price Update Manager */}
                   <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-sovereign">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black flex items-center gap-4">
                          <DatabaseIcon className="w-8 h-8 text-primary" />
                          تحديث الأسعار السريع
                        </h3>
                        <div className="relative w-64">
                          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                          <input 
                            type="text"
                            placeholder="بحث..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-xs font-bold outline-none focus:border-primary transition-all"
                            onChange={(e) => setCatalogSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                         {products.filter(p => !catalogSearch || p.name_ar.includes(catalogSearch) || p.name_en.toLowerCase().includes(catalogSearch.toLowerCase())).slice(0, 50).map(product => (
                           <div key={product.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-primary transition-all">
                             <div className="flex items-center gap-4">
                                <img src={product.image_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                <div>
                                  <p className="font-black text-sm">{product.name_ar}</p>
                                  <p className="text-[10px] text-gray-500 font-bold uppercase">{product.category}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <input 
                                  type="number" 
                                  id={`price-input-${product.id}`}
                                  defaultValue={product.price}
                                  className="w-24 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-center font-black text-secondary focus:outline-none focus:border-secondary"
                                />
                                <span className="text-[10px] font-black text-gray-600">SAR / {product.unit_ar || product.unit_en || 'كجم'}</span>
                                <button 
                                  onClick={async () => {
                                     const input = document.getElementById(`price-input-${product.id}`) as HTMLInputElement;
                                     const newPrice = parseFloat(input.value);
                                     if (!isNaN(newPrice)) {
                                       try {
                                         await updateProduct(product.id, { price: newPrice });
                                         addToast(language === 'ar' ? 'تم تحديث السعر' : 'Price Updated', 'success');
                                         addLog(`Price updated for ${product.name_ar}: ${newPrice} SAR`, 'info');
                                       } catch (err) {
                                         addToast(language === 'ar' ? 'خطأ في التحديث' : 'Update error', 'error');
                                       }
                                     }
                                  }}
                                  className="p-3 bg-secondary/20 text-secondary rounded-xl hover:bg-secondary hover:text-primary transition-all">
                                  <CheckIcon className="w-5 h-5" />
                                </button>
                             </div>
                           </div>
                         ))}
                      </div>
                      <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all border border-white/10">
                        مشاهدة كافة الأصناف ({products.length})
                      </button>
                   </div>
                 </div>

                 {/* Quick Actions & Recent Orders */}
                 <div className="space-y-8">
                   <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100">
                      <h3 className="text-xl font-black text-slate-900 mb-6">إجراءات سريعة</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <button className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase hover:bg-primary transition-all flex items-center justify-center gap-3">
                          <PlusIcon className="w-6 h-6" /> إضافة منتج جديد
                        </button>
                        <button className="w-full bg-secondary text-primary py-5 rounded-3xl font-black uppercase hover:brightness-110 transition-all flex items-center justify-center gap-3">
                          <BellIcon className="w-6 h-6" /> إرسال إشعار عام
                        </button>
                        <button className="w-full bg-white border-2 border-gray-100 text-slate-600 py-5 rounded-3xl font-black uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                          <HistoryIcon className="w-6 h-6" /> أرشيف الحملات
                        </button>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-10 rounded-[4rem] border-2 border-slate-100">
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center justify-between">
                         أحدث الطلبات
                         <span className="text-[10px] bg-primary text-white px-3 py-1 rounded-full">New</span>
                      </h3>
                      <div className="space-y-4">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-start mb-4">
                                 <p className="font-black text-slate-800 tracking-tighter">#ORD-092{i}</p>
                                 <span className="text-[10px] font-black text-primary uppercase">Processing</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mb-2">عميل VIP - شركة النخبة</p>
                              <div className="flex justify-between items-center text-xs font-black">
                                 <span>1,240 SAR</span>
                                 <button className="text-secondary underline">عرض التفاصيل</button>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 </div>
               </div>
            </div>
          ) : renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
