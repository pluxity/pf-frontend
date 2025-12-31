import Hls, { ErrorData, FragLoadedData } from "hls.js";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type {
  HLSConfig,
  HLSEngineInstance,
  HLSState,
  HLSStats,
  HLSStreamState,
  HLSStore,
} from "./types";
import type { HLSStreamStatus } from "../types";

const DEFAULT_CONFIG: Required<HLSConfig> = {
  autoReconnect: true,
  reconnectDelay: 5000,
  maxReconnectAttempts: 3,
};

const createStreamState = (streamUrl: string): HLSStreamState => ({
  streamUrl,
  status: "idle",
  error: null,
  stats: {
    bytesLoaded: 0,
    bitrate: 0,
    bufferLength: 0,
    droppedFrames: 0,
  },
});

const createEngineInstance = (): HLSEngineInstance => ({
  hls: null,
  videoElement: null,
  statsInterval: null,
  reconnectTimer: null,
  reconnectAttempts: 0,
  lastBytesLoaded: 0,
  eventHandlers: {},
});

export const useHLSStore = create<HLSStore>()(
  subscribeWithSelector((set, get) => ({
    config: DEFAULT_CONFIG,
    streams: new Map(),
    engines: new Map(),

    setConfig: (config: Partial<HLSConfig>) => {
      set({ config: { ...get().config, ...config } });
    },

    loadStream: (streamUrl: string, videoElement: HTMLVideoElement) => {
      const { config, streams, engines } = get();

      const existingEngine = engines.get(streamUrl);
      if (existingEngine) {
        cleanupEngine(existingEngine);
      }

      const newStreams = new Map(streams);
      newStreams.set(streamUrl, { ...createStreamState(streamUrl), status: "loading" });

      const engine = createEngineInstance();
      engine.videoElement = videoElement;

      const newEngines = new Map(engines);
      newEngines.set(streamUrl, engine);

      set({ streams: newStreams, engines: newEngines });

      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.muted = true;

      if (Hls.isSupported()) {
        loadHlsJs(streamUrl, videoElement, config, get, set);
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        loadNativeHLS(streamUrl, videoElement, config, get, set);
      } else {
        updateStreamStatus(streamUrl, "error", "HLS is not supported in this browser", get, set);
      }
    },

    destroyStream: (streamUrl: string) => {
      const { streams, engines } = get();

      const engine = engines.get(streamUrl);
      if (engine) {
        cleanupEngine(engine);
      }

      const newStreams = new Map(streams);
      newStreams.delete(streamUrl);

      const newEngines = new Map(engines);
      newEngines.delete(streamUrl);

      set({ streams: newStreams, engines: newEngines });
    },

    destroyAll: () => {
      const { engines } = get();

      engines.forEach((engine) => {
        cleanupEngine(engine);
      });

      set({ streams: new Map(), engines: new Map() });
    },
  }))
);

function cleanupEngine(engine: HLSEngineInstance) {
  if (engine.statsInterval) {
    clearInterval(engine.statsInterval);
  }

  if (engine.reconnectTimer) {
    clearTimeout(engine.reconnectTimer);
  }

  if (engine.hls) {
    engine.hls.destroy();
  }

  if (engine.videoElement) {
    // Remove event listeners
    if (engine.eventHandlers.playing) {
      engine.videoElement.removeEventListener("playing", engine.eventHandlers.playing);
    }
    if (engine.eventHandlers.waiting) {
      engine.videoElement.removeEventListener("waiting", engine.eventHandlers.waiting);
    }
    if (engine.eventHandlers.canplay) {
      engine.videoElement.removeEventListener("canplay", engine.eventHandlers.canplay);
    }
    if (engine.eventHandlers.loadedmetadata) {
      engine.videoElement.removeEventListener(
        "loadedmetadata",
        engine.eventHandlers.loadedmetadata
      );
    }
    if (engine.eventHandlers.error) {
      engine.videoElement.removeEventListener("error", engine.eventHandlers.error);
    }

    engine.videoElement.src = "";
    engine.videoElement.load();
  }
}

function updateStreamStatus(
  streamUrl: string,
  status: HLSStreamStatus,
  error: string | null,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  const streams = new Map(get().streams);
  const stream = streams.get(streamUrl);
  if (stream) {
    streams.set(streamUrl, { ...stream, status, error });
    set({ streams });
  }
}

