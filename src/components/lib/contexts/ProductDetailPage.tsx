
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Page, Review } from '@/types';
import { useI18n } from './I18nContext';
import { useToast } from '../../../contexts/ToastContext';
import { StarIcon, ShoppingCartIcon, GlobeAltIcon, QualityIcon, DocumentTextIcon, XIcon, PlusIcon, HeartIcon, SparklesIcon } from './Icons';

const ProductReviews = React.lazy(() => import('../../ProductReviews'));

interface ProductDetailPageProps {
    product: Product;
    setPage: (page: Page, productId?: number) => void;
    reviews: Review[];
    onAddReview: (review: any) => void;
    addToCart: (product: Product, quantity: number) => void;
    averageRating: { average: number; count: number };
    toggleWishlist: (product: Product) => void;
    isInWishlist: boolean;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ 
    product, 
    setPage, 
    reviews,
    onAddReview,
    addToCart,
    averageRating,
    toggleWishlist,
    isInWishlist
}) => {
  const { t, language, formatCurrency } = useI18n();
  const { addToast } = useToast();
  const isWeightBased = 
    product.unit_en?.toLowerCase().includes('kg') || 
    product.unit_en?.toLowerCase().includes('500g') ||
    product.unit_ar?.includes('كيلو') ||
    product.unit_ar?.includes('جرام');
    
  const [quantity, setQuantity] = useState(isWeightBased ? 0.5 : 1);
  const step = isWeightBased ? 0.5 : 1;
  const [activeImage, setActiveImage] = useState(product.image_url || product.image);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const gallery = product.gallery || [product.image_url || product.image];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y });
  };

  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    onAddReview({
      ...newReview,
      productId: product.id,
      author: t('productDetail.anonymous'),
      date: new Date().toISOString()
    });
    setNewReview({ rating: 5, comment: '' });
    addToast(t('productDetail.thankYou'), 'success');
  };

  return (
    <div className="container mx-auto px-6 py-20 text-black selection:bg-secondary selection:text-white">
      
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-10 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button className="absolute top-10 right-10 text-white hover:text-secondary transition-colors">
              <XIcon className="w-12 h-12" />
          </button>
          <img 
            src={activeImage} 
            alt={product.name_ar} 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-3xl"
          />
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <button 
          onClick={() => setPage('products')} className="bg-white border-2 border-primary/10 text-primary font-black px-8 py-3 rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center gap-3 text-xl shadow-lg"
        >
            &rarr; {t('productDetail.back')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Product Image Viewer */}
        <div className="lg:col-span-6">
            <div className="bg-white p-6 rounded-[5rem] shadow-sovereign border border-gray-100 sticky top-40 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none"></div>
                <div 
                    ref={imgRef}
                    className="aspect-square rounded-[4rem] overflow-hidden bg-gray-50 border-4 border-white shadow-inner relative cursor-zoom-in"
                    onMouseEnter={() => setShowMagnifier(true)}
                    onMouseLeave={() => setShowMagnifier(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => setIsZoomed(true)}
                >
                    <img 
                        src={activeImage} 
                        alt={product.name_ar} 
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                    />
                    
                    {showMagnifier && (
                        <div 
                            className="absolute inset-0 pointer-events-none overflow-hidden rounded-[4rem]"
                            style={{
                                backgroundImage: `url(${activeImage})`,
                                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                                backgroundSize: '250%',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    )}

                    <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-md p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlusIcon className="w-6 h-6 text-primary" />
                    </div>
                </div>

                {gallery.length > 1 && (
                    <div className="flex gap-4 mt-8 justify-center">
                        {gallery.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${activeImage === img ? 'border-secondary scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-md p-4 rounded-full border-2 border-secondary shadow-2xl animate-[spin_20s_linear_infinite]">
                    <QualityIcon className="w-10 h-10 text-secondary" />
                </div>
            </div>
        </div>
        
        {/* Product Details Content */}
        <div className="lg:col-span-6 flex flex-col">
            <div className="bg-primary text-white px-8 py-3 rounded-full w-fit font-black text-[10px] uppercase tracking-[0.4em] mb-8 shadow-xl">
                {t(`categories.${product.category}`)}
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-primary mb-6 leading-tight tracking-tighter uppercase">
                {language === 'ar' ? product.name_ar : product.name_en}
            </h1>

            <div className="flex items-center gap-6 mb-10">
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= Math.round(averageRating.average)} className={`w-5 h-5 ${i <= Math.round(averageRating.average) ? 'text-yellow-500' : 'text-gray-200'}`} />)}
                </div>
                <span className="text-gray-400 font-bold text-xl uppercase tracking-widest">{t('productDetail.gradeQuality')}</span>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-gray-100 mb-10 space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full"></div>
                
                <div className="relative z-10">
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-secondary" /> {t('productDetail.narrativeLabel')}
                    </p>
                    <p className="text-2xl font-bold leading-relaxed text-slate-800">
                        {language === 'ar' ? product.description_ar : product.description_en}
                    </p>
                </div>

                {product.features_ar && (
                    <div className="relative z-10">
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-secondary" /> {t('productDetail.technicalAttributes')}
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(language === 'ar' ? product.features_ar : product.features_en)?.split('،').map((f, i) => (
                                <li key={i} className="flex items-start gap-4 text-lg font-black text-primary group">
                                    <div className="w-6 h-6 bg-white shadow-md rounded-lg flex items-center justify-center text-secondary shrink-0 border border-gray-100 group-hover:bg-secondary group-hover:text-white transition-all">✓</div>
                                    <span className="leading-tight pt-0.5">{f.trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {product.benefits_ar && (
                    <div className="relative z-10">
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                            <QualityIcon className="w-4 h-4 text-secondary" /> {t('productDetail.healthBenefits')}
                        </p>
                        <ul className="grid grid-cols-1 gap-4">
                            {(language === 'ar' ? product.benefits_ar : product.benefits_en)?.split('،').map((b, i) => (
                                <li key={i} className="flex items-start gap-4 text-lg font-bold text-slate-700 group">
                                    <div className="w-2 h-2 bg-secondary rounded-full mt-2.5 shrink-0"></div>
                                    <span className="leading-tight">{b.trim()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="pt-10 border-t border-gray-200 flex items-center gap-8 relative z-10">
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                        <GlobeAltIcon className="w-10 h-10 text-secondary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('productDetail.originLabel')}</p>
                        <p className="text-3xl font-black text-primary flex items-center gap-3">
                            {language === 'ar' ? product.origin_ar : product.origin_en}
                            <span className="bg-green-500 w-2.5 h-2.5 rounded-full animate-ping"></span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
                <div className="text-center md:text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('productDetail.supplyPriceLabel')}</p>
                    <p className="text-7xl font-black text-primary leading-none">
                        {product.price > 0 ? formatCurrency(product.price) : '---'}
                    </p>
                    <p className="text-lg font-bold text-secondary mt-2 italic">{t('productDetail.unitPer', { unit: language === 'ar' ? product.unit_ar : product.unit_en })}</p>
                </div>
                
                <div className="flex-grow w-full">
                    <div className="bg-white border-4 border-gray-100 p-5 rounded-[3rem] flex items-center justify-between shadow-inner">
                        <button onClick={() => setQuantity(Math.max(step, quantity - step))} className="w-16 h-16 bg-gray-50 rounded-2xl font-black text-4xl hover:bg-primary hover:text-white transition-all shadow-sm">-</button>
                        <span className="text-5xl font-black text-primary">{quantity}</span>
                        <button onClick={() => setQuantity(quantity + step)} className="w-16 h-16 bg-gray-50 rounded-2xl font-black text-4xl hover:bg-primary hover:text-white transition-all shadow-sm">+</button>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mb-12">
                <button 
                    onClick={() => { addToCart(product, quantity); addToast(t('productDetail.addedToCart'), 'success'); }}
                    className="flex-grow py-10 bg-primary text-white rounded-[3.5rem] font-black text-4xl shadow-4xl transition-all border-b-[15px] border-primary-dark active:border-b-0 flex items-center justify-center gap-6"
                >
                    <ShoppingCartIcon className="w-12 h-12" />
                    {t('product.addToCart')}
                </button>
                <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-10 rounded-[3.5rem] transition-all duration-500 shadow-4xl border-b-[15px] active:border-b-0 flex items-center justify-center ${
                        isInWishlist ? 'bg-red-500 text-white border-red-700' : 'bg-white text-red-500 border-gray-200 hover:bg-red-50'
                    }`}
                >
                    <HeartIcon filled={isInWishlist} className="w-12 h-12" />
                </button>
            </div>

            <div className="mt-12 p-10 bg-blue-50 rounded-[3rem] border-2 border-blue-100 flex items-start gap-8">
                <QualityIcon className="w-14 h-14 text-blue-500 shrink-0" />
                <p className="text-base font-bold text-blue-800 leading-relaxed pt-1">
                    {t('productDetail.qualityNotice')}
                </p>
            </div>
        </div>
      </div>

      {/* Reviews Section */}
      <React.Suspense fallback={<div className="mt-24 h-64 bg-gray-50 rounded-[4rem] animate-pulse"></div>}>
        <ProductReviews 
          productId={product.id}
          reviews={reviews}
          averageRating={averageRating}
          onAddReview={onAddReview}
        />
      </React.Suspense>
    </div>
  );
};
