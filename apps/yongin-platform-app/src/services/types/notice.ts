export interface Notice {
  id: number;
  title: string;
  content: string;
  isVisible: boolean;
  isAlways: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
