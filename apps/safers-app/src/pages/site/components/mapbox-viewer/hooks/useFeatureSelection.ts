import { useCallback, useEffect, useRef, useState } from "react";
import type { ThreeOverlayHandle, SelectedFeatureData } from "../types";
import { useCCTVPopupStore, useFeatureDataStore } from "@/stores";

interface UseFeatureSelectionOptions {
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  onWorkerSelectRef: React.RefObject<((workerId: string | null) => void) | undefined>;
}

export function useFeatureSelection(options: UseFeatureSelectionOptions) {
  const { overlayRef, onWorkerSelectRef } = options;

  const [selectedFeature, setSelectedFeature] = useState<SelectedFeatureData | null>(null);

  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selectedFeature?.id ?? null;
  }, [selectedFeature]);

  const doSelectWorker = useCallback(
    (workerId: string | null) => {
      if (!workerId) {
        setSelectedFeature(null);
        overlayRef.current?.clearHighlight();
        onWorkerSelectRef.current?.(null);
        return;
      }

      const pos = overlayRef.current?.getFeaturePosition(workerId);
      const featureData = useFeatureDataStore.getState();
      const vitals = featureData.getWorkerVitals(workerId);
      const streamUrl = featureData.getCCTVStreamUrl(workerId);
      const location = featureData.getWorkerLocation(workerId);
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
    },
    [overlayRef, onWorkerSelectRef]
  );

  const handleFeatureClick = useCallback(
    (featureId: string) => {
      const featureData = useFeatureDataStore.getState();
      const streamUrl = featureData.getCCTVStreamUrl(featureId);

      if (streamUrl) {
        useCCTVPopupStore.getState().openPopup(featureId, streamUrl);
        overlayRef.current?.highlightFeature(featureId);
      } else {
        const pos = overlayRef.current?.getFeaturePosition(featureId);
        if (!pos) return;
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
        overlayRef.current?.highlightFeature(featureId);
        onWorkerSelectRef.current?.(featureId);
      }
    },
    [overlayRef, onWorkerSelectRef]
  );

  return {
    selectedFeature,
    setSelectedFeature,
    selectedIdRef,
    doSelectWorker,
    handleFeatureClick,
  };
}
