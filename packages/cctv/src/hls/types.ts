import type { BaseStreamConfig, HLSStreamStatus } from "../types.ts";

export interface HLSStats {
  bytesLoaded: number;
  bitrate: number;
  bufferLength: number;
  droppedFrames: number;
}

export interface HLSStreamState {
  streamUrl: string;
  status: HLSStreamStatus;
  error: string | null;
  stats: HLSStats;
}

export type HLSConfig = BaseStreamConfig;

export interface HLSEngineInstance {
  hls: import("hls.js").default | null;
  videoElement: HTMLVideoElement | null;
  statsInterval: ReturnType<typeof setInterval> | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;
  lastBytesLoaded: number;
}

export interface HLSState {
  config: Required<HLSConfig>;
  streams: Map<string, HLSStreamState>;
  engines: Map<string, HLSEngineInstance>;
}

export interface HLSActions {
  setConfig: (config: Partial<HLSConfig>) => void;
  loadStream: (streamUrl: string, videoElement: HTMLVideoElement) => void;
  destroyStream: (streamUrl: string) => void;
  destroyAll: () => void;
}

export type HLSStore = HLSState & HLSActions;
