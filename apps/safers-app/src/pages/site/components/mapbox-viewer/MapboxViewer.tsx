import { useCallback, useEffect, useRef, useState, useImperativeHandle } from "react";
import { Map as MapboxMap, type CustomLayerInterface } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ModelTransform, ThreeOverlayHandle, WorkerVitals, FeaturePosition } from "./types";
import {
  MAPBOX_TOKEN,
  INITIAL_VIEW,
  MAP_STYLES,
  COLOR_DANGER,
  EMERGENCY_CAMERA,
  BUILDING_OPACITY,
  DEFAULT_FLY_DURATION,
  DEFAULT_BANNER_MESSAGE,
  type MapStyleKey,
} from "./constants";
import { DEFAULT_WORKER_VITALS } from "../../mocks";
import { ThreeOverlay } from "./ThreeOverlay";
import { CCTVPopup } from "./CCTVPopup";
import { FeaturePopup } from "./FeaturePopup";
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
}

interface MapboxViewerProps {
  ref?: React.Ref<MapboxViewerHandle>;
  workerNames?: Record<string, string>;
  onWorkerSelect?: (workerId: string | null) => void;
  onScenarioEnd?: () => void;
}

const MODEL_TRANSFORM: ModelTransform = {
  lng: 126.84714,
  lat: 37.498996,
  altitude: -13,
  rotationX: 90,
  rotationY: 112,
  rotationZ: 0,
  scale: 1,
};

