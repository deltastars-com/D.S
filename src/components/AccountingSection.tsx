import React, { useState, useMemo } from 'react';
import { ChartBarIcon, FileTextIcon, TrendingUpIcon, CalendarIcon, DownloadIcon, UserIcon, BellIcon, SparklesIcon } from './lib/contexts/Icons';
import { Order, Product, Invoice } from '../types';
import { AccountingEngine } from './lib/AccountingEngine';
import { BRANCH_LOCATIONS } from './constants';
import { api } from '@/services/api';

interface AccountingSectionProps {
    language: 'ar' | 'en';
    orders: Order[];
    products: Product[];
    invoices: Invoice[];
    handleUpdateOrder: (orderId: string, data: Partial<Order>) => Promise<void>;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AccountingSection: React.FC<AccountingSectionProps> = ({
    language,
    orders,
    products,
    invoices,
    handleUpdateOrder,
    addToast,
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'invoices' | 'wholesale' | 'cashback'>('overview');
    const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');

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
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-slate-50 transition-all font-black text-xs"
                >
                    {language === 'ar' ? 'السابق' : 'Prev'}
                </button>
                <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onChange(i + 1)}
                            className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${current === i + 1 ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-400 hover:bg-slate-50'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <button 
                    disabled={current === totalPages}
                    onClick={() => onChange(current + 1)}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-slate-50 transition-all font-black text-xs"
                >
                    {language === 'ar' ? 'التالي' : 'Next'}
                </button>
            </div>
        );
    };

    const engine = useMemo(() => {
        const ae = new AccountingEngine();
        invoices.forEach(inv => {
            // Estimate COGS as 70% of subtotal for demo purposes
            ae.recordSalesInvoice(inv, inv.subtotal * 0.7);
        });
        return ae;
    }, [invoices]);

    const incomeStatement = useMemo(() => engine.getIncomeStatement(), [engine]);

