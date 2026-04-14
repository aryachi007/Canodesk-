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

const bannerghattaPolygon: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.500047, 12.821137],
            [77.500047, 12.703160],
            [77.618025, 12.700122],
            [77.618531, 12.819112],
            [77.500047, 12.821137]
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
  const polygonEntityRef = useRef<Cesium.Entity | null>(null);

  useEffect(() => {
    fetchGreenTrends().then(t => {
      setNdvi2020(t.ndvi2020);
      setNdvi2024(t.ndvi2024);
      setGreenLoss(t.greenLossPercent || 16.2);
    }).catch(() => {});
    fetchRecommendations().then(setRec);
  }, []);

  // Mobile defaults to 2D
  useEffect(() => {
    if (window.innerWidth < 768) setIs3D(false);
  }, []);

  // Cesium setup
  useEffect(() => {
    if (!is3D) return;
    if (!containerRef.current) return;
    if (viewerRef.current) return;

    let viewer: Cesium.Viewer;
    try {
      // @ts-ignore
      const terrainProvider = Cesium.createWorldTerrain({ requestVertexNormals: true });
      // @ts-ignore
      const imageryProvider = new Cesium.IonImageryProvider({ assetId: 2 });
      
      viewer = new Cesium.Viewer(containerRef.current, {
        terrainProvider,
        imageryProvider,
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
        shadows: false
      });

      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0f172a');
      // @ts-ignore
      viewer.scene.globe.terrainExaggeration = 1.5;

      // Far initial view
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(77.5590, 12.7621, 80000),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 }
      });

      // Fly in
      setTimeout(() => {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(77.5590, 12.7621, 12000),
          orientation: {
            heading: Cesium.Math.toRadians(-15),
            pitch: Cesium.Math.toRadians(-35),
            roll: 0
          },
          duration: 3.0,
          easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
        });
      }, 500);

      const bannerghattaCoords: number[] = [
        77.500047, 12.821137,
        77.500047, 12.703160,
        77.618025, 12.700122,
        77.618531, 12.819112,
        77.500047, 12.821137
      ];

      const initColor = year === 2020
        ? Cesium.Color.fromCssColorString('#16a34a')
        : Cesium.Color.fromCssColorString('#ea580c');

      const entity = viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(bannerghattaCoords),
          material: initColor.withAlpha(0.3),
          outline: true,
          outlineColor: initColor,
          outlineWidth: 3,
          // @ts-ignore
          clampToGround: true
        }
      });
      polygonEntityRef.current = entity;

      viewerRef.current = viewer;
    } catch (e) {
      console.error('Cesium GreenCover init error:', e);
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
      polygonEntityRef.current = null;
    };
  }, [is3D]);

  // Update polygon color when year changes
  useEffect(() => {
    if (is3D && polygonEntityRef.current) {
      const color = year === 2020
        ? Cesium.Color.fromCssColorString('#16a34a')
        : Cesium.Color.fromCssColorString('#ea580c');
      if (polygonEntityRef.current.polygon) {
        polygonEntityRef.current.polygon.material = new Cesium.ColorMaterialProperty(color.withAlpha(0.3));
        (polygonEntityRef.current.polygon.outlineColor as Cesium.ConstantProperty).setValue(color);
      }
    }
  }, [year, is3D]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, []);

  const ndvi = year === 2020 ? ndvi2020 : ndvi2024;
  const polygonColor = year === 2020 ? '#16a34a' : '#ea580c';

  return (
    <div className="map-page-container page-transition pt-16 h-[100dvh] w-full flex md:flex-row flex-col overflow-hidden">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <div className="map-sidebar shrink-0">
        <Link to="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-400 transition-colors mb-4">
          <ArrowLeft size={14} /> Home / Green Cover
        </Link>

        {/* Small label */}
        <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">
          CANODESK GREEN MONITOR
        </div>

        {/* 16.2% LOST */}
        <div className="text-left py-1 mb-2">
          <p className="font-mono text-5xl font-bold text-red-500 leading-none">
            {greenLoss}%
          </p>
          <p className="text-xs text-slate-400 mt-1">Green Cover Lost Since 2020</p>
        </div>

        {/* Year toggle — immediately below stat */}
        <div className="year-toggle flex bg-slate-800 rounded-full p-1 shadow-inner border border-slate-700 mb-4">
          <button
            onClick={() => setYear(2020)}
            className={`flex-1 rounded-full font-bold text-sm transition-all duration-300 py-2
              ${year === 2020 ? 'bg-green-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            2020
          </button>
          <button
            onClick={() => setYear(2024)}
            className={`flex-1 rounded-full font-bold text-sm transition-all duration-300 py-2
              ${year === 2024 ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            2024
          </button>
        </div>

        {/* NDVI row */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-sm text-slate-300">2020: {ndvi2020.toFixed(2)}</span>
          <span className="font-mono text-sm text-orange-400">2024: {ndvi2024.toFixed(2)}</span>
        </div>

        {/* NDVI health gradient bar */}
        <div className="mb-4">
          <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-600 border border-slate-700 relative overflow-visible">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-4 rounded-sm bg-white shadow-lg border border-slate-400 transition-all duration-500"
              style={{ left: `calc(${(1.0 - ndvi) / 0.5 * 100}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0.50</span>
            <span className="text-slate-300">{ndvi.toFixed(2)}</span>
            <span>1.00</span>
          </div>
        </div>

        {/* VEGETATION DECLINING badge */}
        <div className="flex mb-4">
          <span className="inline-flex items-center px-3 py-1 bg-orange-900/30 rounded border border-orange-500/50 text-orange-400 text-xs font-bold tracking-wider">
            VEGETATION DECLINING
          </span>
        </div>

        {/* Recharts AreaChart 160px */}
        <div style={{ height: 160, background: '#0f172a', borderRadius: 8, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ndviData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" domain={[0.5, 0.8]} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #16a34a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(val: number) => [val.toFixed(2), 'NDVI']}
              />
              <Area type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={2} fill="url(#ndviGrad)" dot={{ fill: '#16a34a', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tree recommendation */}
        <div className="bg-slate-800/80 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🌴</span>
            <span className="text-sm font-bold text-green-400">Restoration Recommendation</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-2">
            {rec?.suggestion || 'Priority afforestation required across southern periphery and existing buffer zones.'}
          </p>
          <div className="text-xs text-slate-400">
            Target species: {rec?.species?.join(', ') || 'Native Shrubland, Bamboo, Teak'}
          </div>
        </div>
      </div>

      {/* ── RIGHT MAP ─────────────────────────────────────────────────────── */}
      <div className="map-wrapper flex-1 relative bg-[#0f172a] min-h-0">

        {/* 2D/3D Toggle — top right */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 999 }}>
          <button
            onClick={() => setIs3D(!is3D)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: '9999px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {is3D ? '2D View' : '3D View'}
          </button>
        </div>

        {is3D ? (
          <div
            id="cesiumContainerGreen"
            ref={containerRef}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          />
        ) : (
          <MapContainer
            center={[12.7621, 77.5590]}
            zoom={11}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            touchZoom={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="CartoDB"
            />
            <GeoJSON
              key={year}
              data={bannerghattaPolygon}
              style={{ color: polygonColor, weight: 2, fillOpacity: 0.3, fillColor: polygonColor }}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
