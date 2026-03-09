import { useEffect, useRef, useImperativeHandle } from "react";
import type { ModelTransform, ThreeOverlayHandle, FeaturePosition, DangerZone } from "../types";
import type { GeoPosition } from "@/services/types/worker.types";
import { createThreeScene, type ThreeSceneApi } from "./create-three-scene";
import { MODEL_URL } from "../config/site.config";
import { useFeatureDataStore } from "@/stores";
import {
  ASSET_URLS,
  fetchWorkerPositions,
  WORKER1_PATROL_PATH,
  WORKER1_PATROL_DURATION,
  WORKER4_PATROL_PATH,
  WORKER4_PATROL_DURATION,
  DUMP_PATROL_PATH,
  DUMP_PATROL_DURATION,
  CCTV_PLACEMENTS,
  SAMPLE_SITE_ID,
} from "../../../config";
import { cctvService } from "@/services";

interface ThreeOverlayProps {
  ref?: React.Ref<ThreeOverlayHandle>;
  getTransform: () => ModelTransform;
  requestRepaint: () => void;
  dangerZones?: DangerZone[];
  onLoad?: () => void;
}

export function ThreeOverlay({
  ref,
  getTransform,
  requestRepaint,
  dangerZones,
  onLoad,
}: ThreeOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<ThreeSceneApi | null>(null);

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
    swapFeatureAsset(id: string, newAssetId: string) {
      sceneRef.current?.swapFeatureAsset(id, newAssetId);
    },
    setBuildingOpacity(opacity: number) {
      sceneRef.current?.setBuildingOpacity(opacity);
    },
    setBuildingClipAltitude(altitude: number | null, workerPosition?: FeaturePosition) {
      sceneRef.current?.setBuildingClipAltitude(altitude, workerPosition);
    },
    setBuildingFloorTransparency(
      altitude: number | null,
      opacity?: number,
      workerPosition?: FeaturePosition
    ) {
      sceneRef.current?.setBuildingFloorTransparency(altitude, opacity, workerPosition);
    },
    checkOcclusion(featureId: string) {
      return sceneRef.current?.checkOcclusion(featureId) ?? false;
    },
    moveFeatureTo(
      id: string,
      target: FeaturePosition,
      durationMs: number,
      onComplete?: () => void
    ) {
      sceneRef.current?.moveFeatureTo(id, target, durationMs, onComplete);
    },
    moveFeatureAlongPath(
      id: string,
      path: FeaturePosition[],
      durationMs: number,
      onComplete?: () => void
    ) {
      sceneRef.current?.moveFeatureAlongPath(id, path, durationMs, onComplete);
    },
    getInitialPosition(id: string) {
      return sceneRef.current?.getInitialPosition(id) ?? null;
    },
    setFeatureHeading(id: string, radians: number) {
      sceneRef.current?.setFeatureHeading(id, radians);
    },
    setFeatureFrustum(id: string, corners: [GeoPosition, GeoPosition, GeoPosition, GeoPosition]) {
      sceneRef.current?.setFeatureFrustum(id, corners);
    },
    setFeatureFOVVisible(id: string, visible: boolean) {
      sceneRef.current?.setFeatureFOVVisible(id, visible);
    },
    setFOVColor(id: string, color: number) {
      sceneRef.current?.setFOVColor(id, color);
    },
    getAllFeatureScreenPositions(width: number, height: number) {
      return sceneRef.current?.getAllFeatureScreenPositions(width, height) ?? new Map();
    },
    highlightFeatures(ids: string[], color?: number) {
      sceneRef.current?.highlightFeatures(ids, color);
    },
    pushLivePosition(id: string, position: FeaturePosition, lerpMs?: number) {
      sceneRef.current?.pushLivePosition(id, position, lerpMs);
    },
    addFeatureMarker(id: string, color?: number, radius?: number) {
      sceneRef.current?.addFeatureMarker(id, color, radius);
    },
    removeFeatureMarker(id: string) {
      sceneRef.current?.removeFeatureMarker(id);
    },
    clearAllMarkers() {
      sceneRef.current?.clearAllMarkers();
    },
    setDangerZones(zones: DangerZone[]) {
      sceneRef.current?.setDangerZones(zones);
    },
    startPatrol(id: string, path: FeaturePosition[], durationMs: number) {
      sceneRef.current?.startPatrol(id, path, durationMs);
    },
    stopPatrol(id: string) {
      sceneRef.current?.stopPatrol(id);
    },
    probeAltitude(lng: number, lat: number) {
      return sceneRef.current?.probeAltitude(lng, lat) ?? null;
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const store = useFeatureDataStore.getState();

    const sceneApi = createThreeScene({
      canvas,
      modelUrl: MODEL_URL,
      getTransform,
      requestRepaint,
    });
    sceneRef.current = sceneApi;

    if (dangerZones && dangerZones.length > 0) {
      sceneApi.setDangerZones(dangerZones);
    }

    // 에셋은 건물 모델과 병렬로 로드 시작
    const workerReady = sceneApi.registerAsset("worker", ASSET_URLS.worker);
    const walkReady = sceneApi.registerAsset("worker-walk", ASSET_URLS.workerWalk);
    sceneApi.registerAsset("worker-stunned", ASSET_URLS.workerStunned);
    const cctvReady = sceneApi.registerAsset("cctv", ASSET_URLS.cctv);
    const dumpReady = sceneApi.registerAsset("dump", ASSET_URLS.dump);
    const crane01Ready = sceneApi.registerAsset("crane-01", ASSET_URLS.crane01);
    const crane02Ready = sceneApi.registerAsset("crane-02", ASSET_URLS.crane02);

    // 건물 모델 로드 완료 후 feature 배치
    sceneApi.modelReady.then(async () => {
      // 건물 로드 완료 → 에셋 로드 대기 후 feature 배치
      await Promise.all([workerReady, cctvReady, dumpReady, crane01Ready, crane02Ready]);

      // 작업자
      const workers = await fetchWorkerPositions();
      for (const w of workers) {
        sceneApi.addFeature(w.id, "worker", w.position);
        store.updateWorkerVitals(w.id, w.vitals);
        store.updateWorkerLocation(
          w.id,
          w.id === "worker-6"
            ? { locationType: "indoor", building: "103동", floor: "12F", floorNumber: 12 }
            : { locationType: "outdoor", floor: "", floorNumber: 0 }
        );
      }
      sceneApi.setFeatureHeading("worker-5", Math.PI);

      await walkReady;
      sceneApi.swapFeatureAsset("worker-1", "worker-walk");
      sceneApi.startPatrol("worker-1", WORKER1_PATROL_PATH, WORKER1_PATROL_DURATION);
      sceneApi.swapFeatureAsset("worker-4", "worker-walk");
      sceneApi.startPatrol("worker-4", WORKER4_PATROL_PATH, WORKER4_PATROL_DURATION);

      // 덤프트럭
      sceneApi.addFeature("dump-1", "dump", DUMP_PATROL_PATH[0]!);
      sceneApi.startPatrol("dump-1", DUMP_PATROL_PATH, DUMP_PATROL_DURATION);

      // 크레인
      sceneApi.addFeature("crane-1", "crane-01", {
        lng: 126.847021,
        lat: 37.499858,
        altitude: 8.5,
      });
      sceneApi.setFeatureHeading("crane-1", (Math.PI * 110) / 180);

      sceneApi.addFeature("crane-2", "crane-02", {
        lng: 126.846997,
        lat: 37.498983,
        altitude: 3.4,
      });
      sceneApi.setFeatureHeading("crane-2", (Math.PI * 110) / 180);

      // CCTV — API에서 목록 가져오고, 3D 배치는 mock 보충 데이터 사용
      const cctvs = await cctvService.getCCTVs(SAMPLE_SITE_ID).catch(() => []);
      for (const cctv of cctvs) {
        const placement = CCTV_PLACEMENTS[cctv.id];
        if (!placement) continue; // 3D 배치 정보 없는 CCTV는 스킵
        const featureId = `cctv-${cctv.id}`;
        sceneApi.addFeature(featureId, "cctv", placement.position);
        sceneApi.setFeatureHeading(featureId, (placement.heading * Math.PI) / 180);
        if (placement.frustumCorners) {
          sceneApi.setFeatureFrustum(featureId, placement.frustumCorners);
        }
        const whepUrl = cctvService.getWHEPUrl(cctv.streamName, SAMPLE_SITE_ID);
        store.setCCTVStreamUrl(featureId, whepUrl);
        const displayName =
          cctv.name
            .replace(cctv.site.name, "")
            .replace(/^[-_\s]+/, "")
            .trim() || cctv.name;
        store.setCCTVName(featureId, displayName);
      }

      onLoad?.();
    });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dangerZones는 초기 설정 후 변경되지 않음
  }, [getTransform, requestRepaint]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" />;
}
