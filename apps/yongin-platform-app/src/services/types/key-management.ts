export interface FileResponse {
  id?: number;
  url?: string;
  originalFileName?: string;
  contentType?: string;
  fileStatus?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface KeyManagementType {
  code: string;
  description: string;
}

export interface KeyManagementItem {
  id: number;
  type: string;
  title: string;
  methodFeature?: string;
  methodContent?: string;
  methodDirection?: string;
  displayOrder: number;
  fileId?: number | null;
  file?: FileResponse;
  selected: boolean;
}
