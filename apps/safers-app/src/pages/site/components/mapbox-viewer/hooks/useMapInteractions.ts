import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { ThreeOverlayHandle, SelectedFeatureData, FeaturePosition } from "../types";
import { useCCTVPopupStore, useFeatureDataStore } from "@/stores";

interface UseMapInteractionsOptions {
  mapRef: React.RefObject<MapboxMap | null>;
  overlayRef: React.RefObject<ThreeOverlayHandle | null>;
  selectedIdRef: React.RefObject<string | null>;
  coordRef?: React.RefObject<HTMLDivElement | null>;
  pathEditingRef?: React.RefObject<boolean>;
  addPathPointRef?: React.RefObject<((p: FeaturePosition) => void) | null>;
  onFeatureSelect: (feature: SelectedFeatureData | null) => void;
  onWorkerSelect: (workerId: string | null) => void;
}

export function useMapInteractions(opts: UseMapInteractionsOptions): void {
  const {
    mapRef,
    overlayRef,
    selectedIdRef,
    coordRef,
    pathEditingRef,
    addPathPointRef,
    onFeatureSelect,
    onWorkerSelect,
  } = opts;

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

    const handleMouseMove = (e: {
      point: { x: number; y: number };
      lngLat: { lng: number; lat: number };
    }) => {
      const canvas = map.getCanvas();
      const hit = overlayRef.current?.raycast(
        e.point.x,
        e.point.y,
        canvas.clientWidth,
        canvas.clientHeight
      );

      if (coordRef?.current) {
        if (hit) {
          const label = hit.featureId ? `Feature: ${hit.featureId}` : `Model: ${hit.meshName}`;
          coordRef.current.textContent = `[${label}]  Lng: ${hit.lng.toFixed(6)}  Lat: ${hit.lat.toFixed(6)}  Alt: ${hit.altitude.toFixed(2)}m`;
        } else {
          coordRef.current.textContent = `[Map]  Lng: ${e.lngLat.lng.toFixed(6)}  Lat: ${e.lngLat.lat.toFixed(6)}  Alt: 0m`;
        }
      }

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
      if (coordRef?.current) {
        coordRef.current.textContent = "";
      }
      if (!selectedIdRef.current) {
        overlayRef.current?.clearHighlight();
      }
    };

    const handleClick = (e: {
      point: { x: number; y: number };
      lngLat: { lng: number; lat: number };
    }) => {
      if (pathEditingRef?.current) {
        const canvas = map.getCanvas();
        const hit = overlayRef.current?.raycast(
          e.point.x,
          e.point.y,
          canvas.clientWidth,
          canvas.clientHeight
        );
        const point: FeaturePosition = hit
          ? {
              lng: Math.round(hit.lng * 1e6) / 1e6,
              lat: Math.round(hit.lat * 1e6) / 1e6,
              altitude: Math.round(hit.altitude * 100) / 100,
            }
          : {
              lng: Math.round(e.lngLat.lng * 1e6) / 1e6,
              lat: Math.round(e.lngLat.lat * 1e6) / 1e6,
              altitude: 0,
            };
        addPathPointRef?.current?.(point);
        return;
      }

      const canvas = map.getCanvas();
      const hit = overlayRef.current?.raycast(
        e.point.x,
        e.point.y,
        canvas.clientWidth,
        canvas.clientHeight
      );

      if (hit?.featureId) {
        const featureData = useFeatureDataStore.getState();
        const streamUrl = featureData.getCCTVStreamUrl(hit.featureId);

        if (streamUrl) {
          useCCTVPopupStore.getState().openPopup(hit.featureId, streamUrl);
          overlayRef.current?.highlightFeature(hit.featureId);
        } else {
          const vitals = featureData.getWorkerVitals(hit.featureId);
          cbRef.current.onFeatureSelect({
            id: hit.featureId,
            lng: hit.lng,
            lat: hit.lat,
            altitude: hit.altitude,
            vitals,
            streamUrl: null,
            location: featureData.getWorkerLocation(hit.featureId),
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
