export interface Announcement {
  content: string;
  updatedAt: string;
}

export interface AnnouncementFormData {
  content: string;
}

export interface Notice {
  id: number;
  title: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface NoticeFormData {
  title: string;
}
