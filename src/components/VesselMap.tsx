'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

type Vessel = {
  name: string; status: string; speed_knots: number; route: string;
  lat: number; lon: number; delay_probability: number;
  departure_time: string; arrival_time: string; eta_label: string; eta_hours: number | null;
};

type Props = { vessels: Vessel[]; selectedName?: string; onSelect?: (name: string) => void };

function delayColor(p: number) {
  if (p > 0.7) return '#dc2626';
  if (p > 0.4) return '#d97706';
  return '#16a34a';
}

function shipSvg(color: string, heading: number, isSelected: boolean) {
  const size = isSelected ? 36 : 28;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <g transform="rotate(${heading}, 12, 12)">
      <path d="M12 2 L16 10 L12 8 L8 10 Z" fill="${color}" stroke="white" stroke-width="1.2"/>
      <rect x="10" y="8" width="4" height="8" rx="1" fill="${color}" stroke="white" stroke-width="1"/>
      <path d="M8 16 Q12 20 16 16" fill="${color}" stroke="white" stroke-width="1"/>
    </g>
    ${isSelected ? `<circle cx="12" cy="12" r="11" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4 2"/>` : ''}
  </svg>`;
  return svg;
}

export default function VesselMap({ vessels, selectedName, onSelect }: Props) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import('leaflet').Map | null>(null);
  const markersRef  = useRef<Map<string, import('leaflet').Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import('leaflet').then(L => {
      const map = L.map(mapRef.current!, {
        center: [37.0, 24.5],
        zoom: 6,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Port markers
      const portIcon = L.divIcon({
        html: `<div style="background:#001A4D;color:#C9A84C;border:2px solid #C9A84C;border-radius:50%;width:10px;height:10px;"></div>`,
        iconSize: [10, 10],
        className: '',
      });
      [
        { name: 'Port of Piraeus',        lat: 37.9477, lon: 23.6333 },
        { name: 'Port of Heraklion',      lat: 35.3397, lon: 25.1444 },
        { name: 'Port of Chania (Souda)', lat: 35.5138, lon: 24.0180 },
      ].forEach(p => {
        L.marker([p.lat, p.lon], { icon: portIcon })
          .addTo(map)
          .bindPopup(`<strong>${p.name}</strong>`, { closeButton: false });
      });

      mapInstance.current = map;

      // Initial vessel markers
      addMarkers(L, map, vessels, selectedName, onSelect);
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when vessels or selection changes
  useEffect(() => {
    if (!mapInstance.current) return;
    import('leaflet').then(L => {
      // Remove old vessel markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current.clear();
      addMarkers(L, mapInstance.current!, vessels, selectedName, onSelect);
    });
  }, [vessels, selectedName, onSelect]);

  function addMarkers(
    L: typeof import('leaflet'),
    map: import('leaflet').Map,
    data: Vessel[],
    selected: string | undefined,
    onSel: ((name: string) => void) | undefined,
  ) {
    data.forEach(v => {
      const isSelected = v.name === selected;
      const color      = delayColor(v.delay_probability);
      const svg        = shipSvg(color, v.heading ?? 0, isSelected);
      const icon = L.divIcon({
        html: svg,
        iconSize: isSelected ? [36, 36] : [28, 28],
        iconAnchor: isSelected ? [18, 18] : [14, 14],
        className: '',
      });

      const statusLabel = v.status.replace('_', ' ');
      const popup = `
        <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px">
          <div style="font-weight:700;font-size:13px;color:#001A4D;margin-bottom:6px">⚓ ${v.name}</div>
          <div style="background:#f1f5f9;border-radius:6px;padding:8px;space-y:4px">
            <div style="margin-bottom:4px"><span style="color:#64748b">Route:</span> <strong>${v.route}</strong></div>
            <div style="margin-bottom:4px"><span style="color:#64748b">Status:</span> <span style="text-transform:capitalize;font-weight:600;color:${v.status === 'underway' ? '#16a34a' : '#3b82f6'}">${statusLabel}</span></div>
            ${v.status === 'underway' ? `<div style="margin-bottom:4px"><span style="color:#64748b">Speed:</span> <strong>${v.speed_knots} kn</strong></div>` : ''}
            <div style="margin-bottom:4px;color:#0f172a">${v.departure_time}</div>
            <div style="color:#0f172a">${v.arrival_time}</div>
          </div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
            <div style="height:6px;border-radius:3px;background:#e2e8f0;flex:1;overflow:hidden">
              <div style="height:100%;width:${(v.delay_probability * 100).toFixed(0)}%;background:${color};border-radius:3px"></div>
            </div>
            <span style="font-size:11px;font-weight:600;color:${color}">Delay risk ${(v.delay_probability * 100).toFixed(0)}%</span>
          </div>
        </div>`;

      const marker = L.marker([v.lat, v.lon], { icon })
        .addTo(map)
        .bindPopup(popup, { maxWidth: 240, className: 'vessel-popup' });

      if (onSel) {
        marker.on('click', () => onSel(v.name));
      }

      if (isSelected) {
        marker.openPopup();
      }

      markersRef.current.set(v.name, marker);
    });
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow text-xs space-y-1 z-[1000]">
        <div className="font-semibold text-gray-700 dark:text-slate-300 mb-1">Delay Risk</div>
        {[['#16a34a','Low (< 40%)'],['#d97706','Medium (40–70%)'],['#dc2626','High (> 70%)']].map(([c,l])=>(
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background:c}}/>
            <span className="text-gray-600 dark:text-slate-400">{l}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 pt-0.5 border-t border-gray-100 dark:border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#C9A84C]"/>
          <span className="text-gray-600 dark:text-slate-400">Port</span>
        </div>
      </div>
    </div>
  );
}
