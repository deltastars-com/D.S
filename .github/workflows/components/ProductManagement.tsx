import React, { useState } from 'react';
import { Product } from '../types';
import { mockProducts } from './lib/vip/products';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name_ar: '',
    name_en: '',
    price: 0,
    unit_ar: 'كجم',
    unit_en: 'kg',
    stock_quantity: 100,
    category: 'vegetables'
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      ...newProduct as Product,
      id: Date.now(),
      image: 'https://picsum.photos/seed/product/400/400'
    };
    setProducts([product, ...products]);
    setIsAdding(false);
    setNewProduct({
      name_ar: '',
      name_en: '',
      price: 0,
      unit_ar: 'كجم',
      unit_en: 'kg',
      stock_quantity: 100,
      category: 'vegetables'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-[#1a3a1a]">إدارة المنتجات والمخزون</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#FF922B] text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all shadow-lg"
        >
          + إضافة منتج جديد
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-2 border-[#FF922B]/20 animate-fade-in">
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">اسم المنتج (عربي)</label>
              <input 
                type="text" 
                required
                value={newProduct.name_ar}
                onChange={e => setNewProduct({...newProduct, name_ar: e.target.value})}
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF922B]/20 rounded-2xl font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">اسم المنتج (English)</label>
              <input 
                type="text" 
                required
                value={newProduct.name_en}
                onChange={e => setNewProduct({...newProduct, name_en: e.target.value})}
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF922B]/20 rounded-2xl font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">السعر (ريال)</label>
              <input 
                type="number" 
                required
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF922B]/20 rounded-2xl font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الكمية المتوفرة</label>
              <input 
                type="number" 
                required
                value={newProduct.stock_quantity}
                onChange={e => setNewProduct({...newProduct, stock_quantity: Number(e.target.value)})}
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-[#FF922B]/20 rounded-2xl font-bold outline-none"
              />
            </div>
            <div className="flex gap-4 md:col-span-2">
              <button type="submit" className="flex-1 bg-[#1a3a1a] text-white py-4 rounded-2xl font-black text-lg shadow-xl">حفظ المنتج</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-lg">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">المنتج</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">التصنيف</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">السعر</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">المخزون</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name_ar} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <p className="font-black text-[#1a3a1a]">{product.name_ar}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{product.name_en}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-black text-[#FF922B]">{product.price} ريال</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="font-bold text-sm">{product.stock_quantity} {product.unit_ar}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">تعديل</button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
