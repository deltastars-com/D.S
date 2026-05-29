
import React, { useState, useEffect } from 'react';
import { useI18n } from './contexts/I18nContext';
import { SparklesIcon, XIcon, DownloadIcon } from './contexts/Icons';

export const PwaInstallPrompt: React.FC = () => {
    const { language } = useI18n();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after 10 seconds of browsing
            setTimeout(() => setIsVisible(true), 10000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the PWA install');
        }
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-32 left-6 right-6 md:left-auto md:right-12 md:w-[450px] z-[9999] animate-fade-in-up">
            <div className="bg-white p-8 rounded-[3.5rem] shadow-sovereign border-t-[15px] border-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
                
                <button 
                    onClick={() => setIsVisible(false)}
                    className="absolute top-6 right-6 text-gray-300 hover:text-primary transition-colors"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                        🚀
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-primary uppercase tracking-tighter">
                            {language === 'ar' ? 'ثبت التطبيق الآن' : 'Install App Now'}
                        </h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delta Stars Sovereign v62.0</p>
                    </div>
                </div>

                <p className="text-sm font-bold text-slate-600 mb-8 leading-relaxed">
                    {language === 'ar' 
                        ? 'احصل على تجربة تسوق أسرع، إشعارات لحظية، وإمكانية التصفح بدون إنترنت من خلال تثبيت التطبيق على جهازك.' 
                        : 'Get a faster shopping experience, real-time notifications, and offline browsing by installing the app on your device.'}
                </p>

                <button 
                    onClick={handleInstall}
                    className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 hover:bg-secondary transition-all shadow-xl border-b-[8px] border-primary-dark active:border-b-0 active:translate-y-1"
                >
                    <DownloadIcon className="w-6 h-6" />
                    {language === 'ar' ? 'تثبيت التطبيق' : 'Install Application'}
                </button>
            </div>
        </div>
    );
};
