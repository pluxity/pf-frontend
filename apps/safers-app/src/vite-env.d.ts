/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTEXT_PATH?: string;
  readonly VITE_API_BASE_PATH?: string;
  readonly VITE_API_SERVER_URL?: string;
  readonly VITE_PROJECT_PATH?: string;
  readonly VITE_ION_CESIUM_ACCESS_TOKEN?: string;
  readonly VITE_MINIO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
