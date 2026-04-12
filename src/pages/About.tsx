import { useEffect, useRef } from 'react';
import { Github, Linkedin } from 'lucide-react';

const ZONE_COORDS: [number, number][] = [
  [12.821137537033133, 77.500047814119071],
  [12.703160186692978, 77.500047814119071],
  [12.700122143336579, 77.618025164459226],
  [12.819112174795533, 77.618531505018638],
  [12.821137537033133, 77.500047814119071],
];

const dataSources = [
  { emoji: '🛰️', name: 'NASA Landsat 8', desc: 'Thermal Infrared Imaging', detail: '30m resolution • 16-day revisit • Global coverage', border: 'border-l-canodesk-red' },
  { emoji: '🌍', name: 'ESA Sentinel-2', desc: 'Vegetation Index Analysis (NDVI)', detail: '10m resolution • 5-day revisit • Global coverage', border: 'border-l-blue-500' },
  { emoji: '🇮🇳', name: 'ISRO Bhuvan', desc: 'India-Specific Urban Layers', detail: 'Variable resolution • India coverage', border: 'border-l-canodesk-orange' },
  { emoji: '⚙️', name: 'Google Earth Engine', desc: 'Cloud Satellite Processing', detail: 'Petabyte-scale analysis • Free for research', border: 'border-l-canodesk-green' },
];

const techStack = [
  { emoji: '⚛️', name: 'React', desc: 'Frontend framework' },
  { emoji: '🟢', name: 'Node.js', desc: 'Backend runtime' },
  { emoji: '🚀', name: 'Express', desc: 'API server' },
  { emoji: '🗺️', name: 'Mapbox GL', desc: '3D satellite maps' },
  { emoji: '🍃', name: 'Leaflet.js', desc: 'Fallback mapping' },
  { emoji: '🌐', name: 'QGIS', desc: 'GIS processing' },
  { emoji: '🛰️', name: 'GEE', desc: 'Satellite processing' },
  { emoji: '📡', name: 'NASA Earthdata', desc: 'Thermal data source' },
  { emoji: '🌍', name: 'ESA Copernicus', desc: 'Vegetation data' },
  { emoji: '📊', name: 'Recharts', desc: 'Data visualization' },
  { emoji: '☁️', name: 'Render.com', desc: 'Cloud deployment' },
  { emoji: '🐙', name: 'GitHub', desc: 'Version control' },
];

const team = [
  { name: 'Aryan R. Achar', role: 'Team Lead & AI Full-Stack', badgeColor: 'bg-green-100 text-green-700', avatarBg: 'bg-green-600', initial: 'A' },
  { name: 'D Vijayvarshegen', role: 'Geospatial UI Engineer', badgeColor: 'bg-blue-100 text-blue-700', avatarBg: 'bg-blue-600', initial: 'V' },
  { name: 'Sufiya B', role: 'Backend & Data Engineer', badgeColor: 'bg-purple-100 text-purple-700', avatarBg: 'bg-purple-600', initial: 'S' },
];

function StudyAreaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([12.7621, 77.5590], 11);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
      }).addTo(map);
      L.polygon(ZONE_COORDS, { color: '#16a34a', fillOpacity: 0.2 }).addTo(map);
      L.circleMarker([12.7621, 77.5590], { radius: 8, color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.8 }).addTo(map);
    })();
  }, []);
  return <div ref={mapRef} className="w-full h-[360px] rounded-2xl overflow-hidden" />;
}

