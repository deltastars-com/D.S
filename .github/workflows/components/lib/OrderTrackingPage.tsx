
import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useI18n } from './contexts/I18nContext';
import { useFirebase } from './contexts/FirebaseContext';
import { DeliveryIcon, LocationMarkerIcon, QualityIcon, SparklesIcon } from './contexts/Icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { Order } from '../../types';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 21.5424,
  lng: 39.2201
};

export const OrderTrackingPage: React.FC = () => {
  const { language, t } = useI18n();
  const { db } = useFirebase();
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [customerLocation, setCustomerLocation] = useState<{lat: number, lng: number}>(center);
  const [orderId, setOrderId] = useState('DS-ORD-1234');
  const [eta, setEta] = useState<number | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey
  });

  useEffect(() => {
    if (!db) return;

    // Listen to the order
    const unsubOrder = onSnapshot(doc(db, 'orders', orderId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Order;
        setOrder(data);
        
        // If order has a driver, listen to driver's location
        if (data.driverId) {
          const unsubDriver = onSnapshot(doc(db, 'drivers', data.driverId), (driverSnap) => {
            if (driverSnap.exists()) {
              const driverData = driverSnap.data();
              if (driverData.location) {
                setDriverLocation(driverData.location);
                
                // Calculate ETA
                const dist = calculateDistance(
                  driverData.location.lat, 
                  driverData.location.lng, 
                  customerLocation.lat, 
                  customerLocation.lng
                );
                // Assume 30km/h average speed in city
                const timeInMinutes = Math.round((dist / 30) * 60) + 5; // +5 mins for buffer
                setEta(timeInMinutes);
              }
            }
          });
          return () => unsubDriver();
        }
      }
    });

    return () => unsubOrder();
  }, [db, orderId, customerLocation]);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const steps = [
    { id: 'pending', label_ar: 'تم استلام الطلب', label_en: 'Order Received', icon: '📝' },
    { id: 'preparing', label_ar: 'جاري التجهيز', label_en: 'Preparation', icon: '🔪' },
    { id: 'setup', label_ar: 'جاري الإعداد والتحميل', label_en: 'Setup & Loading', icon: '📦' },
    { id: 'shipped', label_ar: 'في الطريق إليك (شاحنة مبردة)', label_en: 'Shipping (Refrigerated)', icon: '🚛' },
    { id: 'delivered', label_ar: 'تم التسليم بنجاح', label_en: 'Delivered Successfully', icon: '✅' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === (order?.status || 'pending'));

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in text-black">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-10 rounded-[4rem] shadow-sovereign border-t-[15px] border-primary mb-12">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <DeliveryIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">
                {language === 'ar' ? 'تتبع طلبك مباشرة' : 'Live Order Tracking'}
              </h2>
              <p className="text-sm font-bold text-gray-400">Order ID: {orderId}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="relative mb-16 px-4">
            <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-2 bg-secondary -translate-y-1/2 rounded-full transition-all duration-1000"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="relative flex justify-between">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex flex-col items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-xl transition-all duration-500 z-10 ${
                    idx <= currentStepIndex ? 'bg-secondary text-white scale-110' : 'bg-white text-gray-300 border-2 border-gray-100'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    idx <= currentStepIndex ? 'text-secondary' : 'text-gray-300'
                  }`}>
                    {language === 'ar' ? step.label_ar : step.label_en}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[3rem] overflow-hidden border-4 border-gray-100 shadow-inner">
            {!apiKey ? (
              <div className="w-full h-[500px] bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <LocationMarkerIcon className="w-10 h-10 text-primary opacity-30" />
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-2">
                  {language === 'ar' ? 'خريطة التتبع المباشر' : 'Live Tracking Map'}
                </h4>
                <p className="text-sm font-bold text-gray-400 max-w-xs">
                  {language === 'ar' 
                    ? 'سيتم تفعيل الخريطة التفاعلية فور إضافة مفاتيح الخرائط من قبل الإدارة.' 
                    : 'The interactive map will be activated once the map keys are added by the administration.'}
                </p>
              </div>
            ) : isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={driverLocation || customerLocation}
                zoom={14}
              >
                <Marker 
                  position={customerLocation} 
                  label={language === 'ar' ? "أنت" : "You"} 
                />
                {driverLocation && (
                  <Marker 
                    position={driverLocation} 
                    label={order?.status === 'shipped' 
                      ? (language === 'ar' ? "شاحنة مبردة" : "Refrigerated Truck")
                      : (language === 'ar' ? "المندوب" : "Driver")
                    }
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center animate-pulse">
                <p className="font-black text-gray-400 uppercase tracking-widest">Loading Map...</p>
              </div>
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Estimated Arrival</p>
              <p className="text-4xl font-black text-slate-800">
                {eta ? `${eta - 2} - ${eta + 3}` : '12 - 18'} <span className="text-lg">MIN</span>
              </p>
            </div>
            <div className="bg-primary text-white p-8 rounded-[2.5rem]">
              <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-4">Driver Status</p>
              <p className="text-2xl font-black">
                {driverLocation ? (language === 'ar' ? 'المندوب في الطريق إليك' : 'Driver is on the way') : (language === 'ar' ? 'جاري تحديد موقع المندوب...' : 'Locating driver...')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
