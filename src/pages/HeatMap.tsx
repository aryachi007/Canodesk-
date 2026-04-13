import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchRecommendations, type Recommendation } from '@/lib/api';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

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

export default function HeatMap() {
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [is3D, setIs3D] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    fetchRecommendations().then(setRec);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIs3D(false); // default to 2D on mobile
    }
  }, []);

  useEffect(() => {
    if (is3D && containerRef.current && !viewerRef.current) {
      const viewer = new Cesium.Viewer(containerRef.current, {
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        homeButton: false,
        sceneModePicker: false,
        geocoder: false,
        infoBox: false,
        selectionIndicator: false,
        shadows: false,
        shouldAnimate: false
      });
      
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(77.5590, 12.7621, 15000),
        orientation: {
          heading: Cesium.Math.toRadians(-15),
          pitch: Cesium.Math.toRadians(-35),
          roll: 0
        },
        duration: 2.5
      });

      Cesium.GeoJsonDataSource.load(bannerghattaPolygon as any, {
        stroke: Cesium.Color.RED,
        fill: Cesium.Color.RED.withAlpha(0.3),
        strokeWidth: 2
      }).then(dataSource => {
        viewer.dataSources.add(dataSource);
      });

      viewerRef.current = viewer;
    }
    
    return () => {
      if (viewerRef.current && !is3D) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [is3D]);

  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-page-container page-transition pt-16 h-[100dvh] w-full flex md:flex-row flex-col">
      {/* LEFT SIDEBAR */}
      <div className="map-sidebar relative z-10 shadow-xl shrink-0">
        <Link to="/" className="flex items-center gap-1 text-xs transition-colors" style={{ color: '#94a3b8' }}>
          <ArrowLeft size={14} /> Home / Heat Map
        </Link>
        
        {/* Zone Name + CRITICAL Badge */}
        <div className="flex items-center justify-between mt-2">
          <h1 className="font-heading text-[22px] font-bold m-0 leading-tight">BANNERGHATTA</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-900 border border-red-500 text-red-500 text-[10px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> CRITICAL
          </span>
        </div>

        {/* Heat Score 45°C */}
        <div>
          <span className="font-mono text-[64px] font-bold text-red-500 leading-none">45°C</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div className="bg-red-500 h-full rounded-full w-[90%]" />
        </div>

        {/* Comparison Row */}
        <div className="flex items-center justify-between font-mono text-sm border-t border-slate-700 pt-3 mt-1">
          <span className="text-slate-400">2020: 41°C</span>
          <span className="text-red-400 font-bold flex items-center gap-2">2024: 45°C <span className="text-red-500 bg-red-500/20 px-2 py-1 rounded text-xs">+4°C ↑</span></span>
        </div>

        {/* Recommendation card */}
        <div className="bg-slate-800/80 border border-green-500/30 rounded-xl p-5 mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌴</span>
            <span className="font-body text-sm font-bold text-green-400">Tree Planting Recommendation</span>
          </div>
          <p className="font-body text-sm text-slate-300 mb-4 leading-relaxed">
            {rec?.suggestion || "Plant 500 native shade trees along Bannerghatta Road and forest buffer zones."}
          </p>
          <div className="mb-1">
            <span className="font-body font-bold text-green-400 text-sm">{rec?.trees || 500} trees recommended</span>
          </div>
          <div className="text-xs text-slate-400 font-body">
            Species: {rec?.species?.join(', ') || 'Neem, Peepal, Rain Tree'}
          </div>
        </div>
      </div>

      {/* RIGHT MAP */}
      <div className="map-wrapper flex-1 relative w-full h-full min-h-0 bg-[#0a1628]">
        {/* Toggle Button in Header */}
        <div className="absolute top-4 left-4 z-[999]">
          <button
            onClick={() => setIs3D(!is3D)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f172a]/80 backdrop-blur border border-white/20 text-white text-sm font-medium hover:bg-[#0f172a] transition-all shadow-lg"
          >
            Switch to {is3D ? '2D' : '3D'} View
          </button>
        </div>

        {is3D ? (
          <div 
             id="cesiumContainer" 
             ref={containerRef} 
             style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
          />
        ) : (
          <MapContainer
            center={[12.7621, 77.5590]}
            zoom={11}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            touchZoom={true}
            tap={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="CartoDB"
            />
            <GeoJSON
              data={bannerghattaPolygon as any}
              style={{
                color: '#dc2626',
                weight: 2,
                fillOpacity: 0.3
              }}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
