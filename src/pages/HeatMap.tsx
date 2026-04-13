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
      viewer = new Cesium.Viewer(containerRef.current, {
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
        shouldAnimate: false,
        skyBox: false,
        skyAtmosphere: new Cesium.SkyAtmosphere(),
      });

      // Dark background
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0f172a');

      // Set initial far position
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(77.5590, 12.7621, 80000),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0
        }
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

      // Red glowing polygon using entity (most reliable)
      const bannerghattaCoords: number[] = [
        77.500047, 12.821137,
        77.500047, 12.703160,
        77.618025, 12.700122,
        77.618531, 12.819112,
        77.500047, 12.821137
      ];

      viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(
            Cesium.Cartesian3.fromDegreesArray(bannerghattaCoords)
          ),
          material: Cesium.Color.fromCssColorString('#ef4444').withAlpha(0.25),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#ef4444'),
          outlineWidth: 3,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });

      // Try to also load from API, ignoring error
      Cesium.GeoJsonDataSource.load(
        'https://canodesk.onrender.com/api/zones/geojson',
        {
          stroke: Cesium.Color.fromCssColorString('#ef4444'),
          fill: Cesium.Color.fromCssColorString('#ef4444').withAlpha(0.25),
          strokeWidth: 3,
          clampToGround: true
        }
      ).then(ds => {
        if (!viewer.isDestroyed()) viewer.dataSources.add(ds);
      }).catch(() => { /* fallback polygon already added */ });

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

        {/* Zone name + CRITICAL badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white leading-tight font-mono tracking-widest">
              BANNERGHATTA
            </h1>
            <p className="text-xs text-slate-400 font-body mt-0.5">National Park, Bengaluru</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-900/60 border border-red-500/60 text-red-400 text-[10px] font-bold tracking-wider uppercase shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> CRITICAL
          </span>
        </div>

        {/* Heat score 45°C */}
        <div className="flex flex-col">
          <span className="font-mono text-5xl font-bold text-red-500 leading-none">45°C</span>
          <span className="text-xs text-slate-400 mt-1">Surface Temperature</span>
        </div>

        {/* Red progress bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-mono">
            <span>Heat Index</span>
            <span className="text-red-400">90%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full transition-all duration-1000"
              style={{ width: '90%' }}
            />
          </div>
        </div>

        {/* Comparison row */}
        <div className="flex items-center justify-between font-mono text-sm border-t border-slate-700 pt-3">
          <div className="text-slate-400">
            <div className="text-[10px] tracking-wider mb-1 uppercase">2020</div>
            <div className="text-lg font-bold text-slate-300">38°C</div>
          </div>
          <div className="text-red-500 font-bold text-xl">→</div>
          <div className="text-right">
            <div className="text-[10px] tracking-wider mb-1 uppercase text-red-400">2024</div>
            <div className="text-lg font-bold text-red-400">45°C</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/40 rounded px-2 py-1 text-xs text-red-400 font-bold">
            +7°C ↑
          </div>
        </div>

        {/* Tree recommendation card */}
        <div className="bg-slate-800/80 border border-green-500/30 rounded-xl p-4 mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🌴</span>
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
            onClick={() => setIs3D(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-all shadow-lg"
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
