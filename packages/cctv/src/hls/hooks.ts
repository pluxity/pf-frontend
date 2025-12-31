import { useCallback, useEffect, useRef } from "react";

import { useHLSStore } from "./store";
import type { HLSConfig, HLSStats } from "./types";
import type { HLSStreamStatus } from "../types";

export interface UseHLSStreamReturn {
  status: HLSStreamStatus;
  error: string | null;
  stats: HLSStats;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  load: () => void;
  destroy: () => void;
}

export function useHLSStream(streamUrl: string, autoLoad = true): UseHLSStreamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);

  const streamState = useHLSStore((state) => state.streams.get(streamUrl));
  const loadStream = useHLSStore((state) => state.loadStream);
  const destroyStream = useHLSStore((state) => state.destroyStream);

  const status = streamState?.status ?? "idle";
  const error = streamState?.error ?? null;
  const stats = streamState?.stats ?? {
    bytesLoaded: 0,
    bitrate: 0,
    bufferLength: 0,
    droppedFrames: 0,
  };

  useEffect(() => {
    const video = videoRef.current;
    if (autoLoad && streamUrl && video) {
      loadStream(streamUrl, video);
    }

    return () => {
      if (streamUrl) {
        destroyStream(streamUrl);
      }
    };
  }, [streamUrl, autoLoad, loadStream, destroyStream]);

  const load = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      loadStream(streamUrl, video);
    }
  }, [streamUrl, loadStream]);

  const destroy = useCallback(() => {
    destroyStream(streamUrl);
  }, [streamUrl, destroyStream]);

  return {
    status,
    error,
    stats,
    videoRef,
    load,
    destroy,
  };
}

export function useHLSConfig() {
  const config = useHLSStore((state) => state.config);
  const setConfig = useHLSStore((state) => state.setConfig);

  const updateConfig = useCallback(
    (newConfig: Partial<HLSConfig>) => {
      setConfig(newConfig);
    },
    [setConfig]
  );

  return { config, updateConfig };
}

export function useHLSCleanup() {
  const destroyAll = useHLSStore((state) => state.destroyAll);

  useEffect(() => {
    return () => {
      destroyAll();
    };
  }, [destroyAll]);
}
