import { useEffect, useRef, useState, useCallback } from "react";
import * as Cesium from "cesium";
import {
  Viewer,
  Cesium3DTileset,
  Cesium3DTileStyle,
  PointCloudShading,
  Cartesian3,
  Cartographic,
  Matrix4,
  Color,
  ColorMaterialProperty,
  PolygonHierarchy,
  createWorldTerrainAsync,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Cartesian2,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { DEFAULT_VIEWER_OPTIONS, TILES_URL } from "./config";

// CCTV 데이터 타입
interface CCTVData {
  id: string;
  name: string;
  position: [number, number, number];
  direction: number; // 수평 방향 (0=북, 90=동, 180=남, 270=서)
  fov: number; // 수평 시야각
  range: number; // 가시거리
  tilt?: number; // 틸트 각도 (0=수평, 90=수직 아래) - 기본값 45
}

interface CCTVConfig {
  cctvList: CCTVData[];
  viewCone: {
    fillColor: [number, number, number, number];
    lineColor: [number, number, number, number];
  };
  model: {
    path: string;
    scale: number;
  };
}

interface CesiumViewerProps {
  /** 3D Tiles URL (기본값: 환경변수 또는 config의 TILES_URL) */
  tilesUrl?: string;
  /** 고도 오프셋 (미터 단위, 양수: 위로, 음수: 아래로) */
  heightOffset?: number;
  /** 로딩 상태 변경 콜백 */
  onLoadingChange?: (loading: boolean) => void;
  /** 에러 발생 콜백 */
  onError?: (error: Error) => void;
  /** 타일셋 로드 완료 콜백 */
  onTilesetLoaded?: (tileset: Cesium3DTileset) => void;
  /** 지구본(지형) 표시 여부 */
  showGlobe?: boolean;
}

// 3D 원뿔 시야각 - 삼각형 폴리곤 배열 생성
// CCTV 위치에서 틸트 각도에 따라 펼쳐지는 원뿔 형태
function createViewCone3DPolygons(cctv: CCTVData): { positions: Cartesian3[] }[] {
  const [lng, lat, height] = cctv.position;
  const { direction, fov, range, tilt = 45 } = cctv; // 기본 틸트 45도

  // 미터 → 경위도 변환 계수 (대략적인 값, 위도에 따라 다름)
  const meterToLng = 0.000011;
  const meterToLat = 0.000009;

  const halfFov = fov / 2;
  const segments = 16; // 원뿔 측면 분할 수

  // 틸트 각도를 라디안으로 변환
  const tiltRad = (tilt * Math.PI) / 180;
  const dirRad = (direction * Math.PI) / 180;

  // 원뿔 끝점까지의 수평/수직 거리 계산
  const horizontalDist = range * Math.cos(tiltRad); // 수평 거리
  const verticalDist = range * Math.sin(tiltRad); // 수직 거리 (아래로)

  // FOV 각도에 따른 바닥면 반지름
  const bottomRadius = Math.tan((halfFov * Math.PI) / 180) * range;

  const polygons: { positions: Cartesian3[] }[] = [];

  // 꼭지점 (CCTV 위치)
  const apex = Cartesian3.fromDegrees(lng, lat, height);

  // 바닥면 원형 점들 생성 (틸트 적용)
  const bottomPoints: Cartesian3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = direction - halfFov + fov * t;
    const rad = (angle * Math.PI) / 180;

    // 방향에 따른 수평 오프셋 (틸트 적용)
    const dx = Math.sin(rad) * bottomRadius + Math.sin(dirRad) * horizontalDist;
    const dy = Math.cos(rad) * bottomRadius + Math.cos(dirRad) * horizontalDist;

    bottomPoints.push(
      Cartesian3.fromDegrees(lng + dx * meterToLng, lat + dy * meterToLat, height - verticalDist)
    );
  }

  // 측면 삼각형 폴리곤들 생성
  for (let i = 0; i < segments; i++) {
    const p1 = bottomPoints[i];
    const p2 = bottomPoints[i + 1];
    if (p1 && p2) {
      polygons.push({
        positions: [apex, p1, p2],
      });
    }
  }

  return polygons;
}

