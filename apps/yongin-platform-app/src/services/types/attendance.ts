export interface AttendanceResponse {
  id: number;
  attendanceDate: string;
  deviceName: string;
  attendanceCount: number;
  workContent?: string;
}

export interface AttendanceData {
  id: number;
  attendanceDate: string;
  deviceName: string;
  attendanceCount: number;
  workContent: string;
}
