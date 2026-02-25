import { useCallback, useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ThreeOverlayHandle, DangerZone, MapboxViewerHandle } from "./types";
import type { MapStyleKey } from "./constants";
import { MODEL_TRANSFORM } from "./config/site.config";
import { ThreeOverlay } from "./three/ThreeOverlay";
import { FeaturePopup } from "./overlays/FeaturePopup";
import { EmergencyBanner } from "./overlays/EmergencyBanner";
import { AreaSelectionOverlay, type SelectionRect } from "./overlays/AreaSelectionOverlay";
import { CCTVPopupGrid } from "./overlays/CCTVPopupGrid";
import { FeatureLabelOverlay } from "./overlays/FeatureLabelOverlay";
import { useMapboxSetup } from "./hooks/useMapboxSetup";
import { useMapInteractions } from "./hooks/useMapInteractions";
import { useEmergencyState } from "./hooks/useEmergencyState";
import { useFeatureSelection } from "./hooks/useFeatureSelection";
import { useMapboxViewerHandle } from "./hooks/useMapboxViewerHandle";
import { CameraDebugPanel } from "./overlays/CameraDebugPanel";
import { useCCTVPopupStore, selectCCTVPopups } from "@/stores";
import { FilterChip, FilterChipGroup } from "@pf-dev/ui/molecules";
import { CCTV as CCTVIcon, User as UserIcon, X as XIcon } from "@pf-dev/ui/atoms";

export type { MapboxViewerHandle };

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
  const coordRef = useRef<HTMLDivElement>(null);
  const currentStyleRef = useRef<MapStyleKey>("day");
  const renderCallbacksRef = useRef<Set<() => void>>(new Set());

  const [showCCTVLabels, setShowCCTVLabels] = useState(false);
  const [showWorkerLabels, setShowWorkerLabels] = useState(false);
  const [searchHitIds, setSearchHitIds] = useState<Set<string>>(new Set());

  const onWorkerSelectRef = useRef(onWorkerSelect);
  useEffect(() => {
    onWorkerSelectRef.current = onWorkerSelect;
  }, [onWorkerSelect]);

  const { selectedFeature, setSelectedFeature, selectedIdRef, doSelectWorker, handleFeatureClick } =
    useFeatureSelection({ overlayRef, onWorkerSelectRef });

  const handleCCTVChipChange = useCallback((selected: boolean) => {
    setShowCCTVLabels(selected);
    if (!selected) {
      useCCTVPopupStore.getState().closeAll();
    }
  }, []);

  const handleWorkerChipChange = useCallback(
    (selected: boolean) => {
      setShowWorkerLabels(selected);
      if (!selected) {
        setSelectedFeature(null);
        overlayRef.current?.clearHighlight();
        onWorkerSelectRef.current?.(null);
      }
    },
    [setSelectedFeature]
  );

  const { mapRef } = useMapboxSetup({
    containerRef,
    overlayRef,
    popupRef,
    selectedIdRef,
    renderCallbacksRef,
    sitePolygonWKT,
    currentStyleRef,
  });

  const {
    emergency,
    bannerVisible,
    bannerWorkerId,
    bannerMessage,
    triggerEmergency,
    doResetEmergency,
  } = useEmergencyState({
    mapRef,
    overlayRef,
    setSelectedFeature,
    onWorkerSelectRef,
    onScenarioEnd,
  });

  useMapboxViewerHandle({
    ref,
    mapRef,
    overlayRef,
    currentStyleRef,
    setSelectedFeature,
    doSelectWorker,
    triggerEmergency,
    doResetEmergency,
  });

  const cctvPopups = useCCTVPopupStore(selectCCTVPopups);

  const getTransform = useCallback(() => MODEL_TRANSFORM, []);
  const requestRepaint = useCallback(() => {
    mapRef.current?.triggerRepaint();
  }, [mapRef]);

  useMapInteractions({
    mapRef,
    overlayRef,
    selectedIdRef,
    coordRef,
    onFeatureSelect: setSelectedFeature,
    onWorkerSelect: (workerId) => onWorkerSelectRef.current?.(workerId),
  });

  const handleAreaSelectionComplete = useCallback(
    (rect: SelectionRect) => {
      const canvas = mapRef.current?.getCanvas();
      if (!canvas || !overlayRef.current) return;

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

  const handleSelectionCancel = useCallback(() => {
    overlayRef.current?.clearAllMarkers();
    overlayRef.current?.clearHighlight();
    setSearchHitIds(new Set());
    onSelectionCancel?.();
  }, [onSelectionCancel]);

  return (
    <div className="relative h-full w-full" onContextMenu={(e) => e.preventDefault()}>
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
        <EmergencyBanner
          bannerVisible={bannerVisible}
          bannerWorkerId={bannerWorkerId}
          bannerMessage={bannerMessage}
          workerNames={workerNames}
          onReset={doResetEmergency}
        />
      )}

      <div className="pointer-events-auto absolute left-1/2 top-[4.25rem] z-[5] -translate-x-1/2">
        <FilterChipGroup>
          <FilterChip selected={showCCTVLabels} onChange={handleCCTVChipChange}>
            <span className="flex items-center gap-1.5">
              <CCTVIcon size="sm" />
              CCTV
            </span>
          </FilterChip>
          <FilterChip selected={showWorkerLabels} onChange={handleWorkerChipChange}>
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

      {import.meta.env.DEV && (
        <>
          <div
            ref={coordRef}
            className="pointer-events-none absolute bottom-2 left-2 z-[5] rounded bg-black/60 px-2 py-1 font-mono text-xs text-white"
          />
          <CameraDebugPanel mapRef={mapRef} />
        </>
      )}
    </div>
  );
}