export function MapboxViewer({
  ref,
  workerNames,
  onWorkerSelect,
  onScenarioEnd,
}: MapboxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<ThreeOverlayHandle>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [emergency, setEmergency] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerWorkerId, setBannerWorkerId] = useState("");
  const [bannerMessage, setBannerMessage] = useState(DEFAULT_BANNER_MESSAGE);

  const [selectedFeature, setSelectedFeature] = useState<{
    id: string;
    lng: number;
    lat: number;
    altitude: number;
    vitals: WorkerVitals | null;
    streamUrl: string | null;
  } | null>(null);
  // stale closure 방지용 mirror ref
  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    const prevId = selectedIdRef.current;
    const newId = selectedFeature?.id ?? null;
    selectedIdRef.current = newId;

    // CCTV FOV 표시/숨김 — getCCTVStreamUrl이 값을 반환하면 CCTV
    if (prevId && overlayRef.current?.getCCTVStreamUrl(prevId)) {
      overlayRef.current.setFeatureFOVVisible(prevId, false);
    }
    if (newId && overlayRef.current?.getCCTVStreamUrl(newId)) {
      overlayRef.current.setFeatureFOVVisible(newId, true);
    }
  }, [selectedFeature]);

  // onWorkerSelect 콜백 mirror ref
  const onWorkerSelectRef = useRef(onWorkerSelect);
  useEffect(() => {
    onWorkerSelectRef.current = onWorkerSelect;
  }, [onWorkerSelect]);

  // 활성 워커 추적 (resetEmergency에서 사용)
  const activeWorkerRef = useRef<string | null>(null);

  // getter 패턴 — React ref 의존 없이 순수 함수로 전달 가능
  const getTransform = useCallback(() => MODEL_TRANSFORM, []);

  // 워커 선택 공통 로직
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
    if (pos) {
      setSelectedFeature({
        id: workerId,
        lng: pos.lng,
        lat: pos.lat,
        altitude: pos.altitude,
        vitals,
        streamUrl,
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

    onWorkerSelectRef.current?.(null);
    onScenarioEnd?.();
  }, [onScenarioEnd]);

  useImperativeHandle(ref, () => ({
    setStyle(style: MapStyleKey) {
      if (mapRef.current) {
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
      const vitals = streamUrl ? null : (overlayRef.current?.getWorkerVitals(featureId) ?? null);
      setSelectedFeature({
        id: featureId,
        lng: pos.lng,
        lat: pos.lat,
        altitude: pos.altitude,
        vitals,
        streamUrl,
      });
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
  }));

  const requestRepaint = useCallback(() => {
    mapRef.current?.triggerRepaint();
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapboxMap({
      container: containerRef.current,
      style: MAP_STYLES.day,
      accessToken: MAPBOX_TOKEN,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      antialias: true,
      // @ts-expect-error — useWebGL2 exists in Mapbox GL JS v3 but missing from types
      useWebGL2: true,
      performanceMetricsCollection: false,
      logoPosition: "bottom-left",
      attributionControl: false,
    });

    // 방향키: ↑↓ 전진/후퇴, ←→ 회전
    map.keyboard.disable();
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      if (!keys.includes(e.key)) return;
      e.preventDefault();

      if (e.key === "ArrowLeft") {
        map.rotateTo(map.getBearing() + 3, { duration: 100 });
      } else if (e.key === "ArrowRight") {
        map.rotateTo(map.getBearing() - 3, { duration: 100 });
      } else {
        // 전진/후퇴: bearing 방향 기준 이동
        const step = e.key === "ArrowUp" ? -10 : 10;
        map.panBy([0, step], { duration: 100 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const onStyleLoad = () => {
      // Matrix Bridge — Mapbox 커스텀 레이어로 행렬만 캡처
      if (!map.getLayer("matrix-bridge")) {
        map.addLayer({
          id: "matrix-bridge",
          type: "custom",
          renderingMode: "3d",
          onAdd() {},
          render(_gl: WebGL2RenderingContext, matrix: number[]) {
            const needsRepaint = overlayRef.current?.render(matrix);
            if (needsRepaint) map.triggerRepaint();
          },
        } as unknown as CustomLayerInterface);
      }

      // Mapbox Standard config — POI 라벨 숨기기
      const setConfig = (map as unknown as Record<string, unknown>).setConfigProperty as
        | ((namespace: string, key: string, value: unknown) => void)
        | undefined;
      if (setConfig) {
        setConfig.call(map, "basemap", "showPointOfInterestLabels", false);
      }
    };

    // 좌표 표시 + Feature 호버 하이라이트 (DOM 직접 조작 — React re-render 방지)
    map.on("mousemove", (e) => {
      const canvas = map.getCanvas();
      const hit = overlayRef.current?.raycast(
        e.point.x,
        e.point.y,
        canvas.clientWidth,
        canvas.clientHeight
      );

      // Feature 하이라이트 (선택 중에는 호버 하이라이트 무시)
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

      // 좌표 오버레이
      if (coordRef.current) {
        if (hit) {
          coordRef.current.textContent = `[Model: ${hit.meshName}]  Lng: ${hit.lng.toFixed(6)}  Lat: ${hit.lat.toFixed(6)}  Alt: ${hit.altitude.toFixed(1)}m`;
        } else {
          const { lng, lat } = e.lngLat;
          coordRef.current.textContent = `[Map]  Lng: ${lng.toFixed(6)}  Lat: ${lat.toFixed(6)}  Alt: 0m`;
        }
      }
    });

    map.on("mouseout", () => {
      if (!selectedIdRef.current) {
        overlayRef.current?.clearHighlight();
      }
      if (coordRef.current) {
        coordRef.current.textContent = "";
      }
    });

    // 클릭 → Feature 선택/해제
    map.on("click", (e) => {
      const canvas = map.getCanvas();
      const hit = overlayRef.current?.raycast(
        e.point.x,
        e.point.y,
        canvas.clientWidth,
        canvas.clientHeight
      );

      if (hit?.featureId) {
        const streamUrl = overlayRef.current?.getCCTVStreamUrl(hit.featureId) ?? null;
        const vitals = streamUrl
          ? null
          : (overlayRef.current?.getWorkerVitals(hit.featureId) ?? null);
        setSelectedFeature({
          id: hit.featureId,
          lng: hit.lng,
          lat: hit.lat,
          altitude: hit.altitude,
          vitals,
          streamUrl,
        });
        overlayRef.current?.highlightFeature(hit.featureId);
        if (!streamUrl) onWorkerSelectRef.current?.(hit.featureId);
      } else {
        setSelectedFeature(null);
        overlayRef.current?.clearHighlight();
        onWorkerSelectRef.current?.(null);
      }
    });

    // 매 프레임 팝업 + 이름 라벨 위치 업데이트 (DOM 직접 조작)
    map.on("render", () => {
      const canvas = map.getCanvas();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      // 팝업 위치
      const selId = selectedIdRef.current;
      if (selId && popupRef.current) {
        const pos = overlayRef.current?.projectFeatureToScreen(selId, w, h);
        if (pos) {
          popupRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
          popupRef.current.style.display = "";
        } else {
          popupRef.current.style.display = "none";
        }
      }
    });

    map.on("style.load", onStyleLoad);
    mapRef.current = map;

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <ThreeOverlay ref={overlayRef} getTransform={getTransform} requestRepaint={requestRepaint} />
      {emergency && (
        <div className="pointer-events-none absolute inset-0 z-[3]">
          {/* 빨간 비네트 */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              boxShadow:
                "inset 0 0 5rem 1.25rem rgba(222,69,69,0.35), inset 0 0 12.5rem 3.75rem rgba(222,69,69,0.2)",
              animationDuration: "2s",
            }}
          />
          {/* 빨간 테두리 */}
          <div
            className="absolute inset-0 animate-pulse border-[0.125rem] border-[#DE4545]/80"
            style={{ animationDuration: "2s" }}
          />
          {/* 상단 경고 배너 */}
          {bannerVisible && (
            <div
              role="alert"
              aria-live="assertive"
              className="pointer-events-auto absolute inset-x-0 top-[10%] flex items-center justify-center"
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
      {selectedFeature && (
        <div
          ref={popupRef}
          className="pointer-events-none absolute left-0 top-0 z-[2]"
          style={{ willChange: "transform" }}
        >
          <div className="-translate-x-1/2 -translate-y-full">
            {selectedFeature.streamUrl ? (
              <CCTVPopup
                featureId={selectedFeature.id}
                streamUrl={selectedFeature.streamUrl}
                onClose={() => {
                  setSelectedFeature(null);
                  overlayRef.current?.clearHighlight();
                }}
              />
            ) : (
              <FeaturePopup
                featureId={selectedFeature.id}
                workerName={workerNames?.[selectedFeature.id]}
                position={selectedFeature}
                vitals={selectedFeature.vitals}
                abnormal={emergency}
                onClose={() => {
                  setSelectedFeature(null);
                  overlayRef.current?.clearHighlight();
                  onWorkerSelectRef.current?.(null);
                }}
              />
            )}
          </div>
        </div>
      )}
      <div
        ref={coordRef}
        className="pointer-events-none absolute bottom-2 left-2 z-10 rounded bg-black/70 px-3 py-1.5 font-mono text-xs text-white"
      />
    </div>
  );
}
