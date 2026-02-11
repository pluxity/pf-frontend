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
  ptz: boolean;
  ptzType: string;
}

export interface CCTVPathsResponse {
  itemCount: number;
  pageCount: number;
  items: CCTVPath[];
}
