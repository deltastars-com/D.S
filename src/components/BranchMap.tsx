import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { Loader2, MapPin, Search } from 'lucide-react';

interface BranchMapProps {
  address: string;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  isEditable?: boolean;
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1.5rem'
};

const defaultCenter = {
  lat: 24.7136, // Riyadh center
  lng: 46.6753
};

const BranchMap: React.FC<BranchMapProps> = ({ address, onLocationSelect, initialLocation, isEditable = false }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_MAPS_KEY || '',
    libraries: ['places']
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialLocation || defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<{lat: number; lng: number} | null>(initialLocation || null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const geocodeAddress = useCallback((addr: string) => {
    if (!window.google) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: addr }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        const newPos = { lat: loc.lat(), lng: loc.lng() };
        setCenter(newPos);
        setMarkerPosition(newPos);
        if (onLocationSelect) onLocationSelect(newPos);
      }
    });
  }, [onLocationSelect]);

  useEffect(() => {
    if (isLoaded && address && !initialLocation) {
      const timer = setTimeout(() => {
        geocodeAddress(address);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, address, initialLocation, geocodeAddress]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isEditable && e.latLng) {
      const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarkerPosition(newPos);
      if (onLocationSelect) onLocationSelect(newPos);
    }
  }, [isEditable, onLocationSelect]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setCenter(newPos);
        setMarkerPosition(newPos);
        if (onLocationSelect) onLocationSelect(newPos);
      }
    }
  };

  if (!isLoaded) return (
    <div className="w-full h-[400px] bg-slate-100 rounded-[1.5rem] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="relative w-full space-y-4">
      {isEditable && (
        <div className="relative">
          <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={onPlaceChanged}
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن الموقع بدقة..."
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 focus:border-primary rounded-2xl font-bold outline-none transition-all shadow-sm"
              />
            </div>
          </Autocomplete>
        </div>
      )}
      
      <div className="overflow-hidden rounded-[1.5rem] border-4 border-white shadow-xl">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {markerPosition && (
            <Marker 
              position={markerPosition} 
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>

      {!isEditable && address && (
        <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-xs font-black text-primary truncate">{address}</span>
        </div>
      )}

      {isEditable && (
        <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">
          يمكنك النقر على الخريطة لتعديل الموقع يدوياً
        </p>
      )}
    </div>
  );
};

export default BranchMap;
