import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { fetchStatsOverview, fetchAlerts } from '@/lib/api';

/* Floating particles */
function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 8,
      opacity: 0.2 + Math.random() * 0.25,
      size: 2 + Math.random() * 2,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full bg-primary-foreground" style={{
          left: p.left, bottom: '-10px', width: p.size, height: p.size, opacity: p.opacity,
          animation: `float-particle ${p.duration}s linear ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* SVG Earth with orbit */
function EarthSVG() {
  return (
    <div className="hidden lg:flex items-center justify-center w-full h-full">
      <svg viewBox="0 0 400 400" width="420" height="420">
        <circle cx="200" cy="200" r="120" fill="#0a1628" />
        <path d="M160 120c-10 20-5 50 10 60 20 10 40-5 50-20s5-35-15-45-35-5-45 5z" fill="#1e5c32" opacity="0.7" />
        <path d="M220 200c10 15 30 25 40 15s0-30-15-35-30 5-25 20z" fill="#1e5c32" opacity="0.6" />
        <path d="M140 230c5 10 20 20 35 15s15-20 5-30-25-10-35 0-10 10-5 15z" fill="#1e5c32" opacity="0.5" />
        <ellipse cx="200" cy="200" rx="180" ry="60" fill="none" stroke="white" strokeWidth="1" opacity="0.15"
          className="animate-orbit" style={{ transformOrigin: '200px 200px' }} />
        <circle cx="380" cy="200" r="4" fill="white" className="animate-orbit" style={{ transformOrigin: '200px 200px' }} />
      </svg>
    </div>
  );
}

/* Hero section */
function HeroSection() {
  return (
    <section className="relative min-h-screen canodesk-hero-gradient flex items-center overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.04,
      }} />
      <Particles />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-20 grid lg:grid-cols-2 gap-12 items-center pt-20 lg:pt-0">
        <div className="max-w-[580px]">
          <span className="canodesk-pill border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground text-xs font-body tracking-wider mb-8 inline-flex">🛰️ SATELLITE POWERED</span>
          <h1 className="font-heading font-extrabold leading-[1.05] mb-6">
            {['Bengaluru Is', 'Getting Hotter.', "We're Watching", 'From Space.'].map((line, i) => (
              <span key={i} className={`block text-4xl sm:text-5xl lg:text-7xl animate-fadeUp ${i >= 2 ? 'text-canodesk-green-text' : 'text-primary-foreground'}`}
                style={{ animationDelay: `${i * 200}ms` }}>{line}</span>
            ))}
          </h1>
          <p className="font-body text-lg text-[#bbf7d0] leading-relaxed max-w-[500px] mb-8 animate-fadeUp" style={{ animationDelay: '800ms' }}>
            Real NASA Landsat 8 thermal data combined with ESA Sentinel-2 vegetation analysis — monitoring Bannerghatta's environmental health in real time.
          </p>
          <div className="flex flex-wrap gap-4 mb-8 animate-fadeUp" style={{ animationDelay: '1000ms' }}>
            <Link to="/heatmap" className="canodesk-btn canodesk-btn-primary inline-flex items-center gap-2">
              View Live Dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/greencover" className="canodesk-btn canodesk-btn-secondary">Explore Satellite Data</Link>
          </div>
          <div className="flex gap-3 animate-fadeUp" style={{ animationDelay: '1200ms' }}>
            {['🛰️ NASA Data', '🌍 ESA Data', '🇮🇳 ISRO Data'].map(t => (
              <span key={t} className="text-[11px] font-body text-primary-foreground bg-primary-foreground/10 rounded-full px-3 py-1.5">{t}</span>
            ))}
          </div>
        </div>
        <EarthSVG />
      </div>
    </section>
  );
}

/* Scrolling ticker */
function Ticker() {
  const text = "🛰️ LIVE SATELLITE DATA \u00a0\u00a0•\u00a0\u00a0 NASA LANDSAT 8 THERMAL IMAGING \u00a0\u00a0•\u00a0\u00a0 ESA SENTINEL-2 NDVI ANALYSIS \u00a0\u00a0•\u00a0\u00a0 BANNERGHATTA NATIONAL PARK, BENGALURU \u00a0\u00a0•\u00a0\u00a0 RESOLUTION: 30 METERS \u00a0\u00a0•\u00a0\u00a0 LAST PROCESSED: 2024 \u00a0\u00a0•\u00a0\u00a0 CANODESK ENVIRONMENTAL INTELLIGENCE \u00a0\u00a0•\u00a0\u00a0";
  return (
    <div className="canodesk-ticker-bg h-10 flex items-center overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="font-mono text-[11px] text-canodesk-green-text tracking-wider">{text}{text}</span>
      </div>
    </div>
  );
}

/* Stats strip */
function StatsStrip() {
  const [stats, setStats] = useState({ maxHeat: 45, activeAlerts: 7 });
  useEffect(() => { fetchStatsOverview().then(d => setStats({ maxHeat: d.maxHeat, activeAlerts: d.activeAlerts })); }, []);
  const sat = useCountUp(2, 1500);
  const area = useCountUp(741, 2000);
  const heat = useCountUp(stats.maxHeat, 2000);
  const alerts = useCountUp(stats.activeAlerts, 1800);

  const items = [
    { ref: sat.ref, value: sat.count, suffix: '', emoji: '🛰️', label: 'Satellites Monitoring', color: 'text-canodesk-green', border: 'border-l-canodesk-green' },
    { ref: area.ref, value: area.count, suffix: ' km²', emoji: '📍', label: 'Area Monitored', color: 'text-canodesk-green', border: 'border-l-canodesk-green' },
    { ref: heat.ref, value: heat.count, suffix: '°C', emoji: '🌡️', label: 'Max Heat Score', color: 'text-canodesk-red', border: 'border-l-canodesk-red' },
    { ref: alerts.ref, value: alerts.count, suffix: '', emoji: '🔔', label: 'Active Alerts', color: 'text-canodesk-orange', border: 'border-l-canodesk-orange' },
  ];

  return (
    <section className="bg-card py-16 px-8 lg:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <div key={i} ref={item.ref}
            className={`canodesk-card border-l-4 ${item.border} p-7 animate-fadeUp stagger-${i + 1}`}>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`font-mono text-5xl font-bold ${item.color}`}>{item.value}{item.suffix}</span>
              <span className="text-2xl">{item.emoji}</span>
            </div>
            <p className="font-body text-sm text-canodesk-text-secondary">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Features section */
function FeaturesSection() {
  return (
    <section className="canodesk-green-section py-20 px-8 lg:px-20">
      <div className="max-w-7xl mx-auto text-center mb-14">
        <span className="canodesk-pill bg-canodesk-green text-primary-foreground mb-4 inline-flex">WHAT WE MONITOR</span>
        <h2 className="font-heading text-4xl lg:text-5xl font-bold text-canodesk-navy mb-4">Two Systems. One Mission.</h2>
        <p className="font-body text-lg text-canodesk-text-secondary max-w-xl mx-auto">NASA thermal imaging and ESA vegetation analysis working together to protect Bengaluru's green lungs.</p>
      </div>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* HeatSpot */}
        <div className="canodesk-card overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-canodesk-red to-[#b91c1c] flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center text-2xl">🌡️</div>
          </div>
          <div className="p-8">
            <span className="canodesk-pill canodesk-pill-red text-xs mb-3 inline-flex">NASA LANDSAT 8</span>
            <h3 className="font-heading text-2xl font-bold text-canodesk-navy mb-3">HeatSpot Detection</h3>
            <p className="font-body text-canodesk-text-secondary mb-6">Surface temperature mapping using Thermal Infrared bands from NASA's Landsat 8 satellite. Identifies urban heat islands and thermal anomalies across Bengaluru.</p>
            <div className="heat-gradient h-5 rounded-lg mb-2 relative" />
            <div className="flex justify-between font-mono text-xs text-canodesk-text-muted mb-4">
              <span>25°C</span><span>35°C</span><span>45°C</span>
            </div>
            <p className="font-body font-bold text-canodesk-red">45°C Detected in Bannerghatta</p>
          </div>
        </div>
        {/* SmartCanopy */}
        <div className="canodesk-card overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-canodesk-green to-[#15803d] flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center text-2xl">🌳</div>
          </div>
          <div className="p-8">
            <span className="canodesk-pill canodesk-pill-green text-xs mb-3 inline-flex">ESA SENTINEL-2</span>
            <h3 className="font-heading text-2xl font-bold text-canodesk-navy mb-3">SmartCanopy Monitoring</h3>
            <p className="font-body text-canodesk-text-secondary mb-6">Normalized Difference Vegetation Index (NDVI) analysis from ESA's Sentinel-2 satellite. Tracks vegetation health and deforestation patterns with 10m precision.</p>
            <div className="ndvi-gradient h-5 rounded-lg mb-2" />
            <div className="flex justify-between font-mono text-xs text-canodesk-text-muted mb-4">
              <span>-0.2</span><span>0.4</span><span>0.8</span>
            </div>
            <p className="font-body font-bold text-canodesk-orange">16.2% Green Cover Lost Since 2020</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* How it works */
function HowItWorks() {
  const steps = [
    { emoji: '🛰️', color: 'bg-canodesk-green', title: 'Satellite Capture', desc: 'NASA Landsat 8 and ESA Sentinel-2 capture multispectral imagery every 5-16 days at 10-30m resolution.' },
    { emoji: '⚙️', color: 'bg-blue-500', title: 'GEE Processing', desc: 'Google Earth Engine processes petabytes of satellite data, computing thermal bands and vegetation indices.' },
    { emoji: '📊', color: 'bg-purple-500', title: 'Live Dashboard', desc: 'Processed data flows into Canodesk\'s real-time dashboard with alerts, maps, and actionable recommendations.' },
  ];
  return (
    <section className="bg-card py-20 px-8 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-4xl font-bold text-canodesk-navy text-center mb-16">How Canodesk Works</h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* connecting lines */}
          <div className="hidden md:block absolute top-12 left-[33%] right-[33%] h-0.5 border-t-2 border-dashed border-canodesk-green/30" />
          {steps.map((s, i) => (
            <div key={i} className="text-center animate-fadeUp" style={{ animationDelay: `${i * 200}ms` }}>
              <div className={`w-24 h-24 rounded-full ${s.color} flex items-center justify-center text-4xl mx-auto mb-6`}>{s.emoji}</div>
              <h3 className="font-heading text-lg font-bold text-canodesk-navy mb-2">{s.title}</h3>
              <p className="font-body text-sm text-canodesk-text-secondary max-w-xs mx-auto">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Live alert preview */
function LiveAlertPreview() {
  const [alert, setAlert] = useState<{ suggestion: string } | null>(null);
  useEffect(() => { fetchAlerts().then(a => setAlert(a[0])); }, []);

  return (
    <section className="canodesk-dark-section py-20 px-8 lg:px-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <h2 className="font-heading text-4xl font-bold text-primary-foreground glow-green-text mb-3">Right Now In Bannerghatta</h2>
          <p className="font-body text-canodesk-green-text mb-10">Live environmental alert from our satellite monitoring system</p>
          <div className="canodesk-dark-card p-10 max-w-[620px] mx-auto lg:mx-0" style={{ boxShadow: '0 0 40px rgba(0,255,136,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-canodesk-red animate-pulse-red" />
              <span className="canodesk-pill canodesk-pill-red text-xs">CRITICAL ALERT</span>
            </div>
            <p className="font-mono text-xs text-primary-foreground tracking-[2px] mb-2">BANNERGHATTA NATIONAL PARK</p>
            <p className="font-mono text-[88px] leading-none font-bold text-canodesk-red glow-red mb-2">45°C</p>
            <p className="font-mono text-xl text-canodesk-green-accent mb-4">NDVI: 0.62</p>
            {alert && <p className="font-body text-sm text-canodesk-green-text mb-6">{alert.suggestion}</p>}
            <Link to="/heatmap" className="canodesk-btn canodesk-btn-primary inline-flex items-center gap-2">
              View Full Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        {/* Satellite dish SVG */}
        <div className="hidden lg:block">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <ellipse cx="110" cy="180" rx="50" ry="8" fill="white" opacity="0.1" />
            <line x1="110" y1="180" x2="110" y2="100" stroke="white" strokeWidth="3" opacity="0.4" />
            <path d="M60 100 Q110 50 160 100" fill="none" stroke="white" strokeWidth="3" opacity="0.5" />
            <path d="M75 80 Q110 45 145 80" fill="none" stroke="white" strokeWidth="2" className="animate-signal-1" />
            <path d="M85 60 Q110 30 135 60" fill="none" stroke="white" strokeWidth="2" className="animate-signal-2" />
            <path d="M95 40 Q110 15 125 40" fill="none" stroke="white" strokeWidth="2" className="animate-signal-3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* Main Home page */
export default function Home() {
  return (
    <div className="page-transition">
      <HeroSection />
      <Ticker />
      <StatsStrip />
      <FeaturesSection />
      <HowItWorks />
      <LiveAlertPreview />
    </div>
  );
}
