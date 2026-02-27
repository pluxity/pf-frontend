export interface SystemSettingsResponse {
  rollingIntervalSeconds: number;
  bimThumbnailFile: {
    id: number;
    url: string;
    originalFileName: string;
    contentType: string;
    fileStatus: string;
    zipContents: {
      name: string;
      isDirectory: boolean;
    }[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  };
  aerialViewFile: {
    id: number;
    url: string;
    originalFileName: string;
    contentType: string;
    fileStatus: string;
    zipContents: {
      name: string;
      isDirectory: boolean;
    }[];
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  };
}