export default function About() {
  return (
    <div className="page-transition min-h-screen pt-16">
      {/* Hero */}
      <section className="canodesk-hero-gradient py-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="absolute w-[3px] h-[3px] rounded-full bg-primary-foreground animate-constellation"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.3, animationDelay: `${Math.random() * 6}s` }} />
          ))}
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">Monitoring Bengaluru From 705km Above</h1>
          <p className="font-body text-xl text-canodesk-green-text mb-8">Where satellite science meets environmental action</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {['741 km² Monitored', '2 Satellites', '2020-2024 Data'].map(t => (
              <span key={t} className="bg-primary-foreground/10 text-primary-foreground font-body text-sm rounded-full px-4 py-2">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-card py-20 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-5">
            <h2 className="font-heading text-3xl font-bold text-canodesk-navy mb-4">Our Mission</h2>
            <p className="font-body text-canodesk-text-secondary leading-relaxed">Bengaluru, once known as the "Garden City" of India, has been losing its green cover at an alarming rate. Rapid urbanization, infrastructure development, and population growth have transformed what was once a lush, tree-lined city into one of the fastest-growing urban heat islands in South Asia.</p>
            <p className="font-body text-canodesk-text-secondary leading-relaxed">Surface temperatures in areas like Bannerghatta have risen by nearly 4°C between 2020 and 2024. The Normalized Difference Vegetation Index (NDVI) has dropped from 0.74 to 0.62 — a 16.2% decline in just four years. These aren't just numbers; they represent a fundamental shift in the city's environmental health.</p>
            <p className="font-body text-canodesk-text-secondary leading-relaxed">Traditional ground-based monitoring can't keep pace with the scale and speed of these changes. That's where satellite technology becomes essential. By leveraging NASA's Landsat 8 thermal imaging and ESA's Sentinel-2 vegetation analysis, we can monitor the entire 741 km² study area from 705 kilometers above Earth's surface.</p>
            <p className="font-body text-canodesk-text-secondary leading-relaxed">Canodesk transforms raw satellite data into actionable environmental intelligence. Our platform doesn't just visualize the problem — it provides specific recommendations for tree planting, habitat restoration, and urban cooling strategies based on real data from space.</p>
          </div>
          <div className="lg:col-span-2 flex items-center justify-center">
            <svg viewBox="0 0 300 300" width="280" height="280">
              <circle cx="150" cy="150" r="90" fill="#0a1628" />
              <path d="M120 90c-8 15-4 38 8 45 15 8 30-4 38-15s4-26-11-34-28-4-35 4z" fill="#1e5c32" opacity="0.7" />
              <path d="M170 155c8 11 23 19 30 11s0-23-11-26-23 4-19 15z" fill="#1e5c32" opacity="0.6" />
              <ellipse cx="150" cy="150" rx="130" ry="45" fill="none" stroke="#16a34a" strokeWidth="1" opacity="0.2" />
              <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#94a3b8"
                style={{ offsetPath: 'path("M20,150 A130,45 0 1,1 280,150 A130,45 0 1,1 20,150")', animation: 'orbit-rotate 8s linear infinite', offsetRotate: '0deg' } as any} />
            </svg>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mt-16 flex flex-wrap items-center justify-between gap-4">
          {['2020: Baseline Captured', '2022: Pattern Analysis', '2024: Changes Documented', 'Now: Live Monitoring'].map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-canodesk-green shrink-0" />
              <span className="font-body text-sm text-canodesk-text-secondary">{m}</span>
              {i < 3 && <div className="hidden md:block w-12 h-0.5 bg-canodesk-green/30" />}
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="canodesk-green-section py-20 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-canodesk-navy text-center mb-12">Powered By Space-Grade Data</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {dataSources.map(ds => (
              <div key={ds.name} className={`canodesk-card border-l-4 ${ds.border} p-8`}>
                <span className="text-3xl mb-3 block">{ds.emoji}</span>
                <h3 className="font-heading text-xl font-bold text-canodesk-navy mb-1">{ds.name}</h3>
                <p className="font-body text-canodesk-text-secondary mb-2">{ds.desc}</p>
                <p className="font-mono text-xs text-canodesk-text-muted">{ds.detail}</p>
                <a href="#" className="text-canodesk-green text-sm font-medium mt-3 inline-block hover:underline">Learn More →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Area */}
      <section className="bg-card py-20 px-8 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-canodesk-navy mb-8">Study Area: Bannerghatta National Park</h2>
          <StudyAreaMap />
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            {['741 km²', 'Karnataka, India', '12.76°N 77.56°E', 'Est. 1974'].map(s => (
              <span key={s} className="font-mono text-xs bg-muted text-canodesk-text-secondary rounded-full px-4 py-2">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="canodesk-hero-gradient py-16 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground text-center mb-10">Built With</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {techStack.map(t => (
              <div key={t.name} className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-5 hover:border-canodesk-neon/40 transition-all"
                style={{ transition: 'border-color 200ms, box-shadow 200ms' }}>
                <span className="text-2xl block mb-2">{t.emoji}</span>
                <p className="font-heading font-bold text-primary-foreground text-sm">{t.name}</p>
                <p className="font-body text-xs text-canodesk-green-text/70">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-card py-20 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-canodesk-navy text-center mb-12">The Team Behind Canodesk</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {team.map(t => (
              <div key={t.name} className="canodesk-card p-6 text-center">
                <div className={`w-16 h-16 rounded-full ${t.avatarBg} flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl font-bold text-primary-foreground">{t.initial}</span>
                </div>
                <h3 className="font-heading font-bold text-sm text-canodesk-navy">{t.name}</h3>
                <span className={`canodesk-pill text-[10px] ${t.badgeColor} mt-2 inline-flex`}>{t.role}</span>
                <p className="font-body text-[10px] text-canodesk-text-muted mt-2">AMC Engineering College, Bengaluru</p>
                <div className="flex justify-center gap-2 mt-3">
                  <Github size={14} className="text-canodesk-text-muted hover:text-canodesk-green cursor-pointer transition-colors" />
                  <Linkedin size={14} className="text-canodesk-text-muted hover:text-canodesk-green cursor-pointer transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
