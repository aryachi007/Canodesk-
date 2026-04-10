/// <reference types="vite/client" />

// Allow importing GeoJSON files as modules
declare module '*.geojson' {
  const value: any;
  export default value;
}

