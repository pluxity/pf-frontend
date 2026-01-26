import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { Announcement, AnnouncementFormData, Notice, NoticeFormData } from "../types";

export const announcementService = {
  get: async (): Promise<Announcement> => {
    const response = await getApiClient().get<DataResponse<Announcement>>("/announcement");
    return response.data;
  },

  update: async (data: AnnouncementFormData): Promise<void> => {
    await getApiClient().put("/announcement", data);
  },
};

interface PageData<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  last: boolean;
  first: boolean;
}

export const noticeService = {
  getList: async (): Promise<Notice[]> => {
    const response = await getApiClient().get<DataResponse<PageData<Notice>>>("/notices");
    return response.data.content;
  },

  getById: async (id: number): Promise<Notice> => {
    const response = await getApiClient().get<DataResponse<Notice>>(`/notices/${id}`);
    return response.data;
  },

  create: async (data: NoticeFormData): Promise<Notice> => {
    const response = await getApiClient().post<DataResponse<Notice>>("/notices", data);
    return response.data;
  },

  update: async (id: number, data: NoticeFormData): Promise<Notice> => {
    const response = await getApiClient().put<DataResponse<Notice>>(`/notices/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await getApiClient().delete(`/notices/${id}`);
  },
};
