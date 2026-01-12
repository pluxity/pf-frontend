export type ItemStatus = "active" | "inactive" | "draft";

export interface Item {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  title: string;
  description: string;
  thumbnail?: string;
  status: ItemStatus;
}

export type FilterStatus = "all" | ItemStatus;
