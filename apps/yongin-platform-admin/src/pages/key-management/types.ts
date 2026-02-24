// File 응답
import type { FileResponse } from "../../types";

// KeyManagement 타입
export interface KeyManagementType {
  code: string;
  description: string;
}

// API 응답 타입
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

export interface KeyManagementGroup {
  type: string;
  typeDescription: string;
  items: KeyManagementItem[];
}

// API 요청 타입
export interface KeyManagementRequest {
  type: string;
  title: string;
  methodFeature?: string;
  methodContent?: string;
  methodDirection?: string;
  displayOrder: number;
  fileId?: number | null;
}

export interface KeyManagementUpdateRequest {
  type: string;
  title: string;
  methodFeature?: string;
  methodContent?: string;
  methodDirection?: string;
  displayOrder?: number;
  fileId?: number | null;
}

// Modal Form 데이터 타입
export interface KeyManagementFormData {
  title: string;
  methodFeature: string;
  methodContent: string;
  methodDirection: string;
  displayOrder: number;
}

// Modal Props 타입
export interface KeyManagementModalProps {
  isOpen: boolean;
  selectedItem: KeyManagementItem | null;
  onClose: () => void;
  onSave: (formData: KeyManagementFormData, uploadedFileId: number | null) => void;
}
