import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COMPANY_INFO } from './constants';
import { useI18n } from './lib/contexts';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const { language, t } = useI18n();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 15);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-10 overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: 'spring' }}
          className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full shadow-sovereign flex items-center justify-center p-6 relative border-4 border-secondary/20 logo-circle-glow"
        >
          <img 
            src={COMPANY_INFO.logo_url} 
            alt="Delta Stars Logo" 
            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-700" 
          />
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter"
          >
            {language === 'ar' ? COMPANY_INFO.name : 'DELTA STARS'}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-secondary font-black uppercase tracking-[0.4em] text-[12px] md:text-base border-y border-secondary/20 py-2 inline-block px-4 mb-2"
          >
            {t('header.utility.diamondEdition')}
          </motion.p>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-xs"
          >
            {t('home.hero.quality_label')}
          </motion.p>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-secondary shadow-glow"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            {progress < 100 ? (language === 'ar' ? 'جاري تهيئة النظام السيادي...' : 'Initializing Sovereign Protocol...') : (language === 'ar' ? 'النظام جاهز_' : 'System Ready_')}
          </p>
        </div>
      </div>

      <div className="absolute bottom-10 text-[8px] font-black text-white/5 uppercase tracking-[0.5em] text-center px-4">
        {t('footer.ownership')} | {language === 'ar' ? 'المملكة العربية السعودية' : 'Kingdom of Saudi Arabia'}
      </div>
    </motion.div>
  );
};
