import { useEffect, useRef } from "react";
import { Viewer, Ion, Cartesian3, Math as CesiumMath } from "cesium";
import { mapStore, useMapStore } from "../store/index";
import type { MapViewerProps } from "../types/index";

export type { MapViewerProps };

const DEFAULT_CAMERA_POSITION = {
  longitude: 126.970445,
  latitude: 37.394434,
  height: 500,
  pitch: -45,
};

const DEFAULT_VIEWER_OPTIONS: Viewer.ConstructorOptions = {
  timeline: false,
  animation: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  navigationHelpButton: false,
  scene3DOnly: true,
  skyBox: false,
  skyAtmosphere: false,
  baseLayer: false,
  requestRenderMode: false,
  maximumRenderTimeChange: 0,
};

let hiddenCreditContainer: HTMLDivElement | null = null;
function getHiddenCreditContainer() {
  if (!hiddenCreditContainer) {
    hiddenCreditContainer = document.createElement("div");
    hiddenCreditContainer.style.display = "none";
  }
  return hiddenCreditContainer;
}

export function MapViewer({
  children,
  className,
  ionToken,
  requestRenderMode,
  maximumRenderTimeChange,
}: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewer = useMapStore((state) => state.viewer);

  useEffect(() => {
    if (!containerRef.current) return;

    if (ionToken) {
      Ion.defaultAccessToken = ionToken;
    }

    const viewerInstance = new Viewer(containerRef.current, {
      ...DEFAULT_VIEWER_OPTIONS,
      requestRenderMode:
        typeof requestRenderMode === "boolean"
          ? requestRenderMode
          : DEFAULT_VIEWER_OPTIONS.requestRenderMode,
      maximumRenderTimeChange:
        typeof maximumRenderTimeChange === "number"
          ? maximumRenderTimeChange
          : DEFAULT_VIEWER_OPTIONS.maximumRenderTimeChange,
      creditContainer: getHiddenCreditContainer(),
    });

    // 초기 카메라 위치 설정
    viewerInstance.camera.setView({
      destination: Cartesian3.fromDegrees(
        DEFAULT_CAMERA_POSITION.longitude,
        DEFAULT_CAMERA_POSITION.latitude,
        DEFAULT_CAMERA_POSITION.height
      ),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(DEFAULT_CAMERA_POSITION.pitch),
        roll: 0,
      },
    });

    mapStore.getState().setViewer(viewerInstance);

    return () => {
      mapStore.getState().setViewer(null);
      if (!viewerInstance.isDestroyed()) {
        viewerInstance.destroy();
      }
    };
  }, [ionToken, requestRenderMode, maximumRenderTimeChange]);

  useEffect(() => {
    if (ionToken) {
      Ion.defaultAccessToken = ionToken;
    }
  }, [ionToken]);

  return (
    <div ref={containerRef} className={className}>
      {viewer && children}
    </div>
  );
}
