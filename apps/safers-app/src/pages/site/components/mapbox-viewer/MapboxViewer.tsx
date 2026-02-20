import { useCallback, useEffect, useRef, useState, useImperativeHandle } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Map as MapboxMap } from "mapbox-gl";
import type {
  ThreeOverlayHandle,
  FeaturePosition,
  WorkerLocation,
  DangerZone,
  SelectedFeatureData,
} from "./types";
import {
  MAP_STYLES,
  COLOR_DANGER,
  BUILDING_OPACITY,
  DEFAULT_FLY_DURATION,
  DEFAULT_BANNER_MESSAGE,
  type MapStyleKey,
} from "./constants";
import { MODEL_TRANSFORM, INITIAL_VIEW, EMERGENCY_CAMERA } from "./config/site.config";
import { DEFAULT_WORKER_VITALS } from "../../mocks";
import { ThreeOverlay } from "./three/ThreeOverlay";
import { FeaturePopup } from "./overlays/FeaturePopup";
import { AreaSelectionOverlay, type SelectionRect } from "./overlays/AreaSelectionOverlay";
import { CCTVPopupGrid } from "./overlays/CCTVPopupGrid";
import { FeatureLabelOverlay } from "./overlays/FeatureLabelOverlay";
import { useMapboxSetup } from "./hooks/useMapboxSetup";
import { useMapInteractions } from "./hooks/useMapInteractions";
import { useCCTVPopupStore, selectCCTVPopups } from "@/stores";
import { FilterChip, FilterChipGroup } from "@pf-dev/ui/molecules";
import { CCTV as CCTVIcon, User as UserIcon, X as XIcon } from "@pf-dev/ui/atoms";
import type { SiteEmergencyPayload } from "@/services";

