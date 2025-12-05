export type StreamStatus = "idle" | "connecting" | "connected" | "failed";

export type HLSStreamStatus = "idle" | "loading" | "playing" | "buffering" | "error";

export interface CCTVInfo {
  id: string;
  name: string;
}

export interface BaseStreamConfig {
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface UseStreamReturn {
  status: StreamStatus;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  connect: () => void;
  disconnect: () => void;
}

export type StreamProtocol = "hls" | "whep";