/**
 * 줌 레벨에 따른 포인트 클라우드 스타일 적용
 */
function applyZoomBasedStyle(viewer: Viewer, tileset: Cesium3DTileset) {
  const h = viewer.camera.positionCartographic.height;

  // height → pointSize 매핑 (확장된 범위로 멀리서도 보이도록)
  const MAX_H = 5000.0;
  const MIN_SIZE = 2.0;
  const MAX_SIZE = 12.0;

  const clampedH = Math.min(Math.max(h, 0), MAX_H);
  const t = clampedH / MAX_H;
  const pointSize = MIN_SIZE + t * (MAX_SIZE - MIN_SIZE);

  // attenuation / LOD 조절 (높은 고도까지 확장)
  let maxAtt: number, sse: number;

  if (h > 10000) {
    // 10km 이상: 매우 먼 거리
    maxAtt = 16;
    sse = 128;
  } else if (h > 5000) {
    // 5~10km
    maxAtt = 14;
    sse = 96;
  } else if (h > 2000) {
    // 2~5km
    maxAtt = 12;
    sse = 80;
  } else if (h > 1000) {
    // 1~2km
    maxAtt = 10;
    sse = 64;
  } else if (h > 500) {
    maxAtt = 8;
    sse = 48;
  } else if (h > 300) {
    maxAtt = 6;
    sse = 36;
  } else if (h > 150) {
    maxAtt = 5;
    sse = 28;
  } else if (h > 60) {
    maxAtt = 4;
    sse = 22;
  } else {
    maxAtt = 3;
    sse = 18;
  }

  // 불필요한 재적용 방지
  const sizeKey = Math.round(pointSize * 10) / 10;
  const shadeKey = `${maxAtt}|${sse}`;

  const tilesetAny = tileset as Cesium3DTileset & {
    __lastSize?: number;
    __lastShade?: string;
  };

  if (tilesetAny.__lastSize !== sizeKey) {
    tilesetAny.__lastSize = sizeKey;
    tileset.style = new Cesium3DTileStyle({
      pointSize: sizeKey,
    });
  }

  if (tilesetAny.__lastShade !== shadeKey) {
    tilesetAny.__lastShade = shadeKey;

    tileset.pointCloudShading = new PointCloudShading({
      attenuation: true,
      maximumAttenuation: maxAtt,
      geometricErrorScale: 1.1,
    });

    tileset.maximumScreenSpaceError = sse;
    tileset.skipLevelOfDetail = true;
    tileset.baseScreenSpaceError = 1024;
    tileset.skipScreenSpaceErrorFactor = 8;
    tileset.skipLevels = 1;
  }
}

/**
 * CesiumJS 3D Tiles 뷰어 컴포넌트
 */
