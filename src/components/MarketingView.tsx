
import React, { useState } from 'react';
import { Product, CategoryKey } from '../types';
import { useI18n, useToast, useFirebase } from './lib/contexts';
import { PlusIcon, PencilIcon, SparklesIcon, TrashIcon } from './lib/contexts/Icons';

interface MarketingViewProps {
    products: Product[];
    onUpdateProduct: (id: number, data: Partial<Product>) => Promise<void>;
    onAddProduct: (p: Omit<Product, 'id'>) => Promise<void>;
    onBack: () => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({ products, onUpdateProduct, onAddProduct, onBack }) => {
    const { language, formatCurrency } = useI18n();
    const { addToast } = useToast();
    const { addPriceUpdateRequest, user, categories } = useFirebase();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newPrice, setNewPrice] = useState<string>('');
    const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
        name_ar: '', name_en: '', category: 'vegetables' as CategoryKey, price: 0, image: '', unit_ar: 'ريال للكيلو', unit_en: 'kg', stock_quantity: 1000, min_threshold: 50, description_ar: '', description_en: ''
    });

    const filtered = products.filter(p => (language === 'ar' ? p.name_ar : p.name_en).toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onAddProduct(newProduct);
            addToast(language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully', 'success');
            setIsAdding(false);
            setNewProduct({
                name_ar: '', name_en: '', category: 'vegetables' as CategoryKey, price: 0, image: '', unit_ar: 'ريال للكيلو', unit_en: 'kg', stock_quantity: 1000, min_threshold: 50, description_ar: '', description_en: ''
            });
        } catch (err) {
            addToast('Error adding product', 'error');
        }
    };

    const handlePriceUpdate = async () => {
        if (!editingProduct) return;
        
        const price = parseFloat(newPrice);
        if (isNaN(price) || price < 0) {
            addToast(language === 'ar' ? 'خطأ: يرجى إدخال رقم صحيح' : 'Error: Please enter a valid number', 'error');
            return;
        }

        try {
            // Create a request in Firestore for Admin approval
            await addPriceUpdateRequest({
                productId: editingProduct.id,
                productName_ar: editingProduct.name_ar,
                productName_en: editingProduct.name_en,
                oldPrice: editingProduct.price,
                newPrice: price,
                requestedBy: user?.email || 'Marketing',
                requestedAt: new Date().toISOString(),
                status: 'pending'
            });
            
            addToast(language === 'ar' ? 'تم إرسال طلب تحديث السعر للإدارة بنجاح' : 'Price update request sent to admin successfully', 'success');
            setEditingProduct(null);
            setNewPrice('');
        } catch (e) {
            addToast('Error sending price update request', 'error');
        }
    };

    return (
        <div className="space-y-12 animate-fade-in-up pb-24 text-black">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[4rem] shadow-xl border border-gray-100 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-primary mb-2">إدارة الماركتنج والأسعار</h2>
                    <p className="text-gray-400 font-bold">التحكم في العروض الموسمية والأسعار المؤسسية</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="flex-1 bg-primary text-white px-10 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all"
                    >
                        <PlusIcon className="w-6 h-6" /> إضافة صنف جديد
                    </button>
                    <button onClick={onBack} className="bg-gray-100 text-gray-500 px-10 py-5 rounded-[2rem] font-black hover:bg-red-500 hover:text-white transition-all">الرجوع</button>
                </div>
            </div>

            <div className="bg-white p-12 rounded-[5rem] shadow-sovereign border border-gray-100">
                <div className="flex gap-6 mb-16">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="ابحث عن منتج لتعديل سعره..." 
                            className="w-full p-8 bg-gray-50 border-none rounded-[2.5rem] font-black text-2xl outline-none focus:ring-8 focus:ring-primary/5 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl opacity-10">🔍</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filtered.slice(0, 18).map(p => (
                        <div key={p.id} className="bg-gray-50 p-10 rounded-[3.5rem] border-2 border-transparent hover:border-primary/20 hover:bg-white hover:shadow-3xl transition-all group flex flex-col">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl group-hover:scale-110 transition-transform">
                                    <img src={p.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-slate-800 mb-1 leading-tight">{language === 'ar' ? p.name_ar : p.name_en}</h3>
                                    <span className="bg-primary/5 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                                </div>
                            </div>
                            
                            <div className="mt-auto space-y-6">
                                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-inner">
                                    <span className="text-gray-400 font-bold text-sm">السعر المعتمد:</span>
                                    <span className="text-3xl font-black text-primary">{formatCurrency(p.price)}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            setEditingProduct(p);
                                            setNewPrice(p.price.toString());
                                        }} 
                                        className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-primary transition-all shadow-xl active:scale-95"
                                    >
                                        تعديل السعر
                                    </button>
                                    <button className="p-5 bg-white rounded-[1.5rem] text-gray-200 hover:text-red-500 border border-gray-100 hover:shadow-xl transition-all">
                                        <TrashIcon className="w-8 h-8"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Product Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-4xl animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h3 className="text-3xl font-black text-primary mb-8 text-center">
                            {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
                        </h3>
                        
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">الاسم (عربي)</label>
                                    <input 
                                        type="text" required
                                        value={newProduct.name_ar}
                                        onChange={e => setNewProduct({...newProduct, name_ar: e.target.value})}
                                        className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Name (EN)</label>
                                    <input 
                                        type="text" required
                                        value={newProduct.name_en}
                                        onChange={e => setNewProduct({...newProduct, name_en: e.target.value})}
                                        className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">التصنيف</label>
                                    <select 
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({...newProduct, category: e.target.value as CategoryKey})}
                                        className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold outline-none"
                                    >
                                        {categories.map(c => (
                                            <option key={c.key} value={c.key}>{language === 'ar' ? c.label_ar : c.label_en}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">السعر</label>
                                    <input 
                                        type="number" required step="0.01"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                                        className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold outline-none"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">رابط الصورة</label>
                                    <input 
                                        type="text" required
                                        value={newProduct.image}
                                        onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                                        className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-secondary transition-all"
                                >
                                    إضافة المنتج
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-10 bg-gray-100 text-gray-500 py-6 rounded-[2rem] font-black text-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Price Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 shadow-4xl animate-scale-in">
                        <h3 className="text-3xl font-black text-primary mb-8 text-center">
                            {language === 'ar' ? `تعديل سعر ${editingProduct.name_ar}` : `Edit Price for ${editingProduct.name_en}`}
                        </h3>
                        
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">السعر الجديد (ر.س)</label>
                                <input 
                                    type="number" 
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    className="w-full p-8 bg-gray-50 border-4 border-transparent focus:border-primary rounded-[2.5rem] font-black text-3xl outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={handlePriceUpdate}
                                    className="flex-1 bg-primary text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-secondary transition-all"
                                >
                                    إرسال الطلب
                                </button>
                                <button 
                                    onClick={() => setEditingProduct(null)}
                                    className="px-10 bg-gray-100 text-gray-500 py-6 rounded-[2rem] font-black text-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                            
                            <p className="text-center text-xs font-bold text-gray-400">
                                * سيتم إرسال تنبيه للإدارة للموافقة على السعر الجديد قبل النشر
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
