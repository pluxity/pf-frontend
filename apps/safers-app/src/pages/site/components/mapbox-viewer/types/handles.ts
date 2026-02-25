import type { FeaturePosition, RaycastHit, ScreenPosition } from "./geo.types";
import type { WorkerLocation, DangerZone } from "./feature.types";
import type { SiteEmergencyPayload } from "@/services";
import type { GeoPosition } from "@/services/types/worker.types";

export interface ThreeOverlayHandle {
  render: (matrix: number[]) => boolean;
  raycast: (screenX: number, screenY: number, width: number, height: number) => RaycastHit | null;
  highlightFeature: (id: string, color?: number) => void;
  clearHighlight: () => void;
  projectFeatureToScreen: (id: string, width: number, height: number) => ScreenPosition | null;
  getFeaturePosition: (id: string) => FeaturePosition | null;
  swapFeatureAsset: (id: string, newAssetId: string) => void;
  setBuildingOpacity: (opacity: number) => void;
  setBuildingClipAltitude: (altitude: number | null, workerPosition?: FeaturePosition) => void;
  setBuildingFloorTransparency: (
    altitude: number | null,
    opacity?: number,
    workerPosition?: FeaturePosition
  ) => void;
  checkOcclusion: (featureId: string) => boolean;
  moveFeatureTo: (
    id: string,
    target: FeaturePosition,
    durationMs: number,
    onComplete?: () => void
  ) => void;
  moveFeatureAlongPath: (
    id: string,
    path: FeaturePosition[],
    durationMs: number,
    onComplete?: () => void
  ) => void;
  getInitialPosition: (id: string) => FeaturePosition | null;
  setFeatureHeading: (id: string, radians: number) => void;
  setFeatureFrustum: (
    id: string,
    corners: [GeoPosition, GeoPosition, GeoPosition, GeoPosition]
  ) => void;
  setFeatureFOVVisible: (id: string, visible: boolean) => void;
  setFOVColor: (id: string, color: number) => void;
  getAllFeatureScreenPositions: (width: number, height: number) => Map<string, ScreenPosition>;
  highlightFeatures: (ids: string[], color?: number) => void;
  pushLivePosition: (id: string, position: FeaturePosition, lerpMs?: number) => void;
  addFeatureMarker: (id: string, color?: number, radius?: number) => void;
  removeFeatureMarker: (id: string) => void;
  clearAllMarkers: () => void;
  setDangerZones: (zones: DangerZone[]) => void;
  startPatrol: (id: string, path: FeaturePosition[], durationMs: number) => void;
  stopPatrol: (id: string) => void;
  probeAltitude: (lng: number, lat: number) => number | null;
}

export interface MapboxViewerHandle {
  setStyle: (style: "day" | "mono" | "night") => void;
  triggerEmergency: (
    payload: SiteEmergencyPayload,
    options?: {
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
  ) => void;
  resetEmergency: () => void;
  selectWorker: (workerId: string | null) => void;
  moveFeatureTo: (
    id: string,
    target: FeaturePosition,
    durationMs: number,
    onComplete?: () => void
  ) => void;
  moveFeatureAlongPath: (
    id: string,
    path: FeaturePosition[],
    durationMs: number,
    onComplete?: () => void
  ) => void;
  showCCTVFOV: (cctvId: string, visible: boolean) => void;
  setFOVColor: (cctvId: string, color: number) => void;
  selectFeature: (featureId: string | null, highlightColor?: number) => void;
  flyTo: (opts: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
    duration?: number;
  }) => void;
  swapFeatureAsset: (featureId: string, assetId: string) => void;
  pushLivePosition: (featureId: string, position: FeaturePosition, lerpMs?: number) => void;
  areaSelect: (rect: { x: number; y: number; width: number; height: number }) => string[];
  zoomIn: () => void;
  zoomOut: () => void;
  resetBearing: () => void;
  updateWorkerLocation: (featureId: string, location: WorkerLocation) => void;
  startPatrol: (id: string, path: FeaturePosition[], durationMs: number) => void;
  stopPatrol: (id: string) => void;
}
