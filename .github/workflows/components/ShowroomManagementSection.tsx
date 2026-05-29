
import React from 'react';
import { useI18n, useToast, useFirebase } from './lib/contexts';
import { LayoutIcon, StarIcon } from './lib/contexts/Icons';
import { COMPANY_INFO } from './constants';

export const ShowroomManagementSection: React.FC = () => {
    const { language } = useI18n();
    const { addToast } = useToast();
    const { products, updateProduct } = useFirebase();

    return (
        <div className="space-y-8 md:space-y-12 animate-fade-in">
            <h2 className="text-2xl md:text-4xl font-black text-slate-800 uppercase flex items-center gap-4">
                <LayoutIcon className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                {language === 'ar' ? 'إدارة صالة العروض' : 'Showroom Management'}
            </h2>

            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-6 md:space-y-8">
                <h3 className="text-lg md:text-2xl font-black text-primary border-b pb-4">{language === 'ar' ? 'إعدادات الواجهة الرئيسية' : 'Main Interface Settings'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">{language === 'ar' ? 'رابط بنر الصالة الرئيسي' : 'Main Showroom Banner URL'}</label>
                        <input 
                            type="text" 
                            value={COMPANY_INFO.wide_banner_url}
                            className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-primary rounded-xl md:rounded-2xl font-bold outline-none shadow-sm text-sm md:text-base"
                            readOnly
                        />
                        <p className="text-[10px] text-gray-400 px-4 italic">{language === 'ar' ? 'يتم تحديث البنر من ملف الثوابت السيادية (constants.ts)' : 'Banner is updated from sovereign constants (constants.ts)'}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">{language === 'ar' ? 'عدد المنتجات المميزة' : 'Featured Products Count'}</label>
                        <input 
                            type="number" 
                            value={products.filter(p => p.is_featured).length}
                            className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-primary rounded-xl md:rounded-2xl font-bold outline-none shadow-sm text-sm md:text-base"
                            readOnly
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-6 md:space-y-8">
                <h3 className="text-lg md:text-2xl font-black text-primary border-b pb-4">{language === 'ar' ? 'تخصيص المنتجات المميزة' : 'Customize Featured Products'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {(products || []).map(product => (
                        <div key={product.id} className="bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-primary transition-all gap-4">
                            <div className="flex items-center gap-3 md:gap-4 shrink-0">
                                <img src={product.image} className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover shadow-sm" alt={product.name_ar} />
                                <div>
                                    <p className="font-black text-xs md:text-sm text-slate-800 line-clamp-1">{language === 'ar' ? product.name_ar : product.name_en}</p>
                                    <p className="text-[10px] font-bold text-gray-400">{product.category}</p>
                                </div>
                            </div>
                            <button 
                                onClick={async () => {
                                    try {
                                        await updateProduct(product.id, { is_featured: !product.is_featured });
                                        addToast(language === 'ar' ? 'تم تحديث حالة التمييز' : 'Featured status updated', 'success');
                                    } catch (err) { addToast(language === 'ar' ? 'فشل التحديث' : 'Update failed', 'error'); }
                                }}
                                className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all shrink-0 ${product.is_featured ? 'bg-primary text-white shadow-lg' : 'bg-white text-gray-300 hover:text-primary'}`}
                            >
                                <StarIcon className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
