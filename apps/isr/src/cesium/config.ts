import { Ion } from "cesium";

/**
 * Cesium 설정
 * 환경변수:
 * - VITE_CESIUM_ION_TOKEN: Cesium Ion 액세스 토큰
 * - VITE_3D_TILES_URL: 3D Tiles tileset.json URL
 */

// Cesium Ion 토큰 설정
Ion.defaultAccessToken =
  import.meta.env.VITE_CESIUM_ION_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NGQ0YTBmZC1kMjVmLTQ2OGUtOTFiYy03YWYyNDJhOWZjYzMiLCJpZCI6MjgzMTA2LCJpYXQiOjE3NTMwNjEzMDF9.xhu9JUBNx01Zanmt1lz_MR8a5V0_vTaIpiN8gxhHuU0";

/**
 * 3D Tiles URL
 * 환경변수로 설정하거나 기본값 사용
 */
export const TILES_URL =
  import.meta.env.VITE_3D_TILES_URL || "http://dev.pluxity.com/3d-tiles/farm11/tileset.json";

/**
 * 기본 Viewer 옵션
 */
export const DEFAULT_VIEWER_OPTIONS = {
  // 기본 UI 비활성화
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  navigationHelpButton: false,
  vrButton: false,
};
