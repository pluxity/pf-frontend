import { useEffect, useRef, useImperativeHandle } from "react";
import type { ModelTransform, ThreeOverlayHandle, WorkerVitals } from "./types";
import { createThreeScene, type ThreeSceneApi } from "./create-three-scene";
import { MODEL_URL } from "./constants";

/** 서버 페칭 시뮬레이션 — 실제로는 웨어러블 밴드 → 서버 → API 호출로 대체 */
async function fetchWorkerPositions() {
  await new Promise((r) => setTimeout(r, 500));

  return [
    {
      id: "worker-1",
      position: { lng: 126.846723, lat: 37.500259, altitude: 3.5 },
      vitals: { temperature: 36.5, heartRate: 78 },
    },
    {
      id: "worker-2",
      position: { lng: 126.84648, lat: 37.499865, altitude: 11.9 },
      vitals: { temperature: 36.8, heartRate: 92 },
    },
    {
      id: "worker-3",
      position: { lng: 126.846643, lat: 37.499556, altitude: 11.9 },
      vitals: { temperature: 36.7, heartRate: 82 },
    },
    {
      id: "worker-4",
      position: { lng: 126.847061, lat: 37.499351, altitude: 11.9 },
      vitals: { temperature: 36.4, heartRate: 85 },
    },
    {
      id: "worker-5",
      position: { lng: 126.847065, lat: 37.499254, altitude: 9.7 },
      vitals: { temperature: 36.6, heartRate: 72 },
    },
    {
      id: "worker-6",
      position: { lng: 126.846965, lat: 37.49946, altitude: 37.7 },
      vitals: { temperature: 36.5, heartRate: 76 },
    },
  ];
}

interface ThreeOverlayProps {
  ref?: React.Ref<ThreeOverlayHandle>;
  transformRef: React.RefObject<ModelTransform>;
  requestRepaint: () => void;
}

export function ThreeOverlay({ ref, transformRef, requestRepaint }: ThreeOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ThreeSceneApi | null>(null);
  const vitalsRef = useRef<Map<string, WorkerVitals>>(new Map());

  useImperativeHandle(ref, () => ({
    render(matrix: number[]) {
      return sceneRef.current?.render(matrix) ?? false;
    },
    raycast(screenX: number, screenY: number, width: number, height: number) {
      return sceneRef.current?.raycast(screenX, screenY, width, height) ?? null;
    },
    highlightFeature(id: string, color?: number) {
      sceneRef.current?.highlightFeature(id, color);
    },
    clearHighlight() {
      sceneRef.current?.clearHighlight();
    },
    projectFeatureToScreen(id: string, width: number, height: number) {
      return sceneRef.current?.projectFeatureToScreen(id, width, height) ?? null;
    },
    getWorkerVitals(id: string) {
      return vitalsRef.current.get(id) ?? null;
    },
    swapFeatureAsset(id: string, newAssetId: string) {
      sceneRef.current?.swapFeatureAsset(id, newAssetId);
    },
    updateWorkerVitals(id: string, vitals: WorkerVitals) {
      vitalsRef.current.set(id, vitals);
    },
    setBuildingOpacity(opacity: number) {
      sceneRef.current?.setBuildingOpacity(opacity);
    },
    checkOcclusion(featureId: string) {
      return sceneRef.current?.checkOcclusion(featureId) ?? false;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sceneApi = createThreeScene(canvas, MODEL_URL, transformRef, requestRepaint);
    sceneRef.current = sceneApi;

    // 에셋 등록 + 워커 배치
    sceneApi.registerAsset("worker", "/assets/models/worker_walk.glb");
    sceneApi.registerAsset("worker-stunned", "/assets/models/worker_stunned.glb");

    fetchWorkerPositions().then((workers) => {
      for (const w of workers) {
        sceneApi.addFeature(w.id, "worker", w.position);
        vitalsRef.current.set(w.id, w.vitals);
      }
    });

    // ResizeObserver로 Mapbox 캔버스와 크기 동기화
    const parent = canvas.parentElement;
    if (!parent) return;

    const syncSize = () => {
      const { clientWidth, clientHeight } = parent;
      if (clientWidth > 0 && clientHeight > 0) {
        canvas.width = clientWidth * (window.devicePixelRatio || 1);
        canvas.height = clientHeight * (window.devicePixelRatio || 1);
        canvas.style.width = `${clientWidth}px`;
        canvas.style.height = `${clientHeight}px`;
        sceneApi.setSize(clientWidth, clientHeight);
        requestRepaint();
      }
    };

    const observer = new ResizeObserver(syncSize);
    observer.observe(parent);
    syncSize();

    return () => {
      observer.disconnect();
      sceneApi.dispose();
      sceneRef.current = null;
    };
  }, [transformRef, requestRepaint]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" />;
}
