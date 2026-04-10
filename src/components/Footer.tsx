import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="canodesk-footer-bg py-16 px-8 lg:px-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg width="24" height="24" viewBox="0 0 28 28"><path d="M14 2C8 2 3 8 3 14c0 4 2 7 5 9 1-3 3-6 6-8 3 2 5 5 6 8 3-2 5-5 5-9C25 8 20 2 14 2z" fill="#22c55e"/><path d="M14 10c-2 2-3 5-3 8h6c0-3-1-6-3-8z" fill="#86efac"/></svg>
            <span className="font-heading font-bold text-lg text-primary-foreground">Canodesk</span>
          </div>
          <p className="font-body text-sm text-canodesk-green-text/70 leading-relaxed">Environmental intelligence powered by NASA and ESA satellite data. Monitoring Bengaluru from 705km above.</p>
        </div>
        <div>
          <h4 className="font-heading font-bold text-primary-foreground mb-4">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {['/', '/heatmap', '/greencover', '/alerts', '/about'].map((p, i) => (
              <Link key={p} to={p} className="font-body text-sm text-canodesk-green-text/70 hover:text-canodesk-green-text transition-colors">
                {['Home', 'Heat Map', 'Green Cover', 'Alerts', 'About'][i]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading font-bold text-primary-foreground mb-4">Data Sources</h4>
          <div className="flex flex-col gap-2 text-sm font-body text-canodesk-green-text/70">
            <span>NASA Landsat 8</span><span>ESA Sentinel-2</span><span>ISRO Bhuvan</span><span>Google Earth Engine</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-canodesk-green-accent animate-pulse-dot" />
            <span className="text-xs font-mono text-canodesk-green-text">API Status: Live</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 text-center">
        <p className="font-body text-xs text-canodesk-green-text/50">Built with 💚 at HACKZION 2026 • AMC Engineering College, Bengaluru • Powered by NASA & ESA satellite data</p>
      </div>
    </footer>
  );
}
