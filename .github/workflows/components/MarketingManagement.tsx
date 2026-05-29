import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'السبت', reach: 1200 },
  { name: 'الأحد', reach: 1900 },
  { name: 'الاثنين', reach: 1500 },
  { name: 'الثلاثاء', reach: 2100 },
  { name: 'الأربعاء', reach: 2400 },
  { name: 'الخميس', reach: 3200 },
  { name: 'الجمعة', reach: 2800 },
];

export default function MarketingManagement() {
  const [promotions, setPromotions] = useState([
    { id: 1, title: 'عرض رمضان المبارك', reach: '12,400', status: 'نشط', type: 'خصم مباشر' },
    { id: 2, title: 'حملة الفواكه الموسمية', reach: '8,200', status: 'مجدول', type: 'إعلان ممول' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-[#1a3a1a]">التسويق والعروض</h3>
        <button className="bg-[#FF922B] text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg">
          + حملة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h4 className="text-lg font-black text-[#1a3a1a] mb-6">تحليل الوصول الأسبوعي</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="reach" stroke="#FF922B" strokeWidth={4} dot={{ fill: '#FF922B', strokeWidth: 2, r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold mb-1">إجمالي الوصول</p>
            <p className="text-2xl font-black text-[#1a3a1a]">45,200</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold mb-1">معدل التحويل</p>
            <p className="text-2xl font-black text-emerald-500">12.4%</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold mb-1">الميزانية المستخدمة</p>
            <p className="text-2xl font-black text-[#FF922B]">4,500 ر.س</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <h4 className="text-lg font-black text-[#1a3a1a]">الحملات النشطة</h4>
        </div>
        <div className="divide-y divide-gray-50">
          {promotions.map(promo => (
            <div key={promo.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF922B]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                </div>
                <div>
                  <h5 className="text-sm font-black text-[#1a3a1a]">{promo.title}</h5>
                  <p className="text-xs text-gray-400 font-bold">{promo.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">الوصول</p>
                  <p className="text-sm font-black text-[#1a3a1a]">{promo.reach}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${promo.status === 'نشط' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {promo.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
