import { useCallback, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle } from "../types";
import { INITIAL_VIEW, EMERGENCY_CAMERA } from "../config/site.config";
import {
  DEFAULT_WORKER_VITALS,
  COLOR_DANGER,
  BUILDING_OPACITY,
  DEFAULT_FLY_DURATION,
  DEFAULT_BANNER_MESSAGE,
  CLIP_FLOOR_MARGIN,
} from "../../../config";
import { useCCTVPopupStore, useFeatureDataStore } from "@/stores";
import type { SiteEmergencyPayload } from "@/services";

export interface TriggerEmergencyOptions {
  skipModelSwap?: boolean;
  skipSelect?: boolean;
  skipFlyTo?: boolean;
  message?: string;
  bannerLabel?: string;
  occlusionMode?: "clip" | "transparent";
  camera?: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

interface SelectedFeatureData {
  id: string;
  lng: number;
  lat: number;
  altitude: number;
  vitals: import("@/services/types").WorkerVitals | null;
  streamUrl: string | null;
  location: import("@/services/types").WorkerLocation | null;
}

interface UseEmergencyStateOptions {
  mapRef: React.RefObject<MapboxMap | null>;
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  setSelectedFeature: (feature: SelectedFeatureData | null) => void;
  onWorkerSelectRef: React.RefObject<((workerId: string | null) => void) | undefined>;
  onScenarioEnd?: () => void;
}

export function useEmergencyState(options: UseEmergencyStateOptions) {
  const { mapRef, overlayRef, setSelectedFeature, onWorkerSelectRef, onScenarioEnd } = options;

  const [emergency, setEmergency] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerWorkerId, setBannerWorkerId] = useState("");
  const [bannerMessage, setBannerMessage] = useState(DEFAULT_BANNER_MESSAGE);
  const activeWorkerRef = useRef<string | null>(null);

  const doResetEmergency = useCallback(() => {
    const workerId = activeWorkerRef.current;

    setEmergency(false);
    setBannerVisible(false);
    setBannerWorkerId("");
    setBannerMessage(DEFAULT_BANNER_MESSAGE);

    if (workerId) {
      overlayRef.current?.swapFeatureAsset(workerId, "worker");
      useFeatureDataStore
        .getState()
        .updateWorkerVitals(
          workerId,
          DEFAULT_WORKER_VITALS[workerId] ?? { temperature: 36.5, heartRate: 75 }
        );

      const initialPos = overlayRef.current?.getInitialPosition(workerId);
      if (initialPos) {
        overlayRef.current?.moveFeatureTo(workerId, initialPos, DEFAULT_FLY_DURATION);
      }
    }

    overlayRef.current?.setBuildingClipAltitude(null);
    overlayRef.current?.setBuildingFloorTransparency(null);

    activeWorkerRef.current = null;
    setSelectedFeature(null);
    overlayRef.current?.clearHighlight();

    mapRef.current?.flyTo({
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      duration: DEFAULT_FLY_DURATION,
      essential: true,
    });

    useCCTVPopupStore.getState().closeAll();
    onWorkerSelectRef.current?.(null);
    onScenarioEnd?.();
  }, [mapRef, overlayRef, setSelectedFeature, onWorkerSelectRef, onScenarioEnd]);

  const triggerEmergency = useCallback(
    (payload: SiteEmergencyPayload, opts?: TriggerEmergencyOptions) => {
      activeWorkerRef.current = payload.workerId;

      setEmergency(true);
      setBannerVisible(true);
      setBannerWorkerId(opts?.bannerLabel ?? payload.workerId);
      if (opts?.message) setBannerMessage(opts.message);

      if (!opts?.skipModelSwap) {
        overlayRef.current?.swapFeatureAsset(payload.workerId, "worker-stunned");
      }
      useFeatureDataStore.getState().updateWorkerVitals(payload.workerId, payload.vitals);

      if (!opts?.skipSelect) {
        setSelectedFeature({
          id: payload.workerId,
          lng: payload.position.lng,
          lat: payload.position.lat,
          altitude: payload.position.altitude,
          vitals: payload.vitals,
          streamUrl: null,
          location: useFeatureDataStore.getState().getWorkerLocation(payload.workerId),
        });
        overlayRef.current?.highlightFeature(payload.workerId, COLOR_DANGER);
        onWorkerSelectRef.current?.(payload.workerId);
      }

      const occluded = overlayRef.current?.checkOcclusion(payload.workerId) ?? false;
      if (occluded) {
        const mode = opts?.occlusionMode ?? "clip";
        if (mode === "transparent") {
          overlayRef.current?.setBuildingFloorTransparency(
            payload.position.altitude + CLIP_FLOOR_MARGIN,
            BUILDING_OPACITY.FLOOR_XRAY,
            payload.position
          );
        } else {
          overlayRef.current?.setBuildingClipAltitude(
            payload.position.altitude + CLIP_FLOOR_MARGIN,
            payload.position
          );
        }
      }

      if (!opts?.skipFlyTo) {
        const cam = opts?.camera ?? {
          center: [payload.position.lng, payload.position.lat] as [number, number],
          zoom: EMERGENCY_CAMERA.ZOOM,
          pitch: EMERGENCY_CAMERA.PITCH,
          bearing: EMERGENCY_CAMERA.BEARING,
        };
        mapRef.current?.flyTo({
          center: cam.center,
          zoom: cam.zoom,
          pitch: cam.pitch,
          bearing: cam.bearing,
          duration: DEFAULT_FLY_DURATION,
          essential: true,
        });
      }
    },
    [mapRef, overlayRef, setSelectedFeature, onWorkerSelectRef]
  );

  return {
    emergency,
    bannerVisible,
    bannerWorkerId,
    bannerMessage,
    triggerEmergency,
    doResetEmergency,
  };
}
