import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, MapPin } from 'lucide-react';
import { fetchAlertSummary, fetchAlerts, type AlertSummary, type Alert } from '@/lib/api';

export default function Alerts() {
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchAlertSummary().then(setSummary);
    fetchAlerts().then(data => setAlerts(Array.isArray(data) ? data : []));
  }, []);

  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.status === filter.toUpperCase());

  const exportCSV = () => {
    const csv = 'Zone,Status,Heat,NDVI,Suggestion\n' + alerts.map(a => `${a.zone},${a.status},${a.heat},${a.ndvi},"${a.suggestion}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'canodesk-alerts.csv'; a.click();
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero bar */}
      <div className="canodesk-hero-gradient px-8 lg:px-20 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <p className="font-body text-xs text-canodesk-green-text mb-2">
              <Link to="/" className="hover:underline">Home</Link> &gt; Alerts
            </p>
            <h1 className="font-heading text-3xl font-bold text-primary-foreground glow-green-text">⚡ Alert Command Center</h1>
          </div>
          <span className="flex items-center gap-2 text-primary-foreground text-sm mt-4 md:mt-0">
            <span className="w-2 h-2 rounded-full bg-canodesk-green-accent animate-pulse-dot" /> SYSTEM ACTIVE
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card py-10 px-8 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summary && [
            { bg: 'bg-red-50', color: 'text-canodesk-red', val: summary.critical, label: 'Critical Alerts', sub: 'Require Immediate Action' },
            { bg: 'bg-orange-50', color: 'text-canodesk-orange', val: summary.total, label: 'Total Alerts', sub: 'All Severities' },
            { bg: 'bg-canodesk-green-light', color: 'text-canodesk-green', val: summary.zones, label: 'Zones Monitored', sub: 'Active Surveillance' },
            { bg: 'bg-blue-50', color: 'text-blue-500', val: '● LIVE', label: 'Last Synchronized', sub: summary.lastSync },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-6 animate-fadeUp`} style={{ animationDelay: `${i * 100}ms` }}>
              <p className={`font-mono text-3xl font-bold ${s.color} mb-1`}>{s.val}</p>
              <p className="font-body text-sm font-semibold text-canodesk-navy">{s.label}</p>
              <p className="font-body text-xs text-canodesk-text-muted">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert feed */}
      <div className="bg-card px-8 lg:px-20 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h2 className="font-heading text-xl font-bold text-canodesk-navy flex items-center gap-2">
              Live Alert Feed <span className="w-2 h-2 rounded-full bg-canodesk-green animate-pulse-dot" />
            </h2>
            <button onClick={exportCSV} className="ml-auto canodesk-btn text-sm py-2 px-4 border border-canodesk-green text-canodesk-green hover:bg-canodesk-green-light flex items-center gap-2">
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['All', 'Critical', 'Warning'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`canodesk-pill text-xs transition-colors ${filter === f ? 'bg-canodesk-green text-primary-foreground' : 'bg-card text-canodesk-text-secondary border border-border'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="canodesk-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {['Zone', 'Status', 'Heat', 'NDVI', 'Suggestion', 'Map'].map(h => (
                    <th key={h} className="font-mono text-[11px] text-canodesk-green tracking-wider uppercase text-left px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={i} className={`border-t border-border transition-colors duration-150 hover:bg-canodesk-green-light ${a.status === 'CRITICAL' ? 'border-l-[3px] border-l-canodesk-red bg-red-50/30' : 'border-l-[3px] border-l-canodesk-orange'}`}>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${a.status === 'CRITICAL' ? 'bg-canodesk-red animate-pulse-red' : 'bg-canodesk-orange'}`} />
                        <span className="font-mono font-bold text-sm text-canodesk-navy">{a.zone}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`canodesk-pill text-[10px] ${a.status === 'CRITICAL' ? 'canodesk-pill-red' : 'bg-orange-50 text-canodesk-orange border border-orange-200'}`}
                        style={a.status === 'CRITICAL' ? { boxShadow: '0 0 8px rgba(220,38,38,0.4)' } : {}}>
                        ● {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-canodesk-red">{a.heat}°C</td>
                    <td className="px-5 py-4 font-mono text-canodesk-green">{a.ndvi}</td>
                    <td className="px-5 py-4 font-body text-sm text-canodesk-text-secondary max-w-[200px]">
                      {a.suggestion.slice(0, 40)}…
                    </td>
                    <td className="px-5 py-4">
                      <Link to="/heatmap" className="text-canodesk-green text-sm font-medium flex items-center gap-1 hover:underline">
                        <MapPin size={12} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-body text-xs text-canodesk-text-muted mt-4">Showing {filtered.length} alerts • Last synchronized: ● Live</p>
        </div>
      </div>
    </div>
  );
}
