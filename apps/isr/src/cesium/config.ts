import { Ion } from "cesium";

/**
 * Cesium 설정
 * 환경변수:
 * - VITE_CESIUM_ION_TOKEN: Cesium Ion 액세스 토큰
 * - VITE_3D_TILES_URL: 3D Tiles tileset.json URL
 */

// Cesium Ion 토큰 설정 (환경변수 필수)
if (!import.meta.env.VITE_CESIUM_ION_TOKEN) {
  console.warn("[Cesium] VITE_CESIUM_ION_TOKEN 환경변수가 설정되지 않았습니다.");
}
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN || "";

/**
 * 3D Tiles URL
 * 환경변수로 설정하거나 기본값 사용
 */
export const TILES_URL =
  import.meta.env.VITE_3D_TILES_URL || "https://dev.pluxity.com/3d-tiles/farm11/tileset.json";

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
