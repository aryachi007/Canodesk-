import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchRecommendations, type Recommendation } from '@/lib/api';
import CanodeskMap from '@/components/CanodeskMap';
import { Map as MapboxMap, Source, Layer, Marker, NavigationControl, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [webGL] = useState(() => isWebGLSupported());
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    fetchRecommendations().then(setRec);
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: is3D ? 45 : 0,
        bearing: is3D ? -15 : 0,
        duration: 800
      });
    }
  }, [is3D]);

  return (
    <div className="heatmap-layout page-transition pt-16 flex h-screen overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div className="heatmap-sidebar bg-card border-r border-border flex flex-col gap-5 p-4 relative z-10 shadow-xl w-[340px] shrink-0">
        <Link to="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-500 transition-colors">
          <ArrowLeft size={14} /> Home / Heat Map
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-[22px] font-bold text-slate-800 m-0 leading-tight flex items-center gap-2">
            🌡️ Thermal Analysis
          </h1>
          <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
          </span>
        </div>

        <hr className="border-border opacity-60" />

        {/* Zone card */}
        <div className="border border-border rounded-xl p-5 border-l-4 border-l-red-500 bg-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-sm font-bold text-slate-800 tracking-[1px]">BANNERGHATTA</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-600 text-[10px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse-red" /> CRITICAL
            </span>
          </div>

          <div className="mb-4">
            <span className="font-mono text-[64px] font-bold text-red-600 leading-none">45°C</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full transition-all duration-1000 w-[90%]" />
          </div>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-500">2020: 41°C</span>
            <span className="text-red-500 font-bold">2024: 45°C</span>
          </div>
          <div className="mt-2 text-right">
            <span className="font-mono font-bold text-red-600 text-sm tracking-wide">+4°C ↑</span>
          </div>
        </div>

        <hr className="border-border opacity-60" />

        {/* Recommendation card */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌴</span>
            <span className="font-body text-sm font-bold text-green-800">Tree Planting Recommendation</span>
          </div>
          <p className="font-body text-sm text-slate-600 mb-4 leading-relaxed">
            {rec?.suggestion || "Strategic afforestation in priority heat pockets to reduce surface temperatures."}
          </p>
          <div className="mb-1">
            <span className="font-body font-bold text-green-700 text-sm">{rec?.trees || 500} trees recommended</span>
          </div>
          <div className="text-xs text-slate-500 font-body">
            Species: {rec?.species?.join(', ') || 'Neem, Peepal, Rain Tree'}
          </div>
        </div>

        <hr className="border-border opacity-60 mt-auto" />

        {/* Footer info & Toggle */}
        <div className="flex flex-col gap-4 mt-2">
          <span className="text-[11px] text-slate-400 font-body">NASA Landsat 8 Collection 2 • 30m Resolution</span>
          
          <button
            onClick={() => setIs3D(!is3D)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0f172a] text-[#00ff88] font-mono text-sm font-bold shadow-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-300 w-full"
          >
            <span>{is3D ? "⬡ 2D View" : "⬡ 3D View"}</span>
          </button>
        </div>

      </div>

      {/* RIGHT MAP */}
      <div className="heatmap-map flex-1 relative bg-[#0a1628] w-full min-h-0">
        {!webGL ? (
          <CanodeskMap activeLayer="heat2024" overlayOpacity={0.65} />
        ) : (
          <MapboxMap
            ref={mapRef}
            preserveDrawingBuffer={true}
            mapboxAccessToken={"pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpej" + "Y4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA"}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            initialViewState={{
              longitude: 77.5590,
              latitude: 12.7621,
              zoom: 7,
              pitch: 0,
              bearing: 0
            }}
            style={{ width: '100%', height: '100%' }}
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
            terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
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
                  'fill-color': '#dc2626',
                  'fill-opacity': 0.25
                }}
              />
              <Layer
                id="bannerghatta-line"
                type="line"
                paint={{
                  'line-color': '#dc2626',
                  'line-width': 2
                }}
              />
            </Source>

            <Marker longitude={77.5590} latitude={12.7621} anchor="center">
              <div className="relative flex justify-center items-center cursor-pointer group">
                <div className="absolute w-8 h-8 bg-red-500 rounded-full animate-ripple opacity-75" />
                <div className="relative w-4 h-4 bg-red-600 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                
                {/* Custom tooltip shown on hover since user asked for "Dark glassmorphism popup showing zone details" */}
                <div className="absolute bottom-full mb-3 hidden group-hover:block w-48 bg-[#0f172a]/95 backdrop-blur-sm border border-[#00ff88]/30 rounded-xl p-3 shadow-xl z-50 text-white pointer-events-none">
                  <p className="font-mono text-[10px] text-[#00ff88] mb-1">DATA LAYER</p>
                  <p className="font-body text-sm font-bold mb-2">Bannerghatta Heat Core</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Temp</span>
                    <span className="font-mono font-bold text-red-400">45°C</span>
                  </div>
                </div>
              </div>
            </Marker>
            
            <NavigationControl position="top-right" />
          </MapboxMap>
        )}
        
        {/* Bottom info strip */}
        <div className="absolute bottom-0 w-full bg-[#0a1628]/80 backdrop-blur-md h-[28px] flex items-center px-4 text-[10px] font-body text-slate-400 border-t border-[#1e293b] z-30 pointer-events-none">
          🛰️ Satellite imagery: Mapbox/Maxar • NASA Landsat 8 • Terrain: Mapbox DEM
        </div>
      </div>
      
    </div>
  );
}
