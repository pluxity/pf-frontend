export type { PageResponse } from "@/types";

export interface AttendanceResponse {
  id: number;
  attendanceDate: string;
  deviceName: string;
  attendanceCount: number;
  workContent?: string;
}

export interface AttendanceUpdateRequest {
  workContent: string;
}

export interface AttendanceBulkRequest {
  updates: { id: number; workContent: string }[];
}

export interface AttendanceData {
  id: number;
  attendanceDate: string;
  deviceName: string;
  attendanceCount: number;
  workContent: string;
}
