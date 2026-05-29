import React from 'react';
import { useFirebase } from './lib/contexts/FirebaseContext';
import { useI18n } from './lib/contexts/I18nContext';
import { ShieldCheckIcon, FileTextIcon, RefreshCcwIcon, DeliveryIcon, ArrowLeftIcon } from './lib/contexts/Icons';

interface LegalPageProps {
  pageId: 'privacy' | 'terms' | 'shipping' | 'returns';
  onBack: () => void;
}

export const LegalPageView: React.FC<LegalPageProps> = ({ pageId, onBack }) => {
  const { legalPages } = useFirebase();
  const { language } = useI18n();
  
  const page = legalPages.find(p => p.id === pageId);
  
  const icons = {
    privacy: <ShieldCheckIcon className="w-16 h-16 text-primary" />,
    terms: <FileTextIcon className="w-16 h-16 text-primary" />,
    returns: <RefreshCcwIcon className="w-16 h-16 text-primary" />,
    shipping: <DeliveryIcon className="w-16 h-16 text-primary" />,
  };

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <FileTextIcon className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">الصفحة غير متوفرة حالياً</h2>
          <button onClick={onBack} className="text-primary font-bold flex items-center gap-2 mx-auto">
            <ArrowLeftIcon className="w-5 h-5" /> العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1f0e] py-20 px-6 animate-fade-in text-white">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-10 flex items-center gap-3 text-secondary font-black hover:gap-5 transition-all group"
        >
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center shadow-md group-hover:bg-secondary group-hover:text-white transition-all border border-white/10">
            <ArrowLeftIcon className="w-5 h-5" />
          </div>
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>

        <div className="text-center mb-20">
          <div className="inline-flex p-8 bg-secondary/10 rounded-[3rem] mb-8 shadow-sovereign border border-secondary/20">
            {icons[pageId]}
          </div>
          <h1 className="text-6xl font-black text-white mb-6 tracking-tighter uppercase text-shadow-sovereign">
            {language === 'ar' ? page.title_ar : page.title_en}
          </h1>
          <div className="h-2 w-32 bg-secondary mx-auto rounded-full shadow-sovereign"></div>
        </div>

        <div className="space-y-12">
          {((language === 'ar' ? page.content_ar : page.content_en) || '').split('\n\n').map((section, idx) => {
            const [title, ...contentLines] = section.split('\n');
            return (
              <div key={idx} className="bg-slate-800/40 backdrop-blur-md p-12 rounded-[4rem] shadow-xl border border-white/5 hover:border-secondary/20 transition-all">
                <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-4 text-shadow-sovereign">
                  <span className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center text-xl shadow-sovereign">{idx + 1}</span>
                  {title.replace(/^\d+\.\s*/, '')}
                </h2>
                <div className="text-2xl text-gray-400 leading-relaxed font-bold space-y-4">
                  {contentLines.map((line, lIdx) => (
                    <p key={lIdx}>{line}</p>
                  ))}
                  {contentLines.length === 0 && <p>{title}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 p-10 bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-white/5 text-center">
          <p className="text-xl text-gray-500 font-bold italic">
            {language === 'ar' 
              ? 'تم تحديث هذه السياسة لتتوافق مع أنظمة وزارة التجارة وقانون التجارة الإلكترونية في المملكة العربية السعودية.' 
              : 'This policy has been updated to comply with Ministry of Commerce regulations and E-commerce law in Saudi Arabia.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const SYSTEM_CONFIG = {
  BRAND_NAME: "نجوم دلتا للتجارة",
};
