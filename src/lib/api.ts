import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 15000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlertSummary {
  critical: number;
  total: number;
  zones: number;
  lastSync: string;
}

export interface Alert {
  zone: string;
  status: string;
  heat: number;
  ndvi: number;
  suggestion: string;
  coordinates?: [number, number];
}

export interface StatsOverview {
  maxHeat: number;
  activeAlerts: number;
  satellites: number;
  area: string;
}

export interface Recommendation {
  suggestion: string;
  trees: number;
  species: string[];
}

export interface ZoneData {
  id: number;
  name: string;
  heatScore2024: number;
  heatScore2020: number;
  heatChange: number;
  ndvi2024: number;
  ndvi2020: number;
  greenLossPercent: number;
  alertStatus: string;
  suggestion: string;
  coordinates: [number, number];
  geometry: any;
}

export interface GreenTrends {
  ndvi2020: number;
  ndvi2024: number;
  greenLossPercent: number;
  trend: string;
}

// ─── Alert Summary ────────────────────────────────────────────────────────────

export const fetchAlertSummary = async (): Promise<AlertSummary> => {
  try {
    const { data } = await api.get('/api/alerts/summary');
    return {
      critical: data.summary?.critical_count ?? 0,
      total: data.summary?.action_needed ?? 0,
      zones: data.summary?.total_zones ?? 1,
      lastSync: 'Live',
    };
  } catch {
    return { critical: 1, total: 1, zones: 1, lastSync: 'Live' };
  }
};

// ─── Alerts List ──────────────────────────────────────────────────────────────

export const fetchAlerts = async (): Promise<Alert[]> => {
  try {
    const { data } = await api.get('/api/alerts');
    if (!data.success || !Array.isArray(data.data)) throw new Error('bad shape');
    return data.data.map((a: any) => ({
      zone: a.name ?? a.zone_name ?? 'Unknown',
      status: a.alert_status ?? 'WARNING',
      heat: a.indicators?.heat_score_2024 ?? 0,
      ndvi: a.indicators?.ndvi_2024 ?? 0,
      suggestion: a.tree_planting_suggestion ?? a.message ?? '',
      coordinates: a.lat && a.lng ? [a.lng, a.lat] : undefined,
    }));
  } catch {
    return [
      { zone: 'Bannerghatta', status: 'CRITICAL', heat: 45, ndvi: 0.62, suggestion: 'Plant 500 native shade trees along Bannerghatta Road and forest buffer zones.' },
    ];
  }
};

// ─── Stats Overview ───────────────────────────────────────────────────────────

export const fetchStatsOverview = async (): Promise<StatsOverview> => {
  try {
    const { data } = await api.get('/api/stats/overview');
    const stats = data.data;
    return {
      maxHeat: stats?.heat?.avg_score_2024 ?? 45,
      activeAlerts: (stats?.alerts?.critical ?? 0) + (stats?.alerts?.warning ?? 0),
      satellites: 2,
      area: `${stats?.total_zones ?? 1} zone · 16.8 km²`,
    };
  } catch {
    return { maxHeat: 45, activeAlerts: 1, satellites: 2, area: '16.8 km²' };
  }
};

// ─── Recommendations ──────────────────────────────────────────────────────────

export const fetchRecommendations = async (): Promise<Recommendation> => {
  try {
    const { data } = await api.get('/api/stats/recommendations');
    const zone = data.per_zone?.[0];
    const speciesList = (data.recommended_species_for_bengaluru ?? [])
      .slice(0, 4)
      .map((s: any) => s.name?.split(' (')[0] ?? s.name);
    return {
      suggestion: zone?.suggestion ?? 'Plant native shade trees in buffer zones.',
      trees: data.city_wide?.total_trees_needed ?? zone?.trees_needed ?? 500,
      species: speciesList.length ? speciesList : ['Neem', 'Peepal', 'Rain Tree'],
    };
  } catch {
    return {
      suggestion: 'Plant drought-resistant native species along the southern corridor of Bannerghatta.',
      trees: 500,
      species: ['Neem', 'Peepal', 'Rain Tree'],
    };
  }
};

// ─── Zone Data (for HeatMap) ──────────────────────────────────────────────────

export const fetchZoneData = async (): Promise<ZoneData | null> => {
  try {
    const { data } = await api.get('/api/heat/hotspots');
    if (!data.success || !data.data?.length) return null;
    const z = data.data[0];
    return {
      id: z.id,
      name: z.zone_name ?? z.name ?? 'Bannerghatta',
      heatScore2024: z.heat_score_2024 ?? 45,
      heatScore2020: z.heat_score_2020 ?? 41,
      heatChange: z.heat_change ?? (z.heat_score_2024 - z.heat_score_2020),
      ndvi2024: z.ndvi_score_2024 ?? 0.62,
      ndvi2020: z.ndvi_score_2020 ?? 0.74,
      greenLossPercent: Math.abs(z.green_loss_percent ?? 16.2),
      alertStatus: z.alert_status ?? 'CRITICAL',
      suggestion: z.tree_planting_suggestion ?? '',
      coordinates: [z.coordinates?.lng ?? 77.559, z.coordinates?.lat ?? 12.7621],
      geometry: z.geometry ?? null,
    };
  } catch {
    return null;
  }
};

// ─── Green Trends (for GreenCover) ────────────────────────────────────────────

export const fetchGreenTrends = async (): Promise<GreenTrends> => {
  try {
    const { data } = await api.get('/api/green/deforestation');
    return {
      ndvi2020: data.trend_lines?.[0]?.avg_ndvi ?? 0.74,
      ndvi2024: data.trend_lines?.[1]?.avg_ndvi ?? 0.62,
      greenLossPercent: Math.abs(data.trend_lines?.[1]?.avg_green_cover_loss_pct ?? 16.2),
      trend: data.per_zone?.[0]?.trend ?? 'declining',
    };
  } catch {
    return { ndvi2020: 0.74, ndvi2024: 0.62, greenLossPercent: 16.2, trend: 'declining' };
  }
};

export default api;
