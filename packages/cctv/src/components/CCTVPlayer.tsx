import { useCallback, useEffect, useRef } from "react";

import { useHLSStore } from "../hls/store.ts";
import { useWHEPStore } from "../whep/store.ts";
import type { StreamProtocol, StreamStatus, HLSStreamStatus } from "../types.ts";
import type { HLSStats } from "../hls/types.ts";

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

  const getStatus = (): StreamStatus | HLSStreamStatus => {
    if (protocol === "hls") {
      return hlsStreamState?.status ?? "idle";
    }
    return whepStreamState?.status ?? "idle";
  };

  const getError = (): string | null => {
    if (protocol === "hls") {
      return hlsStreamState?.error ?? null;
    }
    return whepStreamState?.error ?? null;
  };

  const getStream = (): MediaStream | null => {
    if (protocol === "whep") {
      return whepStreamState?.remoteStream ?? null;
    }
    return null;
  };

  const getStats = (): HLSStats | null => {
    if (protocol === "hls") {
      return hlsStreamState?.stats ?? null;
    }
    return null;
  };

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
  }, [protocol, streamUrl, autoConnect, whepInitialized, whepConnect]);

  const stream = getStream();
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
    status: getStatus(),
    error: getError(),
    connect,
    disconnect,
    stream: getStream(),
    stats: getStats(),
  });
}
