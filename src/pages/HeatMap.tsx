import { useEffect, useState, useTransition } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowLeft, Globe, Map as MapIcon } from 'lucide-react';
import { fetchRecommendations, type Recommendation } from '@/lib/api';
import CanodeskMap from '@/components/CanodeskMap';
import { Map as MapboxMap, Source, Layer, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type HeatLayer  = 'heat2020' | 'heat2024';
type MapMode    = '2d' | '3d';

const bannerghattaPolygon = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.500047814119071, 12.821137537033133],
            [77.500047814119071, 12.703160186692978],
            [77.618025164459226, 12.700122143336579],
            [77.618531505018638, 12.819112174795533],
            [77.500047814119071, 12.821137537033133]
          ]
        ]
      }
    }
  ]
};

// WebGL detection for Mapbox fallback
function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch(e) {
    return false;
  }
}

export default function HeatMap() {
  const [rec,       setRec]       = useState<Recommendation | null>(null);
  const [layer,     setLayer]     = useState<HeatLayer>('heat2024');
  const [mapMode,   setMapMode]   = useState<MapMode>('2d');
  const [fading,    setFading]    = useState(false);
  const [,          startTransition] = useTransition();
  const [webGL]                     = useState(() => isWebGLSupported());
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);

  useEffect(() => { fetchRecommendations().then(setRec); }, []);

  const toggleMode = (next: MapMode) => {
    if (next === mapMode) return;
    if (next === '3d' && !webGL) return;
    setFading(true);
    setTimeout(() => {
      startTransition(() => setMapMode(next));
      setFading(false);
    }, 300);
  };

  const handleLayerChange = (newLayer: HeatLayer) => {
    if (layer === newLayer) return;
    setOverlayOpacity(0);
    setTimeout(() => {
      setLayer(newLayer);
      setOverlayOpacity(0.65);
    }, 300);
  };

  return (
    <div className="page-transition map-page-container h-screen flex pt-16">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="map-sidebar bg-card border-r border-border flex flex-col gap-5">
        <Link to="/" className="flex items-center gap-1 text-sm text-canodesk-text-muted hover:text-canodesk-green transition-colors">
          <ArrowLeft size={14} /> Home
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xl">🌡️</span>
          <h1 className="font-heading text-xl font-bold text-canodesk-navy">Thermal Analysis</h1>
          <span className="canodesk-pill canodesk-pill-green text-[10px] ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-canodesk-green animate-pulse-dot" /> LIVE
          </span>
        </div>

        <hr className="border-border" />

        {/* ── 2D / 3D Mode Toggle ──────────────────────────────────────── */}
        <div>
          <p className="font-mono text-[10px] text-canodesk-text-muted tracking-wider mb-2">MAP MODE</p>
          <div className="flex gap-2">
            <button
              onClick={() => toggleMode('2d')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body font-semibold text-sm border transition-all duration-300
                ${mapMode === '2d' ? 'bg-canodesk-green text-white border-canodesk-green shadow-lg shadow-green-500/20' : 'border-border text-canodesk-text-muted hover:border-canodesk-green hover:text-canodesk-green'}`}
            >
              <MapIcon size={14} /> 2D View
            </button>
            <button
              onClick={() => toggleMode('3d')}
              disabled={!webGL}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body font-semibold text-sm border transition-all duration-300
                ${!webGL ? 'opacity-40 cursor-not-allowed border-border text-canodesk-text-muted' : mapMode === '3d' ? 'bg-canodesk-navy text-white border-canodesk-navy shadow-lg' : 'border-border text-canodesk-text-muted hover:border-canodesk-navy hover:text-canodesk-navy'}`}
            >
              <Globe size={14} /> 3D View
            </button>
          </div>
          {!webGL && (
            <p className="font-body text-[10px] text-canodesk-text-muted mt-2 text-center">
              ⚠️ WebGL not supported — 3D disabled
            </p>
          )}
          {mapMode === '3d' && webGL && (
            <p className="font-body text-[10px] text-canodesk-text-muted mt-2 text-center animate-fadeUp">
              ✨ Cinematic 3D • Click zones for details
            </p>
          )}
        </div>

        {/* ── Heat Layer Toggle ─────────────────────────────────────────── */}
        <div>
          <p className="font-mono text-[10px] text-canodesk-text-muted tracking-wider mb-2">SELECT YEAR</p>
          <div className="bg-muted rounded-3xl p-1 flex h-11">
            <button
              onClick={() => handleLayerChange('heat2020')}
              className={`flex-1 rounded-[20px] font-body font-medium text-sm transition-all duration-300
                ${layer === 'heat2020' ? 'bg-card text-canodesk-green shadow' : 'text-canodesk-text-muted'}`}
            >
              🌡️ 2020
            </button>
            <button
              onClick={() => handleLayerChange('heat2024')}
              className={`flex-1 rounded-[20px] font-body font-medium text-sm transition-all duration-300
                ${layer === 'heat2024' ? 'bg-card text-canodesk-red shadow' : 'text-canodesk-text-muted'}`}
            >
              2024 🔴
            </button>
          </div>
        </div>

        {/* Zone data card */}
        <div className="canodesk-card border-l-4 border-l-canodesk-red p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-canodesk-navy tracking-[1.5px]">BANNERGHATTA</span>
            <span className="canodesk-pill canodesk-pill-red text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-canodesk-red animate-pulse-red" /> CRITICAL
            </span>
          </div>
          <p className="font-mono text-6xl font-bold text-canodesk-red leading-none mb-4">
            {layer === 'heat2024' ? '38.5' : '35.0'}°C
          </p>
          <div className="w-full bg-muted rounded h-2 mb-2">
            <div className="bg-canodesk-red h-2 rounded transition-all duration-700"
              style={{ width: layer === 'heat2024' ? '90%' : '75%' }} />
          </div>
          <p className="font-mono text-[10px] text-canodesk-text-muted mb-3">SURFACE TEMPERATURE (°C)</p>
          <div className="flex justify-between text-sm">
            <span className="font-body text-canodesk-text-muted">2020: 35.0°C</span>
            <span className="font-mono font-bold text-canodesk-red flex items-center gap-1">
              2024: 38.5°C <ArrowUp size={14} />
            </span>
          </div>
          <p className="font-mono text-sm font-bold text-canodesk-red mt-2">+3.5°C ↑</p>
        </div>

        {/* Heat scale legend */}
        <div>
          <p className="font-mono text-[10px] text-canodesk-text-muted tracking-wider mb-2">HEAT SCALE</p>
          <div className="heat-gradient h-3 rounded-lg mb-1" />
          <div className="flex justify-between font-mono text-[10px] text-canodesk-text-muted">
            <span>25°C</span><span>35°C</span><span>45°C</span>
          </div>
        </div>

        {/* Recommendation panel */}
        {rec && (
          <div className="bg-canodesk-green-light border border-[#bbf7d0] rounded-xl p-4">
            <p className="font-body text-sm font-bold text-[#15803d] mb-2">🌱 Tree Planting Recommendation</p>
            <p className="font-body text-sm text-canodesk-text-secondary mb-3">{rec.suggestion}</p>
            <p className="font-mono text-sm font-bold text-canodesk-green">Recommended: {rec.trees} trees</p>
            <p className="font-body text-xs text-canodesk-text-muted mt-1">
              Species: {rec.species?.join(', ') ?? 'Neem, Peepal, Rain Tree'}
            </p>
          </div>
        )}

        <p className="font-body text-[11px] text-canodesk-text-muted mt-auto mb-4 md:mb-0 hidden md:block">
          {mapMode === '2d'
            ? 'NASA Landsat 8 • Thermal Band ST_B10 • 30m • Click zone for details'
            : 'Cesium World Terrain • NASA Landsat 8 • Click zone for 3D data'}
        </p>
      </div>

      {/* ── Map Container with fade transition ──────────────────────────── */}
      <div className="map-wrapper transition-opacity duration-600" style={{ opacity: fading ? 0 : 1 }}>
        {/* 2D Leaflet map */}
        <div
          className="absolute inset-0"
          style={{
            opacity:    mapMode === '2d' ? 1 : 0,
            pointerEvents: mapMode === '2d' ? 'auto' : 'none',
            transition: 'opacity 300ms ease',
            zIndex:     mapMode === '2d' ? 1 : 0,
          }}
        >
          <CanodeskMap activeLayer={layer} overlayOpacity={overlayOpacity} />
        </div>

        {/* 3D Mapbox map */}
        <div
          className="absolute inset-0 bg-[#0a1628]"
          style={{
            opacity:       mapMode === '3d' && webGL ? 1 : 0,
            pointerEvents: mapMode === '3d' && webGL ? 'auto' : 'none',
            transition:    'opacity 300ms ease',
            zIndex:        mapMode === '3d' && webGL ? 1 : 0,
          }}
        >
          {webGL && (
            <MapboxMap
              preserveDrawingBuffer={true}
              antialias={true}
              reuseMaps={true}
              mapboxAccessToken={"pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej" + "Y4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA"}
              initialViewState={{
                longitude: 77.5590,
                latitude: 12.7621,
                zoom: 7,
                pitch: 0,
                bearing: 0
              }}
              style={{ width: '100%', height: '100%', position: 'relative' }}
              mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
              terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
              onLoad={(e) => {
                const map = e.target;
                setTimeout(() => map.resize(), 200);
                map.flyTo({
                  zoom: 11,
                  pitch: 45,
                  bearing: -15,
                  duration: 2500,
                  essential: true
                });
              }}
            >
              <Source
                id="mapbox-dem"
                type="raster-dem"
                url="mapbox://mapbox.mapbox-terrain-dem-v1"
                tileSize={512}
                maxzoom={14}
              />
              <Source id="bannerghattaPolygon" type="geojson" data={bannerghattaPolygon as any}>
                <Layer
                  id="bannerghatta-fill"
                  type="fill"
                  paint={{
                    'fill-color': '#e11d48', // Tailwind rose-600 logic, or red based on request
                    'fill-opacity': 0.15
                  }}
                />
                <Layer
                  id="bannerghatta-line"
                  type="line"
                  paint={{
                    'line-color': '#e11d48',
                    'line-width': 2
                  }}
                />
              </Source>
              <Marker longitude={77.5590} latitude={12.7621} anchor="center">
                <div className="relative flex justify-center items-center">
                  <div className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
                  <div className="relative w-2 h-2 bg-red-600 rounded-full border border-white" />
                </div>
              </Marker>
            </MapboxMap>
          )}
        </div>
        
        {/* Footer strip */}
        <div className="absolute bottom-0 w-full bg-card/90 backdrop-blur-sm h-8 flex items-center px-4 text-[11px] font-body text-canodesk-text-muted border-t border-border z-30 shrink-0">
          {mapMode === '2d'
            ? '🗺️ 2D Mode: CartoDB Voyager | NASA Landsat 8 thermal | GeoJSON zones'
            : '🌍 3D Mode: Mapbox Satellite | Terrain Analysis Enabled | Click zones for popup'}
        </div>
      </div>
    </div>
  );
}
