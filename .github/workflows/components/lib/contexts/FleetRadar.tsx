import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useI18n } from './I18nContext';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 21.5424,
  lng: 39.2201
};

const mockVehicles = [
  { id: 'V01', lat: 21.5450, lng: 39.2250, status: 'moving', speed: 45 },
  { id: 'V02', lat: 21.5400, lng: 39.2150, status: 'stopped', speed: 0 },
  { id: 'V03', lat: 21.5500, lng: 39.2300, status: 'moving', speed: 30 },
];

export default function FleetRadar() {
  const { language } = useI18n();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[500px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-primary">
          {language === 'ar' ? 'رادار الأسطول اللحظي' : 'Live Fleet Radar'}
        </h3>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            12 {language === 'ar' ? 'نشط' : 'Active'}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
            6 {language === 'ar' ? 'متوقف' : 'Stopped'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-100 rounded-2xl relative overflow-hidden border-4 border-white shadow-inner min-h-[400px]">
        {apiKey && isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
          >
            {mockVehicles.map(v => (
              <Marker 
                key={v.id}
                position={{ lat: v.lat, lng: v.lng }}
                label={v.id}
                icon={{
                  url: v.status === 'moving' ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <>
            {/* Mock Map Background */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i12!2i2457!3i1642!2m3!1e0!2sm!3i605151523!3m8!2sar!3sSA!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!5f2')] bg-cover"></div>
            
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
              <div className="bg-white/90 p-6 rounded-2xl shadow-2xl text-center max-w-xs border border-white">
                <p className="text-primary font-black text-sm mb-2">
                  {language === 'ar' ? 'بانتظار تفعيل مفتاح الخرائط' : 'Awaiting Map API Key'}
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  {language === 'ar' ? 'سيتم تفعيل التتبع المباشر فور إضافة المفتاح' : 'Live tracking will activate once key is added'}
                </p>
              </div>
            </div>

            {/* Mock Vehicle Markers */}
            <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white animate-bounce">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v3h3V7zM14 11h-3v3h3v-3zM15 7h1.172a2 2 0 011.414.586l.828.828A2 2 0 0119 9.828V14a1 1 0 01-1 1h-1.05a2.5 2.5 0 01-4.9 0H11v-1h4V7z"></path></svg>
            </div>
            <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-secondary rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white animate-pulse">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-3v3h3V7zM14 11h-3v3h3v-3zM15 7h1.172a2 2 0 011.414.586l.828.828A2 2 0 0119 9.828V14a1 1 0 01-1 1h-1.05a2.5 2.5 0 01-4.9 0H11v-1h4V7z"></path></svg>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-bold mb-1">المركبة #0202</p>
          <p className="text-sm font-black text-primary">جدة - حي المنار</p>
          <p className="text-[10px] text-green-500 mt-1">تتحرك بسرعة 45 كم/س</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-bold mb-1">المركبة #0304</p>
          <p className="text-sm font-black text-primary">مكة - الشوقية</p>
          <p className="text-[10px] text-secondary mt-1">متوقفة للتفريغ</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-bold mb-1">المركبة #0108</p>
          <p className="text-sm font-black text-primary">الرياض - السلي</p>
          <p className="text-[10px] text-blue-500 mt-1">في طريق العودة</p>
        </div>
      </div>
    </div>
  );
}
