
import React, { useState, useEffect } from 'react';
import { Product, Page, Promotion, CategoryKey } from '../../../types';
import { ProductCard } from '../../ProductCard';
import { useI18n } from './I18nContext';
import { COMPANY_INFO } from '../../constants';
import { DeliveryIcon, QualityIcon, SparklesIcon, ChartBarIcon, FingerprintIcon, StarIcon, GlobeAltIcon } from './Icons';

export const Home: React.FC<{
    setPage: (p: Page, productId?: number, category?: CategoryKey) => void;
    addToCart: (p: Product) => void;
    products: Product[];
    promotions: Promotion[];
}> = ({ setPage, products }) => {
    const { t, language, getHijriDate } = useI18n();
    const [stats, setStats] = useState({ activeOrders: 12, qualityScore: 99.8 });

    // محاكاة حركة البيانات الحية لرفع مستوى التفاعل
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({ ...prev, activeOrders: prev.activeOrders + (Math.random() > 0.5 ? 1 : -1) }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const categories: CategoryKey[] = ['fruits', 'vegetables', 'herbs', 'qassim', 'dates', 'packages'];

    return (
        <div className="space-y-0 pb-32 bg-white overflow-x-hidden selection:bg-secondary selection:text-white">
            
            {/* Cinematic Hero Section v60 */}
            <section className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-primary-dark">
                <div className="absolute inset-0">
                    <img 
                        src={COMPANY_INFO.wide_banner_url} 
                        alt="Premium Supply" 
                        className="w-full h-full object-cover opacity-50 scale-105 animate-slow-pan" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 via-transparent to-primary-dark/80"></div>
                </div>
                
                <div className="relative z-10 text-center px-6 max-w-7xl">
                    <div className="flex flex-col items-center animate-fade-in-up">
                        <div className="bg-secondary/20 backdrop-blur-3xl border-2 border-secondary/30 text-secondary px-10 py-3 rounded-full inline-flex items-center gap-6 font-black text-[11px] mb-12 uppercase tracking-[0.4em] shadow-2xl">
                             <SparklesIcon className="w-5 h-5 animate-pulse" />
                             {t('home.hero.quality_label')}
                        </div>
                        
                        <h1 className="text-7xl md:text-[11rem] font-black text-white mb-8 leading-[0.8] tracking-tighter uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            {language === 'ar' ? COMPANY_INFO.name : COMPANY_INFO.name_en}
                        </h1>
                        
                        <div className="flex items-center gap-6 mb-16">
                            <div className="h-px w-20 bg-secondary/50"></div>
                            <p className="text-2xl md:text-5xl font-bold text-secondary italic opacity-90 tracking-tight">
                                {language === 'ar' ? COMPANY_INFO.slogan : COMPANY_INFO.slogan_en}
                            </p>
                            <div className="h-px w-20 bg-secondary/50"></div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8">
                            <button 
                                onClick={() => setPage('products')} 
                                className="group relative bg-white text-primary px-20 py-8 rounded-[3rem] font-black text-3xl hover:scale-105 transition-all shadow-4xl overflow-hidden border-b-[10px] border-gray-200 active:translate-y-2 active:border-b-0"
                            >
                                <span className="relative z-10 flex items-center gap-4">🛒 {t('home.hero.button')}</span>
                                <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            </button>
                            <button 
                                onClick={() => setPage('vipLogin')} 
                                className="bg-secondary text-white px-20 py-8 rounded-[3rem] font-black text-3xl hover:scale-105 transition-all shadow-[0_30px_60px_rgba(255,146,43,0.3)] border-b-[10px] border-orange-800 active:translate-y-2 active:border-b-0"
                            >
                                {t('home.hero.vipButton')} 🔐
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Live Metrics Hub */}
                <div className="absolute bottom-16 left-12 right-12 z-20 flex flex-col md:flex-row justify-between items-end gap-8 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-4xl border border-white/10 p-10 rounded-[4rem] shadow-sovereign pointer-events-auto flex items-center gap-10 group">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-green-500/30 rounded-full flex items-center justify-center animate-spin-slow">
                                <DeliveryIcon className="w-10 h-10 text-green-500" />
                            </div>
                            <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]"></div>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-1">Live Fleet Status</p>
                            <p className="text-3xl font-black text-white">{stats.activeOrders} <span className="text-xs text-green-500">ACTIVE MISSIONS</span></p>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-4xl border border-white/5 p-10 rounded-[4rem] text-right pointer-events-auto hidden lg:block">
                        <div className="flex items-center justify-end gap-4 mb-4">
                            <p className="text-xl font-black text-white uppercase">{getHijriDate()}</p>
                            <GlobeAltIcon className="w-6 h-6 text-secondary" />
                        </div>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.5em]">Global Integrity Score: {stats.qualityScore}%</p>
                    </div>
                </div>
            </section>

            {/* Strategic Sourcing Sections v60 */}
            <section className="container mx-auto px-6 py-32">
                <div className="text-center mb-24 animate-fade-in">
                    <h2 className="text-6xl md:text-9xl font-black text-slate-900 mb-6 uppercase tracking-tighter leading-none">
                        {t('home.categories.title')}
                    </h2>
                    <div className="h-2 w-40 bg-secondary mx-auto rounded-full mb-8"></div>
                    <p className="text-2xl md:text-4xl font-bold text-slate-400 italic">{t('home.categories.subtitle')}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
                    {categories.map((cat, idx) => (
                        <div 
                            key={cat} 
                            onClick={() => setPage('products', undefined, cat)}
                            className="group bg-white p-12 rounded-[5rem] shadow-xl hover:shadow-sovereign hover:-translate-y-6 transition-all duration-700 cursor-pointer border border-gray-50 flex flex-col items-center relative overflow-hidden"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="text-8xl mb-8 group-hover:rotate-12 transition-transform duration-500 filter drop-shadow-2xl">
                                {cat === 'fruits' ? '🍎' : cat === 'vegetables' ? '🥦' : cat === 'dates' ? '🌴' : cat === 'qassim' ? '🌾' : cat === 'packages' ? '📦' : '🌿'}
                            </div>
                            <h3 className="font-black text-2xl text-primary text-center group-hover:text-secondary transition-colors uppercase tracking-tight">
                                {t(`categories.${cat}`)}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Engineering Section */}
            <section className="bg-slate-50 py-32 border-y-8 border-gray-100 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="space-y-12">
                            <div className="inline-flex items-center gap-4 bg-primary text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                                <FingerprintIcon className="w-5 h-5 text-secondary" />
                                {language === 'ar' ? 'هوية الجودة المطلقة' : 'ABSOLUTE QUALITY IDENTITY'}
                            </div>
                            <h2 className="text-6xl md:text-8xl font-black text-primary leading-none uppercase tracking-tighter">
                                نحن نضمن <br/> <span className="text-secondary">الثقة الرقمية</span>
                            </h2>
                            <p className="text-2xl font-bold text-slate-500 leading-relaxed max-w-xl italic">
                                "من الحقول الوطنية إلى مائدتك، نستخدم أحدث تقنيات التتبع الجغرافي والتحقق من الجودة عبر الذكاء الاصطناعي لضمان أن كل ثمرة تصلك هي الأفضل عالمياً."
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-secondary">
                                    <p className="text-4xl font-black text-primary mb-2">91+</p>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">صنف معتمد</p>
                                </div>
                                <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-green-500">
                                    <p className="text-4xl font-black text-primary mb-2">100%</p>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">فحص مختبري</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-secondary rounded-[6rem] rotate-3 group-hover:rotate-0 transition-transform duration-700"></div>
                            <img 
                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200" 
                                className="relative rounded-[6rem] shadow-4xl border-8 border-white group-hover:-translate-x-4 group-hover:-translate-y-4 transition-all duration-700" 
                                alt="Quality Hub"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes slow-pan {
                    0% { transform: scale(1.05) translate(0,0); }
                    50% { transform: scale(1.15) translate(-2%, -2%); }
                    100% { transform: scale(1.05) translate(0,0); }
                }
                .animate-slow-pan { animation: slow-pan 30s infinite alternate ease-in-out; }
            `}</style>
        </div>
    );
};
