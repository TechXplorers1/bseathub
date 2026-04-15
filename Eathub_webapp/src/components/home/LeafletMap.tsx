'use client';

import { useEffect, useRef } from 'react';
import type { NearbyProvider } from './NearbyMapView';
import type { LeafletMapProps } from './NearbyMapView';

// Leaflet is loaded client-side only (not SSR-compatible)
export default function LeafletMap({
  userLat,
  userLng,
  providers,
  selectedProvider,
  hoveredId,
  onProviderSelect,
}: LeafletMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const radiusCircleRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const getMarkerColor = (type: string) => {
    if (type === 'chef') return '#7c3aed';
    if (type === 'home-food') return '#f97316';
    return '#2563eb';
  };

  const createSvgIcon = (color: string, isSelected: boolean, isHovered: boolean) => {
    const scale = isSelected ? 1.35 : isHovered ? 1.15 : 1;
    const size = Math.round(32 * scale);
    const shadow = isSelected ? 'filter:drop-shadow(0 3px 8px rgba(0,0,0,0.4))' : isHovered ? 'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : '';
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" style="${shadow}">
        <path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 28 12 28S28 21 28 12C28 5.37 22.63 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="12" r="6" fill="white" opacity="0.95"/>
      </svg>`;
    return svg;
  };

  const createUserSvg = () => `
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.4))">
      <circle cx="18" cy="18" r="16" fill="#ef4444" stroke="white" stroke-width="3"/>
      <circle cx="18" cy="18" r="6" fill="white"/>
    </svg>`;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically import Leaflet (client-side only)
    import('leaflet').then((L) => {
      // Fix default icon issue in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Include Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapRef.current) return; // already initialized

      const map = L.map(mapContainerRef.current!, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: false,
      });
      mapRef.current = map;

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap tiles (completely free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        html: createUserSvg(),
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<div class="text-sm font-bold p-1">📍 You are here</div>', { offset: [0, -16] });

      // Accuracy circle
      radiusCircleRef.current = L.circle([userLat, userLng], {
        radius: 10000, // default 10km display circle
        color: '#ef4444',
        fillColor: '#ef444420',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '6 4',
      }).addTo(map);

    }).catch(console.error);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user marker when coords change
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return;
    userMarkerRef.current.setLatLng([userLat, userLng]);
    radiusCircleRef.current?.setLatLng([userLat, userLng]);
    mapRef.current.panTo([userLat, userLng]);
  }, [userLat, userLng]);

  // Update provider markers
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      const map = mapRef.current;
      const existingIds = new Set(markersRef.current.keys());
      const newIds = new Set(providers.filter(p => p.latitude && p.longitude).map(p => p.id));

      // Remove markers no longer in list
      existingIds.forEach(id => {
        if (!newIds.has(id)) {
          markersRef.current.get(id)?.remove();
          markersRef.current.delete(id);
        }
      });

      // Add / update markers
      providers.forEach(p => {
        if (!p.latitude || !p.longitude) return;
        const isSelected = selectedProvider?.id === p.id;
        const isHovered = hoveredId === p.id;
        const color = getMarkerColor(p.type);

        const icon = L.divIcon({
          html: createSvgIcon(color, isSelected, isHovered),
          className: '',
          iconSize: [isSelected ? 43 : isHovered ? 37 : 32, isSelected ? 54 : isHovered ? 46 : 40],
          iconAnchor: [isSelected ? 21 : isHovered ? 18 : 16, isSelected ? 54 : isHovered ? 46 : 40],
        });

        if (markersRef.current.has(p.id)) {
          markersRef.current.get(p.id)?.setIcon(icon);
        } else {
          const popupContent = `
            <div style="min-width:160px;font-family:sans-serif">
              <p style="font-weight:800;font-size:13px;margin:0 0 4px">${p.name}</p>
              <p style="font-size:11px;color:#666;margin:0 0 4px">${p.cuisineType || p.specialty || ''}</p>
              ${p.distanceKm != null ? `<p style="font-size:11px;color:#e91e63;font-weight:700;margin:0 0 4px">📍 ${p.distanceKm < 1 ? Math.round(p.distanceKm * 1000) + 'm' : p.distanceKm.toFixed(1) + 'km'} away</p>` : ''}
              ${p.rating ? `<p style="font-size:11px;color:#f59e0b;font-weight:700;margin:0">⭐ ${p.rating.toFixed(1)}</p>` : ''}
            </div>`;

          const marker = L.marker([p.latitude, p.longitude], { icon })
            .addTo(map)
            .bindPopup(popupContent, { offset: [0, -35], closeButton: false });

          marker.on('click', () => onProviderSelect(p));
          markersRef.current.set(p.id, marker);
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, selectedProvider, hoveredId]);

  // Pan to selected provider
  useEffect(() => {
    if (!mapRef.current || !selectedProvider?.latitude || !selectedProvider?.longitude) return;
    mapRef.current.flyTo([selectedProvider.latitude, selectedProvider.longitude], 15, { duration: 0.8 });
    markersRef.current.get(selectedProvider.id)?.openPopup();
  }, [selectedProvider]);

  return <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />;
}
