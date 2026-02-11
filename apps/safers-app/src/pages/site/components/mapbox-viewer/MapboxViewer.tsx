import { useCallback, useEffect, useRef, useState, useImperativeHandle } from "react";
import { Map as MapboxMap, type CustomLayerInterface } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ModelTransform, ThreeOverlayHandle, WorkerVitals } from "./types";
import { MAPBOX_TOKEN, INITIAL_VIEW, MAP_STYLES, type MapStyleKey } from "./constants";
import { ThreeOverlay } from "./ThreeOverlay";
import { FeaturePopup } from "./FeaturePopup";

export type ScenarioId = 1 | 2;

/** 서버 비상 이벤트 API 페칭 시뮬레이션 — 실제로는 서버 푸시/폴링으로 대체 */
async function fetchEmergencyEvent(scenario: ScenarioId) {
  await new Promise((r) => setTimeout(r, 800));

  if (scenario === 2) {
    return {
      eventId: "EVT-20260211-002",
      type: "abnormal_vitals" as const,
      workerId: "worker-6",
      position: { lng: 126.846965, lat: 37.49946, altitude: 37.7 },
      vitals: { temperature: 39.1, heartRate: 160 },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    eventId: "EVT-20260211-001",
    type: "abnormal_vitals" as const,
    workerId: "worker-3",
    position: { lng: 126.846643, lat: 37.499556, altitude: 11.9 },
    vitals: { temperature: 38.5, heartRate: 145 },
    timestamp: new Date().toISOString(),
  };
}

export interface MapboxViewerHandle {
  setStyle: (style: MapStyleKey) => void;
  triggerEmergency: (scenario: ScenarioId) => Promise<void>;
  resetEmergency: () => void;
}

interface MapboxViewerProps {
  ref?: React.Ref<MapboxViewerHandle>;
}

export function MapboxViewer({ ref }: MapboxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<ThreeOverlayHandle>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [emergency, setEmergency] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerWorkerId, setBannerWorkerId] = useState("");

  const [selectedFeature, setSelectedFeature] = useState<{
    id: string;
    lng: number;
    lat: number;
    altitude: number;
    vitals: WorkerVitals | null;
  } | null>(null);
  // stale closure 방지용 mirror ref
  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selectedFeature?.id ?? null;
  }, [selectedFeature]);

  // 활성 워커 추적 (resetEmergency에서 사용)
  const activeWorkerRef = useRef<string | null>(null);

  const transformRef = useRef<ModelTransform>({
    lng: 126.84714,
    lat: 37.498996,
    altitude: -13,
    rotationX: 90,
    rotationY: 112,
    rotationZ: 0,
    scale: 1,
  });

  useImperativeHandle(ref, () => ({
    setStyle(style: MapStyleKey) {
      if (mapRef.current) {
        mapRef.current.setStyle(MAP_STYLES[style]);
      }
    },
    async triggerEmergency(scenario: ScenarioId) {
      // 서버 이벤트 API 페칭 시뮬레이션
      const event = await fetchEmergencyEvent(scenario);

      activeWorkerRef.current = event.workerId;

      setEmergency(true);
      setBannerVisible(true);
      setBannerWorkerId(event.workerId);

      overlayRef.current?.swapFeatureAsset(event.workerId, "worker-stunned");
      overlayRef.current?.updateWorkerVitals(event.workerId, event.vitals);

      setSelectedFeature({
        id: event.workerId,
        lng: event.position.lng,
        lat: event.position.lat,
        altitude: event.position.altitude,
        vitals: event.vitals,
      });
      overlayRef.current?.highlightFeature(event.workerId, 0xde4545);

      // 오클루전 자동 감지 — 건물이 워커 위를 덮으면 투명화
      const occluded = overlayRef.current?.checkOcclusion(event.workerId) ?? false;
      if (occluded) {
        overlayRef.current?.setBuildingOpacity(0.15);
      }

      // 카메라 파라미터 — 고도 기반 자동 계산 (pitch 45.5° 통일)
      const BASE_ZOOM = 21.3;
      const BASE_ALT = 11.9;
      const bearing = 120;
      const pitch = 45.5;

      const zoom =
        event.position.altitude <= BASE_ALT
          ? BASE_ZOOM
          : BASE_ZOOM - Math.log2(event.position.altitude / BASE_ALT);

      // 고도 기반 오프셋 — pitch/bearing/altitude로 화면 중앙 보정
      const pitchRad = (pitch * Math.PI) / 180;
      const bearingRad = (bearing * Math.PI) / 180;
      const offsetMeters = event.position.altitude * Math.tan(pitchRad);
      const mPerLng = 111320 * Math.cos((event.position.lat * Math.PI) / 180);
      const mPerLat = 111320;

      mapRef.current?.flyTo({
        center: [
          event.position.lng + (offsetMeters * Math.sin(bearingRad)) / mPerLng,
          event.position.lat + (offsetMeters * Math.cos(bearingRad)) / mPerLat,
        ],
        zoom,
        pitch,
        bearing,
        duration: 2000,
        essential: true,
      });
    },
    resetEmergency() {
      const workerId = activeWorkerRef.current;

      setEmergency(false);
      setBannerVisible(false);
      setBannerWorkerId("");

      // 활성 워커 원래 모델 + 정상 바이탈 복원
      if (workerId) {
        const defaultVitals: Record<string, WorkerVitals> = {
          "worker-3": { temperature: 36.7, heartRate: 82 },
          "worker-6": { temperature: 36.5, heartRate: 76 },
        };
        overlayRef.current?.swapFeatureAsset(workerId, "worker");
        overlayRef.current?.updateWorkerVitals(
          workerId,
          defaultVitals[workerId] ?? { temperature: 36.5, heartRate: 75 }
        );
      }

      // 항상 건물 불투명 복원 (안전)
      overlayRef.current?.setBuildingOpacity(1.0);

      activeWorkerRef.current = null;
      setSelectedFeature(null);
      overlayRef.current?.clearHighlight();

      // 초기 뷰로 복귀
      mapRef.current?.flyTo({
        center: INITIAL_VIEW.center,
        zoom: INITIAL_VIEW.zoom,
        pitch: INITIAL_VIEW.pitch,
        bearing: INITIAL_VIEW.bearing,
        duration: 2000,
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
        const vitals = overlayRef.current?.getWorkerVitals(hit.featureId) ?? null;
        setSelectedFeature({
          id: hit.featureId,
          lng: hit.lng,
          lat: hit.lat,
          altitude: hit.altitude,
          vitals,
        });
        overlayRef.current?.highlightFeature(hit.featureId);
      } else {
        setSelectedFeature(null);
        overlayRef.current?.clearHighlight();
      }
    });

    // 매 프레임 팝업 위치 업데이트 (DOM 직접 조작)
    map.on("render", () => {
      const id = selectedIdRef.current;
      if (!id || !popupRef.current) return;

      const canvas = map.getCanvas();
      const pos = overlayRef.current?.projectFeatureToScreen(
        id,
        canvas.clientWidth,
        canvas.clientHeight
      );

      if (pos) {
        popupRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        popupRef.current.style.display = "";
      } else {
        popupRef.current.style.display = "none";
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
      <ThreeOverlay ref={overlayRef} transformRef={transformRef} requestRepaint={requestRepaint} />
      {/* 비상 오버레이 */}
      {emergency && (
        <div className="pointer-events-none absolute inset-0 z-[3]">
          {/* 빨간 비네트 */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              boxShadow:
                "inset 0 0 80px 20px rgba(222,69,69,0.35), inset 0 0 200px 60px rgba(222,69,69,0.2)",
              animationDuration: "2s",
            }}
          />
          {/* 빨간 테두리 */}
          <div
            className="absolute inset-0 animate-pulse border-[3px] border-[#DE4545]/80"
            style={{ animationDuration: "2s" }}
          />
          {/* 상단 경고 배너 */}
          {bannerVisible && (
            <div className="pointer-events-auto absolute inset-x-0 top-16 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-lg bg-[#DE4545]/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
                <span className="animate-pulse text-lg">&#9888;</span>
                <span>비상 상황 발생 — {bannerWorkerId} 이상징후 감지</span>
                <button
                  onClick={() => setBannerVisible(false)}
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
            <FeaturePopup
              featureId={selectedFeature.id}
              position={selectedFeature}
              vitals={selectedFeature.vitals}
              onClose={() => setSelectedFeature(null)}
            />
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
