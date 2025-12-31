import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { performWhepNegotiation } from "./client";
import type { WHEPConfig, WHEPState, WHEPStreamState, WHEPStore } from "./types";
import type { CCTVInfo, StreamStatus } from "../types";

const RETRY_DELAY = 5000;
const MAX_RETRIES = 3;

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const DEFAULT_CONFIG: Required<WHEPConfig> = {
  iceServers: DEFAULT_ICE_SERVERS,
  autoReconnect: true,
  reconnectDelay: RETRY_DELAY,
  maxReconnectAttempts: MAX_RETRIES,
};

const createStreamState = (streamUrl: string): WHEPStreamState => ({
  streamUrl,
  status: "idle",
  pc: null,
  remoteStream: null,
  error: null,
  retryCount: 0,
  retryTimer: null,
  abortController: null,
});

function cleanupStreamState(stream: WHEPStreamState) {
  if (stream.retryTimer) {
    clearTimeout(stream.retryTimer);
  }
  if (stream.abortController) {
    stream.abortController.abort();
  }
  if (stream.pc) {
    stream.pc.close();
  }
  if (stream.remoteStream) {
    stream.remoteStream.getTracks().forEach((t) => t.stop());
  }
}

export const useWHEPStore = create<WHEPStore>()(
  subscribeWithSelector((set, get) => ({
    initialized: false,
    config: DEFAULT_CONFIG,
    cctvList: [],
    cctvLoading: false,
    streams: new Map(),

    setConfig: (config: Partial<WHEPConfig>) => {
      set({ config: { ...get().config, ...config } });
    },

    initialize: () => {
      set({ initialized: true });
    },

    cleanup: () => {
      const { streams } = get();

      streams.forEach((stream) => {
        cleanupStreamState(stream);
      });

      set({
        initialized: false,
        streams: new Map(),
      });
    },

    setCCTVList: (list: CCTVInfo[]) => {
      set({ cctvList: list });
    },

    connectStream: async (streamUrl: string) => {
      const { streams, config } = get();

      const existing = streams.get(streamUrl);

      if (existing && (existing.status === "connected" || existing.status === "connecting")) {
        return;
      }

      if (existing) {
        if (existing.pc) {
          existing.pc.close();
        }
        if (existing.abortController) {
          existing.abortController.abort();
        }
      }

      const retryCount = existing?.retryCount ?? 0;
      const abortController = new AbortController();

      const newStreams = new Map(streams);
      newStreams.set(streamUrl, {
        ...createStreamState(streamUrl),
        status: "connecting",
        retryCount,
        abortController,
      });
      set({ streams: newStreams });

      const iceConfig: RTCConfiguration = {
        iceServers: config.iceServers,
      };
      const pc = new RTCPeerConnection(iceConfig);

      set((state) => {
        const s = new Map(state.streams);
        const st = s.get(streamUrl);
        if (st) s.set(streamUrl, { ...st, pc });
        return { streams: s };
      });

      pc.ontrack = (e) => {
        const remoteStream = e.streams[0];
        if (remoteStream) {
          set((s) => {
            const streams = new Map(s.streams);
            const st = streams.get(streamUrl);
            if (st) {
              streams.set(streamUrl, { ...st, remoteStream });
            }
            return { streams };
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;

        if (state === "connected") {
          set((s) => {
            const streams = new Map(s.streams);
            const st = streams.get(streamUrl);
            if (st) {
              streams.set(streamUrl, { ...st, status: "connected", retryCount: 0 });
            }
            return { streams };
          });
        } else if (state === "failed" || state === "disconnected") {
          scheduleRetry(streamUrl, get, set);
        }
      };

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      try {
        await performWhepNegotiation(pc, streamUrl, abortController.signal);
      } catch {
        if (abortController.signal.aborted) return;
        scheduleRetry(streamUrl, get, set);
      }
    },

    disconnectStream: (streamUrl: string) => {
      const { streams } = get();
      const stream = streams.get(streamUrl);

      if (!stream) return;

      cleanupStreamState(stream);

      const newStreams = new Map(streams);
      newStreams.delete(streamUrl);
      set({ streams: newStreams });
    },
  }))
);

function scheduleRetry(
  streamUrl: string,
  get: () => WHEPStore,
  set: (partial: Partial<WHEPState> | ((state: WHEPState) => Partial<WHEPState>)) => void
) {
  const { config } = get();
  const streams = new Map(get().streams);
  const stream = streams.get(streamUrl);

  if (!stream) return;

  const newRetryCount = stream.retryCount + 1;

  if (newRetryCount > config.maxReconnectAttempts) {
    streams.set(streamUrl, {
      ...stream,
      status: "failed",
      error: "Max retries exceeded",
    });
    set({ streams });
    return;
  }

  const retryTimer = setTimeout(() => {
    get().connectStream(streamUrl);
  }, config.reconnectDelay);

  streams.set(streamUrl, {
    ...stream,
    status: "connecting",
    retryCount: newRetryCount,
    retryTimer,
  });
  set({ streams });
}

// Re-export types
export type { WHEPConfig, WHEPStreamState, WHEPState, WHEPStore, StreamStatus };
