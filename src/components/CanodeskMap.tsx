import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap } from 'react-leaflet';
import L from 'leaflet';
import zonesGeoJSON from '../data/BENGALURU_ZONES.json';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const BOUNDS: L.LatLngBoundsExpression = [[12.7342, 77.3791], [13.1390, 77.8826]];

type LayerKey = 'heat2020' | 'heat2024' | 'ndvi2020' | 'ndvi2024';
const LAYERS: Record<LayerKey, { src: string; label: string }> = {
  heat2020: { src: '/LST 2020.png',           label: 'Heat 2020' },
  heat2024: { src: '/LST 2024.png',           label: 'Heat 2024' },
  ndvi2020: { src: '/BENGALURU ndvi2020.png', label: 'NDVI 2020' },
  ndvi2024: { src: '/NDVI2024.png',           label: 'NDVI 2024' },
};

function MapEvents() {
  const map = useMap();
  useEffect(() => {
    // Issue 3: Add smooth fly-to animation when Leaflet map loads
    map.flyTo([12.7621, 77.5590], 11, { duration: 2, easeLinearity: 0.5 });
    
    // Issue 10: Force Resize on Mobile
    setTimeout(() => { map.invalidateSize(); }, 200);
  }, [map]);
  return null;
}

export default function CanodeskMap({ activeLayer, overlayOpacity = 0.65 }: { activeLayer: LayerKey, overlayOpacity?: number }) {
  const layer = LAYERS[activeLayer];

  const onEachFeature = (feature: any, layerL: L.Layer) => {
    const p = feature.properties;
    const statusColor = p.alert_stat === 'CRITICAL' ? '#dc2626' : p.alert_stat === 'WARNING' ? '#ea580c' : '#16a34a';

    layerL.bindPopup(`
      <div style="font-family:'JetBrains Mono',monospace; min-width:180px; padding:4px">
        <p style="font-size:11px;color:#64748b;margin:0 0 6px">ZONE INFO</p>
        <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px">${p.zone_name ?? 'Unknown'}</p>
        <div>
          <span style="color:#dc2626">Heat: ${p.heat_score ?? 'N/A'}°C</span> | 
          <span style="color:#16a34a">NDVI: ${p.ndvi_score ?? 'N/A'}</span>
        </div>
        <div style="margin-top:8px; font-weight:bold; color:${statusColor}">${p.alert_stat ?? 'UNKNOWN'}</div>
      </div>
    `);

    // Issue 3: Smooth zoom on marker click
    layerL.on('click', (e: any) => {
      const mapObj = e.target._map;
      const bounds = e.target.getBounds ? e.target.getBounds() : null;
      const center = bounds ? bounds.getCenter() : e.latlng;
      mapObj.flyTo(center, 13, { duration: 1 }); // duration 1000ms
    });
  };

  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    const p = feature.properties;
    const heatScore = p.heat_score || 35;
    let circleColor = '#22c55e';
    if (heatScore > 37) circleColor = '#ef4444';
    else if (heatScore >= 34) circleColor = '#f97316';
    return L.circle(latlng, {
      radius: heatScore * 40,
      color: circleColor,
      fillColor: circleColor,
      fillOpacity: 0.4,
      weight: 2,
    });
  };

  return (
    // Issue 9: Fix Leaflet Touch on Mobile
    <MapContainer
      touchZoom={true}
      tap={true}
      zoomControl={true}
      scrollWheelZoom={false}
      center={[12.7621, 77.5590]}
      zoom={11}
      style={{ width: '100%', height: '100%' }}
    >
      <MapEvents />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
        maxZoom={18}
      />
      <ImageOverlay
        url={layer.src}
        bounds={BOUNDS}
        opacity={overlayOpacity}
        interactive={false}
        className="overlay-transition"
      />
      <GeoJSON 
        data={zonesGeoJSON as any} 
        style={{ color: '#00ff88', weight: 2, fillColor: '#00ff88', fillOpacity: 0.06 }} 
        onEachFeature={onEachFeature}
        pointToLayer={pointToLayer}
      />
    </MapContainer>
  );
}