    const dailyStats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayInvoices = invoices.filter(inv => inv.date.startsWith(today));
        const sales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const count = todayInvoices.length;
        const profit = todayInvoices.reduce((sum, inv) => sum + (inv.subtotal * 0.3), 0); // 30% margin
        return { sales, count, profit };
    }, [invoices]);

    const monthlyStats = useMemo(() => {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthInvoices = invoices.filter(inv => inv.date.startsWith(currentMonth));
        const sales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const count = monthInvoices.length;
        const profit = monthInvoices.reduce((sum, inv) => sum + (inv.subtotal * 0.3), 0);
        return { sales, count, profit };
    }, [invoices]);

    const branchStats = useMemo(() => {
        const stats: Record<string, { sales: number, count: number, profit: number, avgOrder: number }> = {};
        const relevantInvoices = invoices.filter(inv => 
            reportType === 'daily' 
                ? inv.date.startsWith(new Date().toISOString().split('T')[0]) 
                : inv.date.startsWith(new Date().toISOString().slice(0, 7))
        );

        relevantInvoices.forEach(inv => {
            const bId = inv.branchId?.toString() || 'unknown';
            if (!stats[bId]) stats[bId] = { sales: 0, count: 0, profit: 0, avgOrder: 0 };
            stats[bId].sales += inv.total;
            stats[bId].count += 1;
            stats[bId].profit += (inv.subtotal * 0.3);
            stats[bId].avgOrder = stats[bId].sales / stats[bId].count;
        });
        return stats;
    }, [invoices, reportType]);

    const handlePrint = () => {
        window.print();
    };

    const handleSyncToOnyx = async (type: 'order' | 'invoice', id: string) => {
        try {
            await api.syncToOnyx(type, id);
            addToast(language === 'ar' ? 'تمت المزامنة مع أونيكس برو بنجاح' : 'Synced to Onyx Pro successfully', 'success');
        } catch (err) {
            addToast(language === 'ar' ? 'فشل المزامنة مع أونيكس برو' : 'Onyx Pro sync failed', 'error');
        }
    };

    return (
        <div className="space-y-12 animate-fade-in print:space-y-4">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .bg-slate-50 { background-color: var(--color-app-bg) !important; -webkit-print-color-adjust: exact; }
                    .text-primary { color: var(--color-primary) !important; }
                    .text-secondary { color: var(--color-secondary) !important; }
                    .text-emerald-600 { color: var(--color-primary-light) !important; }
                }
            `}</style>
            <div className="flex flex-col lg:flex-row justify-between items-center no-print gap-6">
                <h2 className="text-2xl md:text-4xl font-black text-slate-800 uppercase flex items-center gap-4 text-center md:text-right">
                    <ChartBarIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    {language === 'ar' ? 'التكامل المالي والتقارير' : 'Financial Integration & Reports'}
                </h2>
                <div className="flex bg-slate-100 p-1.5 md:p-2 rounded-xl md:rounded-2xl gap-1 md:gap-2 overflow-x-auto w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-grow md:flex-grow-0 px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        {language === 'ar' ? 'نظرة عامة' : 'Overview'}
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`flex-grow md:flex-grow-0 px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        {language === 'ar' ? 'التقارير التجارية' : 'Commercial Reports'}
                    </button>
                    <button 
                        onClick={() => setActiveTab('invoices')}
                        className={`flex-grow md:flex-grow-0 px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${activeTab === 'invoices' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        {language === 'ar' ? 'الفواتير' : 'Invoices'}
                    </button>
                    <button 
                        onClick={() => setActiveTab('wholesale')}
                        className={`flex-grow md:flex-grow-0 px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${activeTab === 'wholesale' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        {language === 'ar' ? 'كبار العملاء' : 'Wholesale/VIP'}
                    </button>
                    <button 
                        onClick={() => setActiveTab('cashback')}
                        className={`flex-grow md:flex-grow-0 px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs transition-all whitespace-nowrap ${activeTab === 'cashback' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}
                    >
                        {language === 'ar' ? 'الكاش باك' : 'Cashback'}
                    </button>
                </div>
            </div>

            {activeTab === 'cashback' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-white p-10 rounded-[3rem] border-2 border-gray-100 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <h3 className="text-2xl font-black text-primary flex items-center gap-4">
                                <SparklesIcon className="w-8 h-8 text-secondary" />
                                {language === 'ar' ? 'إدارة أرصدة الكاش باك' : 'Cashback Balance Management'}
                            </h3>
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder={language === 'ar' ? 'بحث باسم العميل...' : 'Search by customer...'}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all text-sm font-bold"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="p-8 bg-slate-50 rounded-3xl border border-gray-100">
                                <p className="text-gray-400 font-black text-xs uppercase mb-2">إجمالي أرصدة العملاء</p>
                                <h4 className="text-3xl font-black text-primary">12,450.00 ر.س</h4>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-3xl border border-gray-100">
                                <p className="text-gray-400 font-black text-xs uppercase mb-2">كاش باك مستحق اليوم</p>
                                <h4 className="text-3xl font-black text-secondary">850.00 ر.س</h4>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-3xl border border-gray-100">
                                <p className="text-gray-400 font-black text-xs uppercase mb-2">نسبة الكاش باك الافتراضية</p>
                                <h4 className="text-3xl font-black text-emerald-600">5%</h4>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right min-w-[800px]">
                                <thead>
                                    <tr className="text-gray-400 text-xs font-black border-b">
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>
                                            {language === 'ar' ? 'العميل' : 'Customer'} {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('total_spent')}>
                                            {language === 'ar' ? 'إجمالي المشتريات' : 'Total Purchases'} {sortConfig?.key === 'total_spent' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('cashback')}>
                                            {language === 'ar' ? 'رصيد الكاش باك' : 'Cashback Balance'} {sortConfig?.key === 'cashback' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('last_op')}>
                                            {language === 'ar' ? 'آخر عملية' : 'Last Transaction'} {sortConfig?.key === 'last_op' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                        </th>
                                        <th className="pb-4">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(() => {
                                        const { data, totalPages } = processData([
                                            { id: '1', name: 'أحمد محمد', total_spent: 5400, cashback: 270, last_op: '2024-04-14' },
                                            { id: '2', name: 'سارة علي', total_spent: 1200, cashback: 60, last_op: '2024-04-13' },
                                            { id: '3', name: 'مؤسسة النور', total_spent: 15000, cashback: 750, last_op: '2024-04-14' }
                                        ], ['name']);
                                        
                                        return (
                                            <>
                                                {data.map(item => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-all">
                                                        <td className="py-6 font-black text-primary">{item.name}</td>
                                                        <td className="py-6 font-bold">{item.total_spent.toLocaleString()} ر.س</td>
                                                        <td className="py-6 font-black text-emerald-600">{item.cashback.toLocaleString()} ر.س</td>
                                                        <td className="py-6 text-gray-400 text-sm font-bold">{item.last_op}</td>
                                                        <td className="py-6">
                                                            <button className="bg-primary text-white px-4 py-2 rounded-xl font-black text-xs">تحويل للرصيد</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {data.length === 0 && (
                                                    <tr><td colSpan={5} className="py-12 text-center text-gray-400 font-bold">{language === 'ar' ? 'لا توجد نتائج' : 'No results found'}</td></tr>
                                                )}
                                            </>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination placeholder if needed */}
                    </div>
                </div>
            )}

            {activeTab === 'wholesale' && (
                <div className="space-y-8 md:space-y-12 animate-fade-in">
                    <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-black text-primary flex items-center gap-4">
                                <UserIcon className="w-6 h-6 md:w-8 md:h-8" />
                                {language === 'ar' ? 'إدارة حسابات كبار العملاء (الجملة)' : 'Wholesale/VIP Client Management'}
                            </h3>
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder={language === 'ar' ? 'بحث باسم العميل...' : 'Search by name...'}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all text-sm font-bold"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right min-w-[800px]">
                                <thead>
                                    <tr className="text-gray-400 text-[10px] md:text-xs font-black border-b">
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>{language === 'ar' ? 'العميل' : 'Client'} {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('onyx_id')}>{language === 'ar' ? 'رقم Onyx' : 'Onyx ID'} {sortConfig?.key === 'onyx_id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('credit_limit')}>{language === 'ar' ? 'سقف الائتمان' : 'Credit Limit'} {sortConfig?.key === 'credit_limit' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('debt_balance')}>{language === 'ar' ? 'الرصيد المدين' : 'Debt Balance'} {sortConfig?.key === 'debt_balance' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('status')}>{language === 'ar' ? 'الحالة' : 'Status'} {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(() => {
                                        const { data, totalPages } = processData([
                                            { id: '1', name: 'شركة النجوم للتوريدات', onyx_id: 'ONYX-9901', credit_limit: 50000, debt_balance: 12500, status: 'Active' },
                                            { id: '2', name: 'مؤسسة دلتا الغذائية', onyx_id: 'ONYX-9902', credit_limit: 100000, debt_balance: 45000, status: 'Active' },
                                            { id: '3', name: 'سوبر ماركت الوفاء', onyx_id: 'ONYX-9903', credit_limit: 20000, debt_balance: 18000, status: 'Warning' }
                                        ], ['name', 'onyx_id']);
                                        return (
                                            <>
                                                {data.map(client => (
                                                    <tr key={client.id} className="hover:bg-slate-50 transition-all">
                                                        <td className="py-4 md:py-6 font-black text-primary">{client.name}</td>
                                                        <td className="py-4 md:py-6 font-bold text-gray-400">{client.onyx_id}</td>
                                                        <td className="py-4 md:py-6 font-black">{client.credit_limit.toLocaleString()} ر.س</td>
                                                        <td className="py-4 md:py-6 font-black text-red-600">{client.debt_balance.toLocaleString()} ر.س</td>
                                                        <td className="py-4 md:py-6">
                                                            <span className={`px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase ${client.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                {client.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 md:py-6">
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    title={language === 'ar' ? 'عرض كشف الحساب' : 'View Statement'}
                                                                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary hover:text-white transition-all"
                                                                >
                                                                    <FileTextIcon className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={async () => {
                                                                        try {
                                                                            addToast(language === 'ar' ? `تم إرسال تذكير بالمديونية لـ ${client.name}` : `Debt reminder sent to ${client.name}`, 'info');
                                                                        } catch (err) {
                                                                            addToast('Failed to send reminder', 'error');
                                                                        }
                                                                    }}
                                                                    title={language === 'ar' ? 'إرسال تذكير بالدفع' : 'Send Payment Reminder'}
                                                                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-secondary hover:text-white transition-all"
                                                                >
                                                                    <BellIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {data.length === 0 && (
                                                    <tr><td colSpan={6} className="py-12 text-center text-gray-400 font-bold">{language === 'ar' ? 'لا توجد نتائج' : 'No results found'}</td></tr>
                                                )}
                                                <tr>
                                                    <td colSpan={6}><Pagination totalPages={totalPages} current={currentPage} onChange={setCurrentPage} /></td>
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

            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl border-2 border-gray-100 shadow-sm">
                            <p className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-2">إجمالي المبيعات</p>
                            <p className="text-2xl md:text-4xl font-black text-primary">
                                {incomeStatement.revenue.toFixed(2)} ر.س
                            </p>
                        </div>
                        <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl border-2 border-gray-100 shadow-sm">
                            <p className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-2">صافي الأرباح</p>
                            <p className="text-2xl md:text-4xl font-black text-emerald-600">
                                {incomeStatement.netProfit.toFixed(2)} ر.س
                            </p>
                        </div>
                        <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl border-2 border-gray-100 shadow-sm">
                            <p className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-2">قيمة المخزون التقديرية</p>
                            <p className="text-2xl md:text-4xl font-black text-slate-800">
                                {products.reduce((acc, p) => acc + p.price * p.stock_quantity, 0).toLocaleString()} ر.س
                            </p>
                        </div>
                        <div className="p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl border-2 border-gray-100 shadow-sm">
                            <p className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-widest mb-2">الطلبات المعلقة مالياً</p>
                            <p className="text-2xl md:text-4xl font-black text-red-600">
                                {(orders || []).filter((o) => o.paymentStatus === 'pending').length}
                            </p>
                        </div>
                    </div>

                    {/* Onyx Pro Sync Status */}
                    <div className="bg-primary text-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-right">
                            <h3 className="text-xl md:text-2xl font-black mb-2">مزامنة Onyx Pro ERP</h3>
                            <p className="text-xs md:text-sm text-white/60 font-bold">حالة الربط: متصل وآمن (ZATCA Phase 2 Ready)</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleSyncToOnyx('order', 'all')}
                                className="bg-secondary text-white px-6 md:px-8 py-3 rounded-xl font-black text-xs md:text-sm shadow-lg hover:scale-105 transition-all"
                            >
                                مزامنة كافة البيانات الآن
                            </button>
                        </div>
                    </div>

                    {/* Order Approval Section */}
                    <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-6 md:space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
                            <h3 className="text-xl md:text-2xl font-black text-primary">{language === 'ar' ? 'الموافقة على الطلبات والتحصيل المالي' : 'Order Approval & Collections'}</h3>
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder={language === 'ar' ? 'بحث بالعميل أو الطلب...' : 'Search by customer or order...'}
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all text-sm font-bold"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right min-w-[800px]">
                                <thead>
                                    <tr className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest border-b">
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('id')}>{language === 'ar' ? 'رقم الطلب' : 'Order ID'} {sortConfig?.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('customerName')}>{language === 'ar' ? 'العميل' : 'Customer'} {sortConfig?.key === 'customerName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('total')}>{language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'} {sortConfig?.key === 'total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('paymentMethod')}>{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'} {sortConfig?.key === 'paymentMethod' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                        <th className="pb-4">{language === 'ar' ? 'حالة الدفع' : 'Status'}</th>
                                        <th className="pb-4">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(() => {
                                        const { data, totalPages } = processData((orders || []).filter((o) => o.paymentStatus === 'pending'), ['customerName', 'id']);
                                        return (
                                            <>
                                                {data.map((order) => (
                                                    <tr key={order.id} className="group hover:bg-slate-50 transition-all">
                                                        <td className="py-4 md:py-6 font-black text-primary">#{order.id.slice(-6)}</td>
                                                        <td className="py-4 md:py-6 font-bold">{order.customerName}</td>
                                                        <td className="py-4 md:py-6 font-black text-secondary">{order.total.toFixed(2)} ر.س</td>
                                                        <td className="py-4 md:py-6 font-bold text-[10px] md:text-xs uppercase">{order.paymentMethod}</td>
                                                        <td className="py-4 md:py-6">
                                                            <span className="px-3 md:px-4 py-1 bg-red-100 text-red-600 rounded-full text-[8px] md:text-[10px] font-black uppercase">
                                                                Pending
                                                            </span>
                                                        </td>
                                                        <td className="py-4 md:py-6">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await handleUpdateOrder(order.id, {
                                                                                paymentStatus: 'paid',
                                                                                status: 'preparing',
                                                                            });
                                                                            await handleSyncToOnyx('order', order.id);
                                                                            addToast('تم تأكيد الدفع ومزامنة الطلب', 'success');
                                                                        } catch (err) {
                                                                            addToast('فشل تأكيد الدفع', 'error');
                                                                        }
                                                                    }}
                                                                    className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs hover:bg-green-700 transition-all shadow-lg whitespace-nowrap"
                                                                >
                                                                    تأكيد الاستلام المالي
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {data.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="py-12 text-center text-gray-400 font-bold italic">
                                                            {searchTerm ? (language === 'ar' ? 'لا توجد نتائج بحث' : 'No search results') : (language === 'ar' ? 'لا توجد طلبات معلقة مالياً حالياً' : 'No pending payment orders')}
                                                        </td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td colSpan={6}><Pagination totalPages={totalPages} current={currentPage} onChange={setCurrentPage} /></td>
                                                </tr>
                                            </>
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'reports' && (
                <div className="space-y-6 md:space-y-10">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={() => setReportType('daily')}
                            className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all ${reportType === 'daily' ? 'bg-primary text-white shadow-xl' : 'bg-white text-gray-400 border-2 border-gray-100'}`}
                        >
                            <CalendarIcon className="w-5 h-5 md:w-6 md:h-6" />
                            {language === 'ar' ? 'التقرير اليومي' : 'Daily Report'}
                        </button>
                        <button 
                            onClick={() => setReportType('monthly')}
                            className={`flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black transition-all ${reportType === 'monthly' ? 'bg-primary text-white shadow-xl' : 'bg-white text-gray-400 border-2 border-gray-100'}`}
                        >
                            <TrendingUpIcon className="w-5 h-5 md:w-6 md:h-6" />
                            {language === 'ar' ? 'البيان الشهري' : 'Monthly Statement'}
                        </button>
                    </div>

                    <div className="bg-white p-6 md:p-12 rounded-2xl md:rounded-[4rem] border-2 border-gray-100 shadow-2xl relative overflow-hidden print-area">
                        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-primary/5 blur-3xl rounded-full no-print"></div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-start mb-10 md:mb-16 relative z-10 gap-6">
                            <div className="text-center md:text-right w-full md:w-auto">
                                <h3 className="text-3xl md:text-5xl font-black text-primary mb-2 md:mb-4">
                                    {reportType === 'daily' ? (language === 'ar' ? 'كشف الحساب اليومي' : 'Daily Account Statement') : (language === 'ar' ? 'البيان التجاري الشهري' : 'Monthly Commercial Statement')}
                                </h3>
                                <p className="text-xl md:text-2xl text-gray-400 font-bold">
                                    {reportType === 'daily' ? new Date().toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <button 
                                onClick={handlePrint}
                                className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black hover:bg-black transition-all no-print"
                            >
                                <DownloadIcon className="w-5 h-5 md:w-6 md:h-6" />
                                {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 mb-10 md:mb-16 relative z-10">
                            <div className="p-6 md:p-10 bg-slate-50 rounded-2xl md:rounded-[3rem] border-2 border-gray-100">
                                <p className="text-gray-400 font-black text-[10px] md:text-sm uppercase mb-2 md:mb-4">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                                <h4 className="text-3xl md:text-5xl font-black text-primary">
                                    {reportType === 'daily' ? dailyStats.sales.toFixed(2) : monthlyStats.sales.toFixed(2)} ر.س
                                </h4>
                            </div>
                            <div className="p-6 md:p-10 bg-slate-50 rounded-2xl md:rounded-[3rem] border-2 border-gray-100">
                                <p className="text-gray-400 font-black text-[10px] md:text-sm uppercase mb-2 md:mb-4">{language === 'ar' ? 'عدد العمليات' : 'Total Operations'}</p>
                                <h4 className="text-3xl md:text-5xl font-black text-secondary">
                                    {reportType === 'daily' ? dailyStats.count : monthlyStats.count} عملية
                                </h4>
                            </div>
                            <div className="p-6 md:p-10 bg-slate-50 rounded-2xl md:rounded-[3rem] border-2 border-gray-100">
                                <p className="text-gray-400 font-black text-[10px] md:text-sm uppercase mb-2 md:mb-4">{language === 'ar' ? 'صافي الأرباح التقديرية' : 'Estimated Net Profit'}</p>
                                <h4 className="text-3xl md:text-5xl font-black text-emerald-600">
                                    {reportType === 'daily' ? dailyStats.profit.toFixed(2) : monthlyStats.profit.toFixed(2)} ر.س
                                </h4>
                                <p className="text-[8px] md:text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-widest">Margin: 30%</p>
                            </div>
                        </div>

                        <div className="space-y-4 md:space-y-6 relative z-10 mb-10 md:mb-12">
                            <h4 className="text-xl md:text-2xl font-black text-slate-800 border-b pb-4">{language === 'ar' ? 'تحليل أداء الفروع' : 'Branch Performance Analysis'}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {Object.entries(branchStats).map(([bId, stats]) => {
                                    const branch = BRANCH_LOCATIONS.find(b => b.id.toString() === bId);
                                    return (
                                        <div key={bId} className="p-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{branch ? branch.name_ar : `فرع ${bId}`}</p>
                                                    <h5 className="text-xl font-black text-primary">{stats.sales.toFixed(2)} ر.س</h5>
                                                </div>
                                                <div className="bg-primary/5 p-2 rounded-lg">
                                                    <TrendingUpIcon className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                                <div>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase">العمليات</p>
                                                    <p className="text-sm font-black text-secondary">{stats.count}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase">متوسط الطلب</p>
                                                    <p className="text-sm font-black text-slate-700">{stats.avgOrder.toFixed(0)} ر.س</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase">مساهمة الربح</p>
                                                    <p className="text-sm font-black text-emerald-600">{stats.profit.toFixed(2)} ر.س</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(branchStats).length === 0 && (
                                    <p className="col-span-full text-center text-gray-400 italic py-8">لا توجد بيانات فروع لهذا التقرير</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 md:space-y-6 relative z-10">
                            <h4 className="text-xl md:text-2xl font-black text-slate-800 border-b pb-4">{language === 'ar' ? 'تفاصيل العمليات' : 'Operation Details'}</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right min-w-[600px]">
                                    <thead>
                                        <tr className="text-gray-400 text-[10px] md:text-xs font-black border-b">
                                            <th className="pb-4">التاريخ</th>
                                            <th className="pb-4">البيان</th>
                                            <th className="pb-4">المبلغ</th>
                                            <th className="pb-4">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {invoices
                                            .filter(inv => reportType === 'daily' ? inv.date.startsWith(new Date().toISOString().split('T')[0]) : inv.date.startsWith(new Date().toISOString().slice(0, 7)))
                                            .map(inv => (
                                                <tr key={inv.id} className="hover:bg-slate-50 transition-all">
                                                    <td className="py-3 md:py-4 font-bold text-xs md:text-sm text-gray-400">{new Date(inv.date).toLocaleTimeString('ar-SA')}</td>
                                                    <td className="py-3 md:py-4 font-black text-sm md:text-base text-primary">فاتورة مبيعات #{inv.id} - {inv.customerName}</td>
                                                    <td className="py-3 md:py-4 font-black text-sm md:text-base">{inv.total.toFixed(2)} ر.س</td>
                                                    <td className="py-3 md:py-4">
                                                        <span className={`px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black ${inv.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                            {inv.status_ar}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'invoices' && (
                <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 shadow-sm no-print">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-8 no-print">
                        <h3 className="text-xl md:text-2xl font-black text-primary flex items-center gap-4">
                            <FileTextIcon className="w-6 h-6 md:w-8 md:h-8" />
                            {language === 'ar' ? 'سجل الفواتير الإلكترونية' : 'E-Invoice Registry'}
                        </h3>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder={language === 'ar' ? 'بحث برقم الفاتورة أو العميل...' : 'Search by invoice or customer...'}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all text-sm font-bold"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right min-w-[800px]">
                            <thead>
                                <tr className="text-gray-400 text-[10px] md:text-xs font-black border-b">
                                    <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('id')}>{language === 'ar' ? 'رقم الفاتورة' : 'Invoice ID'} {sortConfig?.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                    <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('customerName')}>{language === 'ar' ? 'العميل' : 'Customer'} {sortConfig?.key === 'customerName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                    <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('date')}>{language === 'ar' ? 'التاريخ' : 'Date'} {sortConfig?.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                    <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('total')}>{language === 'ar' ? 'المبلغ' : 'Amount'} {sortConfig?.key === 'total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                    <th className="pb-4 cursor-pointer hover:text-primary" onClick={() => handleSort('status')}>{language === 'ar' ? 'الحالة' : 'Status'} {sortConfig?.key === 'status' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                    <th className="pb-4">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(() => {
                                    const { data, totalPages } = processData(invoices, ['customerName', 'id']);
                                    return (
                                        <>
                                            {data.map(inv => (
                                                <tr key={inv.id} className="hover:bg-slate-50 transition-all">
                                                    <td className="py-4 md:py-6 font-black text-primary">#{inv.id}</td>
                                                    <td className="py-4 md:py-6 font-bold">{inv.customerName}</td>
                                                    <td className="py-4 md:py-6 text-xs md:text-sm text-gray-400">{new Date(inv.date).toLocaleDateString('ar-SA')}</td>
                                                    <td className="py-4 md:py-6 font-black text-secondary">{inv.total.toFixed(2)} ر.س</td>
                                                    <td className="py-4 md:py-6">
                                                        <span className={`px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black ${inv.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                            {inv.status_ar}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 md:py-6">
                                                        <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary hover:text-white transition-all">
                                                            <FileTextIcon className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {data.length === 0 && (
                                                <tr><td colSpan={6} className="py-12 text-center text-gray-400 font-bold">{language === 'ar' ? 'لا توجد فواتير' : 'No invoices found'}</td></tr>
                                            )}
                                            <tr>
                                                <td colSpan={6}><Pagination totalPages={totalPages} current={currentPage} onChange={setCurrentPage} /></td>
                                            </tr>
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 shadow-sm no-print">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl border border-gray-100 gap-4">
                        <div className="text-center sm:text-right">
                            <h4 className="text-lg md:text-xl font-black">
                                {language === 'ar' ? 'ربط الحساب البنكي' : 'Bank Integration'}
                            </h4>
                            <p className="text-xs md:text-sm font-bold text-gray-400">ANB - SA4730400108095516770029</p>
                        </div>
                        <span className="bg-green-100 text-green-600 px-4 md:px-6 py-1 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase">
                            Connected
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl border border-gray-100 gap-4">
                        <div className="text-center sm:text-right">
                            <h4 className="text-lg md:text-xl font-black">
                                {language === 'ar' ? 'نظام الفوترة الإلكترونية' : 'E-Invoicing'}
                            </h4>
                            <p className="text-xs md:text-sm font-bold text-gray-400">ZATCA Phase 2 Integration Active</p>
                        </div>
                        <span className="bg-green-100 text-green-600 px-4 md:px-6 py-1 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase">
                            Active
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl border border-gray-100 gap-4">
                        <div className="text-center sm:text-right">
                            <h4 className="text-lg md:text-xl font-black">{language === 'ar' ? 'بوابة الدفع' : 'Payment Gateway'}</h4>
                            <p className="text-xs md:text-sm font-bold text-gray-400">Stripe / STC Pay Production Ready</p>
                        </div>
                        <span className="bg-orange-100 text-orange-600 px-4 md:px-6 py-1 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase">
                            Pending
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountingSection;
