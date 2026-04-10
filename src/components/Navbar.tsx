import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, Menu, X, Hexagon } from 'lucide-react';
import { fetchAlertSummary } from '@/lib/api';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/heatmap', label: 'Heat Map' },
  { to: '/greencover', label: 'Green Cover' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [alertCount, setAlertCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location]);
  useEffect(() => {
    fetchAlertSummary().then(d => setAlertCount(d.critical));
  }, []);

  return (
    <>
      <nav className="canodesk-navbar fixed top-0 left-0 right-0 z-[1000] h-16 flex items-center px-6 lg:px-12">
        {/* Left */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <svg width="28" height="28" viewBox="0 0 28 28" className="animate-leaf">
            <path d="M14 2C8 2 3 8 3 14c0 4 2 7 5 9 1-3 3-6 6-8 3 2 5 5 6 8 3-2 5-5 5-9C25 8 20 2 14 2z" fill="#16a34a" />
            <path d="M14 10c-2 2-3 5-3 8h6c0-3-1-6-3-8z" fill="#22c55e" />
          </svg>
          <span className="font-heading font-bold text-xl text-canodesk-navy">Canodesk</span>
          <span className="text-canodesk-text-muted text-xs hidden sm:inline ml-1">• Environmental Intelligence</span>
        </Link>

        {/* Center nav links - desktop */}
        <div className="hidden lg:flex items-center gap-1 mx-auto">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) =>
                `font-body font-medium text-sm px-4 py-2 relative transition-colors duration-200 ${isActive ? 'text-canodesk-green' : 'text-canodesk-text-secondary hover:text-canodesk-green'}`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-canodesk-green transition-all duration-300 ${isActive ? 'w-3/4' : 'w-0'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 ml-auto lg:ml-0 shrink-0">
          <span className="canodesk-pill canodesk-pill-green text-xs hidden sm:inline-flex">
            <span className="w-2 h-2 rounded-full bg-canodesk-green animate-pulse-dot" /> LIVE
          </span>
          <Link to="/alerts" className="relative p-2">
            <Bell size={20} className={`text-canodesk-text-secondary ${alertCount > 0 ? 'animate-jiggle' : ''}`} />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-canodesk-red text-primary-foreground text-[10px] font-bold flex items-center justify-center">{alertCount}</span>
            )}
          </Link>
          <Link to="/heatmap" className="canodesk-pill canodesk-pill-dark text-xs hidden md:inline-flex">
            <Hexagon size={12} /> 3D View
          </Link>
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2">
            <Menu size={24} className="text-canodesk-navy" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1001] canodesk-hero-gradient flex flex-col">
          <div className="flex items-center justify-between p-6">
            <span className="font-heading font-bold text-xl text-primary-foreground">Canodesk</span>
            <button onClick={() => setMobileOpen(false)}><X size={28} className="text-primary-foreground" /></button>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-8">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className="font-heading text-3xl text-primary-foreground hover:text-canodesk-green-text transition-colors"
                onClick={() => setMobileOpen(false)}
              >{l.label}</NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
