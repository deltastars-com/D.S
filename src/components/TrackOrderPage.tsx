import React, { useState } from 'react';
import { useI18n } from './lib/contexts/I18nContext';
import OrderTracking from './OrderTracking';
import { SearchIcon, PackageIcon } from './lib/contexts/Icons';

export const TrackOrderPage: React.FC = () => {
    const { language, t } = useI18n();
    const [orderId, setOrderId] = useState('');
    const [searchedId, setSearchedId] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderId.trim()) {
            setSearchedId(orderId.trim());
        }
    };

    // Mock data for tracking simulation
    const trackingData = {
        pickup: { lat: 21.5433, lng: 39.1728, address: 'فرع جدة الرئيسي - حي المنار' },
        delivery: { lat: 21.5833, lng: 39.2128, address: 'منزل العميل - جدة' },
        route: [
          { lat: 21.5433, lng: 39.1728, address: '', timestamp: new Date() },
          { lat: 21.5533, lng: 39.1828, address: '', timestamp: new Date() },
          { lat: 21.5633, lng: 39.1928, address: '', timestamp: new Date() },
          { lat: 21.5733, lng: 39.2028, address: '', timestamp: new Date() },
          { lat: 21.5833, lng: 39.2128, address: '', timestamp: new Date() },
        ]
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-24">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-7xl font-black text-primary tracking-tighter uppercase">
                        {t('trackOrder.title')}
                    </h1>
                    <p className="text-xl md:text-3xl font-bold text-gray-400 italic">
                        {t('trackOrder.subtitle')}
                    </p>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sovereign border-t-[15px] border-primary">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6">
                        <div className="flex-grow relative">
                            <input 
                                type="text" 
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder={t('trackOrder.placeholder')}
                                className="w-full p-6 md:p-8 bg-gray-50 border-4 border-gray-100 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl focus:border-primary outline-none transition-all shadow-inner"
                            />
                            <PackageIcon className={`absolute ${language === 'ar' ? 'left-6 md:left-10' : 'right-6 md:right-10'} top-1/2 -translate-y-1/2 w-8 h-8 text-gray-300`} />
                        </div>
                        <button 
                            type="submit"
                            className="bg-primary text-white px-12 py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl shadow-4xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
                        >
                            <SearchIcon className="w-8 h-8" />
                            {t('trackOrder.search')}
                        </button>
                    </form>
                </div>

                {searchedId && (
                    <div className="animate-fade-in-up">
                        <OrderTracking 
                            driverId={`driver-${searchedId}`} // In a real app we'd fetch driverId by orderId
                            customerLocation={trackingData.delivery as any}
                            initialDriverLocation={trackingData.pickup as any}
                        />
                    </div>
                )}

                {!searchedId && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale">
                        <div className="bg-white p-8 rounded-3xl text-center space-y-4">
                            <div className="text-4xl">📦</div>
                            <p className="font-black">{t('trackOrder.steps.prep')}</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl text-center space-y-4">
                            <div className="text-4xl">🚚</div>
                            <p className="font-black">{t('trackOrder.steps.shipping')}</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl text-center space-y-4">
                            <div className="text-4xl">🏠</div>
                            <p className="font-black">{t('trackOrder.steps.delivered')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
