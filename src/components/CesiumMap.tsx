import { useEffect, useRef } from 'react';

// ─── Types for Cesium (loaded dynamically to avoid SSR/build issues) ──────────
type CesiumViewer = any;
type ActiveLayer  = 'heat2020' | 'heat2024' | 'ndvi2020' | 'ndvi2024';

interface CesiumMapProps {
  activeLayer: ActiveLayer;
}

// ─── Overlay image paths ───────────────────────────────────────────────────────
const LAYER_IMAGES: Record<ActiveLayer, string> = {
  heat2020: '/LST 2020.png',
  heat2024: '/LST 2024.png',
  ndvi2020: '/BENGALURU ndvi2020.png',
  ndvi2024: '/NDVI2024.png',
};

// ─── Overlay bounds (SW → NE in Cesium degrees) ───────────────────────────────
const RECT = { west: 77.3791, south: 12.7342, east: 77.8826, north: 13.1390 };

export default function CesiumMap({ activeLayer }: CesiumMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef    = useRef<CesiumViewer>(null);
  const layerRef     = useRef<any>(null);

  // ── Boot Cesium once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    let viewer: CesiumViewer;

    (async () => {
      // Dynamic import keeps Cesium out of vendor bundle and away from initial parse
      const Cesium = await import('cesium');
      await import('cesium/Build/Cesium/Widgets/widgets.css');

      // ── Viewer bootstrap ───────────────────────────────────────────────────
      viewer = new Cesium.Viewer(containerRef.current!, {
        // Use the free Cesium World Terrain
        terrainProvider: await Cesium.createWorldTerrainAsync({
          requestWaterMask: false,
          requestVertexNormals: false,
        }),

        // Strip all default UI chrome for a clean cinematic look
        timeline:              false,
        animation:             false,
        baseLayerPicker:       false,
        fullscreenButton:      false,
        vrButton:              false,
        geocoder:              false,
        homeButton:            false,
        infoBox:               true,
        selectionIndicator:    true,
        navigationHelpButton:  false,
        sceneModePicker:       false,
      });

      viewerRef.current = viewer;

      // Basemap: Bing Aerial (built-in, no external key needed in Cesium Ion)
      // Falls back gracefully to default if ion token absent
      viewer.scene.globe.enableLighting = false;
      viewer.scene.skyBox.show          = false; // Remove space stars for clean look
      viewer.scene.sun.show             = false;
      viewer.scene.moon.show            = false;
      viewer.scene.backgroundColor      = Cesium.Color.fromCssColorString('#0a1628');

      // ── Cinematic fly-in animation ─────────────────────────────────────────
      const destination = Cesium.Cartesian3.fromDegrees(77.5590, 12.7621, 160000);
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(77.5590, 8.0, 1800000),
        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
      });
      viewer.camera.flyTo({
        destination,
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch:   Cesium.Math.toRadians(-35),
          roll:    0,
        },
        duration: 3.5,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      });

      // ── Load GeoJSON zones ─────────────────────────────────────────────────
      try {
        const zonesJson = await import('../data/BENGALURU_ZONES.json');
        const dataSource = await Cesium.GeoJsonDataSource.load(zonesJson.default, {
          stroke:       Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.9),
          fill:         Cesium.Color.fromCssColorString('#00ff88').withAlpha(0.08),
          strokeWidth:  3,
          clampToGround: true,
        });
        await viewer.dataSources.add(dataSource);

        // Make zones glow on click with labels
        viewer.selectedEntityChanged.addEventListener((entity: any) => {
          if (entity && entity.properties) {
            const p = entity.properties;
            const zoneName  = p.zone_name?.getValue()  ?? 'Unknown';
            const heatScore = p.heat_score?.getValue()  ?? 'N/A';
            const ndviScore = p.ndvi_score?.getValue()  ?? 'N/A';
            const alertStat = p.alert_stat?.getValue()  ?? 'UNKNOWN';

            entity.description = new Cesium.ConstantProperty(
              `<div style="font-family:'JetBrains Mono',monospace;padding:12px;min-width:200px;background:#0f172a;color:white;border-radius:12px">
                <p style="font-size:11px;letter-spacing:2px;color:#64748b;margin:0 0 6px">ZONE INFO</p>
                <p style="font-size:18px;font-weight:700;color:white;margin:0 0 10px">${zoneName}</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
                  <div>
                    <span style="color:#94a3b8">Heat Score</span><br/>
                    <strong style="color:#ef4444">${heatScore}°C</strong>
                  </div>
                  <div>
                    <span style="color:#94a3b8">NDVI Score</span><br/>
                    <strong style="color:#22c55e">${ndviScore}</strong>
                  </div>
                </div>
                <div style="margin-top:10px">
                  <span style="
                    display:inline-block;
                    background:${alertStat === 'CRITICAL' ? '#dc262622' : '#16a34a22'};
                    color:${alertStat === 'CRITICAL' ? '#ef4444' : '#22c55e'};
                    border:1px solid ${alertStat === 'CRITICAL' ? '#ef444455' : '#22c55e55'};
                    border-radius:9999px;
                    padding:2px 12px;
                    font-size:11px;
                    font-weight:600
                  ">● ${alertStat}</span>
                </div>
              </div>`
            );
          }
        });
      } catch (err) {
        console.warn('[CesiumMap] GeoJSON load error:', err);
      }

      // ── Add initial image overlay ──────────────────────────────────────────
      addOverlay(viewer, Cesium, activeLayer);
    })();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
        layerRef.current  = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Swap overlay when activeLayer changes ────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;

    (async () => {
      const Cesium = await import('cesium');
      addOverlay(viewer, Cesium, activeLayer);
    })();
  }, [activeLayer]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#0a1628' }}
      className="cesium-container"
    />
  );
}

// ─── Helper: add/replace satellite image overlay ───────────────────────────────
function addOverlay(viewer: CesiumViewer, Cesium: any, layer: ActiveLayer) {
  // Remove existing image overlay if present
  if (layerRef_global) {
    try { viewer.imageryLayers.remove(layerRef_global, false); } catch {}
    layerRef_global = null;
  }

  const rect = Cesium.Rectangle.fromDegrees(
    RECT.west, RECT.south, RECT.east, RECT.north
  );

  const provider = new Cesium.SingleTileImageryProvider({
    url:       LAYER_IMAGES[layer],
    rectangle: rect,
  });

  const imageryLayer = viewer.imageryLayers.addImageryProvider(provider);
  imageryLayer.alpha = 0.65;
  layerRef_global    = imageryLayer;
}

// Module-level ref so the closure in addOverlay can track it across renders
let layerRef_global: any = null;
