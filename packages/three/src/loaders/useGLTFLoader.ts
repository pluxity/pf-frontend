import { useEffect, useState } from "react";
import { GLTFLoader } from "three-stdlib";
import { useModelStore } from "../store/modelStore.ts";
import type { UseGLTFLoaderOptions, UseGLTFLoaderReturn } from "../types/loader.ts";

export function useGLTFLoader(
  url: string | null,
  options: UseGLTFLoaderOptions = {}
): UseGLTFLoaderReturn {
  const {
    autoAddToStore = false,
    modelId = url || "unnamed",
    onProgress,
    onLoaded,
    onError,
  } = options;

  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [gltf, setGltf] = useState<UseGLTFLoaderReturn["gltf"]>(null);

  const addModel = useModelStore((s) => s.addModel);
  const updateModelProgress = useModelStore((s) => s.updateModelProgress);
  const updateModelStatus = useModelStore((s) => s.updateModelStatus);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;

    const loadModel = async () => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);
      setProgress(0);

      const loader = new GLTFLoader();

      loader.load(
        url,
        // onLoad
        (loadedGltf) => {
          if (cancelled) return;
          setGltf(loadedGltf);
          setIsLoading(false);
          setProgress(100);

          if (autoAddToStore) {
            addModel({
              id: modelId,
              url,
              object: loadedGltf.scene,
              gltf: loadedGltf,
              status: "loaded",
              progress: 100,
            });
          }

          onLoaded?.(loadedGltf);
        },
        // onProgress
        (event) => {
          if (cancelled) return;
          if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            setProgress(percent);
            onProgress?.(percent);

            if (autoAddToStore) {
              updateModelProgress(modelId, percent);
            }
          }
        },
        // onError
        (err) => {
          if (cancelled) return;
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsLoading(false);

          if (autoAddToStore) {
            updateModelStatus(modelId, "error", error.message);
          }

          onError?.(error);
        }
      );
    };

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [
    url,
    modelId,
    autoAddToStore,
    onProgress,
    onLoaded,
    onError,
    addModel,
    updateModelProgress,
    updateModelStatus,
  ]);

  return {
    gltf,
    scene: gltf?.scene ?? null,
    animations: gltf?.animations ?? [],
    isLoading,
    progress,
    error,
  };
}
