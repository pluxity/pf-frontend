/** v3 API - /api/v3/paths/list */
export interface CCTVPath {
  name: string;
  confName: string;
  source: {
    type: string;
    id: string;
  };
  ready: boolean;
  readyTime: string | null;
  tracks: string[];
  bytesReceived: number;
  bytesSent: number;
  readers: unknown[];
  ptz: boolean;
  ptzType: string;
}

export interface CCTVPathsResponse {
  itemCount: number;
  pageCount: number;
  items: CCTVPath[];
}

/** v1 API - /api/v1/streams (레거시) */
export interface CCTVStream {
  id: string;
  name: string;
  source: string;
  source_on_demand: boolean;
  rtsp_transport: string;
  source_type: "config" | "database";
  runtime_info?: {
    is_active: boolean;
    codec: string;
    subscriber_count: number;
  };
}

export interface CCTVStreamsResponse {
  count: number;
  streams: CCTVStream[];
}
