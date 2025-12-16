import { useEffect, useState } from "react";
import { FBXLoader } from "three-stdlib";
import { useModelStore } from "../store/modelStore.ts";
import type { UseFBXLoaderOptions, UseFBXLoaderReturn } from "../types/loader.ts";

export function useFBXLoader(
  url: string | null,
  options: UseFBXLoaderOptions = {}
): UseFBXLoaderReturn {
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
  const [object, setObject] = useState<UseFBXLoaderReturn["object"]>(null);

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

      const loader = new FBXLoader();

      loader.load(
        url,
        // onLoad
        (loadedObject) => {
          if (cancelled) return;
          setObject(loadedObject);
          setIsLoading(false);
          setProgress(100);

          if (autoAddToStore) {
            addModel({
              id: modelId,
              url,
              object: loadedObject,
              status: "loaded",
              progress: 100,
            });
          }

          onLoaded?.(loadedObject);
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
    object,
    isLoading,
    progress,
    error,
  };
}
