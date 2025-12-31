import { useCallback, useEffect, useRef } from "react";

import { useHLSStore } from "../hls/store";
import { useWHEPStore } from "../whep/store";
import type { StreamProtocol, StreamStatus, HLSStreamStatus } from "../types";
import type { HLSStats } from "../hls/types";

export interface CCTVPlayerRenderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: StreamStatus | HLSStreamStatus;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  stream: MediaStream | null;
  stats: HLSStats | null;
}

export interface CCTVPlayerProps {
  streamUrl: string;
  protocol: StreamProtocol;
  autoConnect?: boolean;
  children: (props: CCTVPlayerRenderProps) => React.ReactNode;
}

export function CCTVPlayer({
  streamUrl,
  protocol,
  autoConnect = true,
  children,
}: CCTVPlayerProps): React.ReactNode {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hlsStreamState = useHLSStore((state) => state.streams.get(streamUrl));
  const hlsLoad = useHLSStore((state) => state.loadStream);
  const hlsDestroy = useHLSStore((state) => state.destroyStream);

  const whepStreamState = useWHEPStore((state) => state.streams.get(streamUrl));
  const whepInitialized = useWHEPStore((state) => state.initialized);
  const whepConnect = useWHEPStore((state) => state.connectStream);
  const whepDisconnect = useWHEPStore((state) => state.disconnectStream);

  const status: StreamStatus | HLSStreamStatus =
    protocol === "hls" ? (hlsStreamState?.status ?? "idle") : (whepStreamState?.status ?? "idle");
  const error: string | null =
    protocol === "hls" ? (hlsStreamState?.error ?? null) : (whepStreamState?.error ?? null);
  const stream: MediaStream | null =
    protocol === "whep" ? (whepStreamState?.remoteStream ?? null) : null;
  const stats: HLSStats | null = protocol === "hls" ? (hlsStreamState?.stats ?? null) : null;

  const connect = useCallback(() => {
    if (protocol === "hls") {
      if (videoRef.current) {
        hlsLoad(streamUrl, videoRef.current);
      }
    } else {
      whepConnect(streamUrl);
    }
  }, [protocol, streamUrl, hlsLoad, whepConnect]);

  const disconnect = useCallback(() => {
    if (protocol === "hls") {
      hlsDestroy(streamUrl);
    } else {
      whepDisconnect(streamUrl);
    }
  }, [protocol, streamUrl, hlsDestroy, whepDisconnect]);

  useEffect(() => {
    if (protocol === "hls" && autoConnect && streamUrl && videoRef.current) {
      hlsLoad(streamUrl, videoRef.current);
    }

    return () => {
      if (protocol === "hls" && streamUrl) {
        hlsDestroy(streamUrl);
      }
    };
  }, [protocol, streamUrl, autoConnect, hlsLoad, hlsDestroy]);

  useEffect(() => {
    if (protocol === "whep" && autoConnect && streamUrl && whepInitialized) {
      whepConnect(streamUrl);
    }

    return () => {
      if (protocol === "whep" && streamUrl) {
        whepDisconnect(streamUrl);
      }
    };
  }, [protocol, streamUrl, autoConnect, whepInitialized, whepConnect, whepDisconnect]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    if (protocol === "hls") return;

    if (video.srcObject === stream) return;

    video.srcObject = stream;
    video.play().catch(() => {});

    return () => {
      video.srcObject = null;
    };
  }, [protocol, stream]);

  // eslint-disable-next-line react-hooks/refs -- render props pattern requires passing ref to children
  return children({
    videoRef,
    status,
    error,
    connect,
    disconnect,
    stream,
    stats,
  });
}
