import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchRecommendations, type Recommendation } from '@/lib/api';
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

function createPulsingMarkerCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 40;
  canvas.height = 40;
  const ctx = canvas.getContext('2d')!;

  // Outer glow ring
  ctx.beginPath();
  ctx.arc(20, 20, 18, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Inner solid circle
  ctx.beginPath();
  ctx.arc(20, 20, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  // White center dot
  ctx.beginPath();
  ctx.arc(20, 20, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  return canvas;
}

export default function HeatMap() {
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [is3D, setIs3D] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    fetchRecommendations().then(setRec);
  }, []);

  // Mobile defaults to 2D
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIs3D(false);
    }
  }, []);

  // Cesium setup effect
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

      // Dark background
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0f172a');
      // @ts-ignore
      viewer.scene.globe.terrainExaggeration = 1.5;

      // Set initial far position
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(77.5590, 12.7621, 80000),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 }
      });

      // Fly in smoothly after short delay
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

      // Red polygon
      viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            77.500047, 12.821137,
            77.500047, 12.703160,
            77.618025, 12.700122,
            77.618531, 12.819112,
            77.500047, 12.821137
          ]),
          material: Cesium.Color.RED.withAlpha(0.25),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ef4444'),
          outlineWidth: 3,
          // @ts-ignore
          clampToGround: true
        }
      });

      // Pulsing billboard marker
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(77.5590, 12.7621, 100),
        billboard: {
          image: createPulsingMarkerCanvas(),
          width: 40,
          height: 40,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });

      viewerRef.current = viewer;
    } catch (e) {
      console.error('Cesium init error:', e);
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, [is3D]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
    };
  }, []);

  return (
    <div className="map-page-container page-transition pt-16 h-[100dvh] w-full flex md:flex-row flex-col overflow-hidden">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <div className="map-sidebar shrink-0">
        <Link to="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-400 transition-colors">
          <ArrowLeft size={14} /> Home / Heat Map
        </Link>

        {/* Small label */}
        <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">
          CANODESK HEAT MONITOR
        </div>

        {/* Zone name + CRITICAL badge */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white leading-tight">
            Bannerghatta National Park
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-900/60 border border-red-500/60 text-red-400 text-[10px] font-bold tracking-wider uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> CRITICAL
          </span>
        </div>

        {/* Heat score 45°C */}
        <div className="flex flex-col mb-4">
          <span className="font-mono text-5xl font-bold text-red-500 leading-none">45°C</span>
          <span className="text-xs text-slate-400 mt-1">Surface Temperature 2024</span>
        </div>

        {/* Red progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-mono">
            <span>Heat Index</span>
            <span className="text-red-400">90%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-1000"
              style={{ width: '90%' }}
            />
          </div>
        </div>

        {/* Comparison row */}
        <div className="flex items-center justify-between font-mono text-sm mb-4">
          <span className="text-slate-300">2020: 38°C → 2024: 45°C</span>
          <span className="text-red-500 font-bold">↑</span>
        </div>

        {/* Divider line */}
        <hr className="border-slate-700 my-4" />

        {/* Tree recommendation card */}
        <div className="bg-slate-800 border border-green-500/30 rounded-xl p-4 mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base text-green-400">🍃</span>
            <span className="text-sm font-bold text-green-400">Tree Planting Recommendation</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            {rec?.suggestion || 'Plant 500 native shade trees along Bannerghatta Road and forest buffer zones.'}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-green-400 text-sm">{rec?.trees || 500} trees</span>
            <span className="text-xs text-slate-400">{rec?.species?.slice(0, 2).join(', ') || 'Neem, Peepal'}</span>
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
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="CartoDB"
            />
            <GeoJSON
              data={bannerghattaPolygon}
              style={{ color: '#ef4444', weight: 2, fillOpacity: 0.25, fillColor: '#ef4444' }}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
