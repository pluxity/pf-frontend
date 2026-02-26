export interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface NoticeFormData {
  title: string;
  content: string;
}
