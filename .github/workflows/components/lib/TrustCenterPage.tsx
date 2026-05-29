
import React from 'react';
import { useI18n } from './contexts/I18nContext';
import { COMPANY_DOCS, COMPANY_INFO } from '../constants';
import { SparklesIcon, DocumentTextIcon, QualityIcon } from './contexts/Icons';

export const TrustCenterPage: React.FC = () => {
    const { language } = useI18n();

    const handleDownload = (driveId: string) => {
        window.open(`https://drive.google.com/uc?export=download&id=${driveId}`, '_blank');
    };

    return (
        <div className="animate-fade-in pb-32 text-black bg-white">
            {/* High Quality Header */}
            <section className="bg-primary-dark pt-32 pb-44 px-6 text-center relative overflow-hidden border-b-[20px] border-secondary/20">
                <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-secondary/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-xl px-10 py-3 rounded-full border border-white/10 text-secondary font-black text-xs mb-10 uppercase tracking-[0.4em]">
                        <QualityIcon className="w-5 h-5" />
                        {language === 'ar' ? 'النزاهة، الشفافية، جودة عالية' : 'Integrity, Transparency, High Quality'}
                    </div>
                    <h1 className="text-6xl md:text-[6rem] font-black text-white mb-6 leading-tight uppercase tracking-tighter">
                        {language === 'ar' ? 'قسم الامتثال والشفافية' : 'Compliance Hub'}
                    </h1>
                    <p className="text-2xl md:text-3xl font-bold text-white/50 italic max-w-4xl mx-auto leading-relaxed">
                        بوابة التحقق من الاعتمادات والتراخيص الرسمية ذات الجودة العالية لـ {language === 'ar' ? 'نجوم دلتا' : 'deltastars'}
                    </p>
                </div>
            </section>

            {/* Verified Stickers Grid */}
            <div className="container mx-auto px-6 -mt-32 relative z-20">
                <div className="bg-white p-12 md:p-24 rounded-[5rem] shadow-4xl border border-gray-100 flex flex-col items-center">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-primary mb-4">{language === 'ar' ? 'الملصقات الرسمية المعتمدة' : 'Official Verified Stickers'}</h2>
                        <p className="text-gray-400 font-bold text-xl">{language === 'ar' ? 'انقر على أي ملصق لتحميل نسخة PDF الأصلية فائقة الجودة' : 'Click any sticker to download high-quality original PDF'}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
                        {COMPANY_DOCS.map(doc => (
                            <div 
                                key={doc.id}
                                onClick={() => handleDownload(doc.drive_id)}
                                className="group flex flex-col items-center cursor-pointer"
                            >
                                <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full flex items-center justify-center shadow-2xl border-8 border-white group-hover:border-secondary transition-all duration-700 relative overflow-hidden group-hover:scale-105 group-active:scale-95 ring-12 ring-gray-50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent"></div>
                                    <img 
                                        src={doc.icon_url} 
                                        className="w-32 md:w-44 h-auto object-contain z-10 drop-shadow-xl p-4"
                                        alt={doc.title_en}
                                        loading="eager"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3503/3503827.png";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-primary/95 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="bg-secondary/20 p-4 rounded-full mb-4">
                                            <DocumentTextIcon className="w-12 h-12 text-secondary" />
                                        </div>
                                        <span className="text-white font-black text-sm uppercase tracking-[0.2em]">تحميل مستند الجودة</span>
                                        <span className="text-secondary font-bold text-[10px] uppercase mt-2">Verified High-Quality</span>
                                    </div>
                                </div>
                                <div className="mt-10 text-center">
                                    <h3 className="text-3xl font-black text-slate-800 mb-3 leading-tight">{language === 'ar' ? doc.title_ar : doc.title_en}</h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="bg-green-100 text-green-600 px-5 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border border-green-200">Quality Verified ✓</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-32 p-12 bg-slate-50 rounded-[4rem] border-4 border-dashed border-gray-200 text-center max-w-5xl relative overflow-hidden">
                        <p className="text-gray-500 font-bold text-xl leading-relaxed relative z-10">
                            {language === 'ar' ? 
                                'نلتزم في نجوم دلتا بأعلى معايير الحوكمة والامتثال لضمان تقديم منتجات وخدمات ذات جودة عالية لشركائنا في كافة قطاعات المملكة العربية السعودية.' :
                                'At deltastars, we adhere to the highest standards of governance and compliance to ensure providing high-quality products and services to our partners across all sectors in KSA.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
