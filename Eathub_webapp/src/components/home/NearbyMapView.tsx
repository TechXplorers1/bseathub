'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useEffect } from 'react';
import { MapPin, ChefHat, Store, Home, Loader2, Navigation, Filter, SlidersHorizontal, Star, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/context/LocationProvider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

import type React from 'react';
const BASE_URL = 'http://localhost:8081/api/v1';

export interface LeafletMapProps {
  userLat: number;
  userLng: number;
  providers: NearbyProvider[];
  selectedProvider: NearbyProvider | null;
  hoveredId: string | null;
  onProviderSelect: (p: NearbyProvider) => void;
}

// Dynamic import of the actual map to avoid SSR issues with Leaflet
const LeafletMap = dynamic<LeafletMapProps>(
  () => import('./LeafletMap') as any,
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-emerald-700 font-medium">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export interface NearbyProvider {
  id: string;
  name: string;
  slug: string;
  type: 'restaurant' | 'home-food' | 'chef';
  cuisineType?: string;
  specialty?: string;
  rating?: number;
  imageId?: string;
  avatarUrl?: string;
  avgDeliveryTime?: number;
  isOpen?: boolean;
  city?: string;
  addressLine1?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

type FilterType = 'all' | 'restaurant' | 'home-food' | 'chef';
const RADIUS_OPTIONS = [5, 10, 20, 50];

export default function NearbyMapView() {
  const { coordinates, isLocating, locationError, location, requestLocation } = useLocation();

  const [providers, setProviders] = useState<{
    restaurants: NearbyProvider[];
    homeFoods: NearbyProvider[];
    chefs: NearbyProvider[];
  }>({ restaurants: [], homeFoods: [], chefs: [] });

  const [loadingProviders, setLoadingProviders] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedProvider, setSelectedProvider] = useState<NearbyProvider | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchNearby = useCallback(async (lat: number, lng: number, radius: number) => {
    setLoadingProviders(true);
    try {
      const res = await fetch(`${BASE_URL}/discovery/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (!res.ok) throw new Error('Failed to fetch nearby providers');
      const data = await res.json();
      setProviders({
        restaurants: (data.restaurants || []).map((r: any) => ({ ...r, type: 'restaurant' as const })),
        homeFoods: (data.homeFoods || []).map((h: any) => ({ ...h, type: 'home-food' as const })),
        chefs: (data.chefs || []).map((c: any) => ({ ...c, type: 'chef' as const })),
      });
    } catch (e) {
      console.error('Nearby fetch error:', e);
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  useEffect(() => {
    if (coordinates) {
      fetchNearby(coordinates.lat, coordinates.lng, radiusKm);
    }
  }, [coordinates, radiusKm, fetchNearby]);

  const allProviders: NearbyProvider[] = [
    ...providers.restaurants,
    ...providers.homeFoods,
    ...providers.chefs,
  ];

  const filteredProviders = allProviders.filter(p => {
    if (activeFilter === 'all') return true;
    return p.type === activeFilter;
  });

  const getProviderUrl = (p: NearbyProvider) => {
    if (p.type === 'chef') return `/chefs/${p.slug}`;
    if (p.type === 'home-food') return `/home-food/${p.slug}`;
    return `/restaurant/${p.slug}`;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'chef') return <ChefHat className="h-3.5 w-3.5" />;
    if (type === 'home-food') return <Home className="h-3.5 w-3.5" />;
    return <Store className="h-3.5 w-3.5" />;
  };

  const getTypeBadgeColor = (type: string) => {
    if (type === 'chef') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (type === 'home-food') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const totalCount = filteredProviders.length;
  const mappableCount = filteredProviders.filter(p => p.latitude && p.longitude).length;

  return (
    <div className="w-full flex flex-col gap-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500" />
            Nearby Food &amp; Services
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {coordinates
              ? `${totalCount} providers found within ${radiusKm} km of ${location}`
              : isLocating
              ? 'Detecting your location...'
              : 'Enable location to see nearby providers'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Radius selector */}
          <div className="flex items-center gap-1 rounded-full bg-muted p-1">
            {RADIUS_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold transition-all',
                  radiusKm === r
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r}km
              </button>
            ))}
          </div>
          {/* Refresh location */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full h-8 gap-1.5"
            onClick={requestLocation}
            disabled={isLocating}
          >
            <Navigation className={cn('h-3.5 w-3.5', isLocating && 'animate-spin')} />
            {isLocating ? 'Locating...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {(['all', 'restaurant', 'home-food', 'chef'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border',
              activeFilter === f
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary'
            )}
          >
            {f === 'all' && <SlidersHorizontal className="h-3 w-3" />}
            {f === 'restaurant' && <Store className="h-3 w-3" />}
            {f === 'home-food' && <Home className="h-3 w-3" />}
            {f === 'chef' && <ChefHat className="h-3 w-3" />}
            {f === 'all'
              ? `All (${allProviders.length})`
              : f === 'restaurant'
              ? `Restaurants (${providers.restaurants.length})`
              : f === 'home-food'
              ? `Home Food (${providers.homeFoods.length})`
              : `Chefs (${providers.chefs.length})`}
          </button>
        ))}
      </div>

      {/* Main layout: Map + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-3 h-[520px] lg:h-[480px]">

        {/* Map Panel */}
        <div className="relative flex-1 rounded-2xl overflow-hidden border border-border shadow-lg min-h-[280px]">
          {!coordinates && !isLocating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 z-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Location Access Needed</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {locationError || 'Allow location access to see nearby food providers on the map.'}
                </p>
              </div>
              <Button onClick={requestLocation} className="rounded-full px-6 gap-2">
                <Navigation className="h-4 w-4" />
                Enable Location
              </Button>
            </div>
          )}

          {isLocating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur z-10 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Getting your location...</p>
            </div>
          )}

          {loadingProviders && coordinates && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 border shadow-md flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs font-semibold">Finding providers...</span>
            </div>
          )}

          {coordinates && (
            <LeafletMap
              userLat={coordinates.lat}
              userLng={coordinates.lng}
              providers={filteredProviders}
              selectedProvider={selectedProvider}
              hoveredId={hoveredId}
              onProviderSelect={setSelectedProvider}
            />
          )}

          {/* Map Legend */}
          {coordinates && (
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm rounded-xl p-2.5 border shadow-md text-[10px] space-y-1.5">
              <p className="font-bold text-[11px] text-foreground mb-1">Legend</p>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm"></span><span className="text-muted-foreground">Restaurant</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-sm"></span><span className="text-muted-foreground">Home Food</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600 border-2 border-white shadow-sm"></span><span className="text-muted-foreground">Chef</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></span><span className="text-muted-foreground">You</span></div>
              <p className="text-muted-foreground mt-1">{mappableCount}/{totalCount} on map</p>
            </div>
          )}
        </div>

        {/* Provider List Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-2 overflow-y-auto pr-0.5">
          {filteredProviders.length === 0 && !loadingProviders && coordinates && (
            <div className="flex flex-col items-center justify-center flex-1 py-10 text-center text-muted-foreground">
              <MapPin className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-semibold">No providers found</p>
              <p className="text-xs mt-1">Try increasing the radius</p>
            </div>
          )}

          {filteredProviders.map(p => (
            <Link key={p.id} href={getProviderUrl(p)} target="_blank"
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedProvider(p)}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                selectedProvider?.id === p.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : hoveredId === p.id
                  ? 'border-primary/40 bg-muted/60 shadow-sm'
                  : 'border-border bg-card hover:border-primary/30 hover:bg-muted/40'
              )}
            >
              {/* Avatar / Image */}
              <div className={cn(
                'relative w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-lg overflow-hidden',
                p.type === 'chef' ? 'bg-purple-600' : p.type === 'home-food' ? 'bg-orange-500' : 'bg-blue-600'
              )}>
                {p.imageId || p.avatarUrl ? (
                  <img
                    src={p.imageId || p.avatarUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <span>{p.name?.[0] || '?'}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{p.name}</p>
                  {p.distanceKm != null && (
                    <span className="text-[10px] font-black text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-full">
                      {p.distanceKm < 1
                        ? `${Math.round(p.distanceKm * 1000)}m`
                        : `${p.distanceKm.toFixed(1)}km`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border', getTypeBadgeColor(p.type))}>
                    {getTypeIcon(p.type)}
                    {p.type === 'chef' ? 'Chef' : p.type === 'home-food' ? 'Home Food' : 'Restaurant'}
                  </span>
                  {p.rating && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
                      <Star className="h-2.5 w-2.5 fill-current" />{p.rating.toFixed(1)}
                    </span>
                  )}
                  {p.avgDeliveryTime && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />{p.avgDeliveryTime}m
                    </span>
                  )}
                </div>
                {(p.cuisineType || p.specialty) && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {p.cuisineType || p.specialty}
                  </p>
                )}
                {p.city && (
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" />{p.city}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
