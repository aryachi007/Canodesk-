import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchGreenTrends, fetchRecommendations, type Recommendation } from '@/lib/api';
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

const ndviData = [
  { year: '2020', ndvi: 0.74 },
  { year: '2021', ndvi: 0.71 },
  { year: '2022', ndvi: 0.68 },
  { year: '2023', ndvi: 0.65 },
  { year: '2024', ndvi: 0.62 }
];

export default function GreenCover() {
  const [year, setYear] = useState<2020 | 2024>(2024);
  const [ndvi2020, setNdvi2020] = useState(0.74);
  const [ndvi2024, setNdvi2024] = useState(0.62);
  const [greenLoss, setGreenLoss] = useState(16.2);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [is3D, setIs3D] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const dataSourceRef = useRef<Cesium.GeoJsonDataSource | null>(null);

  useEffect(() => {
    fetchGreenTrends().then(t => {
      setNdvi2020(t.ndvi2020);
      setNdvi2024(t.ndvi2024);
      setGreenLoss(t.greenLossPercent || 16.2);
    });
    fetchRecommendations().then(setRec);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIs3D(false); // default to 2D on mobile
    }
  }, []);

  // Cesium setup
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

      const strokeColor = year === 2024 ? Cesium.Color.fromCssColorString('#ea580c') : Cesium.Color.fromCssColorString('#16a34a');
      
      Cesium.GeoJsonDataSource.load(bannerghattaPolygon as any, {
        stroke: strokeColor,
        fill: strokeColor.withAlpha(0.3),
        strokeWidth: 2
      }).then(dataSource => {
        viewer.dataSources.add(dataSource);
        dataSourceRef.current = dataSource;
      });

      viewerRef.current = viewer;
    }
    
    return () => {
      if (viewerRef.current && !is3D) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        dataSourceRef.current = null;
      }
    };
  }, [is3D]);

  // Handle year color toggle in Cesium
  useEffect(() => {
    if (is3D && dataSourceRef.current) {
        const color = year === 2024 ? Cesium.Color.fromCssColorString('#ea580c') : Cesium.Color.fromCssColorString('#16a34a');
        const entities = dataSourceRef.current.entities.values;
        for (let i = 0; i < entities.length; i++) {
           const entity = entities[i];
           if (entity.polygon) {
              entity.polygon.material = new Cesium.ColorMaterialProperty(color.withAlpha(0.3));
              entity.polygon.outlineColor = new Cesium.ConstantProperty(color);
           }
        }
    }
  }, [year, is3D]);

  useEffect(() => {
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  const ndvi = year === 2020 ? ndvi2020 : ndvi2024;
  const polygonColor = year === 2024 ? '#ea580c' : '#16a34a';

  return (
    <div className="map-page-container page-transition pt-16 h-[100dvh] w-full flex md:flex-row flex-col">
      {/* LEFT SIDEBAR */}
      <div className="map-sidebar relative z-10 shadow-xl shrink-0">
        <Link to="/" className="flex items-center gap-1 text-xs hover:text-green-500 transition-colors mb-2" style={{ color: '#94a3b8' }}>
          <ArrowLeft size={14} /> Home / Vegetation Analysis
        </Link>
        
        {/* 16.2% LOST stat */}
        <div className="text-center py-2">
          <p className="font-mono text-[64px] font-bold text-red-500 tracking-tight leading-none mb-1">
            {greenLoss}%
          </p>
          <p className="font-body text-sm text-red-500 tracking-[2px] font-bold uppercase py-1">
            LOST
          </p>
        </div>

        {/* Year toggle */}
        <div className="flex bg-slate-800 rounded-full p-1 h-12 shadow-inner border border-slate-700">
            <button
              onClick={() => setYear(2020)}
              className={`flex-1 rounded-full font-body font-bold text-sm transition-all duration-300
                ${year === 2020 ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              2020
            </button>
            <button
              onClick={() => setYear(2024)}
              className={`flex-1 rounded-full font-body font-bold text-sm transition-all duration-300
                ${year === 2024 ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              2024
            </button>
        </div>

        {/* NDVI values */}
        <div className="flex items-center justify-between font-mono font-bold text-2xl mt-2">
             <div className="text-green-500">{ndvi2020.toFixed(2)}</div>
             <div className="text-orange-500">{ndvi2024.toFixed(2)}</div>
        </div>

        {/* NDVI health gradient bar */}
        <div className="relative pt-2">
            <div className="h-3 rounded-full overflow-hidden border border-slate-700 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
            <div className="absolute top-2 h-3 flex items-center transition-all duration-500" style={{ left: `${(ndvi / 1.0) * 100}%` }}>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-white -translate-x-1/2 -translate-y-[12px]" />
            </div>
            <p className="font-mono text-[10px] text-center mt-2 text-slate-400">
              NDVI SCORE
            </p>
        </div>

        {/* VEGETATION DECLINING badge */}
        <div className="flex justify-center mt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-orange-500/50 bg-orange-900/50 text-orange-400 text-xs font-bold tracking-wider">
             VEGETATION DECLINING
          </span>
        </div>

        {/* Recharts AreaChart */}
        <div style={{ height: 160, background: '#0f172a', borderRadius: 8 }} className="mt-2 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ndviData}>
              <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" domain={[0.5, 0.8]} tick={{ fontSize: 12 }} width={35} />
              <Tooltip 
                 contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="ndvi"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tree recommendation card */}
        <div className="bg-slate-800/80 border border-green-500/30 rounded-xl p-5 mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🌴</span>
            <span className="font-body text-sm font-bold text-green-400">Restoration Policy</span>
          </div>
          <p className="font-body text-sm text-slate-300 mb-4 leading-relaxed">
            {rec?.suggestion || "Priority afforestation required across southern periphery. Enhance existing buffer zones."}
          </p>
          <div className="text-xs text-slate-400 font-body">
            Replanting Targets: {rec?.species?.join(', ') || 'Native Shrubland, Bamboo'}
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
              key={year}
              data={bannerghattaPolygon as any}
              style={{
                color: polygonColor,
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