function updateStreamStats(
  streamUrl: string,
  stats: Partial<HLSStats>,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  const streams = new Map(get().streams);
  const stream = streams.get(streamUrl);
  if (stream) {
    streams.set(streamUrl, { ...stream, stats: { ...stream.stats, ...stats } });
    set({ streams });
  }
}

function loadHlsJs(
  streamUrl: string,
  videoElement: HTMLVideoElement,
  config: Required<HLSConfig>,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  const playlistUrl = streamUrl;

  const hls = new Hls({
    debug: false,
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 10,
    maxBufferLength: 4,
    maxMaxBufferLength: 6,
    maxBufferSize: 10 * 1000 * 1000,
    maxBufferHole: 0.3,
    liveSyncDuration: 0.5,
    liveMaxLatencyDuration: 3,
    liveDurationInfinity: true,
    manifestLoadingTimeOut: 5000,
    manifestLoadingMaxRetry: 3,
    levelLoadingTimeOut: 5000,
    fragLoadingTimeOut: 10000,
    highBufferWatchdogPeriod: 1,
  });

  const enginesMap = new Map(get().engines);
  const engineInstance = enginesMap.get(streamUrl);
  if (engineInstance) {
    engineInstance.hls = hls;
    set({ engines: enginesMap });
  }

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    updateStreamStatus(streamUrl, "playing", null, get, set);

    const enginesMap2 = new Map(get().engines);
    const engineInstance2 = enginesMap2.get(streamUrl);
    if (engineInstance2) {
      engineInstance2.reconnectAttempts = 0;
      set({ engines: enginesMap2 });
    }

    startStatsCollection(streamUrl, videoElement, get, set);

    videoElement.play().catch(() => {});
  });

  hls.on(Hls.Events.FRAG_LOADED, (_event: string, data: FragLoadedData) => {
    const streams = new Map(get().streams);
    const stream = streams.get(streamUrl);
    if (stream) {
      const newBytesLoaded = stream.stats.bytesLoaded + data.frag.stats.total;
      streams.set(streamUrl, {
        ...stream,
        stats: { ...stream.stats, bytesLoaded: newBytesLoaded },
      });
      set({ streams });
    }
  });

  hls.on(Hls.Events.ERROR, (_event: string, data: ErrorData) => {
    handleHlsError(streamUrl, data, config, get, set);
  });

  const handlePlaying = () => updateStreamStatus(streamUrl, "playing", null, get, set);
  const handleWaiting = () => updateStreamStatus(streamUrl, "buffering", null, get, set);
  const handleCanPlay = () => {
    const stream = get().streams.get(streamUrl);
    if (stream?.status === "buffering") {
      updateStreamStatus(streamUrl, "playing", null, get, set);
    }
  };

  // Store event handlers for cleanup
  const enginesMap3 = new Map(get().engines);
  const engineInstance3 = enginesMap3.get(streamUrl);
  if (engineInstance3) {
    engineInstance3.eventHandlers = {
      playing: handlePlaying,
      waiting: handleWaiting,
      canplay: handleCanPlay,
    };
    set({ engines: enginesMap3 });
  }

  videoElement.addEventListener("playing", handlePlaying);
  videoElement.addEventListener("waiting", handleWaiting);
  videoElement.addEventListener("canplay", handleCanPlay);

  hls.loadSource(playlistUrl);
  hls.attachMedia(videoElement);
}

