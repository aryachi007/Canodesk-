import { useEffect, useRef } from 'react';
import L from 'leaflet';
import zonesGeoJSON from '../data/BENGALURU_ZONES.json';

// ─── Bounds for the image overlays ────────────────────────────────────────────
const BOUNDS: L.LatLngBoundsExpression = [
  [12.7342, 77.3791], // SW
  [13.1390, 77.8826], // NE
];

const CENTER: L.LatLngExpression = [12.7621, 77.5590];

type LayerKey = 'heat2020' | 'heat2024' | 'ndvi2020' | 'ndvi2024';

interface CanodeskMapProps {
  /** Which image overlay layer to show */
  activeLayer: LayerKey;
}

// Map from key → public path and display label
const LAYERS: Record<LayerKey, { src: string; label: string; color: string }> = {
  heat2020: { src: '/LST 2020.png',            label: 'Heat 2020', color: '#ef4444' },
  heat2024: { src: '/LST 2024.png',            label: 'Heat 2024', color: '#dc2626' },
  ndvi2020: { src: '/BENGALURU ndvi2020.png',  label: 'NDVI 2020', color: '#16a34a' },
  ndvi2024: { src: '/NDVI2024.png',            label: 'NDVI 2024', color: '#ea580c' },
};

export default function CanodeskMap({ activeLayer }: CanodeskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const overlayRef   = useRef<L.ImageOverlay | null>(null);

  // ── Initialise map once ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Fix default icon path broken by bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(containerRef.current, {
      center:     CENTER,
      zoom:       11,
      zoomControl: true,
      touchZoom:   true,
      tap:         true,
      dragging:    true,
      contextmenu: false,
    });
    mapRef.current = map;

    // Fix 6 — Resize/invalidate on mount so tiles render in dynamic containers
    setTimeout(() => { map.invalidateSize(); }, 100);

    // Base tile layer – ESRI World Imagery (satellite look, no API key)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA',
        maxZoom: 18,
      }
    ).addTo(map);

    // ── GeoJSON zone boundaries ──────────────────────────────────────────────
    L.geoJSON(zonesGeoJSON as any, {
      style: {
        color:       '#00ff88',
        weight:      2,
        fillColor:   '#00ff88',
        fillOpacity: 0.06,
        dashArray:   '6 4',
      },
      onEachFeature(feature, layer) {
        const p = feature.properties as {
          zone_name?: string;
          heat_score?: number;
          ndvi_score?: number;
          alert_stat?: string;
        };

        const statusColor =
          p.alert_stat === 'CRITICAL' ? '#dc2626' :
          p.alert_stat === 'WARNING'  ? '#ea580c' : '#16a34a';

        layer.bindPopup(`
          <div style="font-family:'JetBrains Mono',monospace; min-width:180px; padding:4px">
            <p style="font-size:11px;letter-spacing:2px;color:#64748b;margin:0 0 6px">ZONE INFO</p>
            <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px">
              ${p.zone_name ?? 'Unknown'}
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
              <div>
                <span style="color:#94a3b8">Heat Score</span><br/>
                <strong style="color:#dc2626">${p.heat_score ?? 'N/A'}°C</strong>
              </div>
              <div>
                <span style="color:#94a3b8">NDVI Score</span><br/>
                <strong style="color:#16a34a">${p.ndvi_score ?? 'N/A'}</strong>
              </div>
            </div>
            <div style="margin-top:8px">
              <span style="
                display:inline-block;
                background:${statusColor}22;
                color:${statusColor};
                border:1px solid ${statusColor}55;
                border-radius:9999px;
                padding:2px 10px;
                font-size:11px;
                font-weight:600
              ">● ${p.alert_stat ?? 'UNKNOWN'}</span>
            </div>
          </div>
        `, { maxWidth: 240 });

        // Add heat circle
        if (typeof (layer as any).getBounds === 'function') {
          const center = (layer as any).getBounds().getCenter();
          const heatScore = p.heat_score || 35;
          let circleColor = '#22c55e'; // low -> green
          if (heatScore > 37) circleColor = '#ef4444'; // high -> red
          else if (heatScore >= 34) circleColor = '#f97316'; // medium -> orange

          const className = heatScore > 37 ? 'heat-glow-circle' : '';
          
          L.circle(center, {
            radius: heatScore * 40,
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.4,
            weight: 2,
            className: className,
            interactive: false // ensure it doesn't block clicks from the polygon
          }).addTo(map);
        }
      },
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current  = null;
      overlayRef.current = null;
    };
  }, []);

  // ── Swap image overlay when activeLayer changes ──────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous overlay
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    // Add new overlay
    const layer = LAYERS[activeLayer];
    const overlay = L.imageOverlay(layer.src, BOUNDS, {
      opacity:       0.65,
      interactive:   false,
    });
    overlay.addTo(map);
    overlayRef.current = overlay;
  }, [activeLayer]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}
