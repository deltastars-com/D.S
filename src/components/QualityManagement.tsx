import React, { useState } from 'react';

export default function QualityManagement() {
  const [checks, setChecks] = useState([
    { id: 'QC-001', item: 'طماطم بلدي', score: 9.5, status: 'ممتاز', date: '2024-03-24', inspector: 'أحمد علي' },
    { id: 'QC-002', item: 'خيار صوبة', score: 8.2, status: 'جيد جداً', date: '2024-03-24', inspector: 'سارة محمد' },
    { id: 'QC-003', item: 'برتقال أبو صرة', score: 6.5, status: 'مقبول', date: '2024-03-23', inspector: 'خالد فهد' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-primary-dark">إدارة الجودة والرقابة</h3>
        <button className="bg-primary-dark text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg flex items-center gap-2">
          <span>+ فحص جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">متوسط الجودة</p>
          <p className="text-2xl font-black text-primary-dark">8.7 / 10</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">نسبة الرفض</p>
          <p className="text-2xl font-black text-red-500">1.2%</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">فحوصات اليوم</p>
          <p className="text-2xl font-black text-secondary">24</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-bold mb-1">الموردين المعتمدين</p>
          <p className="text-2xl font-black text-emerald-500">12</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">رقم الفحص</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">المنتج</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">الدرجة</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">الحالة</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">المفتش</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {checks.map(check => (
              <tr key={check.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-black text-primary-dark">{check.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-600">{check.item}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${check.score > 8 ? 'bg-emerald-500' : check.score > 6 ? 'bg-secondary' : 'bg-red-500'}`}
                        style={{ width: `${check.score * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-black">{check.score}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    check.status === 'ممتاز' ? 'bg-emerald-50 text-emerald-600' : 
                    check.status === 'جيد جداً' ? 'bg-blue-50 text-blue-600' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {check.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-400">{check.inspector}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
