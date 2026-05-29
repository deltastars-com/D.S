
import { Geolocation } from '@capacitor/geolocation';
import { db, doc, updateDoc, setDoc, getDoc, serverTimestamp } from '@/firebase';

let watchId: string | null = null;

export const startDriverTracking = async (driverId: string, driverName: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear any existing watch
    if (watchId) {
      await Geolocation.clearWatch({ id: watchId });
    }

    // Ensure driver document exists
    const driverRef = doc(db, 'drivers', driverId);
    const driverSnap = await getDoc(driverRef);
    if (!driverSnap.exists()) {
      await setDoc(driverRef, {
        id: driverId,
        name: driverName,
        status: 'online',
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(driverRef, {
        status: 'online',
        updatedAt: serverTimestamp()
      });
    }

    watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 5000,
      },
      async (position) => {
        if (!position?.coords) return;

        try {
          await updateDoc(driverRef, {
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error updating driver location in Firestore:", error);
        }
      }
    );
  } catch (err) {
    console.error("Failed to start tracking:", err);
  }
};

export const stopDriverTracking = async (driverId?: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    if (watchId) {
      await Geolocation.clearWatch({ id: watchId });
      watchId = null;
    }

    if (driverId) {
      const driverRef = doc(db, 'drivers', driverId);
      await updateDoc(driverRef, {
        status: 'offline',
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.error("Failed to stop tracking:", err);
  }
};
