import React, { useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { SYSTEM_CONFIG } from './constants';

/**
 * Delta Stars "Sweet Map" Engine
 * نظام خرائط تفاعلي متقدم مصمم خصيصاً لمتابعة الشحنات وفروع الشركة
 */

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const INITIAL_CENTER = {
  lat: 21.5433, // Jeddah coordinates
  lng: 39.1728,
};

// Premium Dark Green Map Style (Delta Stars Signature)
const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: SYSTEM_CONFIG.PRIMARY_DARK }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: SYSTEM_CONFIG.PRIMARY_DARK }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c4a631' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ca8a04' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ca8a04' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1a331a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a401a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0e2b0e' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#ca8a04', lightness: -70 }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#071407' }],
  },
];

interface SweetMapProps {
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    description?: string;
    icon?: string;
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (markerId: string) => void;
}

export const SweetMap: React.FC<SweetMapProps> = ({ 
  markers = [], 
  center = INITIAL_CENTER, 
  zoom = 10,
  onMarkerClick 
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [activeMarker, setActiveMarker] = React.useState<string | null>(null);

  const options = useMemo(() => ({
    styles: mapStyles,
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    clickableIcons: true,
    rotateControl: true,
    scaleControl: true,
    gestureHandling: 'greedy',
    backgroundColor: SYSTEM_CONFIG.PRIMARY_DARK,
  }), []);

  const onLoad = useCallback((_map: google.maps.Map) => {
    // Custom logic on map load if needed
  }, []);

  const onUnmount = useCallback((_map: google.maps.Map) => {
    // Cleanup
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-primary-dark animate-pulse rounded-2xl flex items-center justify-center text-green-800 font-sans italic">
        جاري تحميل محرك الخرائط الذكي...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={options}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.title}
          onClick={() => {
            setActiveMarker(marker.id);
            if (onMarkerClick) onMarkerClick(marker.id);
          }}
          icon={marker.icon || {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: SYSTEM_CONFIG.SECONDARY_COLOR,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 1.5,
          }}
        />
      ))}

      {activeMarker && markers.find(m => m.id === activeMarker) && (
        <InfoWindow
          position={markers.find(m => m.id === activeMarker)!.position}
          onCloseClick={() => setActiveMarker(null)}
        >
          <div className="p-2 text-primary font-sans">
            <h3 className="font-bold border-b border-gray-100 pb-1 mb-1">
              {markers.find(m => m.id === activeMarker)!.title}
            </h3>
            <p className="text-xs text-gray-600">
              {markers.find(m => m.id === activeMarker)!.description || 'موقع نشط'}
            </p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};
