import { useEffect, useRef, useState } from "react";
import { Deck, COORDINATE_SYSTEM } from "@deck.gl/core";
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { SimpleMeshLayer } from "@deck.gl/mesh-layers";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";
import { TILES_URL } from "./config";

// CCTV 데이터 타입
interface CCTVData {
  id: string;
  name: string;
  position: [number, number, number]; // [lng, lat, height]
  direction: number; // 수평 방향 (도, 0=북, 90=동, 180=남, 270=서)
  fov: number; // 수평 시야각 (도)
  range: number; // 가시거리 (미터)
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

// 3D 원뿔 메쉬 생성 (CCTV에서 틸트 각도에 따라 펼쳐지는 형태)
// 미터 단위로 생성 - METER_OFFSETS 좌표계와 함께 사용
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createConeMesh(cctv: CCTVData): any {
  const { direction, fov, range, tilt = 45 } = cctv; // 기본 틸트 45도

  const halfFov = fov / 2;
  const segments = 16;

  // 틸트 각도를 라디안으로 변환
  const tiltRad = (tilt * Math.PI) / 180;
  const dirRad = (direction * Math.PI) / 180;

  // 원뿔 끝점까지의 수평/수직 거리 계산
  const horizontalDist = range * Math.cos(tiltRad); // 수평 거리
  const verticalDist = range * Math.sin(tiltRad); // 수직 거리 (아래로)

  // FOV 각도에 따른 바닥면 반지름
  const bottomRadius = Math.tan((halfFov * Math.PI) / 180) * range;

  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  // Apex (꼭지점) at origin - CCTV 위치
  positions.push(0, 0, 0);
  normals.push(0, 0, 1);

  // Bottom ring vertices - 틸트 각도에 따라 펼쳐짐
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = direction - halfFov + fov * t;
    const rad = (angle * Math.PI) / 180;

    // 방향에 따른 수평 오프셋 (틸트 적용)
    const x = Math.sin(rad) * bottomRadius + Math.sin(dirRad) * horizontalDist;
    const y = Math.cos(rad) * bottomRadius + Math.cos(dirRad) * horizontalDist;
    const z = -verticalDist;

    positions.push(x, y, z);

    // Normal pointing outward
    const nx = Math.sin(rad) * 0.5;
    const ny = Math.cos(rad) * 0.5;
    normals.push(nx, ny, 0.7);
  }

  // Side triangles (from apex to ring)
  for (let i = 0; i < segments; i++) {
    indices.push(0, i + 1, i + 2);
  }

  // Bottom center for closing the cone
  const bottomCenterIdx = positions.length / 3;
  positions.push(
    Math.sin(dirRad) * horizontalDist,
    Math.cos(dirRad) * horizontalDist,
    -verticalDist
  );
  normals.push(0, 0, -1);

  // Bottom triangles
  for (let i = 0; i < segments; i++) {
    indices.push(bottomCenterIdx, i + 2, i + 1);
  }

  return {
    attributes: {
      POSITION: { value: new Float32Array(positions), size: 3 },
      NORMAL: { value: new Float32Array(normals), size: 3 },
    },
    indices: { value: new Uint16Array(indices) },
  };
}

interface DeckViewerProps {
  /** 3D Tiles URL (tileset.json) */
  tilesUrl?: string;
  /** 로딩 상태 변경 콜백 */
  onLoadingChange?: (loading: boolean) => void;
  /** 에러 발생 콜백 */
  onError?: (error: Error) => void;
}

/**
 * deck.gl 기반 3D Tiles 뷰어 컴포넌트
 */
