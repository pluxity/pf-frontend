import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle, SelectedFeatureData } from "../types";
import { useCCTVPopupStore } from "@/stores";

interface UseMapInteractionsOptions {
  mapRef: React.RefObject<MapboxMap | null>;
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  selectedIdRef: React.RefObject<string | null>;
  onFeatureSelect: (feature: SelectedFeatureData | null) => void;
  onWorkerSelect: (workerId: string | null) => void;
}

export function useMapInteractions(opts: UseMapInteractionsOptions): void {
  const { mapRef, overlayRef, selectedIdRef, onFeatureSelect, onWorkerSelect } = opts;

  const cbRef = useRef({ onFeatureSelect, onWorkerSelect });
  useEffect(() => {
    cbRef.current = { onFeatureSelect, onWorkerSelect };
  });

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();

      if (e.key === "ArrowLeft") {
        map.rotateTo(map.getBearing() + 3, { duration: 100 });
      } else if (e.key === "ArrowRight") {
        map.rotateTo(map.getBearing() - 3, { duration: 100 });
      } else {
        const step = e.key === "ArrowUp" ? -10 : 10;
        map.panBy([0, step], { duration: 100 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const handleMouseMove = (e: { point: { x: number; y: number } }) => {
      const canvas = map.getCanvas();
      const hit = overlayRef.current?.raycast(
        e.point.x,
        e.point.y,
        canvas.clientWidth,
        canvas.clientHeight
      );

      if (!selectedIdRef.current) {
        if (hit?.featureId) {
          overlayRef.current?.highlightFeature(hit.featureId);
          canvas.style.cursor = "pointer";
        } else {
          overlayRef.current?.clearHighlight();
          canvas.style.cursor = "";
        }
      } else {
        canvas.style.cursor = hit?.featureId ? "pointer" : "";
      }
    };

    const handleMouseOut = () => {
      if (!selectedIdRef.current) {
        overlayRef.current?.clearHighlight();
      }
    };

    const handleClick = (e: { point: { x: number; y: number } }) => {
      const canvas = map.getCanvas();
      const hit = overlayRef.current?.raycast(
        e.point.x,
        e.point.y,
        canvas.clientWidth,
        canvas.clientHeight
      );

      if (hit?.featureId) {
        const streamUrl = overlayRef.current?.getCCTVStreamUrl(hit.featureId) ?? null;

        if (streamUrl) {
          useCCTVPopupStore.getState().openPopup(hit.featureId, streamUrl);
          overlayRef.current?.highlightFeature(hit.featureId);
        } else {
          const vitals = overlayRef.current?.getWorkerVitals(hit.featureId) ?? null;
          cbRef.current.onFeatureSelect({
            id: hit.featureId,
            lng: hit.lng,
            lat: hit.lat,
            altitude: hit.altitude,
            vitals,
            streamUrl: null,
            location: overlayRef.current?.getWorkerLocation(hit.featureId) ?? null,
          });
          overlayRef.current?.highlightFeature(hit.featureId);
          cbRef.current.onWorkerSelect(hit.featureId);
        }
      } else {
        cbRef.current.onFeatureSelect(null);
        overlayRef.current?.clearHighlight();
        cbRef.current.onWorkerSelect(null);
      }
    };

    map.on("mousemove", handleMouseMove);
    map.on("mouseout", handleMouseOut);
    map.on("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      map.off("mousemove", handleMouseMove);
      map.off("mouseout", handleMouseOut);
      map.off("click", handleClick);
    };
  }, []);
}
