import { Viewer, Ion } from "cesium";
import { useViewerStore } from "./store.ts";
import type { ViewerConfig } from "../types.ts";

export function createViewer(container: HTMLElement | string, config: ViewerConfig = {}): Viewer {
  // Ion 토큰 설정
  if (config.ionToken) {
    Ion.defaultAccessToken = config.ionToken;
  }

  const viewer = new Viewer(container, {
    // 기본값: 최소 UI 설정
    timeline: config.timeline ?? false,
    animation: config.animation ?? false,
    baseLayerPicker: config.baseLayerPicker ?? false,
    fullscreenButton: config.fullscreenButton ?? true,
    vrButton: config.vrButton ?? false,
    geocoder: config.geocoder ?? false,
    homeButton: config.homeButton ?? true,
    infoBox: config.infoBox ?? true,
    sceneModePicker: config.sceneModePicker ?? false,
    selectionIndicator: config.selectionIndicator ?? true,
    navigationHelpButton: config.navigationHelpButton ?? false,
  });

  // Cesium 크레딧 제거 (선택사항)
  // viewer.cesiumWidget.creditContainer.style.display = "none";

  // 기본 설정
  viewer.scene.globe.depthTestAgainstTerrain = true;

  // Store에 viewer 등록 (전역 이벤트 핸들러 초기화)
  useViewerStore.getState().setViewer(viewer);

  return viewer;
}
