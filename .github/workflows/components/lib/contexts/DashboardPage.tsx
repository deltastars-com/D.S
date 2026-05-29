import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { User, Product, ShowroomItem, Page, Invoice, Payment, VipClient, VipTransaction, Promotion } from '../../../types';
import { useI18n } from './I18nContext';
import { ChartBarIcon, LogoutIcon, PlusIcon, UserIcon, DeliveryIcon, SparklesIcon, PencilIcon, DocumentTextIcon } from './Icons';
import { AccountsView } from '../../AccountsView';
import { OperationsView } from '../../OperationsView';
import { WarehouseView } from '../../WarehouseView';
import { MarketingView } from '../../MarketingView';
import { BranchOrdersView } from '../../BranchOrdersView';
import { DelegateOrdersView } from '../../DelegateOrdersView';
import { SectionAuthModal } from '../SectionAuthModal';
import { NotificationCenter } from '../../../src/components/NotificationCenter';

interface DashboardPageProps {
  user: User | null;
  products: Product[];
  showroomItems: ShowroomItem[];
  promotions: Promotion[];
  categoryConfigs: any[];
  onAddProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<boolean>;
  onSetShowroomItems: (items: ShowroomItem[]) => void;
  onSetPromotions: (promos: Promotion[]) => void;
  onSetCategoryConfigs: (configs: any[]) => void;
  setPage: (page: Page) => void;
  invoices: Invoice[];
  payments: Payment[];
  vipClients: VipClient[];
  transactions: VipTransaction[];
  onAddPayment: (p: Payment) => void;
  onAddVipClient: (c: VipClient) => Promise<VipClient>;
  onUpdateVipClient: (c: VipClient) => Promise<VipClient>;
  onDeleteVipClient: (id: string) => Promise<boolean>;
  systemStatus?: 'healthy' | 'syncing' | 'optimizing';
  isOnline?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const { language, t, formatCurrency } = useI18n();
  const [view, setView] = useState<string>(() => localStorage.getItem('delta-last-view-v24') || 'menu');
  const [authNeeded, setAuthNeeded] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('delta-last-view-v24', view);
  }, [view]);

  const handleReturnToMenu = () => setView('menu');

  const userRole = props.user?.type || 'client';

  const totalSales = (props.invoices || []).filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);
  const lowStockCount = (props.products || []).filter(p => p.stock_quantity <= (p.min_threshold || 10)).length;

  return (
    <div 
      className="container mx-auto px-6 py-20 min-h-screen text-black"
    >
      {authNeeded && (
        <SectionAuthModal 
            section={authNeeded as any} 
            onUnlock={() => { 
                if(authNeeded === 'developer') props.setPage('dev_console');
                else setView(authNeeded); 
                setAuthNeeded(null); 
            }} 
            onClose={() => setAuthNeeded(null)} 
        />
      )}
      
      {/* Sovereign Header */}
      <div 
        className="bg-primary text-white p-12 md:p-16 rounded-[4rem] md:rounded-[5rem] shadow-4xl mb-16 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-12 border-b-[20px] border-secondary"
      >
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 text-center md:text-right" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <h1 
              className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-4"
            >
                {t('dashboard.title')}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="bg-secondary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Sovereign v27.0</span>
                <p className="text-xl font-bold text-white/60 italic">{t('dashboard.subtitle')}</p>
            </div>
        </div>
        <div className="relative z-10 flex flex-wrap justify-center gap-4">
             {/* System Health Widget */}
             <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/20 flex flex-col gap-1 shadow-2xl min-w-[200px]">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                        props.systemStatus === 'healthy' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                        props.systemStatus === 'syncing' ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 
                        'bg-orange-500 shadow-[0_0_10px_#f97316]'
                    }`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                        {props.systemStatus === 'healthy' ? 'System Healthy' : 
                         props.systemStatus === 'syncing' ? 'Synchronizing' : 'Optimizing'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${props.isOnline ? 'bg-green-500' : 'bg-red-500 animate-ping'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                        {props.isOnline ? 'Network Online' : 'Network Offline'}
                    </span>
                </div>
             </div>

             <NotificationCenter />

             <div 
               className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-[2rem] font-black border border-white/20 flex items-center gap-4 shadow-2xl"
             >
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                <span className="text-lg">{props.user?.email || 'Admin Session'}</span>
             </div>
             <button 
               onClick={() => props.setPage('home')} 
               className="bg-white text-primary px-8 py-4 rounded-[2rem] font-black hover:bg-secondary hover:text-white transition-all shadow-3xl"
             >
                {t('header.navLinks.home')}
             </button>
        </div>
      </div>

        {view === 'menu' && (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-black pb-24" 
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          >
              {/* 1. Administration - Only for Admin/GM */}
              {(userRole === 'admin' || userRole === 'gm') && (
                <div 
                  onClick={() => setAuthNeeded('gm.portal')} 
                  className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-4xl cursor-pointer group border-b-[15px] border-primary flex flex-col items-center text-center"
                >
                    <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">⚖️</div>
                    <h3 className="text-3xl font-black mb-2">{language === 'ar' ? 'الإدارة' : 'Administration'}</h3>
                    <p className="text-sm font-bold opacity-40">{t('dashboard.sections.admin.desc')}</p>
                </div>
              )}

              {/* 2. Sales & Marketing - For Admin, GM, and Marketing */}
              {(userRole === 'admin' || userRole === 'gm' || userRole === 'marketing') && (
                <div 
                  onClick={() => setView('marketing')} 
                  className="bg-white text-slate-800 p-10 rounded-[4rem] shadow-xl hover:shadow-4xl cursor-pointer group border-b-[15px] border-secondary flex flex-col items-center text-center border border-gray-100"
                >
                    <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">📢</div>
                    <h3 className="text-3xl font-black mb-2">{language === 'ar' ? 'المبيعات والتسويق' : 'Sales & Marketing'}</h3>
                    <p className="text-sm font-bold text-gray-400">{t('dashboard.sections.marketing.desc')}</p>
                </div>
              )}

              {/* 3. Operations - For Admin, GM, and Ops */}
              {(userRole === 'admin' || userRole === 'gm' || userRole === 'ops') && (
                <div 
                  onClick={() => setAuthNeeded('operations')} 
                  className="bg-white text-slate-800 p-10 rounded-[4rem] shadow-xl hover:shadow-4xl cursor-pointer group border-b-[15px] border-green-600 flex flex-col items-center text-center border border-gray-100"
                >
                    <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">🚛</div>
                    <h3 className="text-3xl font-black mb-2">{language === 'ar' ? 'العمليات والمخازن' : 'Operations & Warehouse'}</h3>
                    <p className="text-sm font-bold text-gray-400">{t('dashboard.sections.ops.desc')}</p>
                </div>
              )}

              {/* 3.5 Branch Orders - For Admin, GM, and Ops */}
              {(userRole === 'admin' || userRole === 'gm' || userRole === 'ops') && (
                <div 
                  onClick={() => setView('branch_orders')} 
                  className="bg-white text-slate-800 p-10 rounded-[4rem] shadow-xl hover:shadow-4xl cursor-pointer group border-b-[15px] border-blue-600 flex flex-col items-center text-center border border-gray-100"
                >
                    <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">🏪</div>
                    <h3 className="text-3xl font-black mb-2">{language === 'ar' ? 'طلبات الفروع' : 'Branch Orders'}</h3>
                    <p className="text-sm font-bold text-gray-400">{language === 'ar' ? 'استقبال وتجهيز طلبات الفروع' : 'Receive and process branch orders'}</p>
                </div>
              )}

              {/* 3.6 Delegate Orders - For Admin, GM, and Delegate */}
              {(userRole === 'admin' || userRole === 'gm' || userRole === 'delegate') && (
                <div 
                  onClick={() => setView('delegate_orders')} 
                  className="bg-white text-slate-800 p-10 rounded-[4rem] shadow-xl hover:shadow-4xl cursor-pointer group border-b-[15px] border-secondary flex flex-col items-center text-center border border-gray-100"
                >
                    <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">💼</div>
                    <h3 className="text-3xl font-black mb-2">{language === 'ar' ? 'شاشة المندوب' : 'Delegate View'}</h3>
                    <p className="text-sm font-bold text-gray-400">{language === 'ar' ? 'إدارة طلبات المنطقة والعملاء' : 'Manage regional and customer orders'}</p>
                </div>
              )}

              {/* 4. Developer - Only for Developer and Admin */}
              {(userRole === 'admin' || userRole === 'developer') && (
                <div 
                  onClick={() => setAuthNeeded('developer')} 
                  className="bg-secondary text-white p-10 rounded-[4rem] shadow-4xl cursor-pointer group border-b-[15px] border-orange-700 flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-4 right-4 flex gap-2">
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">🖐️</span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">👤</span>
                    </div>
                    <div className="text-8xl mb-8 group-hover:scale-110 transition-transform">🛡️</div>
                    <h3 className="text-3xl font-black mb-2">{language === 'ar' ? 'قسم المطور' : 'Developer Section'}</h3>
                    <p className="text-sm font-bold opacity-60">{t('dashboard.sections.dev.desc')}</p>
                </div>
              )}

              {/* 5. Updates Section - For everyone but maybe just a placeholder */}
              <div 
                className="bg-gray-100 text-gray-400 p-10 rounded-[4rem] shadow-inner flex flex-col items-center text-center border-2 border-dashed border-gray-300"
              >
                  <div className="text-8xl mb-8 opacity-20">➕</div>
                  <h3 className="text-3xl font-black mb-2">{language === 'ar' ? 'تحديثات مستقبلية' : 'Future Updates'}</h3>
                  <p className="text-sm font-bold opacity-40">{language === 'ar' ? 'مساحة مخصصة للإضافات الجديدة' : 'Reserved for new additions'}</p>
              </div>
          </div>
        )}

        {view === 'gm.portal' && (
            <div 
              className="space-y-10 animate-fade-in pb-20"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-b-8 border-green-500">
                        <p className="text-xs font-black text-gray-400 uppercase mb-2">{t('dashboard.stats.sales')}</p>
                        <p className="text-5xl font-black text-slate-800">{formatCurrency(totalSales)}</p>
                    </div>
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border-b-8 border-orange-500">
                        <p className="text-xs font-black text-gray-400 uppercase mb-2">{t('dashboard.stats.lowStock')}</p>
                        <p className="text-5xl font-black text-slate-800">{lowStockCount}</p>
                    </div>
                    <div className="bg-primary text-white p-10 rounded-[3.5rem] shadow-xl">
                        <p className="text-xs font-black text-secondary uppercase mb-2">{t('dashboard.stats.pending')}</p>
                        <p className="text-5xl font-black">3</p>
                    </div>
                </div>

                {/* AI & Financial Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-3xl rounded-full"></div>
                        <h4 className="text-2xl font-black mb-6 flex items-center gap-4">
                            <SparklesIcon className="w-8 h-8 text-secondary animate-pulse" />
                            {language === 'ar' ? 'توقعات الذكاء الاصطناعي (عُدي)' : 'AI Predictions (Oday)'}
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <span className="text-2xl">📈</span>
                                <div>
                                    <p className="text-sm font-bold">{language === 'ar' ? 'زيادة متوقعة في طلبات التمور بنسبة 25%' : 'Expected 25% increase in Dates orders'}</p>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest">Next 7 Days • Confidence 92%</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <span className="text-2xl">🥦</span>
                                <div>
                                    <p className="text-sm font-bold">{language === 'ar' ? 'توصية: زيادة مخزون الخضروات الورقية' : 'Recommendation: Increase Leafy Greens stock'}</p>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest">Supply Chain Alert • High Priority</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white text-slate-800 p-10 rounded-[4rem] shadow-2xl border border-gray-100">
                        <h4 className="text-2xl font-black mb-6 flex items-center gap-4">
                            <ChartBarIcon className="w-8 h-8 text-primary" />
                            {language === 'ar' ? 'التقارير المالية المتقدمة' : 'Advanced Financial Reports'}
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                <span className="font-bold">{language === 'ar' ? 'صافي الربح المتوقع' : 'Projected Net Profit'}</span>
                                <span className="text-xl font-black text-green-600">{formatCurrency(totalSales * 0.15)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                <span className="font-bold">{language === 'ar' ? 'إجمالي الديون المستحقة' : 'Total Outstanding Debt'}</span>
                                <span className="text-xl font-black text-red-600">{formatCurrency(12500)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <AccountsView onBack={handleReturnToMenu} invoices={props.invoices} payments={props.payments} vipClients={props.vipClients} transactions={props.transactions} onAddPayment={props.onAddPayment} onAddVipClient={props.onAddVipClient} onUpdateVipClient={props.onUpdateVipClient} onDeleteVipClient={props.onDeleteVipClient} />
            </div>
        )}
        
        {view === 'marketing' && (
            <div 
            >
              <MarketingView 
                products={props.products} 
                onUpdateProduct={props.onUpdateProduct} 
                onAddProduct={props.onAddProduct}
                onBack={handleReturnToMenu} 
              />
            </div>
        )}

        {view === 'warehouse' && (
          <div 
          >
            <WarehouseView 
              products={props.products} 
              orders={[]} // Should ideally fetch from Firebase
              onUpdateStock={async (id, qty) => {
                const p = props.products.find(x => x.id === id);
                if (p) await props.onUpdateProduct(p.id, { stock_quantity: qty });
              }} 
              onUpdateOrderStatus={async (id, status) => {
                  // Placeholder for order status update if needed here
              }}
              onBack={handleReturnToMenu} 
              invoices={props.invoices} 
            />
          </div>
        )}
        
        {view === 'operations' && (
          <div 
          >
            <OperationsView onBack={handleReturnToMenu} />
          </div>
        )}

        {view === 'branch_orders' && (
          <div className="space-y-8">
            {!localStorage.getItem('selected-branch-id') ? (
              <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-gray-100 text-center">
                <h2 className="text-4xl font-black text-primary mb-8">اختر الفرع للمتابعة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 'JED-01', name: 'فرع جدة الرئيسي' },
                    { id: 'MAK-02', name: 'فرع مكة المكرمة' },
                    { id: 'MAD-03', name: 'فرع المدينة المنورة' },
                    { id: 'RIY-04', name: 'فرع الرياض' },
                    { id: 'DAM-05', name: 'فرع الدمام' },
                    { id: 'ABH-06', name: 'فرع أبها' }
                  ].map(branch => (
                    <button 
                      key={branch.id}
                      onClick={() => {
                        localStorage.setItem('selected-branch-id', branch.id);
                        setView('branch_orders_active');
                      }}
                      className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-transparent hover:border-primary hover:bg-white transition-all group"
                    >
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📍</div>
                      <span className="text-xl font-black text-slate-800">{branch.name}</span>
                      <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest">{branch.id}</p>
                    </button>
                  ))}
                </div>
                <button onClick={handleReturnToMenu} className="mt-12 text-gray-400 font-black hover:text-primary transition-colors">الرجوع للقائمة الرئيسية</button>
              </div>
            ) : (
              <BranchOrdersView 
                branchId={localStorage.getItem('selected-branch-id') || 'JED-01'} 
                onBack={() => {
                  localStorage.removeItem('selected-branch-id');
                  setView('menu');
                }} 
              />
            )}
          </div>
        )}

        {view === 'branch_orders_active' && (
           <BranchOrdersView 
              branchId={localStorage.getItem('selected-branch-id') || 'JED-01'} 
              onBack={() => {
                localStorage.removeItem('selected-branch-id');
                setView('branch_orders');
              }} 
           />
        )}

        {view === 'delegate_orders' && (
          <DelegateOrdersView 
            user={props.user}
            onBack={handleReturnToMenu}
          />
        )}
    </div>
  );
};

export default DashboardPage;
