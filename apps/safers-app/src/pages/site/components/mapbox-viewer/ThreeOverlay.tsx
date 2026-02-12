import { useEffect, useRef, useImperativeHandle } from "react";
import type { ModelTransform, ThreeOverlayHandle, WorkerVitals } from "./types";
import { createThreeScene, type ThreeSceneApi } from "./create-three-scene";
import { MODEL_URL, ASSET_URLS } from "./constants";
import { cctvService } from "@/services";
import { fetchWorkerPositions } from "../../mocks";

interface ThreeOverlayProps {
  ref?: React.Ref<ThreeOverlayHandle>;
  getTransform: () => ModelTransform;
  requestRepaint: () => void;
}

export function ThreeOverlay({ ref, getTransform, requestRepaint }: ThreeOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ThreeSceneApi | null>(null);
  const vitalsRef = useRef<Map<string, WorkerVitals>>(new Map());
  /** CCTV featureId → WHEP stream URL */
  const cctvStreamUrlsRef = useRef<Map<string, string>>(new Map());

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
    getFeaturePosition(id: string) {
      return sceneRef.current?.getFeaturePosition(id) ?? null;
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
    moveFeatureTo(id: string, target, durationMs: number, onComplete?: () => void) {
      sceneRef.current?.moveFeatureTo(id, target, durationMs, onComplete);
    },
    getInitialPosition(id: string) {
      return sceneRef.current?.getInitialPosition(id) ?? null;
    },
    setFeatureHeading(id: string, radians: number) {
      sceneRef.current?.setFeatureHeading(id, radians);
    },
    setFeatureFOV(id: string, fovDeg: number, range: number, pitchDeg?: number) {
      sceneRef.current?.setFeatureFOV(id, fovDeg, range, pitchDeg);
    },
    setFeatureFOVVisible(id: string, visible: boolean) {
      sceneRef.current?.setFeatureFOVVisible(id, visible);
    },
    setFOVColor(id: string, color: number) {
      sceneRef.current?.setFOVColor(id, color);
    },
    getCCTVStreamUrl(id: string) {
      return cctvStreamUrlsRef.current.get(id) ?? null;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sceneApi = createThreeScene({
      canvas,
      modelUrl: MODEL_URL,
      getTransform,
      requestRepaint,
    });
    sceneRef.current = sceneApi;

    sceneApi.registerAsset("worker", ASSET_URLS.worker);
    sceneApi.registerAsset("worker-stunned", ASSET_URLS.workerStunned);
    sceneApi.registerAsset("cctv", ASSET_URLS.cctv);

    fetchWorkerPositions().then((workers) => {
      for (const w of workers) {
        sceneApi.addFeature(w.id, "worker", w.position);
        vitalsRef.current.set(w.id, w.vitals);
      }
    });

    cctvService.getCCTVList().then(({ data }) => {
      for (const cctv of data) {
        sceneApi.addFeature(cctv.id, "cctv", cctv.position);
        sceneApi.setFeatureHeading(cctv.id, (cctv.heading * Math.PI) / 180);
        sceneApi.setFeatureFOV(cctv.id, cctv.fovDeg, cctv.fovRange, cctv.pitch);
        cctvStreamUrlsRef.current.set(cctv.id, cctvService.getStreamUrl(cctv.streamName));
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
  }, [getTransform, requestRepaint]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" />;
}
