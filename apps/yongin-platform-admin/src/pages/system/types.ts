/**
 * 파일 정보
 */
export interface FileInfo {
  id: number;
  url: string;
  originalFileName: string;
  contentType: string;
  fileStatus: string;
  zipContents?: Array<{
    name: string;
    isDirectory: boolean;
  }>;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * 시스템 설정 조회
 */
export interface SystemSetting {
  rollingIntervalSeconds?: number;
  bimThumbnailFile: FileInfo;
  aerialViewFile: FileInfo;
}

/**
 * 시스템 설정 업데이트
 */
export interface UpdateSystemSetting {
  rollingIntervalSeconds: number;
  bimThumbnailFileId?: number;
  aerialViewFileId?: number;
}