export interface MapboxViewerHandle {
  setStyle: (style: MapStyleKey) => void;
  triggerEmergency: (
    payload: SiteEmergencyPayload,
    options?: {
      skipModelSwap?: boolean;
      skipSelect?: boolean;
      skipFlyTo?: boolean;
      message?: string;
      bannerLabel?: string;
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
  areaSelect: (rect: SelectionRect) => string[];
  zoomIn: () => void;
  zoomOut: () => void;
  resetBearing: () => void;
  updateWorkerLocation: (featureId: string, location: WorkerLocation) => void;
  startPatrol: (id: string, path: FeaturePosition[], durationMs: number) => void;
  stopPatrol: (id: string) => void;
}

interface MapboxViewerProps {
  ref?: React.Ref<MapboxViewerHandle>;
  sitePolygonWKT?: string;
  workerNames?: Record<string, string>;
  workerLocations?: Record<string, { floor: string }>;
  dangerZones?: DangerZone[];
  onWorkerSelect?: (workerId: string | null) => void;
  onScenarioEnd?: () => void;
  selectionMode?: boolean;
  onAreaSelect?: (featureIds: string[]) => void;
  onSelectionCancel?: () => void;
}

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

export function MapboxViewer({
  ref,
  sitePolygonWKT,
  workerNames,
  workerLocations,
  dangerZones,
  onWorkerSelect,
  onScenarioEnd,
  selectionMode,
  onAreaSelect,
  onSelectionCancel,
}: MapboxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<ThreeOverlayHandle>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const currentStyleRef = useRef<MapStyleKey>("day");

  const [emergency, setEmergency] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerWorkerId, setBannerWorkerId] = useState("");
  const [bannerMessage, setBannerMessage] = useState(DEFAULT_BANNER_MESSAGE);

  const [showCCTVLabels, setShowCCTVLabels] = useState(false);
  const [showWorkerLabels, setShowWorkerLabels] = useState(false);
  const [searchHitIds, setSearchHitIds] = useState<Set<string>>(new Set());

  const [selectedFeature, setSelectedFeature] = useState<SelectedFeatureData | null>(null);

  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selectedFeature?.id ?? null;
  }, [selectedFeature]);

  const renderCallbacksRef = useRef<Set<() => void>>(new Set());

  const { mapRef } = useMapboxSetup({
    containerRef,
    overlayRef,
    popupRef,
    selectedIdRef,
    renderCallbacksRef,
    sitePolygonWKT,
    currentStyleRef,
  });

  const cctvPopups = useCCTVPopupStore(selectCCTVPopups);

  const onWorkerSelectRef = useRef(onWorkerSelect);
  useEffect(() => {
    onWorkerSelectRef.current = onWorkerSelect;
  }, [onWorkerSelect]);

  const activeWorkerRef = useRef<string | null>(null);

  const getTransform = useCallback(() => MODEL_TRANSFORM, []);

  const doSelectWorker = useCallback((workerId: string | null) => {
    if (!workerId) {
      setSelectedFeature(null);
      overlayRef.current?.clearHighlight();
      onWorkerSelectRef.current?.(null);
      return;
    }

    const pos = overlayRef.current?.getFeaturePosition(workerId);
    const vitals = overlayRef.current?.getWorkerVitals(workerId) ?? null;
    const streamUrl = overlayRef.current?.getCCTVStreamUrl(workerId) ?? null;
    const location = overlayRef.current?.getWorkerLocation(workerId) ?? null;
    if (pos) {
      setSelectedFeature({
        id: workerId,
        lng: pos.lng,
        lat: pos.lat,
        altitude: pos.altitude,
        vitals,
        streamUrl,
        location,
      });
      overlayRef.current?.highlightFeature(workerId);
    }
    onWorkerSelectRef.current?.(workerId);
  }, []);

  const doResetEmergency = useCallback(() => {
    const workerId = activeWorkerRef.current;

    setEmergency(false);
    setBannerVisible(false);
    setBannerWorkerId("");
    setBannerMessage(DEFAULT_BANNER_MESSAGE);

    if (workerId) {
      overlayRef.current?.swapFeatureAsset(workerId, "worker");
      overlayRef.current?.updateWorkerVitals(
        workerId,
        DEFAULT_WORKER_VITALS[workerId] ?? { temperature: 36.5, heartRate: 75 }
      );

      const initialPos = overlayRef.current?.getInitialPosition(workerId);
      if (initialPos) {
        overlayRef.current?.moveFeatureTo(workerId, initialPos, DEFAULT_FLY_DURATION);
      }
    }

    overlayRef.current?.setBuildingOpacity(BUILDING_OPACITY.FULL);

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
  }, [mapRef, onScenarioEnd]);

  useImperativeHandle(ref, () => ({
    setStyle(style: MapStyleKey) {
      if (mapRef.current) {
        currentStyleRef.current = style;
        mapRef.current.setStyle(MAP_STYLES[style]);
      }
    },
    triggerEmergency(
      payload: SiteEmergencyPayload,
      opts?: {
        skipModelSwap?: boolean;
        skipSelect?: boolean;
        skipFlyTo?: boolean;
        message?: string;
        bannerLabel?: string;
      }
    ) {
      activeWorkerRef.current = payload.workerId;

      setEmergency(true);
      setBannerVisible(true);
      setBannerWorkerId(opts?.bannerLabel ?? payload.workerId);
      if (opts?.message) setBannerMessage(opts.message);

      if (!opts?.skipModelSwap) {
        overlayRef.current?.swapFeatureAsset(payload.workerId, "worker-stunned");
      }
      overlayRef.current?.updateWorkerVitals(payload.workerId, payload.vitals);

      if (!opts?.skipSelect) {
        setSelectedFeature({
          id: payload.workerId,
          lng: payload.position.lng,
          lat: payload.position.lat,
          altitude: payload.position.altitude,
          vitals: payload.vitals,
          streamUrl: null,
          location: overlayRef.current?.getWorkerLocation(payload.workerId) ?? null,
        });
        overlayRef.current?.highlightFeature(payload.workerId, COLOR_DANGER);
        onWorkerSelectRef.current?.(payload.workerId);
      }

      const occluded = overlayRef.current?.checkOcclusion(payload.workerId) ?? false;
      if (occluded) {
        overlayRef.current?.setBuildingOpacity(BUILDING_OPACITY.OCCLUDED);
      }

      if (!opts?.skipFlyTo) {
        const { BASE_ZOOM, BASE_ALT, BEARING, PITCH } = EMERGENCY_CAMERA;

        const zoom =
          payload.position.altitude <= BASE_ALT
            ? BASE_ZOOM
            : BASE_ZOOM - Math.log2(payload.position.altitude / BASE_ALT);

        const pitchRad = (PITCH * Math.PI) / 180;
        const bearingRad = (BEARING * Math.PI) / 180;
        const offsetMeters = payload.position.altitude * Math.tan(pitchRad);
        const mPerLng = 111320 * Math.cos((payload.position.lat * Math.PI) / 180);
        const mPerLat = 111320;

        mapRef.current?.flyTo({
          center: [
            payload.position.lng + (offsetMeters * Math.sin(bearingRad)) / mPerLng,
            payload.position.lat + (offsetMeters * Math.cos(bearingRad)) / mPerLat,
          ],
          zoom,
          pitch: PITCH,
          bearing: BEARING,
          duration: DEFAULT_FLY_DURATION,
          essential: true,
        });
      }
    },
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
      const streamUrl = overlayRef.current?.getCCTVStreamUrl(featureId) ?? null;
      if (streamUrl) {
        useCCTVPopupStore.getState().openPopup(featureId, streamUrl);
      } else {
        const vitals = overlayRef.current?.getWorkerVitals(featureId) ?? null;
        setSelectedFeature({
          id: featureId,
          lng: pos.lng,
          lat: pos.lat,
          altitude: pos.altitude,
          vitals,
          streamUrl: null,
          location: overlayRef.current?.getWorkerLocation(featureId) ?? null,
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
      overlayRef.current?.updateWorkerLocation(featureId, location);
    },
    startPatrol(id: string, path: FeaturePosition[], durationMs: number) {
      overlayRef.current?.startPatrol(id, path, durationMs);
    },
    stopPatrol(id: string) {
      overlayRef.current?.stopPatrol(id);
    },
  }));

  const requestRepaint = useCallback(() => {
    mapRef.current?.triggerRepaint();
  }, [mapRef]);

  useMapInteractions({
    mapRef,
    overlayRef,
    selectedIdRef,
    onFeatureSelect: setSelectedFeature,
    onWorkerSelect: (workerId) => onWorkerSelectRef.current?.(workerId),
  });

  const handleAreaSelectionComplete = useCallback(
    (rect: SelectionRect) => {
      const hits = hitTestRect(rect, mapRef, overlayRef);

      overlayRef.current?.clearAllMarkers();
      if (hits.length > 0) {
        overlayRef.current?.highlightFeatures(hits);
        for (const id of hits) {
          overlayRef.current?.addFeatureMarker(id);
        }
      }
      setSearchHitIds(new Set(hits));
      onAreaSelect?.(hits);
    },
    [mapRef, onAreaSelect]
  );

  const handleFeatureClick = useCallback((featureId: string) => {
    const streamUrl = overlayRef.current?.getCCTVStreamUrl(featureId) ?? null;

    if (streamUrl) {
      useCCTVPopupStore.getState().openPopup(featureId, streamUrl);
      overlayRef.current?.highlightFeature(featureId);
    } else {
      const pos = overlayRef.current?.getFeaturePosition(featureId);
      if (!pos) return;
      const vitals = overlayRef.current?.getWorkerVitals(featureId) ?? null;
      setSelectedFeature({
        id: featureId,
        lng: pos.lng,
        lat: pos.lat,
        altitude: pos.altitude,
        vitals,
        streamUrl: null,
        location: overlayRef.current?.getWorkerLocation(featureId) ?? null,
      });
      overlayRef.current?.highlightFeature(featureId);
      onWorkerSelectRef.current?.(featureId);
    }
  }, []);

  const handleSelectionCancel = useCallback(() => {
    overlayRef.current?.clearAllMarkers();
    overlayRef.current?.clearHighlight();
    setSearchHitIds(new Set());
    onSelectionCancel?.();
  }, [onSelectionCancel]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <ThreeOverlay
        ref={overlayRef}
        getTransform={getTransform}
        requestRepaint={requestRepaint}
        dangerZones={dangerZones}
      />

      <AreaSelectionOverlay
        active={!!selectionMode}
        onSelectionComplete={handleAreaSelectionComplete}
        onCancel={handleSelectionCancel}
      />

      {emergency && (
        <div className="pointer-events-none absolute inset-0 z-[3]">
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              boxShadow:
                "inset 0 0 5rem 1.25rem rgba(222,69,69,0.35), inset 0 0 12.5rem 3.75rem rgba(222,69,69,0.2)",
              animationDuration: "2s",
            }}
          />
          <div
            className="absolute inset-0 animate-pulse border-[0.125rem] border-[#DE4545]/80"
            style={{ animationDuration: "2s" }}
          />
          {bannerVisible && (
            <div
              role="alert"
              aria-live="assertive"
              className="pointer-events-auto absolute inset-x-0 top-[15vh] flex items-center justify-center"
            >
              <div className="flex items-center gap-3 rounded-lg bg-[#DE4545]/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                <span className="animate-pulse text-lg">&#9888;</span>
                <span>
                  비상 상황 발생 — {workerNames?.[bannerWorkerId] ?? bannerWorkerId} {bannerMessage}
                </span>
                <button
                  onClick={doResetEmergency}
                  aria-label="시나리오 종료"
                  className="ml-2 rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-auto absolute left-1/2 top-[4.25rem] z-[5] -translate-x-1/2">
        <FilterChipGroup>
          <FilterChip selected={showCCTVLabels} onChange={setShowCCTVLabels}>
            <span className="flex items-center gap-1.5">
              <CCTVIcon size="sm" />
              CCTV
            </span>
          </FilterChip>
          <FilterChip selected={showWorkerLabels} onChange={setShowWorkerLabels}>
            <span className="flex items-center gap-1.5">
              <UserIcon size="sm" />
              작업자
            </span>
          </FilterChip>
          {searchHitIds.size > 0 && (
            <button
              onClick={handleSelectionCancel}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-transparent bg-[#00C48C] px-4 text-sm font-bold text-white transition-all hover:bg-[#00B07D]"
            >
              검색 {searchHitIds.size}건
              <XIcon size="xs" />
            </button>
          )}
        </FilterChipGroup>
      </div>

      <FeatureLabelOverlay
        showCCTV={showCCTVLabels}
        showWorker={showWorkerLabels}
        forcedIds={searchHitIds}
        hiddenIds={
          new Set([
            ...(selectedFeature ? [selectedFeature.id] : []),
            ...cctvPopups.map((p) => p.featureId),
          ])
        }
        workerNames={workerNames}
        workerLocations={workerLocations}
        overlayRef={overlayRef}
        mapRef={mapRef}
        renderCallbacksRef={renderCallbacksRef}
        onFeatureClick={handleFeatureClick}
      />

      {selectedFeature && !selectedFeature.streamUrl && (
        <div
          ref={popupRef}
          className="pointer-events-none absolute left-0 top-0 z-[2]"
          style={{ willChange: "transform" }}
        >
          <div className="-translate-x-1/2 -translate-y-full">
            <FeaturePopup
              featureId={selectedFeature.id}
              workerName={workerNames?.[selectedFeature.id]}
              position={selectedFeature}
              vitals={selectedFeature.vitals}
              location={selectedFeature.location}
              abnormal={emergency}
              onClose={() => {
                setSelectedFeature(null);
                overlayRef.current?.clearHighlight();
                onWorkerSelectRef.current?.(null);
              }}
            />
          </div>
        </div>
      )}

      {cctvPopups.length > 0 && (
        <CCTVPopupGrid
          popups={cctvPopups}
          overlayRef={overlayRef}
          mapRef={mapRef}
          renderCallbacksRef={renderCallbacksRef}
        />
      )}
    </div>
  );
}
