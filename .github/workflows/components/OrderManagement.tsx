import React from 'react';

export default function OrderManagement() {
  const orders = [
    { id: 'ORD-1234', customer: 'مطعم النخيل', amount: '1,200 ر.س', status: 'delivered', date: '2026-03-24' },
    { id: 'ORD-1235', customer: 'فندق هيلتون', amount: '4,500 ر.س', status: 'preparing', date: '2026-03-24' },
    { id: 'ORD-1236', customer: 'سوبر ماركت الراية', amount: '8,900 ر.س', status: 'shipped', date: '2026-03-23' },
    { id: 'ORD-1237', customer: 'مستشفى الملك فهد', amount: '2,100 ر.س', status: 'pending', date: '2026-03-23' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'setup': return 'bg-indigo-100 text-indigo-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'تم التسليم';
      case 'preparing': return 'جاري التجهيز';
      case 'setup': return 'جاري الإعداد والتحميل';
      case 'shipped': return 'قيد الشحن';
      case 'pending': return 'في انتظار الدفع';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-primary">الطلبات الأخيرة</h3>
        <button className="text-sm font-bold text-secondary hover:underline">عرض الكل</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">رقم الطلب</th>
              <th className="px-8 py-4">العميل</th>
              <th className="px-8 py-4">المبلغ</th>
              <th className="px-8 py-4">الحالة</th>
              <th className="px-8 py-4">التاريخ</th>
              <th className="px-8 py-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-4 font-bold text-primary">{order.id}</td>
                <td className="px-8 py-4 font-bold text-slate-700">{order.customer}</td>
                <td className="px-8 py-4 font-black text-primary">{order.amount}</td>
                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="px-8 py-4 text-xs text-slate-500">{order.date}</td>
                <td className="px-8 py-4">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
