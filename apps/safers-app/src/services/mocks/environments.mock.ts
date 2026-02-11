import type { Environment } from "../types/environments.types";

export const mockEnvironments: Environment[] = [
  {
    name: "초미세먼지(PM2.5)",
    value: 14,
    unit: "µg/m³",
    status: "양호",
    fill: "#11C208",
    percentage: 10,
  },
  {
    name: "미세먼지(PM10)",
    value: 45,
    unit: "µg/m³",
    status: "주의",
    fill: "#FDC200",
    percentage: 50,
  },
  {
    name: "일산화탄소",
    value: 15,
    unit: "ppm",
    status: "나쁨",
    fill: "#F86700",
    percentage: 75,
  },
  {
    name: "총휘발성유기화합물",
    value: 995,
    unit: "µg/m³",
    status: "매우나쁨",
    fill: "#CA0014",
    percentage: 90,
  },
  {
    name: "소음",
    value: 70,
    unit: "dB",
    status: "양호",
    fill: "#11C208",
    percentage: 70,
  },
];
