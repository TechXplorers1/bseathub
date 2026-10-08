'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { NearbyProvider } from './NearbyMapView';

interface LeafletMapProps {
  userLat: number;
  userLng: number;
  providers: NearbyProvider[];
  selectedProvider: NearbyProvider | null;
  hoveredId: string | null;
  onProviderSelect: (p: NearbyProvider) => void;
}

export default function LeafletMap({
  userLat,
  userLng,
  providers,
  selectedProvider,
  hoveredId,
  onProviderSelect,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  const getMarkerColor = (type: string) => {
    if (type === 'chef') return '#7c3aed';
    if (type === 'home-food') return '#f97316';
    return '#2563eb';
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current).setView([userLat, userLng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // User marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="width: 24px; height: 24px; background: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when user location changes
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return;
    userMarkerRef.current.setLatLng([userLat, userLng]);
    mapRef.current.flyTo([userLat, userLng], mapRef.current.getZoom());
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
      
      const scale = isSelected ? 1.3 : isHovered ? 1.15 : 1;
      const zIndex = isSelected ? 500 : isHovered ? 400 : 100;

      const html = `
        <div style="width: 32px; height: 32px; background: ${color}; border: 2px solid white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg) scale(${scale}); box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;">
           <div style="width: 14px; height: 14px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
      `;

      if (markersRef.current.has(p.id)) {
        const marker = markersRef.current.get(p.id)!;
        const icon = L.divIcon({
          className: 'custom-provider-marker',
          html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        marker.setIcon(icon);
        marker.setZIndexOffset(zIndex);
      } else {
        const icon = L.divIcon({
          className: 'custom-provider-marker',
          html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const popupContent = `
            <div style="padding: 2px; min-width: 120px; font-family: inherit;">
              <h4 style="margin: 0; font-weight: 800; font-size: 14px;">${p.name}</h4>
              <p style="margin: 4px 0 0; font-size: 11px; color: #666;">${p.cuisineType || p.specialty || ''}</p>
              ${p.distanceKm ? `<p style="margin: 4px 0 0; font-size: 12px; font-weight: bold; color: #f43f5e;">📍 ${p.distanceKm.toFixed(1)} km away</p>` : ''}
            </div>
          `;

        const marker = L.marker([p.latitude, p.longitude], { icon, zIndexOffset: zIndex })
          .bindPopup(popupContent, { closeButton: false, offset: [0, -20] })
          .addTo(map);

        marker.on('click', () => {
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
    
    mapRef.current.flyTo(
      [selectedProvider.latitude, selectedProvider.longitude],
      15,
      { duration: 1.2 }
    );

    const marker = markersRef.current.get(selectedProvider.id);
    if (marker && !marker.isPopupOpen()) {
      marker.openPopup();
    }
  }, [selectedProvider]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 relative" style={{ isolation: 'isolate' }} />;
}