function loadNativeHLS(
  streamUrl: string,
  videoElement: HTMLVideoElement,
  config: Required<HLSConfig>,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  const playlistUrl = streamUrl;

  videoElement.src = playlistUrl;

  const handleLoadedMetadata = () => {
    updateStreamStatus(streamUrl, "playing", null, get, set);

    const engines = new Map(get().engines);
    const engine = engines.get(streamUrl);
    if (engine) {
      engine.reconnectAttempts = 0;
      set({ engines });
    }

    startStatsCollection(streamUrl, videoElement, get, set);
  };

  const handlePlaying = () => updateStreamStatus(streamUrl, "playing", null, get, set);
  const handleWaiting = () => updateStreamStatus(streamUrl, "buffering", null, get, set);
  const handleCanPlay = () => {
    const stream = get().streams.get(streamUrl);
    if (stream?.status === "buffering") {
      updateStreamStatus(streamUrl, "playing", null, get, set);
    }
  };
  const handleError = () => {
    handleNativeError(streamUrl, config, get, set);
  };

  // Store event handlers for cleanup
  const enginesMap4 = new Map(get().engines);
  const engineInstance4 = enginesMap4.get(streamUrl);
  if (engineInstance4) {
    engineInstance4.eventHandlers = {
      loadedmetadata: handleLoadedMetadata,
      playing: handlePlaying,
      waiting: handleWaiting,
      canplay: handleCanPlay,
      error: handleError,
    };
    set({ engines: enginesMap4 });
  }

  videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
  videoElement.addEventListener("playing", handlePlaying);
  videoElement.addEventListener("waiting", handleWaiting);
  videoElement.addEventListener("canplay", handleCanPlay);
  videoElement.addEventListener("error", handleError);
}

function handleHlsError(
  streamUrl: string,
  data: ErrorData,
  config: Required<HLSConfig>,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  const engines = get().engines;
  const engine = engines.get(streamUrl);

  if (!engine?.hls) return;

  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        engine.hls.startLoad();
        break;

      case Hls.ErrorTypes.MEDIA_ERROR:
        engine.hls.recoverMediaError();
        break;

      default:
        updateStreamStatus(streamUrl, "error", `HLS Error: ${data.details}`, get, set);
        cleanupEngine(engine);

        if (config.autoReconnect) {
          scheduleReconnect(streamUrl, config, get, set);
        }
        break;
    }
  }
}

function handleNativeError(
  streamUrl: string,
  config: Required<HLSConfig>,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  updateStreamStatus(streamUrl, "error", "Native HLS error", get, set);

  if (config.autoReconnect) {
    scheduleReconnect(streamUrl, config, get, set);
  }
}

function scheduleReconnect(
  streamUrl: string,
  config: Required<HLSConfig>,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  const engines = new Map(get().engines);
  const engine = engines.get(streamUrl);

  if (!engine) return;

  if (engine.reconnectAttempts >= config.maxReconnectAttempts) {
    updateStreamStatus(
      streamUrl,
      "error",
      `Max reconnect attempts (${config.maxReconnectAttempts}) reached`,
      get,
      set
    );
    return;
  }

  engine.reconnectAttempts++;
  set({ engines });

  engine.reconnectTimer = setTimeout(() => {
    const currentEngine = get().engines.get(streamUrl);
    if (currentEngine?.videoElement) {
      get().loadStream(streamUrl, currentEngine.videoElement);
    }
  }, config.reconnectDelay);
}

function startStatsCollection(
  streamUrl: string,
  videoElement: HTMLVideoElement,
  get: () => HLSStore,
  set: (partial: Partial<HLSState>) => void
) {
  const engines = new Map(get().engines);
  const engine = engines.get(streamUrl);

  if (!engine) return;

  if (engine.statsInterval) {
    clearInterval(engine.statsInterval);
  }

  engine.statsInterval = setInterval(() => {
    const stream = get().streams.get(streamUrl);
    if (!stream) return;

    const currentEngine = get().engines.get(streamUrl);
    if (!currentEngine) return;

    const bytesDelta = stream.stats.bytesLoaded - currentEngine.lastBytesLoaded;
    const bitrate = (bytesDelta * 8) / 1000;
    currentEngine.lastBytesLoaded = stream.stats.bytesLoaded;

    let bufferLength = 0;
    if (videoElement.buffered.length > 0) {
      const currentTime = videoElement.currentTime;
      const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
      bufferLength = bufferedEnd - currentTime;
    }

    const droppedFrames =
      (videoElement as HTMLVideoElement & { webkitDroppedFrameCount?: number })
        .webkitDroppedFrameCount || 0;

    updateStreamStats(streamUrl, { bitrate, bufferLength, droppedFrames }, get, set);
  }, 1000);

  set({ engines });
}

// Re-export types
export type { HLSConfig, HLSStreamState, HLSState, HLSStore, HLSStats };
