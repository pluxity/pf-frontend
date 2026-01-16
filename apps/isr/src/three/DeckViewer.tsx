import { useEffect, useRef, useState } from "react";
import { Deck } from "@deck.gl/core";
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";
import { TILES_URL } from "./config";

interface DeckViewerProps {
  tilesUrl?: string;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: Error) => void;
}

export function DeckViewer({ tilesUrl = TILES_URL, onLoadingChange, onError }: DeckViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tileCount, setTileCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

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
            new Tile3DLayer({
              id: "3d-tiles",
              data: tilesUrl,
              loaders: [Tiles3DLoader],
              pointSize: 1,
              opacity: 1,
              getColor: [255, 255, 255, 255],
              maximumScreenSpaceError: 8,
              pickable: true,
              onClick: (info) => {
                if (info.picked && info.coordinate) {
                  console.log("[DeckGL] 클릭 좌표:", {
                    경도: info.coordinate[0],
                    위도: info.coordinate[1],
                  });
                }
              },
              onTilesetLoad: (tileset) => {
                console.log("[DeckGL] Tileset loaded:", tileset);
                console.log("[DeckGL] CartographicCenter:", tileset.cartographicCenter);

                if (tileset.cartographicCenter) {
                  const [lng, lat] = tileset.cartographicCenter;
                  console.log("[DeckGL] Moving to:", lng, lat);

                  if (lng !== undefined && lat !== undefined) {
                    deck.setProps({
                      initialViewState: {
                        longitude: lng,
                        latitude: lat,
                        zoom: 18,
                        pitch: 60,
                        bearing: 0,
                      },
                    });
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
  }, [tilesUrl, onLoadingChange, onError]);

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
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-300">3D Tiles 로딩 중...</span>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <div className="text-red-400 text-sm">3D Tiles 로드 실패</div>
            <div className="text-xs text-slate-500 max-w-md break-all">{error.message}</div>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-orange-600/80 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none">
        deck.gl
      </div>

      <div className="absolute bottom-4 right-4 bg-slate-800/80 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none">
        Tiles: {tileCount}
      </div>
    </div>
  );
}
