'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { NearbyProvider } from './NearbyMapView';

// Replace with your actual Mapbox token
// IT IS RECOMMENDED TO USE AN ENVIRONMENT VARIABLE: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const MAPBOX_TOKEN = 'pk.eyJ1IjoicGxhY2Vob2xkZXIiLCJhIjoiY20waW94am1tMDByNzJycHh6M2R3c213dyJ9.PlaceholderToken'; 

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapboxMapProps {
  userLat: number;
  userLng: number;
  providers: NearbyProvider[];
  selectedProvider: NearbyProvider | null;
  hoveredId: string | null;
  onProviderSelect: (p: NearbyProvider) => void;
}

export default function MapboxMap({
  userLat,
  userLng,
  providers,
  selectedProvider,
  hoveredId,
  onProviderSelect,
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const getMarkerColor = (type: string) => {
    if (type === 'chef') return '#7c3aed';
    if (type === 'home-food') return '#f97316';
    return '#2563eb';
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // modern, clean style
      center: [userLng, userLat],
      zoom: 12,
    });

    mapRef.current = map;

    // Add navigation control (zoom/rotate)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // User marker
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.innerHTML = `
      <div style="width: 24px; height: 24px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; items-center; justify-center;">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `;

    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLng, userLat])
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when user location changes
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return;
    userMarkerRef.current.setLngLat([userLng, userLat]);
    mapRef.current.flyTo({ center: [userLng, userLat], speed: 0.8 });
  }, [userLat, userLng]);

  // Update provider markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const newIds = new Set(providers.filter(p => p.latitude && p.longitude).map(p => p.id));
    const currentIds = new Set(markersRef.current.keys());

    // Remove old markers
    currentIds.forEach(id => {
      if (!newIds.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    });

    // Add / Update markers
    providers.forEach(p => {
      if (!p.latitude || !p.longitude) return;
      
      const isSelected = selectedProvider?.id === p.id;
      const isHovered = hoveredId === p.id;
      const color = getMarkerColor(p.type);
      
      if (markersRef.current.has(p.id)) {
        const marker = markersRef.current.get(p.id)!;
        const el = marker.getElement();
        el.style.transform = `scale(${isSelected ? 1.3 : isHovered ? 1.15 : 1})`;
        el.style.zIndex = isSelected ? '10' : isHovered ? '5' : '1';
      } else {
        const el = document.createElement('div');
        el.className = 'provider-marker';
        el.style.cursor = 'pointer';
        el.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        el.innerHTML = `
          <div style="width: 32px; height: 32px; background: ${color}; border: 2px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-center;">
             <div style="width: 14px; height: 14px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div style="padding: 8px; min-width: 150px; font-family: inherit;">
              <h4 style="margin: 0; font-weight: 800; font-size: 14px;">${p.name}</h4>
              <p style="margin: 4px 0 0; font-size: 11px; color: #666;">${p.cuisineType || p.specialty || ''}</p>
              ${p.distanceKm ? `<p style="margin: 4px 0 0; font-size: 12px; font-weight: bold; color: #f43f5e;">📍 ${p.distanceKm.toFixed(1)} km away</p>` : ''}
            </div>
          `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([p.longitude, p.latitude])
          .setPopup(popup)
          .addTo(map);

        el.addEventListener('click', () => {
          onProviderSelect(p);
        });

        markersRef.current.set(p.id, marker);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, hoveredId, selectedProvider]);

  // Handle selected provider zoom
  useEffect(() => {
    if (!mapRef.current || !selectedProvider?.latitude || !selectedProvider?.longitude) return;
    
    mapRef.current.flyTo({
      center: [selectedProvider.longitude, selectedProvider.latitude],
      zoom: 15,
      essential: true,
      speed: 1.2
    });

    const marker = markersRef.current.get(selectedProvider.id);
    if (marker) {
      marker.togglePopup();
    }
  }, [selectedProvider]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
}
