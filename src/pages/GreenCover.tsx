import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Map as MapIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchGreenTrends } from '@/lib/api';
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

export default function GreenCover() {
  const [year, setYear] = useState<2020 | 2024>(2024);
  const [ndvi2020, setNdvi2020] = useState(0.74);
  const [ndvi2024, setNdvi2024] = useState(0.62);
  const [greenLoss, setGreenLoss] = useState(16.2);
  const [loading, setLoading] = useState(true);
  const [is3D, setIs3D] = useState(true);
  const [webGL] = useState(() => isWebGLSupported());
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    fetchGreenTrends().then(t => {
      setNdvi2020(t.ndvi2020);
      setNdvi2024(t.ndvi2024);
      setGreenLoss(t.greenLossPercent || 16.2);
      setLoading(false);
    }).catch(() => {
        setLoading(false);
    });
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

  // Smooth SetPaintProperty handling
  useEffect(() => {
    if (mapRef.current && mapRef.current.getMap()) {
      const map = mapRef.current.getMap();
      if (map.getLayer('bannerghatta-fill')) {
        const newColor = year === 2020 ? '#16a34a' : '#ea580c';
        
        // Smooth transition trick
        map.setPaintProperty('bannerghatta-fill', 'fill-opacity', 0);
        setTimeout(() => {
          if (map.getStyle()) {
             map.setPaintProperty('bannerghatta-fill', 'fill-color', newColor);
             map.setPaintProperty('bannerghatta-fill', 'fill-opacity', 0.3);
          }
        }, 300);
      }
    }
  }, [year]);

  const activeLayer = year === 2020 ? 'ndvi2020' : 'ndvi2024';
  const ndvi = year === 2020 ? ndvi2020 : ndvi2024;
  const polygonColor = year === 2020 ? '#16a34a' : '#ea580c';
  
  const ndviData = [
    { year: '2020', ndvi: ndvi2020 },
    { year: '2024', ndvi: ndvi2024 },
  ];

  return (
    <div className="heatmap-layout page-transition pt-16 flex md:flex-row flex-col h-screen overflow-hidden">
      
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="heatmap-sidebar bg-card border-r border-border flex flex-col gap-4 p-4 relative z-10 shadow-xl overflow-y-auto w-full md:w-[340px] shrink-0">
        <Link to="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-500 transition-colors">
          <ArrowLeft size={14} /> Home / Vegetation Analysis
        </Link>
        
        {/* YEAR TOGGLE (FIRST ELEMENT) */}
        <div className="year-toggle-mobile md:static md:w-full md:transform-none md:p-0 md:bg-transparent md:border-none md:shadow-none md:justify-start">
          <div className="bg-slate-100 rounded-full p-1 flex h-12 w-full shadow-inner border border-slate-200">
            <button
              onClick={() => setYear(2020)}
              className={`flex-1 rounded-full font-body font-bold text-sm transition-all duration-300 md:px-4
                ${year === 2020 ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              🌳 2020
            </button>
            <button
              onClick={() => setYear(2024)}
              className={`flex-1 rounded-full font-body font-bold text-sm transition-all duration-300 md:px-4
                ${year === 2024 ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              2024 🔴
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-[22px] font-bold text-slate-800 m-0 flex items-center gap-2">
            🌿 Vegetation Analysis
          </h1>
          <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> LIVE
          </span>
        </div>

        <hr className="border-border opacity-60" />

        {/* Hero stat */}
        <div className="text-center py-2 animate-fadeUp">
          <p className="font-mono text-[64px] font-bold text-red-600 tracking-tight leading-none mb-2">
            {loading ? '...' : `${greenLoss}%`}
          </p>
          <p className="font-body text-sm text-red-700 tracking-[2px] font-bold uppercase bg-red-50 inline-block px-3 py-1 rounded border border-red-100">
            GREEN COVER LOST
          </p>
        </div>

        <hr className="border-border opacity-60" />

        {/* NDVI stats */}
        <div>
          <div className="flex items-center justify-between font-mono font-bold text-2xl mb-2">
             <div className="text-green-600">{ndvi2020.toFixed(2)}</div>
             <div className="text-orange-500">{ndvi2024.toFixed(2)}</div>
          </div>

          {/* NDVI position indicator bar */}
          <div className="relative pt-2">
            <div className="ndvi-gradient h-3 rounded-full overflow-hidden border border-slate-200" />
            <div className="absolute top-2 h-3 flex items-center transition-all duration-500" style={{ left: `${(ndvi / 1.0) * 100}%` }}>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-slate-800 -translate-x-1/2 -translate-y-[12px]" />
            </div>
            <p className="font-mono text-[10px] text-center mt-3 text-slate-400">
              {ndvi.toFixed(2)} — {year === 2020 ? 'Dense Vegetation' : 'Moderate Vegetation'}
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-xs font-bold tracking-wider">
            🔻 VEGETATION DECLINING
          </span>
        </div>

        {/* NDVI trend chart */}
        <div className="bg-[#0f172a] rounded-xl p-4 shadow-inner mt-2">
          <p className="font-mono text-[10px] text-slate-400 mb-2 tracking-wider font-bold">NDVI TREND 2020 → 2024</p>
          <div style={{ width: '100%', height: '130px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ndviData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #22c55e', borderRadius: 8, color: '#22c55e', fontSize: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Area
                  type="monotone"
                  dataKey="ndvi"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#ndviGrad)"
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <hr className="border-border opacity-60 mt-auto" />

        <div className="flex flex-col gap-4 mt-2">
          <span className="text-[11px] text-slate-400 font-body">ESA Sentinel-2 SR Harmonized • 10m Resolution</span>
          
          <button
            onClick={() => setIs3D(!is3D)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0f172a] text-[#00ff88] font-mono text-sm font-bold shadow-lg hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-300 w-full"
          >
            <span>{is3D ? "⬡ 2D View" : "⬡ 3D View"}</span>
          </button>
        </div>

      </div>

      {/* ── Map Container ────────────────────────────────────────────────── */}
      <div className="heatmap-map flex-1 relative bg-[#0a1628] w-full min-h-0">
        {!webGL ? (
          <CanodeskMap activeLayer={activeLayer} overlayOpacity={0.65} />
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
                  'fill-color': polygonColor,
                  'fill-opacity': 0.3,
                  'fill-opacity-transition': { duration: 300, delay: 0 },
                  'fill-color-transition': { duration: 300, delay: 0 }
                }}
              />
              <Layer
                id="bannerghatta-line"
                type="line"
                paint={{
                  'line-color': polygonColor,
                  'line-width': 2,
                  'line-color-transition': { duration: 300, delay: 0 }
                }}
              />
            </Source>

            <Marker longitude={77.5590} latitude={12.7621} anchor="center">
              <div className="relative flex justify-center items-center group" style={{ transition: 'all 500ms ease' }}>
                <div className={`absolute w-8 h-8 rounded-full animate-ripple opacity-75 ${year === 2020 ? 'bg-green-500' : 'bg-orange-500'}`} />
                <div className={`relative w-4 h-4 rounded-full border-[3px] border-white shadow-lg ${year === 2020 ? 'bg-green-600' : 'bg-orange-600'}`} />
                
                <div className="absolute bottom-full mb-3 hidden group-hover:block w-48 bg-[#0f172a]/95 backdrop-blur-sm border border-[#00ff88]/30 rounded-xl p-3 shadow-xl z-50 text-white pointer-events-none">
                  <p className="font-mono text-[10px] text-[#00ff88] mb-1">DATA LAYER</p>
                  <p className="font-body text-sm font-bold mb-2">Vegetation Cover</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">NDVI</span>
                    <span className="font-mono font-bold text-green-400">{ndvi.toFixed(2)}</span>
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
