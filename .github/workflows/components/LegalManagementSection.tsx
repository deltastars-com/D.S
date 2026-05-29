
import React, { useState, useEffect } from 'react';
import { useI18n, useToast, useFirebase } from './lib/contexts';
import { DocumentTextIcon } from './lib/contexts/Icons';

export const LegalManagementSection: React.FC = () => {
    const { language } = useI18n();
    const { addToast } = useToast();
    const { legalPages, updateLegalPage, seedLegalPages } = useFirebase();
    const [localLegalPages, setLocalLegalPages] = useState<Record<string, string>>({});

    useEffect(() => {
        if (legalPages.length > 0) {
            const data: Record<string, string> = {};
            legalPages.forEach(page => {
                data[`${page.id}_ar`] = page.content_ar;
                data[`${page.id}_en`] = page.content_en;
            });
            setLocalLegalPages(data);
        }
    }, [legalPages]);

    const handleSaveLegal = async () => {
        try {
            const pageIds = ['privacy', 'terms', 'shipping', 'returns'];
            for (const id of pageIds) {
                await updateLegalPage(id, {
                    content_ar: localLegalPages[`${id}_ar`] || '',
                    content_en: localLegalPages[`${id}_en`] || ''
                });
            }
            addToast(language === 'ar' ? 'تم حفظ كافة الصفحات القانونية بنجاح' : 'All legal pages saved successfully', 'success');
        } catch (err) {
            addToast(language === 'ar' ? 'فشل في حفظ الصفحات القانونية' : 'Failed to save legal pages', 'error');
        }
    };

    return (
        <div className="space-y-8 md:space-y-12 animate-fade-in">
            <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[4rem] border-2 border-gray-100 shadow-sm">
                <h3 className="text-xl md:text-3xl font-black text-primary mb-6 md:mb-10 flex items-center gap-4">
                    <DocumentTextIcon className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                    {language === 'ar' ? 'إدارة الصفحات القانونية والسياسات' : 'Legal Pages & Policies Management'}
                </h3>
                
                <div className="grid grid-cols-1 gap-8 md:gap-16">
                    {[
                        { id: 'privacy', label: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
                        { id: 'terms', label: language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions' },
                        { id: 'shipping', label: language === 'ar' ? 'سياسة الشحن والتوصيل' : 'Shipping Policy' },
                        { id: 'returns', label: language === 'ar' ? 'سياسة الاسترجاع' : 'Returns Policy' }
                    ].map(page => (
                        <div key={page.id} className="bg-slate-50 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 border-gray-100 space-y-6 md:space-y-8">
                            <h3 className="text-lg md:text-2xl font-black text-primary">{page.label}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">المحتوى بالعربي</label>
                                    <textarea 
                                        value={localLegalPages[`${page.id}_ar`] || ''}
                                        onChange={e => setLocalLegalPages({...localLegalPages, [`${page.id}_ar`]: e.target.value})}
                                        className="w-full p-4 md:p-6 bg-white border-2 border-transparent focus:border-primary rounded-2xl md:rounded-3xl font-bold outline-none shadow-sm h-48 md:h-64 text-right text-sm md:text-base"
                                        placeholder="أدخل نص السياسة هنا..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Content in English</label>
                                    <textarea 
                                        value={localLegalPages[`${page.id}_en`] || ''}
                                        onChange={e => setLocalLegalPages({...localLegalPages, [`${page.id}_en`]: e.target.value})}
                                        className="w-full p-4 md:p-6 bg-white border-2 border-transparent focus:border-primary rounded-2xl md:rounded-3xl font-bold outline-none shadow-sm h-48 md:h-64 text-sm md:text-base"
                                        placeholder="Enter policy text here..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <button 
                        onClick={async () => {
                            if (confirm(language === 'ar' ? 'هل تريد إعادة تعيين كافة الصفحات القانونية إلى القيم الافتراضية؟' : 'Do you want to reset all legal pages to default values?')) {
                                await seedLegalPages();
                                addToast(language === 'ar' ? 'تمت إعادة تعيين الصفحات بنجاح' : 'Pages reset successfully', 'success');
                            }
                        }}
                        className="text-gray-400 hover:text-primary font-bold text-xs md:text-sm transition-all"
                    >
                        {language === 'ar' ? 'إعادة تعيين الافتراضيات' : 'Reset to Defaults'}
                    </button>
                    <button 
                        onClick={handleSaveLegal} 
                        className="w-full sm:w-auto bg-primary text-white px-8 md:px-12 py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl shadow-2xl hover:bg-black transition-all"
                    >
                        {language === 'ar' ? 'حفظ كافة التعديلات القانونية' : 'Save All Legal Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};
