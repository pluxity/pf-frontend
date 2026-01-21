import type { ProcessStatusData } from "../types";

const MOCK_DATA: ProcessStatusData[] = [
  {
    id: "1",
    date: "2026-01-20",
    name: "도로공",
    targetRate: 100,
    progressRate: 60,
  },
  {
    id: "2",
    date: "2026-01-21",
    name: "토공",
    targetRate: 100,
    progressRate: 10,
  },
  {
    id: "3",
    date: "2026-01-22",
    name: "비개착",
    targetRate: 100,
    progressRate: 20,
  },
  {
    id: "4",
    date: "2026-01-23",
    name: "교량/옹벽",
    targetRate: 100,
    progressRate: 33,
  },
];

export const getProcessStatusList = (): Promise<ProcessStatusData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DATA);
    }, 1000);
  });
};
