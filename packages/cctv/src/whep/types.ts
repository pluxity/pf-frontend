import type { BaseStreamConfig, IceServerConfig, StreamStatus, CCTVInfo } from "../types.ts";

export interface WHEPNegotiationResult {
  answerSdp: string;
}

export interface WHEPConfig extends BaseStreamConfig {
  iceServers?: IceServerConfig[];
}

export interface WHEPStreamState {
  streamUrl: string;
  status: StreamStatus;
  pc: RTCPeerConnection | null;
  remoteStream: MediaStream | null;
  error: string | null;
  retryCount: number;
  retryTimer: ReturnType<typeof setTimeout> | null;
  abortController: AbortController | null;
}

export interface WHEPState {
  initialized: boolean;
  config: Required<WHEPConfig>;
  cctvList: CCTVInfo[];
  cctvLoading: boolean;
  streams: Map<string, WHEPStreamState>;
}

export interface WHEPActions {
  setConfig: (config: Partial<WHEPConfig>) => void;
  initialize: () => void;
  cleanup: () => void;
  setCCTVList: (list: CCTVInfo[]) => void;
  connectStream: (streamUrl: string) => Promise<void>;
  disconnectStream: (streamUrl: string) => void;
}

export type WHEPStore = WHEPState & WHEPActions;