export function CesiumViewer({
  tilesUrl = TILES_URL,
  heightOffset = 0,
  onLoadingChange,
  onError,
  onTilesetLoaded,
  showGlobe = true,
}: CesiumViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cctvConfig, setCctvConfig] = useState<CCTVConfig | null>(null);

  // CCTV 설정 로드
  useEffect(() => {
    fetch("/config/cctv-config.json")
      .then((res) => res.json())
      .then((config: CCTVConfig) => {
        console.log("[Cesium] CCTV config loaded:", config);
        setCctvConfig(config);
      })
      .catch((err) => {
        console.error("[Cesium] Failed to load CCTV config:", err);
      });
  }, []);

  // CCTV 엔티티 추가 (3D 원뿔 시야각 + 모델)
  const addCCTVEntities = (viewer: Viewer, config: CCTVConfig) => {
    const { cctvList, viewCone, model } = config;

    const fillColor = Color.fromBytes(
      viewCone.fillColor[0],
      viewCone.fillColor[1],
      viewCone.fillColor[2],
      viewCone.fillColor[3]
    );

    const outlineColor = Color.fromBytes(
      viewCone.lineColor[0],
      viewCone.lineColor[1],
      viewCone.lineColor[2],
      viewCone.lineColor[3]
    );

    cctvList.forEach((cctv) => {
      const [lng, lat, height] = cctv.position;

      // 3D 원뿔 시야각 (여러 삼각형 폴리곤으로 구성)
      const conePolygons = createViewCone3DPolygons(cctv);
      conePolygons.forEach((polygon, idx) => {
        viewer.entities.add({
          id: `${cctv.id}-viewcone-${idx}`,
          name: `${cctv.name} 시야각`,
          polygon: {
            hierarchy: new PolygonHierarchy(polygon.positions),
            material: new ColorMaterialProperty(fillColor),
            outline: true,
            outlineColor: outlineColor,
            perPositionHeight: true,
          },
        });
      });

      // 3D 모델 (GLB) + 실루엣 효과
      viewer.entities.add({
        id: `${cctv.id}-model`,
        name: cctv.name,
        position: Cartesian3.fromDegrees(lng, lat, height),
        model: {
          uri: model.path,
          scale: model.scale,
          minimumPixelSize: 64,
          silhouetteColor: Color.CYAN,
          silhouetteSize: 2.0,
        },
      });
    });

    console.log(`[Cesium] Added ${cctvList.length} CCTV entities with 3D view cones`);
  };

  // 클릭 시 3D 모델 배치 (3D Tiles 포인트 클라우드 포함)
  const setupClickHandler = (viewer: Viewer) => {
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((click: { position: Cartesian2 }) => {
      // 1. scene.pick으로 클릭한 객체 확인
      const pickedObject = viewer.scene.pick(click.position);

      // 2. scene.pickPosition으로 3D 좌표 획득
      const cartesian = viewer.scene.pickPosition(click.position);

      if (cartesian && Cartesian3.magnitude(cartesian) > 0) {
        const cartographic = Cartographic.fromCartesian(cartesian);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        // 클릭한 객체 정보 출력
        const objectType = pickedObject?.primitive?.constructor?.name || "unknown";
        const is3DTiles =
          pickedObject?.primitive instanceof Cesium3DTileset || objectType.includes("Cesium3DTile");

        console.log("[Cesium] 클릭 정보:", {
          경도: lng,
          위도: lat,
          고도: height,
          객체타입: objectType,
          포인트클라우드: is3DTiles,
        });

        // 클릭 위치에 Air.glb 모델 배치 (테스트용)
        // 클릭한 정확한 높이에 배치 (오프셋 없음)
        const modelId = `clicked-model-${Date.now()}`;
        viewer.entities.add({
          id: modelId,
          name: "배치된 모델",
          position: Cartesian3.fromDegrees(lng, lat, height),
          model: {
            uri: "/assets/models/Air.glb",
            scale: 1,
            minimumPixelSize: 64,
            silhouetteColor: Color.YELLOW,
            silhouetteSize: 2.0,
          },
        });
      } else {
        console.log(
          "[Cesium] 클릭 위치에서 좌표를 얻을 수 없습니다. (포인트 클라우드 영역을 클릭해주세요)"
        );
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return handler;
  };

  const loadTileset = useCallback(
    async (viewer: Viewer, url: string) => {
      try {
        setIsLoading(true);
        onLoadingChange?.(true);

        const tileset = await Cesium3DTileset.fromUrl(url);

        const bs = tileset.boundingSphere;
        const centerCartographic = Cartographic.fromCartesian(bs.center);
        console.log("[Cesium] Tileset 정보:", {
          center: {
            lng: Cesium.Math.toDegrees(centerCartographic.longitude),
            lat: Cesium.Math.toDegrees(centerCartographic.latitude),
            height: centerCartographic.height,
          },
          radius: bs.radius,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transform: (tileset as any).root?.transform,
        });

        if (heightOffset !== 0) {
          const boundingSphere = tileset.boundingSphere;
          const cartographic = Cartographic.fromCartesian(boundingSphere.center);
          const surface = Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            0.0
          );
          const offset = Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            heightOffset
          );
          const translation = Cartesian3.subtract(offset, surface, new Cartesian3());
          tileset.modelMatrix = Matrix4.fromTranslation(translation);
          console.log(`[Cesium] Height offset applied: ${heightOffset}m`);
        }

        tileset.pointCloudShading = new PointCloudShading({
          attenuation: true,
          maximumAttenuation: 4,
          geometricErrorScale: 1.1,
        });

        tileset.style = new Cesium3DTileStyle({
          pointSize: 2.5,
        });

        tileset.maximumScreenSpaceError = 24;
        tileset.skipLevelOfDetail = true;
        tileset.baseScreenSpaceError = 1024;
        tileset.skipScreenSpaceErrorFactor = 8;
        tileset.skipLevels = 1;

        tileset.cullRequestsWhileMoving = false;
        tileset.cullRequestsWhileMovingMultiplier = 0.1;
        tileset.foveatedScreenSpaceError = false;
        tileset.dynamicScreenSpaceError = false;

        tileset.preloadWhenHidden = true;

        viewer.scene.primitives.add(tileset);

        applyZoomBasedStyle(viewer, tileset);

        let pendingZoomUpdate = false;
        viewer.camera.changed.addEventListener(() => {
          if (pendingZoomUpdate) return;
          pendingZoomUpdate = true;
          requestAnimationFrame(() => {
            pendingZoomUpdate = false;
            applyZoomBasedStyle(viewer, tileset);
          });
        });

        await viewer.zoomTo(tileset);

        setIsLoading(false);
        setError(null);
        onLoadingChange?.(false);
        onTilesetLoaded?.(tileset);

        console.log("[Cesium] 3D Tiles loaded:", url);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load 3D Tiles");
        console.error("[Cesium] Error loading 3D Tiles:", error);
        setError(error);
        setIsLoading(false);
        onLoadingChange?.(false);
        onError?.(error);
      }
    },
    [heightOffset, onLoadingChange, onTilesetLoaded, onError]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    // Viewer 초기화
    const viewer = new Viewer(containerRef.current, DEFAULT_VIEWER_OPTIONS);
    viewerRef.current = viewer;

    // 안개 비활성화
    viewer.scene.fog.enabled = false;

    // 배경색 설정
    viewer.scene.backgroundColor = Color.fromCssColorString("#0f172a");

    // 깊이 테스트 활성화 (pickPosition이 3D Tiles에서도 작동하도록)
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // 줌 제한 완화 (더 가까이 줌인 가능하도록)
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1; // 최소 1미터까지 줌인
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 50000000; // 최대 줌아웃

    // Terrain 적용
    createWorldTerrainAsync().then((terrain) => {
      if (!viewer.isDestroyed()) {
        viewer.terrainProvider = terrain;
        console.log("[Cesium] World Terrain loaded");
      }
    });

    // CCTV 엔티티 추가
    if (cctvConfig) {
      addCCTVEntities(viewer, cctvConfig);
    }

    // 클릭 핸들러 설정 (클릭 시 3D 모델 배치)
    const clickHandler = setupClickHandler(viewer);

    // 3D Tiles 로드
    loadTileset(viewer, tilesUrl);

    // 클린업
    return () => {
      clickHandler.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, [tilesUrl, cctvConfig, loadTileset]);

  // 지구본 표시/숨김 토글
  useEffect(() => {
    if (viewerRef.current && !viewerRef.current.isDestroyed()) {
      viewerRef.current.scene.globe.show = showGlobe;
    }
  }, [showGlobe]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-300">3D Tiles 로딩 중...</span>
          </div>
        </div>
      )}

      {/* 에러 표시 */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="text-red-400 text-sm">3D Tiles 로드 실패</div>
            <div className="text-xs text-slate-500 max-w-md break-all">{error.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
