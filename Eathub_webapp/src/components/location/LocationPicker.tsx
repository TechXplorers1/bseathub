'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

export default function LocationPicker({ initialLat, initialLng, initialAddress, onLocationSelect }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const startLat = initialLat || 20.5937; // Default to India center
    const startLng = initialLng || 78.9629;

    const map = L.map(mapContainerRef.current).setView([startLat, startLng], initialLat ? 15 : 4);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const customIcon = L.divIcon({
      className: 'custom-picker-marker',
      html: `
        <div style="width: 32px; height: 32px; background: #f97316; border: 2px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
           <div style="width: 12px; height: 12px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Add marker
    const marker = L.marker([startLat, startLng], {
      draggable: true,
      icon: customIcon
    }).addTo(map);

    markerRef.current = marker;

    // IF we have an initial address but NO coords, trigger search automatically
    if (!initialLat && !initialLng && initialAddress) {
       geocodeAddress(initialAddress, map, marker);
    }

    marker.on('dragend', () => {
      const latLng = marker.getLatLng();
      onLocationSelect(latLng.lat, latLng.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
          onLocationSelect(latitude, longitude);
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not get your location. Please check your browser permissions.');
      }
    );
  };

  const geocodeAddress = async (query: string, mapObj?: L.Map | null, markerObj?: L.Marker | null) => {
    if (!query.trim()) return;
    setIsSearching(true);
    
    // Recursive search with fallback levels
    const performSearch = async (q: string): Promise<any> => {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data && data[0]) return data[0];
      return null;
    };

    try {
      let result = await performSearch(query);
      
      // Fallback 1: Remove potentially specific house numbers (e.g. "1-388-1")
      if (!result && query.includes(' ')) {
        const parts = query.split(' ');
        if (parts.length > 2) {
          const fallbackQuery = parts.slice(1).join(' '); // remove first part
          result = await performSearch(fallbackQuery);
        }
      }

      // Fallback 2: Try just the locality/city if still nothing
      if (!result && query.includes(',')) {
        const segments = query.split(',');
        if (segments.length > 1) {
          const fallbackQuery = segments.slice(1).join(',').trim();
          result = await performSearch(fallbackQuery);
        }
      }

      if (result) {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const map = mapObj || mapRef.current;
        const marker = markerObj || markerRef.current;
        
        if (map && marker) {
          map.flyTo([lat, lon], 15);
          marker.setLatLng([lat, lon]);
          onLocationSelect(lat, lon, result.display_name);
        }
      } else if (!mapObj) {
        alert('Location not found. Try entering a nearby landmark or just the city name.');
      }
    } catch (e) {
      console.error(e);
      alert('Search failed. Please check your connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => geocodeAddress(searchQuery);

  return (
    <div className="flex flex-col gap-3 h-full min-h-[400px]">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            placeholder="Search address or landmark..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10"
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-0 top-0 h-full"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={handleGetCurrentLocation} disabled={isLocating}>
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Navigation className="h-4 w-4 text-primary" />}
        </Button>
      </div>
      
      <div className="relative flex-1 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 text-xs font-semibold text-primary">
          <MapPin className="h-3 w-3" />
          Drag pin to refine location
        </div>
      </div>
    </div>
  );
}
