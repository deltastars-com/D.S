import React, { useState, useMemo, useEffect } from 'react';
import { useFirebase, useI18n, useToast } from './lib/contexts';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCartIcon, 
  UserIcon,
  PackageIcon, 
  TrendingUpIcon, 
  DollarSignIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  XIcon,
  SearchIcon,
  FilterIcon,
  MapPinIcon,
  TruckIcon,
  FileTextIcon,
  SparklesIcon,
  FingerprintIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BrainIcon
} from './lib/contexts/Icons';
import { motion } from 'motion/react';

interface VipDashboardPageProps {
  user: any;
  onLogout: () => void;
  onNavigate?: (page: string, params?: any) => void;
}

export function VipDashboardPage({ user, onLogout, onNavigate }: VipDashboardPageProps) {
  const { language, formatCurrency, t } = useI18n();

  // Table State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processData = <T extends any>(data: T[], searchFields: (keyof T)[]) => {
    let filtered = data.filter(item =>
      searchFields.some(field =>
        String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return { data: paginated, totalPages, totalItems };
  };

  const Pagination = ({ totalPages, current, onChange }: { totalPages: number, current: number, onChange: (p: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button 
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="p-2 rounded-lg border border-white/10 disabled:opacity-30 hover:bg-white/5 transition-all font-tajawal text-xs text-white"
        >
          {language === 'ar' ? 'السابق' : 'Prev'}
        </button>
        <div className="flex gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`w-8 h-8 rounded-lg font-tajawal text-xs transition-all ${current === i + 1 ? 'bg-secondary text-white shadow-md' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button 
          disabled={current === totalPages}
          onClick={() => onChange(current + 1)}
          className="p-2 rounded-lg border border-white/10 disabled:opacity-30 hover:bg-white/5 transition-all font-tajawal text-xs text-white"
        >
          {language === 'ar' ? 'التالي' : 'Next'}
        </button>
      </div>
    );
  };
  const { orders, showroomItems, products } = useFirebase();
  const { addToast } = useToast();
  
  const { registerBiometrics } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(!!user?.biometric_key);

  useEffect(() => {
    setIsBiometricEnabled(!!user?.biometric_key);
  }, [user?.biometric_key]);

  const userOrders = useMemo(() => {
    return orders?.filter(o => o.customerId === user?.id) || [];
  }, [orders, user?.id]);

  const stats = useMemo(() => {
    const totalSpent = userOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const pendingCount = userOrders.filter(o => o.status === 'pending').length;
    return { totalSpent, pendingCount };
  }, [userOrders]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="font-tajawal text-lg">{t('vip.loading')}</p>
        </div>
      </div>
    );
  }

  const handleEnableBiometric = async () => {
    try {
      addToast(language === 'ar' ? 'جاري تفعيل البصمة السيادية...' : 'Activating Sovereign Biometrics...', 'info');
      await registerBiometrics();
      setIsBiometricEnabled(true);
      addToast(language === 'ar' ? 'تم تفعيل الدخول بالبصمة بنجاح' : 'Biometric login enabled successfully', 'success');
    } catch (error) {
      addToast(language === 'ar' ? 'فشل تفعيل البصمة' : 'Failed to enable biometrics', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-tajawal relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Sidebar */}
      <aside className="w-80 bg-white p-10 flex flex-col border-l-2 border-slate-100 shadow-2xl relative z-20">
        <div className="mb-16 space-y-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl border-4 border-white group-hover:rotate-12 transition-transform duration-500">
              <span className="text-4xl font-black">VIP</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-xl shadow-lg border-2 border-white">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-primary">{user.name}</h2>
            <p className="text-secondary font-black text-[10px] uppercase tracking-[0.3em]">{user.company || 'Sovereign Partner'}</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-3">
          {[
            { id: 'orders', label: t('vip.tabs.orders'), icon: ShoppingCartIcon },
            { id: 'tracking', label: t('vip.tabs.tracking'), icon: TruckIcon },
            { id: 'invoices', label: t('vip.tabs.invoices'), icon: FileTextIcon },
            { id: 'profile', label: t('vip.tabs.profile'), icon: UserIcon },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black text-sm transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-[0_20px_40px_rgba(26,58,26,0.2)] translate-x-3' : 'hover:bg-slate-50 text-gray-400'}`}
            >
              <tab.icon className="w-6 h-6" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">{t('vip.support.title')}</p>
          <button className="w-full bg-white text-primary py-4 rounded-xl font-black text-xs shadow-sm hover:bg-primary hover:text-white transition-all border border-slate-100">
            {t('vip.support.button')}
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="mt-8 bg-red-50 text-red-600 p-5 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all"
        >
          {t('common.logout_emoji')}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto relative z-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black text-primary tracking-tighter">
              {activeTab === 'orders' ? t('checkout.addressStep') : 
               activeTab === 'tracking' ? t('vip.tracking.title') : 
               activeTab === 'invoices' ? t('checkout.paymentStep') : t('vip.security.title')}
            </h1>
            <p className="text-gray-400 font-bold mt-2">{t('vip.welcome', { name: user.name })}</p>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sovereign border border-slate-100 flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('vip.stats.cashback')}</span>
                <p className="text-2xl font-black text-emerald-500">{formatCurrency(user.cashbackBalance || 0)}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                <SparklesIcon className="w-7 h-7" />
              </div>
            </div>
            
            <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sovereign border border-slate-100 flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('vip.stats.debt')}</span>
                <p className="text-2xl font-black text-red-500">{formatCurrency(user.debt_balance || 0)}</p>
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                <DollarSignIcon className="w-7 h-7" />
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'orders' && (
          <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-sovereign border-b-8 border-blue-500 flex items-center justify-between group hover:-translate-y-2 transition-transform">
                <div className="space-y-2">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t('vip.stats.processing')}</p>
                  <h4 className="text-4xl font-black text-blue-600">{stats.pendingCount}</h4>
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:rotate-12 transition-transform">
                  <PackageIcon className="w-8 h-8" />
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-sovereign border-b-8 border-emerald-500 flex items-center justify-between group hover:-translate-y-2 transition-transform">
                <div className="space-y-2">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t('vip.stats.total_orders')}</p>
                  <h4 className="text-4xl font-black text-emerald-600">{userOrders.length}</h4>
                </div>
                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:rotate-12 transition-transform">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
              </div>
              <div className="bg-primary text-white p-10 rounded-[3rem] shadow-sovereign border-b-8 border-secondary flex items-center justify-between group hover:-translate-y-2 transition-transform">
                <div className="space-y-2">
                  <p className="text-white/50 font-bold text-xs uppercase tracking-widest">{t('vip.stats.credit_limit')}</p>
                  <h4 className="text-3xl font-black text-secondary">{formatCurrency(user.credit_limit || 0)}</h4>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-secondary group-hover:rotate-12 transition-transform">
                  <TrendingUpIcon className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-12 rounded-2xl md:rounded-[4rem] shadow-sovereign border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 px-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-black text-primary">{t('vip.orders.history_title')}</h3>
                  <div className="relative w-full md:w-64 mt-2">
                    <input
                      type="text"
                      placeholder={language === 'ar' ? 'بحث بالطلب...' : 'Search order...'}
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary outline-none transition-all text-sm font-black"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = '#showroom'}
                  className="w-full md:w-auto bg-secondary text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all"
                >
                  {t('vip.orders.new_order')}
                </button>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-[700px]">
                  <thead>
                    <tr className="text-gray-400 border-b-2 font-bold text-sm">
                      <th className="py-8 cursor-pointer hover:text-primary" onClick={() => handleSort('id')}>{t('common.id')} {sortConfig?.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                      <th className="cursor-pointer hover:text-primary" onClick={() => handleSort('createdAt')}>{t('common.date')} {sortConfig?.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                      <th className="cursor-pointer hover:text-primary" onClick={() => handleSort('total')}>{t('common.amount')} {sortConfig?.key === 'total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                      <th className="cursor-pointer hover:text-primary" onClick={() => handleSort('status')}>{t('common.status')} {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const { data, totalPages } = processData(userOrders, ['id', 'status']);
                      return (
                        <>
                          {data.map(order => (
                            <tr key={order.id} className="border-b hover:bg-slate-50 transition-all group">
                              <td className="py-8 font-black text-primary text-lg">#{order.id.slice(0, 8)}</td>
                              <td className="text-gray-400 font-bold text-sm">{new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</td>
                              <td className="font-black text-secondary text-lg">{formatCurrency(order.total)}</td>
                              <td>
                                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase ${
                                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {t(`common.statuses.${order.status}`)}
                                </span>
                              </td>
                              <td>
                                <button 
                                  onClick={() => onNavigate?.('live_tracking', { orderId: order.id })}
                                  className="text-primary font-black text-xs flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
                                >
                                  {t('vip.orders.track')}
                                  <ArrowRightIcon className="w-4 h-4 rotate-180" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {data.length === 0 && (
                            <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-bold italic">{t('common.noResults')}</td></tr>
                          )}
                          <tr>
                            <td colSpan={5}><Pagination totalPages={totalPages} current={currentPage} onChange={setCurrentPage} /></td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-10 animate-fade-in">
            {userOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(order => (
              <div key={order.id} className="bg-white p-12 rounded-[4rem] shadow-sovereign border border-gray-100">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-3xl font-black text-primary">{t('vip.tracking.title')} #{order.id.slice(0, 8)}</h3>
                    <p className="text-gray-400 font-bold mt-2">{t('common.status')}: {t(`common.statuses.${order.status}`)}</p>
                  </div>
                  <button 
                    onClick={() => onNavigate?.('live_tracking', { orderId: order.id })}
                    className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-secondary transition-all flex items-center gap-3"
                  >
                    <MapPinIcon className="w-5 h-5" />
                    {t('vip.tracking.open_map')}
                  </button>
                </div>
                
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-gray-100 flex items-center gap-8">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-primary">
                    <TruckIcon className="w-10 h-10" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">{t('vip.tracking.current_location')}</p>
                    <p className="text-primary font-black text-2xl">{t('vip.tracking.truck_status')}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {userOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
              <div className="h-[60vh] flex items-center justify-center bg-white rounded-[4rem] shadow-sovereign border border-gray-100">
                <div className="text-center space-y-8">
                  <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                    <MapPinIcon className="w-20 h-20" />
                  </div>
                  <h3 className="text-4xl font-black text-primary">{t('vip.tracking.no_active')}</h3>
                  <p className="text-gray-400 font-bold max-w-md mx-auto text-lg">{t('vip.tracking.no_active_desc')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-12 animate-fade-in">
            <div className="bg-white p-12 rounded-[4rem] shadow-sovereign border border-gray-100">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-primary">{t('vip.tabs.invoices')}</h3>
              </div>
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <FileTextIcon className="w-12 h-12" />
                </div>
                <p className="text-gray-400 font-bold">{language === 'ar' ? 'سجل العمليات المالية سيظهر هنا قريباً' : 'Financial transactions record will appear here soon'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-12 animate-fade-in">
            <div className="bg-white p-12 rounded-[4rem] shadow-sovereign border border-gray-100">
              <div className="flex items-center gap-8 mb-12">
                <div className="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center text-primary">
                  <ShieldCheckIcon className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-primary">{t('vip.security.title')}</h3>
                  <p className="text-gray-400 font-bold">{t('vip.security.subtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className={`p-10 rounded-[3rem] border-2 transition-all ${isBiometricEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-8">
                    <FingerprintIcon className={`w-12 h-12 ${isBiometricEnabled ? 'text-emerald-500' : 'text-gray-300'}`} />
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${isBiometricEnabled ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {isBiometricEnabled ? t('common.active') : t('common.inactive')}
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-primary mb-4">{t('vip.security.biometric_title')}</h4>
                  <p className="text-gray-500 font-bold mb-8 leading-relaxed">{t('vip.security.biometric_desc')}</p>
                  {!isBiometricEnabled && (
                    <button 
                      onClick={handleEnableBiometric}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      {t('vip.security.activate_now')}
                    </button>
                  )}
                </div>

                <div className="p-10 rounded-[3rem] bg-slate-50 border-2 border-gray-100">
                  <div className="flex justify-between items-start mb-8">
                    <UserIcon className="w-12 h-12 text-gray-300" />
                    <div className="px-4 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white">
                      {t('common.verified')}
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-primary mb-4">{t('vip.profile.details')}</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">{t('vip.profile.name')}</span>
                      <span className="font-black text-primary">{user.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">{t('vip.profile.company')}</span>
                      <span className="font-black text-primary">{user.company}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-bold">{t('vip.profile.phone')}</span>
                      <span className="font-black text-primary">{user.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating AI Assistant for VIPs */}
      <button 
        onClick={() => onNavigate?.('ai_chat' as any)}
        className="fixed bottom-12 left-12 group z-[100] transition-all"
      >
        <div className="relative">
          <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl group-hover:bg-secondary/20 transition-all"></div>
          <div className="bg-white p-1 rounded-full shadow-sovereign border-2 border-primary relative overflow-hidden w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Oday&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile&eyebrows=default&eyes=default" 
              alt="Oday AI"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-1 -right-1 bg-secondary text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tight shadow-lg border border-white/20 whitespace-nowrap">
            {t('oday.title').split(' ')[0]} AI
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
        </div>
      </button>
    </div>
  );
}
