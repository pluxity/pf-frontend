import { useEffect, useRef } from "react";
import { GLTFLoader } from "three-stdlib";
import { useAssetStore } from "../store";
import type { Asset } from "../types";

export function useAssetLoader(assets: Asset[]) {
  const updateAsset = useAssetStore((s) => s.updateAsset);
  const getAsset = useAssetStore((s) => s.getAsset);
  const loadedRef = useRef(new Set<string>());

  useEffect(() => {
    if (assets.length === 0) return;

    const loader = new GLTFLoader();

    assets.forEach((asset) => {
      if (loadedRef.current.has(asset.id)) return;

      const existing = getAsset(asset.id);
      if (!existing) return;
      if (existing.object) return;

      loadedRef.current.add(asset.id);

      loader.load(asset.modelUrl, (gltf) => {
        updateAsset(asset.id, { object: gltf.scene });
      });
    });
  }, [assets, updateAsset, getAsset]);
}
