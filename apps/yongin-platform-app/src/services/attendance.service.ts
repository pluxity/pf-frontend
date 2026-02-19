import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { AttendanceResponse, AttendanceData } from "./types";

function toGridData(response: AttendanceResponse): AttendanceData {
  return {
    id: response.id,
    attendanceDate: response.attendanceDate,
    deviceName: response.deviceName,
    attendanceCount: response.attendanceCount,
    workContent: response.workContent ?? "",
  };
}

export async function getLatestAttendances(): Promise<AttendanceData[]> {
  const response =
    await getApiClient().get<DataResponse<AttendanceResponse[]>>("/attendances/latest");
  return response.data.map(toGridData);
}