export function DeckViewer({ tilesUrl = TILES_URL, onLoadingChange, onError }: DeckViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tileCount, setTileCount] = useState(0);
  const [cctvConfig, setCctvConfig] = useState<CCTVConfig | null>(null);

  // CCTV 설정 로드
  useEffect(() => {
    fetch("/config/cctv-config.json")
      .then((res) => res.json())
      .then((config: CCTVConfig) => {
        console.log("[DeckGL] CCTV config loaded:", config);
        setCctvConfig(config);
      })
      .catch((err) => {
        console.error("[DeckGL] Failed to load CCTV config:", err);
      });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !cctvConfig) return;

    const container = containerRef.current;
    let mounted = true;
    let loadedTiles = 0;

    const INITIAL_VIEW_STATE = {
      longitude: 128.57,
      latitude: 38.07,
      zoom: 15,
      pitch: 45,
      bearing: 0,
      minPitch: 0,
      maxPitch: 85,
    };

    const initViewer = async () => {
      try {
        setIsLoading(true);
        onLoadingChange?.(true);

        console.log("[DeckGL] Loading from:", tilesUrl);

        // deck.gl 초기화
        const deck = new Deck({
          parent: container,
          initialViewState: INITIAL_VIEW_STATE,
          controller: {
            scrollZoom: { speed: 0.002, smooth: true },
            dragPan: true,
            dragRotate: true,
            doubleClickZoom: false,
            touchZoom: true,
            touchRotate: true,
            keyboard: true,
            inertia: false,
          },
          layers: [
            // 3D Tiles 포인트 클라우드 레이어
            // tileset.json에 ECEF transform이 있으므로 기본 좌표계 사용
            new Tile3DLayer({
              id: "3d-tiles",
              data: tilesUrl,
              loaders: [Tiles3DLoader],
              pointSize: 1,
              opacity: 1,
              getColor: [255, 255, 255, 255],
              // coordinateSystem 제거 - tileset의 transform 자동 적용
              maximumScreenSpaceError: 8,
              pickable: true,
              onClick: (info) => {
                if (info.picked && info.coordinate && info.index !== undefined) {
                  const lng = info.coordinate[0];
                  const lat = info.coordinate[1];
                  let altitude = 0;

                  const tile = info.object as {
                    content?: {
                      attributes?: {
                        positions?: Float32Array;
                      };
                      cartographicOrigin?: ArrayLike<number>;
                    };
                  };

                  if (tile?.content) {
                    const positions = tile.content.attributes?.positions;
                    const origin = tile.content.cartographicOrigin;

                    if (positions && origin) {
                      const originZ = origin[2] ?? 0;
                      const localZ = positions[info.index * 3 + 2] ?? 0;
                      altitude = originZ + localZ;
                    }
                  }

                  // 타일 원점 정보
                  const tile2 = info.object as {
                    content?: {
                      cartographicOrigin?: ArrayLike<number>;
                    };
                  };
                  const origin = tile2?.content?.cartographicOrigin;

                  console.log("[DeckGL] 클릭 좌표:", {
                    경도: lng,
                    위도: lat,
                    고도: altitude,
                    타일원점: origin ? [origin[0], origin[1], origin[2]] : null,
                  });
                }
              },
              onTilesetLoad: (tileset) => {
                console.log("[DeckGL] Tileset loaded:", tileset);
                console.log("[DeckGL] CartographicCenter:", tileset.cartographicCenter);

                if (tileset.cartographicCenter) {
                  const [lng, lat, alt] = tileset.cartographicCenter;
                  console.log("[DeckGL] Moving to:", lng, lat, "height:", alt);

                  if (lng !== undefined && lat !== undefined) {
                    const newViewState = {
                      longitude: lng,
                      latitude: lat,
                      zoom: 18,
                      pitch: 60,
                      bearing: 0,
                    };
                    deck.setProps({ initialViewState: newViewState });
                  }
                }

                if (mounted) {
                  setIsLoading(false);
                  onLoadingChange?.(false);
                }
              },
              onTileLoad: () => {
                loadedTiles++;
                if (mounted) {
                  setTileCount(loadedTiles);
                }
              },
              onTileError: (_tile, error) => {
                console.error("[DeckGL] Tile error:", _tile?.id, error);
              },
            }),

            // CCTV 시야각 3D 원뿔 레이어 - 미터 단위 좌표계 사용
            ...cctvConfig.cctvList.map(
              (cctv) =>
                new SimpleMeshLayer({
                  id: `cctv-cone-${cctv.id}`,
                  data: [{ position: [0, 0, 0] }], // 원점 기준 (coordinateOrigin이 실제 위치)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  mesh: createConeMesh(cctv) as any,
                  getPosition: (d: { position: [number, number, number] }) => d.position,
                  getColor: cctvConfig.viewCone.fillColor,
                  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
                  coordinateOrigin: cctv.position, // CCTV 위치를 원점으로
                  sizeScale: 1,
                  wireframe: false,
                  getOrientation: [0, 0, 0],
                  material: {
                    ambient: 0.5,
                    diffuse: 0.6,
                    shininess: 32,
                    specularColor: [100, 200, 255],
                  },
                })
            ),

            // CCTV 3D 모델 - 아웃라인 (뒤에 약간 큰 실루엣)
            new ScenegraphLayer({
              id: "cctv-3d-outline",
              data: cctvConfig.cctvList,
              scenegraph: cctvConfig.model.path,
              getPosition: (d) => d.position,
              getOrientation: (d) => [0, d.direction, 90],
              sizeScale: cctvConfig.model.scale * 1.15,
              _lighting: "flat",
              getColor: [0, 200, 255, 255],
            }),

            // CCTV 3D 모델 - 메인
            new ScenegraphLayer({
              id: "cctv-3d-models",
              data: cctvConfig.cctvList,
              scenegraph: cctvConfig.model.path,
              getPosition: (d) => d.position,
              getOrientation: (d) => [0, d.direction, 90],
              sizeScale: cctvConfig.model.scale,
              _lighting: "pbr",
              pickable: true,
            }),

            // 테스트용 3D 모델 - 아웃라인 (노란색)
            // 클릭 좌표 사용, 고도는 100m로 테스트
            new ScenegraphLayer({
              id: "test-air-model-outline",
              data: [
                {
                  position: [128.57488262603536, 38.06697892928325, 100],
                },
              ],
              scenegraph: "/assets/models/Air.glb",
              getPosition: (d: { position: [number, number, number] }) => d.position,
              getOrientation: [0, 0, 90],
              sizeScale: 1.1,
              _lighting: "flat",
              getColor: [255, 220, 0, 255], // 노란색
            }),

            // 테스트용 3D 모델 - 메인
            new ScenegraphLayer({
              id: "test-air-model",
              data: [
                {
                  position: [128.57488262603536, 38.06697892928325, 100],
                },
              ],
              scenegraph: "/assets/models/Air.glb",
              getPosition: (d: { position: [number, number, number] }) => d.position,
              getOrientation: [0, 0, 90],
              sizeScale: 1,
              _lighting: "pbr",
            }),
          ],
          onLoad: () => {
            console.log("[DeckGL] Deck initialized");
          },
          onError: (err) => {
            console.error("[DeckGL] Error:", err);
            if (mounted) {
              setError(err instanceof Error ? err : new Error(String(err)));
              setIsLoading(false);
              onLoadingChange?.(false);
              onError?.(err instanceof Error ? err : new Error(String(err)));
            }
          },
        });

        deckRef.current = deck;
      } catch (err) {
        if (!mounted) return;
        const error = err instanceof Error ? err : new Error("Failed to initialize viewer");
        console.error("[DeckGL] Error:", error);
        setError(error);
        setIsLoading(false);
        onLoadingChange?.(false);
        onError?.(error);
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (deckRef.current) {
        deckRef.current.finalize();
        deckRef.current = null;
      }
    };
  }, [tilesUrl, cctvConfig, onLoadingChange, onError]);

  // 우클릭 컨텍스트 메뉴 방지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    container.addEventListener("contextmenu", handleContextMenu);
    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* deck.gl 컨테이너 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-300">3D Tiles 로딩 중...</span>
          </div>
        </div>
      )}

      {/* 에러 표시 */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="text-red-400 text-sm">3D Tiles 로드 실패</div>
            <div className="text-xs text-slate-500 max-w-md break-all">{error.message}</div>
          </div>
        </div>
      )}

      {/* deck.gl 뱃지 */}
      <div className="absolute top-4 right-4 bg-orange-600/80 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none">
        deck.gl
      </div>

      {/* 타일 로딩 카운트 (디버그) */}
      <div className="absolute bottom-4 right-4 bg-slate-800/80 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none">
        Tiles: {tileCount}
      </div>
    </div>
  );
}
