import { useImperativeHandle } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type {
  ThreeOverlayHandle,
  FeaturePosition,
  WorkerLocation,
  SelectedFeatureData,
  MapboxViewerHandle,
} from "../types";
import { MAP_STYLES, type MapStyleKey } from "../constants";
import { DEFAULT_FLY_DURATION } from "../../../config";
import { useCCTVPopupStore, useFeatureDataStore } from "@/stores";
import type { SiteEmergencyPayload } from "@/services";
import type { SelectionRect } from "../overlays/AreaSelectionOverlay";
import type { TriggerEmergencyOptions } from "./useEmergencyState";

function hitTestRect(
  rect: SelectionRect,
  mapRef: React.RefObject<MapboxMap | null>,
  overlayRef: React.RefObject<ThreeOverlayHandle | null>
): string[] {
  const canvas = mapRef.current?.getCanvas();
  if (!canvas || !overlayRef.current) return [];

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const positions = overlayRef.current.getAllFeatureScreenPositions(w, h);
  const hits: string[] = [];

  for (const [id, pos] of positions) {
    if (
      pos.x >= rect.x &&
      pos.x <= rect.x + rect.width &&
      pos.y >= rect.y &&
      pos.y <= rect.y + rect.height
    ) {
      hits.push(id);
    }
  }
  return hits;
}

interface UseMapboxViewerHandleOptions {
  ref: React.Ref<MapboxViewerHandle> | undefined;
  mapRef: React.RefObject<MapboxMap | null>;
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  currentStyleRef: React.RefObject<MapStyleKey>;
  setSelectedFeature: (feature: SelectedFeatureData | null) => void;
  doSelectWorker: (workerId: string | null) => void;
  triggerEmergency: (payload: SiteEmergencyPayload, opts?: TriggerEmergencyOptions) => void;
  doResetEmergency: () => void;
}

export function useMapboxViewerHandle(options: UseMapboxViewerHandleOptions) {
  const {
    ref,
    mapRef,
    overlayRef,
    currentStyleRef,
    setSelectedFeature,
    doSelectWorker,
    triggerEmergency,
    doResetEmergency,
  } = options;

  useImperativeHandle(ref, () => ({
    setStyle(style: MapStyleKey) {
      if (mapRef.current) {
        currentStyleRef.current = style;
        mapRef.current.setStyle(MAP_STYLES[style]);
      }
    },
    triggerEmergency,
    resetEmergency: doResetEmergency,
    selectWorker: doSelectWorker,
    moveFeatureTo(
      id: string,
      target: FeaturePosition,
      durationMs: number,
      onComplete?: () => void
    ) {
      overlayRef.current?.moveFeatureTo(id, target, durationMs, onComplete);
    },
    moveFeatureAlongPath(
      id: string,
      path: FeaturePosition[],
      durationMs: number,
      onComplete?: () => void
    ) {
      overlayRef.current?.moveFeatureAlongPath(id, path, durationMs, onComplete);
    },
    showCCTVFOV(cctvId: string, visible: boolean) {
      overlayRef.current?.setFeatureFOVVisible(cctvId, visible);
    },
    setFOVColor(cctvId: string, color: number) {
      overlayRef.current?.setFOVColor(cctvId, color);
    },
    selectFeature(featureId: string | null, highlightColor?: number) {
      if (!featureId) {
        setSelectedFeature(null);
        overlayRef.current?.clearHighlight();
        return;
      }
      const pos = overlayRef.current?.getFeaturePosition(featureId);
      if (!pos) return;
      const featureData = useFeatureDataStore.getState();
      const streamUrl = featureData.getCCTVStreamUrl(featureId);
      if (streamUrl) {
        useCCTVPopupStore.getState().openPopup(featureId, streamUrl);
      } else {
        const vitals = featureData.getWorkerVitals(featureId);
        setSelectedFeature({
          id: featureId,
          lng: pos.lng,
          lat: pos.lat,
          altitude: pos.altitude,
          vitals,
          streamUrl: null,
          location: featureData.getWorkerLocation(featureId),
        });
      }
      overlayRef.current?.highlightFeature(featureId, highlightColor);
    },
    flyTo(opts: {
      center: [number, number];
      zoom: number;
      pitch: number;
      bearing: number;
      duration?: number;
    }) {
      mapRef.current?.flyTo({
        center: opts.center,
        zoom: opts.zoom,
        pitch: opts.pitch,
        bearing: opts.bearing,
        duration: opts.duration ?? DEFAULT_FLY_DURATION,
        essential: true,
      });
    },
    swapFeatureAsset(featureId: string, assetId: string) {
      overlayRef.current?.swapFeatureAsset(featureId, assetId);
    },
    pushLivePosition(featureId: string, position: FeaturePosition, lerpMs?: number) {
      overlayRef.current?.pushLivePosition(featureId, position, lerpMs);
    },
    areaSelect(rect: SelectionRect): string[] {
      return hitTestRect(rect, mapRef, overlayRef);
    },
    zoomIn() {
      if (mapRef.current) {
        mapRef.current.zoomIn({ duration: 300 });
      }
    },
    zoomOut() {
      if (mapRef.current) {
        mapRef.current.zoomOut({ duration: 300 });
      }
    },
    resetBearing() {
      if (mapRef.current) {
        mapRef.current.rotateTo(0, { duration: 500 });
      }
    },
    updateWorkerLocation(featureId: string, location: WorkerLocation) {
      useFeatureDataStore.getState().updateWorkerLocation(featureId, location);
    },
    startPatrol(id: string, path: FeaturePosition[], durationMs: number) {
      overlayRef.current?.startPatrol(id, path, durationMs);
    },
    stopPatrol(id: string) {
      overlayRef.current?.stopPatrol(id);
    },
  }));
}
