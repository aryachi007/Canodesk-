import { lazy, Suspense, useEffect, useState, useTransition } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowLeft, Globe, Map } from 'lucide-react';
import { fetchRecommendations, type Recommendation } from '@/lib/api';
import CanodeskMap from '@/components/CanodeskMap';

// Lazy-load Cesium to keep initial bundle small
const CesiumMap = lazy(() => import('@/components/CesiumMap'));

type HeatLayer  = 'heat2020' | 'heat2024';
type MapMode    = '2d' | '3d';

export default function HeatMap() {
  const [rec,       setRec]       = useState<Recommendation | null>(null);
  const [layer,     setLayer]     = useState<HeatLayer>('heat2024');
  const [mapMode,   setMapMode]   = useState<MapMode>('2d');
  const [fading,    setFading]    = useState(false);
  const [,          startTransition] = useTransition();

  useEffect(() => { fetchRecommendations().then(setRec); }, []);

  // ── Smooth fade transition when toggling 2D ↔ 3D ────────────────────────────
  const toggleMode = (next: MapMode) => {
    if (next === mapMode) return;
    setFading(true);
    setTimeout(() => {
      startTransition(() => setMapMode(next));
      setFading(false);
    }, 300);
  };

  return (
    <div className="h-screen flex pt-16">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[340px] shrink-0 bg-card border-r border-border overflow-y-auto p-6 flex flex-col gap-5">

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
                ${mapMode === '2d'
                  ? 'bg-canodesk-green text-white border-canodesk-green shadow-lg shadow-green-500/20'
                  : 'border-border text-canodesk-text-muted hover:border-canodesk-green hover:text-canodesk-green'}`}
            >
              <Map size={14} /> 2D View
            </button>
            <button
              onClick={() => toggleMode('3d')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-body font-semibold text-sm border transition-all duration-300
                ${mapMode === '3d'
                  ? 'bg-canodesk-navy text-white border-canodesk-navy shadow-lg'
                  : 'border-border text-canodesk-text-muted hover:border-canodesk-navy hover:text-canodesk-navy'}`}
            >
              <Globe size={14} /> 3D View
            </button>
          </div>
          {mapMode === '3d' && (
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
              onClick={() => setLayer('heat2020')}
              className={`flex-1 rounded-[20px] font-body font-medium text-sm transition-all duration-300
                ${layer === 'heat2020' ? 'bg-card text-canodesk-green shadow' : 'text-canodesk-text-muted'}`}
            >
              🌡️ 2020
            </button>
            <button
              onClick={() => setLayer('heat2024')}
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
            {layer === 'heat2024' ? '45' : '41'}°C
          </p>
          <div className="w-full bg-muted rounded h-2 mb-2">
            <div className="bg-canodesk-red h-2 rounded transition-all duration-700"
              style={{ width: layer === 'heat2024' ? '90%' : '75%' }} />
          </div>
          <p className="font-mono text-[10px] text-canodesk-text-muted mb-3">CRITICAL THRESHOLD</p>
          <div className="flex justify-between text-sm">
            <span className="font-body text-canodesk-text-muted">2020: 41°C</span>
            <span className="font-mono font-bold text-canodesk-red flex items-center gap-1">
              2024: 45°C <ArrowUp size={14} />
            </span>
          </div>
          <p className="font-mono text-sm font-bold text-canodesk-red mt-2">+4°C ↑</p>
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

        <p className="font-body text-[11px] text-canodesk-text-muted mt-auto">
          {mapMode === '2d'
            ? 'NASA Landsat 8 • Thermal Band ST_B10 • 30m • Click zone for details'
            : 'Cesium World Terrain • NASA Landsat 8 • Click zone for 3D data'}
        </p>
      </div>

      {/* ── Map Container with fade transition ──────────────────────────── */}
      <div className="flex-1 relative hidden lg:flex flex-col">
        <div
          className="flex-1 relative"
          style={{
            opacity:    fading ? 0 : 1,
            transition: 'opacity 300ms ease',
          }}
        >
          {/* 2D Leaflet map */}
          <div
            className="absolute inset-0"
            style={{
              opacity:    mapMode === '2d' ? 1 : 0,
              pointerEvents: mapMode === '2d' ? 'all' : 'none',
              transition: 'opacity 300ms ease',
              zIndex:     mapMode === '2d' ? 1 : 0,
            }}
          >
            <CanodeskMap activeLayer={layer} />
          </div>

          {/* 3D Cesium map */}
          <div
            className="absolute inset-0"
            style={{
              opacity:    mapMode === '3d' ? 1 : 0,
              pointerEvents: mapMode === '3d' ? 'all' : 'none',
              transition: 'opacity 300ms ease',
              zIndex:     mapMode === '3d' ? 1 : 0,
            }}
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-[#0a1628]">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-4 border-canodesk-green border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="font-mono text-xs text-canodesk-green tracking-wider">LOADING 3D ENGINE...</p>
                  </div>
                </div>
              }
            >
              <CesiumMap activeLayer={layer} />
            </Suspense>
          </div>
        </div>

        {/* Footer strip */}
        <div className="bg-card/90 backdrop-blur-sm h-8 flex items-center px-4 text-[11px] font-body text-canodesk-text-muted border-t border-border z-30 shrink-0">
          {mapMode === '2d'
            ? '🗺️ 2D Mode: ESRI Satellite | NASA Landsat 8 thermal | GeoJSON zones'
            : '🌍 3D Mode: Cesium World Terrain | NASA Landsat 8 thermal | Click zones for popup'}
        </div>
      </div>
    </div>
  );
}
