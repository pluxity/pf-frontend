import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { AttendanceResponse, AttendanceData, PageResponse } from "../types";

function toGridData(response: AttendanceResponse): AttendanceData {
  return {
    id: response.id,
    attendanceDate: response.attendanceDate,
    deviceName: response.deviceName,
    attendanceCount: response.attendanceCount,
    workContent: response.workContent ?? "",
  };
}

export async function getAttendanceList(
  page?: number,
  size?: number
): Promise<{ data: AttendanceData[]; totalElements: number }> {
  const response = await getApiClient().get<DataResponse<PageResponse<AttendanceResponse>>>(
    "/attendances",
    {
      params: { page, size },
    }
  );
  return {
    data: response.data.content.map(toGridData),
    totalElements: response.data.totalElements,
  };
}

export async function getLatestAttendances(): Promise<AttendanceData[]> {
  const response =
    await getApiClient().get<DataResponse<AttendanceResponse[]>>("/attendances/latest");
  return response.data.map(toGridData);
}

export async function updateAttendance(id: number, workContent: string): Promise<void> {
  await getApiClient().patch<void>(`/attendances/${id}`, { workContent });
}

export async function updateAttendances(
  updates: { id: number; workContent: string }[]
): Promise<void> {
  await Promise.all(updates.map(({ id, workContent }) => updateAttendance(id, workContent)));
}
