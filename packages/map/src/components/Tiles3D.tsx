import { useEffect, useRef } from "react";
import { Cesium3DTileset, IonResource } from "cesium";
import { useMapStore } from "../store/index";
import type { Tiles3DProps, Tiles3DSource } from "../types/index";

export type { Tiles3DProps, Tiles3DSource };

export function Tiles3D({ url, ionAssetId, show = true, onReady, onError }: Tiles3DProps) {
  const viewer = useMapStore((state) => state.viewer);
  const tilesetRef = useRef<Cesium3DTileset | null>(null);

  useEffect(() => {
    if (!url && !ionAssetId) {
      console.warn("Tiles3D: url 또는 ionAssetId 중 하나는 필수입니다.");
      return;
    }

    if (!viewer || viewer.isDestroyed()) return;

    let isCancelled = false;

    const loadTileset = async () => {
      try {
        let tileset: Cesium3DTileset;

        if (url) {
          tileset = await Cesium3DTileset.fromUrl(url);
        } else {
          const resource = await IonResource.fromAssetId(ionAssetId!);
          tileset = await Cesium3DTileset.fromUrl(resource);
        }

        if (isCancelled || viewer.isDestroyed()) {
          tileset.destroy();
          return;
        }

        tileset.show = show;
        viewer.scene.primitives.add(tileset);
        tilesetRef.current = tileset;
        viewer.scene.requestRender();
        onReady?.(tileset);
      } catch (error) {
        if (isCancelled) return;
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Failed to load 3D Tiles:", err);
        onError?.(err);
      }
    };

    loadTileset();

    return () => {
      isCancelled = true;
      if (tilesetRef.current && !tilesetRef.current.isDestroyed()) {
        if (viewer && !viewer.isDestroyed()) {
          viewer.scene.primitives.remove(tilesetRef.current);
        }
        tilesetRef.current.destroy();
        tilesetRef.current = null;
      }
    };
  }, [viewer, url, ionAssetId, onReady, onError, show]);

  useEffect(() => {
    if (tilesetRef.current && !tilesetRef.current.isDestroyed()) {
      tilesetRef.current.show = show;
    }
  }, [show]);

  return null;
}
