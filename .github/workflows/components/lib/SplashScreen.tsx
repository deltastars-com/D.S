
import React, { useEffect, useState } from 'react';
import { COMPANY_INFO } from '../constants';
import { LogoIcon } from './contexts/Icons';
import { useI18n } from './contexts/I18nContext';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { language } = useI18n();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 800); 
        }, 3000); 
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-primary`}>
            <div className="absolute inset-0 bg-primary-dark"></div>

            <div className="relative z-10 text-center flex flex-col items-center max-w-4xl px-6">
                <div className="relative mb-10 group">
                    <div className="p-4 rounded-[4.5rem] transform animate-pulse transition-transform">
                        <LogoIcon className="w-48 h-48 drop-shadow-2xl object-contain" />
                    </div>
                </div>

                <div className="space-y-4 animate-fade-in text-white">
                    <h1 className="text-5xl md:text-[6rem] font-black tracking-tighter uppercase leading-none drop-shadow-xl">
                        {language === 'ar' ? COMPANY_INFO.name : COMPANY_INFO.name_en}
                    </h1>
                    
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-0.5 w-12 bg-secondary opacity-50 rounded-full"></div>
                        <span className="text-secondary font-black text-[10px] uppercase tracking-[0.4em]">Sovereign Supply Hub</span>
                        <div className="h-0.5 w-12 bg-secondary opacity-50 rounded-full"></div>
                    </div>

                    <p className="text-white/80 text-xl font-bold italic max-w-2xl mx-auto leading-relaxed">
                        {language === 'ar' ? COMPANY_INFO.slogan : COMPANY_INFO.slogan_en}
                    </p>
                </div>

                <div className="mt-16 flex flex-col items-center gap-4">
                    <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary animate-progress-load"></div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes progress-load {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};
