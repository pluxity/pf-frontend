import type { AttendanceData } from "../types";

const MOCK_DATA: AttendanceData[] = [
  {
    id: "1",
    inputDate: "2026-01-07",
    deviceName: "단말기1",
    todayContent: "토공 작업 진행",
  },
  {
    id: "2",
    inputDate: "2026-01-07",
    deviceName: "단말기2",
    todayContent: "도로공 작업 완료",
  },
  {
    id: "3",
    inputDate: "2026-01-07",
    deviceName: "단말기3",
    todayContent: "비계착 설치 중",
  },
];

export const getAttendanceList = (): Promise<AttendanceData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATA);
    }, 1000);
  });
};
