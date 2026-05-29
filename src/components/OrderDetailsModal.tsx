
import React from 'react';
import { Order, Branch } from '../types';
import { XIcon, MapPinIcon, ClockIcon, ShoppingBagIcon, UserIcon, PhoneIcon } from './lib/contexts/Icons';
import { useI18n } from './lib/contexts/I18nContext';

interface OrderDetailsModalProps {
    order: Order;
    branches: Branch[];
    onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, branches, onClose }) => {
    const { language, formatCurrency } = useI18n();
    const branch = branches.find(b => b.id === order.branchId);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-4xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-primary text-white p-8 flex justify-between items-center border-b-8 border-secondary">
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase">Order Details</h2>
                        <p className="text-secondary font-bold text-xs tracking-widest mt-1">#{order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-red-600 transition-all">
                        <XIcon className="w-8 h-8" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Customer Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-primary border-b-2 border-slate-100 pb-2 flex items-center gap-3">
                                <UserIcon className="w-6 h-6 text-secondary" />
                                {language === 'ar' ? 'معلومات العميل' : 'Customer Info'}
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase">Name</p>
                                        <p className="font-bold text-slate-800">{order.customerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <PhoneIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase">Phone</p>
                                        <p className="font-bold text-slate-800">{order.customerPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <MapPinIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase">Address</p>
                                        <p className="font-bold text-slate-800">{order.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Status & Branch */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-primary border-b-2 border-slate-100 pb-2 flex items-center gap-3">
                                <ClockIcon className="w-6 h-6 text-secondary" />
                                {language === 'ar' ? 'حالة الطلب والفرع' : 'Status & Branch'}
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-400 uppercase">Status</span>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-400 uppercase">Branch</span>
                                    <span className="font-bold text-primary">
                                        {branch ? (language === 'ar' ? branch.name_ar : branch.name_en) : 'Not Assigned'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-gray-400 uppercase">Date</span>
                                    <span className="font-bold text-slate-600">
                                        {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-primary border-b-2 border-slate-100 pb-2 flex items-center gap-3">
                            <ShoppingBagIcon className="w-6 h-6 text-secondary" />
                            {language === 'ar' ? 'الأصناف المطلوبة' : 'Order Items'}
                        </h3>
                        <div className="bg-slate-50 rounded-3xl overflow-hidden border border-gray-100">
                            <table className="w-full text-right">
                                <thead className="bg-slate-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-4">Item</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Qty</th>
                                        <th className="p-4">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white transition-colors">
                                            <td className="p-4 font-bold text-slate-800">{language === 'ar' ? item.name_ar : item.name_en}</td>
                                            <td className="p-4 font-mono text-sm">{formatCurrency(item.price)}</td>
                                            <td className="p-4 font-black">x{item.quantity}</td>
                                            <td className="p-4 font-mono font-black text-primary">{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-100 font-black">
                                    <tr>
                                        <td colSpan={3} className="p-4 text-right uppercase tracking-widest text-xs">Total Amount (Inc. VAT)</td>
                                        <td className="p-4 text-2xl text-secondary font-mono">{formatCurrency(order.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-slate-50 border-t border-gray-100 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="px-10 py-4 bg-white border-2 border-gray-200 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all"
                    >
                        {language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-green-800 transition-all shadow-lg"
                    >
                        {language === 'ar' ? 'طباعة الفاتورة' : 'Print Invoice'}
                    </button>
                </div>
            </div>
        </div>
    );
};
