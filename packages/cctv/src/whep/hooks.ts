import { useCallback, useEffect, useRef } from "react";

import { useWHEPStore } from "./store";
import type { WHEPConfig } from "./types";
import type { StreamStatus } from "../types";

export interface UseWHEPStreamReturn {
  status: StreamStatus;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  connect: () => void;
  disconnect: () => void;
}

export function useWHEPStream(streamUrl: string, autoConnect = true): UseWHEPStreamReturn {
  const videoRef = useRef<HTMLVideoElement>(null);

  const stream = useWHEPStore((state) => state.streams.get(streamUrl));
  const initialized = useWHEPStore((state) => state.initialized);
  const connectStream = useWHEPStore((state) => state.connectStream);
  const disconnectStream = useWHEPStore((state) => state.disconnectStream);

  const status: StreamStatus = stream?.status ?? "idle";
  const error = stream?.error ?? null;
  const remoteStream = stream?.remoteStream ?? null;

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  useEffect(() => {
    if (autoConnect && streamUrl && initialized) {
      connectStream(streamUrl);
    }
  }, [streamUrl, autoConnect, initialized, connectStream]);

  const connect = useCallback(() => {
    connectStream(streamUrl);
  }, [streamUrl, connectStream]);

  const disconnect = useCallback(() => {
    disconnectStream(streamUrl);
  }, [streamUrl, disconnectStream]);

  return { status, error, videoRef, connect, disconnect };
}

export function useWHEPCCTVList() {
  const cctvList = useWHEPStore((state) => state.cctvList);
  const loading = useWHEPStore((state) => state.cctvLoading);

  return { cctvList, loading };
}

export function useWHEPConfig() {
  const config = useWHEPStore((state) => state.config);
  const setConfig = useWHEPStore((state) => state.setConfig);

  const updateConfig = useCallback(
    (newConfig: Partial<WHEPConfig>) => {
      setConfig(newConfig);
    },
    [setConfig]
  );

  return { config, updateConfig };
}

export function useWHEPInit() {
  const initialize = useWHEPStore((state) => state.initialize);
  const cleanup = useWHEPStore((state) => state.cleanup);
  const initialized = useWHEPStore((state) => state.initialized);

  return { initialize, cleanup, initialized };
}

export function useWHEPCleanup() {
  const cleanup = useWHEPStore((state) => state.cleanup);
  return cleanup;
}
