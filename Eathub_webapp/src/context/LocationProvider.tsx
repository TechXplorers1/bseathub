'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationContextType {
  location: string;
  setLocation: (location: string) => void;
  coordinates: Coordinates | null;
  setCoordinates: (coords: Coordinates | null) => void;
  locationError: string | null;
  isLocating: boolean;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userLocation') || 'Detecting location...';
    }
    return 'Detecting location...';
  });
  const [coordinates, setCoordinates] = useState<Coordinates | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCoords');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setLocation('Location unavailable');
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        // Reverse geocode using Nominatim (free, no API key needed)
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (resp.ok) {
            const data = await resp.json();
            const addr = data.address;
            const city =
              addr?.city || addr?.town || addr?.village || addr?.county || 'Your location';
            const state = addr?.state || '';
            const fullLoc = state ? `${city}, ${state}` : city;
            setLocation(fullLoc);
            
            // Persist for fallback/Geocoding
            localStorage.setItem('userLocation', fullLoc);
            localStorage.setItem('userCity', city);
            localStorage.setItem('userCoords', JSON.stringify({ lat: latitude, lng: longitude }));
          } else {
            const simpleCoords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocation(simpleCoords);
            localStorage.setItem('userCoords', JSON.stringify({ lat: latitude, lng: longitude }));
          }
        } catch {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(err.message);
        setLocation('Location unavailable');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, coordinates, setCoordinates, locationError, isLocating, requestLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
