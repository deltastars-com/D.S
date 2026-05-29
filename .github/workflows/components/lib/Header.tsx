import React from 'react';
import { User, Page } from '../../types';

interface HeaderProps {
  setPage: (page: Page) => void;
  cartItemCount: number;
  user: User | null;
  onLogout: () => void;
  onToggleAiAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setPage, cartItemCount, user, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-[1000] bg-white/95 backdrop-blur-xl border-b-4 border-yellow-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        
        {/* الهوية التجارية الجديدة الثابتة */}
        <div className="flex flex-col cursor-pointer group" onClick={() => setPage('home')}>
          <h1 className="text-3xl font-black text-[#1a3a1a] tracking-tighter uppercase group-hover:text-yellow-600 transition-colors">
            Delta Stars
          </h1>
          <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
            شريكك الأمثل للخضروات والفواكه والتمور عالية الجودة
          </span>
        </div>

        {/* أزرار التحكم والدخول الذكي */}
        <div className="flex items-center gap-8">
          {user ? (
            <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-full px-6 border border-gray-200 shadow-inner">
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-black text-[#1a3a1a] leading-none">{user.email}</span>
                <span className="text-[9px] font-bold text-emerald-600">الجلسة نشطة الآن ✓</span>
              </div>
              
              {/* زر المطور السري - لا يظهر إلا عند دخولك بإيميل المطور فقط */}
              {user.type === 'developer' && (
                <button 
                  onClick={() => setPage('dev_console')}
                  className="bg-yellow-500 text-black p-2 rounded-xl hover:rotate-180 transition-transform shadow-lg border-b-4 border-yellow-700 active:translate-y-1 active:border-b-0"
                  title="لوحة العمليات التقنية"
                >
                  ⚙️
                </button>
              )}
              
              <button onClick={onLogout} className="text-[11px] text-red-600 font-black border-r-2 pr-4 border-gray-300 hover:text-red-800">خروج</button>
            </div>
          ) : (
            <button 
              onClick={() => setPage('login')} 
              className="text-sm font-black text-white bg-[#1a3a1a] px-8 py-3 rounded-full hover:bg-yellow-600 transition-all shadow-lg border-b-4 border-green-900 active:translate-y-1 active:border-b-0"
            >
              دخول الإدارة
            </button>
          )}

          {/* سلة المشتريات */}
          <div className="relative cursor-pointer group" onClick={() => setPage('cart')}>
            <span className="text-3xl group-hover:scale-110 transition-transform inline-block">🛒</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-xl">
                {cartItemCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
