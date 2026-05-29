import React, { useState, useMemo } from 'react';
import { useI18n } from './lib/contexts';
import { SearchIcon, FilterIcon, ShoppingCartIcon, XIcon } from './lib/contexts/Icons';
import { CATEGORY_ICONS } from './constants';

interface ShowroomPageProps {
  items: any[];
  showroomBanner: string;
  setPage: (page: string) => void;
  initialCategory?: string;
}

export function ShowroomPage({ items, showroomBanner, setPage, initialCategory }: ShowroomPageProps) {
  const { language, formatCurrency, t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setPageNumber(1);
    }
  }, [initialCategory]);

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return t('products.allCategories');
    const labels: any = {
      vegetables: t('categories.vegetables'),
      fruits: t('categories.fruits'),
      herbs: t('categories.herbs'),
      dates: t('categories.dates'),
      qassim: t('categories.qassim'),
      packages: t('categories.packages'),
      seasonal: t('categories.seasonal'),
      imported: t('categories.imported'),
      flowers: t('categories.flowers')
    };
    return labels[cat] || cat;
  };

  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category));
    return ['all', ...Array.from(cats)];
  }, [items]);

  const ITEMS_PER_PAGE = 32;
  const [pageNumber, setPageNumber] = useState(1);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = language === 'ar' ? item.name_ar : item.name_en;
      const desc = language === 'ar' ? item.description_ar : item.description_en;
      const matchesSearch = name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            desc?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory, language]);

  const pagedItems = useMemo(() => {
    return filteredItems.slice(0, pageNumber * ITEMS_PER_PAGE);
  }, [filteredItems, pageNumber]);

  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen pb-20">
      {/* Banner */}
      <div className="relative h-[25vh] md:h-[40vh] overflow-hidden">
        <img 
          src={showroomBanner} 
          className="w-full h-full object-cover brightness-75 scale-105" 
          alt="Showroom Banner"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent flex items-center justify-center text-center p-8">
          <div className="space-y-6 md:space-y-10">
            <h2 className="text-6xl md:text-[8rem] font-black text-white uppercase tracking-tighter drop-shadow-sovereign antialiased font-display">{t('showroom.title')}</h2>
            <div className="h-2 w-48 bg-secondary mx-auto rounded-full shadow-glow"></div>
            <p className="text-2xl md:text-5xl text-secondary font-black italic tracking-[0.2em] md:tracking-[0.5em]">{t('home.hero.quality_label')}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="container mx-auto px-6 -mt-20 md:-mt-32 relative z-10">
        <div className="bg-white/95 backdrop-blur-3xl p-8 md:p-16 rounded-[4rem] md:rounded-[6rem] shadow-sovereign border border-white/20 space-y-12">
          <div className="relative w-full max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary/50 to-emerald-500/50 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative flex items-center">
              <SearchIcon className="absolute right-8 text-primary/30 w-8 h-8" />
              <input 
                type="text" 
                placeholder={t('showroom.searchPlaceholder')} 
                className="w-full p-8 pr-20 bg-slate-50 border-2 border-slate-100 focus:border-secondary rounded-[2.5rem] outline-none font-black transition-all shadow-inner text-2xl placeholder:text-gray-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1); 
                }}
              />
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-4 justify-center md:flex-wrap">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPageNumber(1);
                }}
                className={`px-10 py-5 rounded-3xl font-black text-lg whitespace-nowrap transition-all border-2 ${selectedCategory === cat ? 'bg-primary text-secondary border-primary shadow-2xl scale-110 z-10' : 'bg-white text-primary/40 border-slate-100 hover:border-secondary hover:text-secondary'}`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-6 mt-32 md:mt-48 text-right">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 md:gap-16">
          {pagedItems.map((item, index) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-[4rem] overflow-hidden shadow-2xl hover:shadow-sovereign transition-all duration-700 border-2 border-slate-100 flex flex-col relative transform hover:-translate-y-4"
            >
              <div className="absolute top-6 right-6 z-20 bg-primary/95 text-secondary w-16 h-16 flex items-center justify-center rounded-3xl font-black text-2xl border-4 border-secondary/20 shadow-2xl backdrop-blur-md">
                {index + 1}
              </div>

              <div className="relative h-80 overflow-hidden">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  alt={language === 'ar' ? item.name_ar : item.name_en}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 right-6 bg-secondary text-primary px-6 py-2 rounded-2xl font-black text-xs shadow-glow uppercase tracking-widest">
                  {getCategoryLabel(item.category)}
                </div>
              </div>

              <div className="p-10 flex-1 flex flex-col space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></div>
                    <span className="text-xs font-black text-primary/40 uppercase tracking-[0.3em] leading-none">
                      DS-{item.id}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-primary mb-3 leading-tight group-hover:text-secondary transition-colors">{language === 'ar' ? item.name_ar : item.name_en}</h3>
                  <p className="text-gray-400 font-bold text-lg mb-6 line-clamp-2 leading-relaxed h-14">{language === 'ar' ? item.description_ar : item.description_en}</p>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 group-hover:bg-primary/5 transition-colors">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-glow-sm"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('showroom.qualitySeal')}</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-8 border-t-2 border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('showroom.price')}</span>
                    <span className="text-3xl font-black text-secondary tracking-tighter">{formatCurrency(item.price)}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(item)}
                    className="bg-primary text-white p-6 rounded-[2rem] hover:bg-secondary hover:text-primary transition-all shadow-xl active:scale-95 border-b-8 border-black/20 flex items-center gap-4 group-hover:px-10"
                  >
                    <span className="hidden group-hover:block font-black text-sm uppercase tracking-widest">{t('showroom.orderNow')}</span>
                    <ShoppingCartIcon className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Trigger */}
        {filteredItems.length > pagedItems.length && (
          <div className="mt-32 md:mt-48 flex justify-center pb-20">
            <button 
              onClick={() => setPageNumber(prev => prev + 1)}
              className="group relative overflow-hidden bg-primary text-secondary px-24 md:px-44 py-8 md:py-12 rounded-[3rem] font-black text-2xl md:text-5xl shadow-sovereign hover:scale-105 transition-all active:scale-95 border-b-[12px] border-black/30"
            >
              <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 uppercase tracking-tighter">{t('showroom.showMore')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-12 left-12 bg-white text-primary p-8 rounded-full shadow-sovereign border-4 border-slate-100 hover:bg-secondary hover:text-white transition-all z-50 animate-bounce-slow"
      >
        <FilterIcon className="w-10 h-10 rotate-180" />
      </button>

      {/* Product Modal - High End Detail View */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 md:p-12 bg-primary/95 backdrop-blur-3xl animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-7xl rounded-[5rem] md:rounded-[8rem] overflow-hidden shadow-sovereign relative flex flex-col lg:flex-row min-h-[80vh] border-8 border-white/20">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-12 left-12 z-50 bg-white/10 backdrop-blur-2xl p-6 rounded-full text-white hover:bg-secondary hover:text-primary transition-all border-2 border-white/20"
            >
              <XIcon className="w-10 h-10" />
            </button>
            
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-auto relative overflow-hidden">
              <img 
                src={selectedProduct.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={language === 'ar' ? selectedProduct.name_ar : selectedProduct.name_en}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
            </div>
            
            <div className="w-full lg:w-1/2 p-12 md:p-24 space-y-12 text-right bg-mesh">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-secondary bg-primary px-8 py-3 rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-glow-sm">{getCategoryLabel(selectedProduct.category)}</span>
                  <div className="flex items-center gap-3">
                     <span className="text-gray-400 font-black text-xs uppercase tracking-widest">REF ID: DS-{selectedProduct.id}</span>
                  </div>
                </div>
                <h2 className="text-5xl md:text-8xl font-black text-primary leading-[1] tracking-tighter drop-shadow-sm">{language === 'ar' ? selectedProduct.name_ar : selectedProduct.name_en}</h2>
              </div>
              
              <p className="text-2xl md:text-3xl text-gray-500 font-bold leading-relaxed border-r-8 border-secondary pr-8">
                {language === 'ar' ? selectedProduct.description_ar : selectedProduct.description_en}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-inner group hover:bg-primary transition-colors">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block group-hover:text-secondary/60">{t('showroom.origin')}</span>
                  <p className="text-2xl font-black text-primary group-hover:text-white transition-colors">{language === 'ar' ? selectedProduct.origin_ar : selectedProduct.origin_en}</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 shadow-inner group hover:bg-primary transition-colors">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block group-hover:text-secondary/60">{t('showroom.nutrition')}</span>
                  <p className="text-xl font-bold text-primary group-hover:text-white transition-colors">{language === 'ar' ? selectedProduct.nutritional_value_ar : selectedProduct.nutritional_value_en}</p>
                </div>
              </div>

              <div className="bg-primary p-12 rounded-[4rem] border-4 border-secondary/30 flex flex-col md:flex-row items-center justify-between shadow-sovereign gap-10">
                <div className="flex flex-col text-center md:text-right">
                  <span className="text-sm font-black text-white/50 uppercase tracking-widest mb-2">{t('showroom.priceLabel')}</span>
                  <div className="flex flex-col">
                    <span className="text-6xl md:text-8xl font-black text-secondary tracking-tighter drop-shadow-sovereign-sm">
                      {formatCurrency(selectedProduct.price)}
                    </span>
                    <span className="text-white/40 font-black text-sm uppercase tracking-widest mt-2">{selectedProduct.unit_ar} / {selectedProduct.unit_en}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                   <button 
                    onClick={() => {
                      setSelectedProduct(null);
                      setPage('vip_login');
                    }}
                    className="w-full md:w-auto bg-secondary text-primary px-16 py-8 rounded-[3rem] font-black text-3xl md:text-4xl shadow-gold hover:scale-105 transition-all border-b-[12px] border-secondary-dark active:border-b-0 uppercase tracking-tighter"
                  >
                    {t('showroom.orderNow')}
                  </button>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="text-white/60 hover:text-white font-black text-xl border-b-2 border-white/10 hover:border-white transition-all uppercase tracking-widest"
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
