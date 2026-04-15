'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useLocation } from './LocationProvider';

const API_BASE = 'http://localhost:8081/api/v1';

export interface DistanceFilterOption {
  label: string;
  value: number | null; // null = All (no filter)
}

export const DISTANCE_OPTIONS: DistanceFilterOption[] = [
  { label: 'All', value: null },
  { label: '500m', value: 0.5 },
  { label: '1 km', value: 1 },
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
];

interface NearbyResult {
  restaurants: any[];
  homeFoods: any[];
  chefs: any[];
}

interface DistanceFilterContextType {
  selectedRadius: number | null;
  setSelectedRadius: (r: number | null) => void;
  nearbyData: NearbyResult | null;
  isFetchingNearby: boolean;
  hasLocation: boolean;
  locationLabel: string;
}

const DistanceFilterContext = createContext<DistanceFilterContextType | undefined>(undefined);

/** Geocode a city/address string via Nominatim (free, no API key). */
async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export function DistanceFilterProvider({ children }: { children: ReactNode }) {
  const { coordinates, isLocating, location } = useLocation();

  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
  const [nearbyData, setNearbyData] = useState<NearbyResult | null>(null);
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Resolve coordinates: GPS first, then fallback to profile city geocode
  useEffect(() => {
    if (coordinates) {
      setResolvedCoords(coordinates);
      return;
    }
    if (isLocating) return;

    // GPS not available — try to geocode from profile stored values
    const city =
      typeof window !== 'undefined'
        ? localStorage.getItem('userCity') ||
          localStorage.getItem('userLocation') ||
          localStorage.getItem('userArea')
        : null;

    if (city && city.length > 2) {
      geocodeAddress(city).then(coords => {
        if (coords) setResolvedCoords(coords);
      });
    }
  }, [coordinates, isLocating]);

  const fetchNearby = useCallback(async (lat: number, lng: number, radius: number) => {
    setIsFetchingNearby(true);
    try {
      const res = await fetch(
        `${API_BASE}/discovery/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      // Normalize to match the Restaurant type that card components expect
      const normalize = (item: any, type: 'restaurant' | 'home-food') => ({
        ...item,
        type,
        name: item.name || item.brandName || 'Provider',
        cuisine: item.cuisineType || item.foodType || item.cuisine || 'Multi-cuisine',
        deliveryTime: item.avgDeliveryTime ?? item.deliveryTime ?? 30,
        deliveryFee: item.baseDeliveryFee ?? item.deliveryFee ?? 0,
        services: item.services ?? ['delivery', 'pickup'],
        isOpen: item.isOpen ?? item.isActive ?? true,
        reviews: item.reviewsCount ?? item.reviews ?? 0,
        // keep distanceKm for potential display
        distanceKm: item.distanceKm,
      });

      setNearbyData({
        restaurants: (data.restaurants || []).map((r: any) => normalize(r, 'restaurant')),
        homeFoods: (data.homeFoods || []).map((h: any) => normalize(h, 'home-food')),
        chefs: data.chefs || [],
      });
    } catch (e) {
      console.error('Distance filter fetch error:', e);
      setNearbyData(null);
    } finally {
      setIsFetchingNearby(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRadius === null) {
      setNearbyData(null);
      return;
    }
    if (!resolvedCoords) return;
    fetchNearby(resolvedCoords.lat, resolvedCoords.lng, selectedRadius);
  }, [selectedRadius, resolvedCoords, fetchNearby]);

  const hasLocation = !!resolvedCoords;
  const locationLabel = location || 'your location';

  return (
    <DistanceFilterContext.Provider
      value={{ selectedRadius, setSelectedRadius, nearbyData, isFetchingNearby, hasLocation, locationLabel }}
    >
      {children}
    </DistanceFilterContext.Provider>
  );
}

export function useDistanceFilter() {
  const ctx = useContext(DistanceFilterContext);
  if (!ctx) throw new Error('useDistanceFilter must be used inside DistanceFilterProvider');
  return ctx;
}
