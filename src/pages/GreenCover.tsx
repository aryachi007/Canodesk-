import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchGreenTrends } from '@/lib/api';
import CanodeskMap from '@/components/CanodeskMap';

type NdviLayer = 'ndvi2020' | 'ndvi2024';

export default function GreenCover() {
  const [year,        setYear]        = useState<2020 | 2024>(2024);
  const [ndvi2020,    setNdvi2020]    = useState(0.74);
  const [ndvi2024,    setNdvi2024]    = useState(0.62);
  const [greenLoss,   setGreenLoss]   = useState(16.2);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    fetchGreenTrends().then(t => {
      setNdvi2020(t.ndvi2020);
      setNdvi2024(t.ndvi2024);
      setGreenLoss(t.greenLossPercent);
      setLoading(false);
    });
  }, []);

  const activeLayer: NdviLayer = year === 2020 ? 'ndvi2020' : 'ndvi2024';
  const ndvi      = year === 2020 ? ndvi2020 : ndvi2024;
  const ndviData  = [
    { year: '2020', ndvi: ndvi2020 },
    { year: '2024', ndvi: ndvi2024 },
  ];

  return (
    <div className="h-screen flex pt-16">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[340px] shrink-0 bg-card border-r border-border overflow-y-auto p-6 flex flex-col gap-5">

        <Link to="/" className="flex items-center gap-1 text-sm text-canodesk-text-muted hover:text-canodesk-green transition-colors">
          <ArrowLeft size={14} /> Home
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xl">🌿</span>
          <h1 className="font-heading text-xl font-bold text-canodesk-navy">Vegetation Analysis</h1>
          <span className="canodesk-pill canodesk-pill-green text-[10px] ml-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-canodesk-green animate-pulse-dot" /> LIVE
          </span>
        </div>

        <hr className="border-border" />

        {/* Hero stat */}
        <div className="text-center py-4 animate-fadeUp">
          <p className="font-mono text-7xl font-bold text-canodesk-red">
            {loading ? '...' : `${greenLoss}%`}
          </p>
          <p className="font-body text-sm text-canodesk-text-secondary tracking-[2px] mt-1">GREEN COVER LOST</p>
        </div>

        {/* Year toggle — also switches the map overlay */}
        <div>
          <p className="font-mono text-[10px] text-canodesk-text-muted tracking-wider mb-2">SELECT YEAR</p>
          <div className="bg-muted rounded-3xl p-1 flex h-11">
            <button
              onClick={() => setYear(2020)}
              className={`flex-1 rounded-[20px] font-body font-medium text-sm transition-all duration-300
                ${year === 2020 ? 'bg-card text-canodesk-green shadow' : 'text-canodesk-text-muted'}`}
            >
              🌳 2020
            </button>
            <button
              onClick={() => setYear(2024)}
              className={`flex-1 rounded-[20px] font-body font-medium text-sm transition-all duration-300
                ${year === 2024 ? 'bg-card text-canodesk-red shadow' : 'text-canodesk-text-muted'}`}
            >
              2024 🔴
            </button>
          </div>
        </div>

        {/* NDVI stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="font-mono text-4xl font-bold text-canodesk-green">{ndvi2020}</p>
            <p className="font-body text-xs text-canodesk-text-muted">NDVI 2020</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-4xl font-bold text-canodesk-orange">{ndvi2024}</p>
            <p className="font-body text-xs text-canodesk-text-muted">NDVI 2024</p>
          </div>
        </div>

        {/* NDVI position indicator bar */}
        <div className="relative">
          <div className="ndvi-gradient h-3 rounded-md" />
          <div className="absolute top-0 h-3 flex items-center" style={{ left: `${ndvi * 100}%` }}>
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-card -translate-x-1/2 -translate-y-full" />
          </div>
          <p className="font-mono text-xs text-center mt-1 text-canodesk-text-muted">
            {ndvi.toFixed(2)} — {year === 2020 ? 'Dense Vegetation' : 'Moderate Vegetation'}
          </p>
        </div>

        <span className="canodesk-pill bg-canodesk-orange/10 text-canodesk-orange border border-canodesk-orange/20 text-xs mx-auto">
          🔻 VEGETATION DECLINING
        </span>

        {/* NDVI trend chart */}
        <div className="bg-canodesk-navy rounded-xl p-4">
          <p className="font-mono text-[10px] text-[#94a3b8] mb-2 tracking-wider">NDVI TREND 2020 → 2024</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={ndviData}>
              <defs>
                <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="year" tick={{ fill: '#fff', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #22c55e', borderRadius: 8, color: '#22c55e' }}
              />
              <Area
                type="monotone"
                dataKey="ndvi"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#ndviGrad)"
                isAnimationActive
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="font-body text-[11px] text-canodesk-text-muted mt-auto">
          ESA Sentinel-2 • NDVI Band Analysis • 10m Resolution • Click zone on map for details
        </p>
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative hidden lg:flex flex-col">
        <div className="flex-1 relative">
          <CanodeskMap activeLayer={activeLayer} />
        </div>
        {/* Footer strip */}
        <div className="bg-card/90 backdrop-blur-sm h-8 flex items-center px-4 text-[11px] font-body text-canodesk-text-muted border-t border-border z-10 shrink-0">
          🌿 NDVI overlay: ESA Sentinel-2 &nbsp;|&nbsp; Showing: {year === 2020 ? '2020 baseline' : '2024 current'}
        </div>
      </div>
    </div>
  );
}
