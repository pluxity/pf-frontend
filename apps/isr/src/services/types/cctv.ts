export interface CCTVSource {
  type: string;
  id: string;
}

export interface CCTVReader {
  type: string;
  id: string;
}

export interface CCTVStream {
  name: string;
  confName: string;
  source: CCTVSource;
  ready: boolean;
  readyTime: string | null;
  ptz: boolean;
  ptzType: string;
  tracks: string[];
  bytesReceived: number;
  bytesSent: number;
  readers: CCTVReader[];
}

export interface CCTVListResponse {
  itemCount: number;
  pageCount: number;
  items: CCTVStream[];
}
