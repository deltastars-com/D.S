import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';

// Fix for default marker icons in React Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
}

interface OrderTrackingProps {
  driverId?: string;
  initialDriverLocation?: Location;
  customerLocation?: Location;
}

// Helper component to recenter map when driver moves
const MapRecenter = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true });
    }
  }, [position, map]);
  return null;
};

const OrderTracking: React.FC<OrderTrackingProps> = ({ driverId, initialDriverLocation, customerLocation }) => {
  const [currentDriverLocation, setCurrentDriverLocation] = useState<Location | undefined>(initialDriverLocation);
  const defaultPosition: [number, number] = [21.4858, 39.1925]; // Jeddah Center

  useEffect(() => {
    if (!driverId) return;

    // 1. Initial fetch of driver location
    const fetchDriver = async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('lat, lng')
        .eq('id', driverId)
        .single();
      
      if (data && !error) {
        setCurrentDriverLocation({ lat: data.lat, lng: data.lng });
      }
    };

    fetchDriver();

    // 2. Real-time subscription for driver updates
    const channel = supabase
      .channel(`driver-location-${driverId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drivers',
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          console.log('Sovereign Driver Update Received:', payload.new);
          if (payload.new.lat && payload.new.lng) {
            setCurrentDriverLocation({ 
              lat: parseFloat(payload.new.lat), 
              lng: parseFloat(payload.new.lng) 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);

  return (
    <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-sovereign border-4 border-white/50 relative group">
      {/* Sovereign Overlay */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-start pointer-events-none">
        <div className="bg-emerald-600/95 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-xl animate-fade-in border border-white/20">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <p className="font-black text-lg">تتبع التوريد السيادي المباشر</p>
          </div>
          <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-[0.2em] mt-1 ml-6">
            Elite Transport Node: Tracking {driverId ? `Driver #${driverId.slice(0,4)}` : 'Active'}
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-2 pointer-events-auto">
             <button title="Recenter Map" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
             </button>
        </div>
      </div>

      <MapContainer 
        center={customerLocation ? [customerLocation.lat, customerLocation.lng] : (currentDriverLocation ? [currentDriverLocation.lat, currentDriverLocation.lng] : defaultPosition)} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {currentDriverLocation && (
          <>
            <MapRecenter position={[currentDriverLocation.lat, currentDriverLocation.lng]} />
            <Marker position={[currentDriverLocation.lat, currentDriverLocation.lng]}>
              <Popup className="font-tajawal">
                <div className="text-center p-2">
                  <p className="font-black text-emerald-800">مندوب نجوم دلتا 🚚</p>
                  <p className="text-xs font-bold text-slate-500 mt-1">يصل إليك خلال دقائق</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {customerLocation && (
          <Marker position={[customerLocation.lat, customerLocation.lng]}>
            <Popup className="font-tajawal">
              <div className="text-center p-2">
                 <p className="font-black text-secondary">موقع التسليم المعتمد 📍</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Driver Status Card */}
      {currentDriverLocation && (
        <div className="absolute bottom-10 left-10 right-10 z-[1000] bg-white/95 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-sovereign-sm border-2 border-emerald-50 flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border-2 border-secondary/30">
                    <img src="https://cdn-icons-png.flaticon.com/512/3063/3063822.png" className="w-10 h-10 invert" alt="Driver" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-slate-900">جاري التوصيل الآن</h4>
                    <p className="text-emerald-600 font-bold text-sm">سوبر مان دلتا في الطريق إليك عبر المسار الأسرع</p>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-emerald">اتصال بالمندوب</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;

