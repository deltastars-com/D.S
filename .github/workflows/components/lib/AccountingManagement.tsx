import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'يناير', value: 45000 },
  { name: 'فبراير', value: 52000 },
  { name: 'مارس', value: 48000 },
  { name: 'أبريل', value: 61000 },
  { name: 'مايو', value: 55000 },
  { name: 'يونيو', value: 67000 },
];

export default function AccountingManagement() {
  const [invoices, setInvoices] = useState([
    { id: 'INV-2024-001', customer: 'شركة نجوم دلتا', amount: '15,400 ر.س', status: 'مدفوع', date: '2024-03-24' },
    { id: 'INV-2024-002', customer: 'مطعم السفير', amount: '4,200 ر.س', status: 'معلق', date: '2024-03-24' },
    { id: 'INV-2024-003', customer: 'فندق هيلتون', amount: '28,900 ر.س', status: 'متأخر', date: '2024-03-20' },
  ]);

  const handleExportCSV = () => {
    const headers = ['الشهر', 'القيمة'];
    const csvRows = [
      headers.join(','),
      ...data.map(row => `${row.name},${row.value}`)
    ];
    const csvContent = "\uFEFF" + csvRows.join('\n'); // Add BOM for Excel Arabic support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-[#1a3a1a]">المحاسبة والمالية</h3>
        <div className="flex gap-2">
          <button className="bg-white text-[#1a3a1a] px-4 py-2 rounded-xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
            تصدير Excel
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-white text-[#1a3a1a] px-4 py-2 rounded-xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all"
          >
            تصدير CSV
          </button>
          <button className="bg-[#FF922B] text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg">
            + فاتورة جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">إجمالي المبيعات</p>
          <p className="text-2xl font-black text-[#1a3a1a]">145,000 ر.س</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">المبالغ المحصلة</p>
          <p className="text-2xl font-black text-emerald-500">112,000 ر.س</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">مبالغ معلقة</p>
          <p className="text-2xl font-black text-[#FF922B]">23,000 ر.س</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">مبالغ متأخرة</p>
          <p className="text-2xl font-black text-red-500">10,000 ر.س</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h4 className="text-lg font-black text-[#1a3a1a] mb-6">تحليل الإيرادات الشهرية</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#FF922B' : '#1a3a1a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h4 className="text-lg font-black text-[#1a3a1a]">الفواتير الأخيرة</h4>
          </div>
          <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto custom-scrollbar">
            {invoices.map(invoice => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#1a3a1a] font-black text-[10px]">
                    INV
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#1a3a1a] mb-1">{invoice.customer}</h5>
                    <p className="text-[10px] text-gray-400 font-bold">{invoice.id}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-[#1a3a1a]">{invoice.amount}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${
                    invoice.status === 'مدفوع' ? 'bg-emerald-50 text-emerald-600' : 
                    invoice.status === 'معلق' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
