export interface Notice {
  id: number;
  title: string | null;
  content: string | null;
  isVisible: boolean;
  isAlways: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface NoticeFormData {
  title: string;
  content: string;
  isVisible: boolean;
  isAlways: boolean;
  startDate: string;
  endDate: string;
}
