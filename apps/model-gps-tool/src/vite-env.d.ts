/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_ION_CESIUM_ACCESS_TOKEN: string;
  readonly VITE_ION_CESIUM_MAP_ASSET_ID: string;
  readonly VITE_ION_CESIUM_TERRAIN_ASSET_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
