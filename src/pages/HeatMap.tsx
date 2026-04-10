import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowLeft } from 'lucide-react';
import { fetchRecommendations, type Recommendation } from '@/lib/api';
import CanodeskMap from '@/components/CanodeskMap';

type HeatLayer = 'heat2020' | 'heat2024';

export default function HeatMap() {
  const [rec, setRec]           = useState<Recommendation | null>(null);
  const [layer, setLayer]       = useState<HeatLayer>('heat2024');

  useEffect(() => { fetchRecommendations().then(setRec); }, []);

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

        {/* Layer Toggle */}
        <div>
          <p className="font-mono text-[10px] text-canodesk-text-muted tracking-wider mb-2">SELECT LAYER</p>
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
          NASA Landsat 8 • Thermal Band ST_B10 • 30m Resolution • Click zone on map for details
        </p>
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative hidden lg:flex flex-col">
        <div className="flex-1 relative">
          <CanodeskMap activeLayer={layer} />
        </div>
        {/* Footer strip */}
        <div className="bg-card/90 backdrop-blur-sm h-8 flex items-center px-4 text-[11px] font-body text-canodesk-text-muted border-t border-border z-10 shrink-0">
          🛰️ Satellite: ESRI World Imagery &nbsp;|&nbsp; Thermal overlay: NASA Landsat 8 &nbsp;|&nbsp; GeoJSON: Bannerghatta zone boundary
        </div>
      </div>
    </div>
  );
}
