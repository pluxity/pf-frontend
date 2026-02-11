// 환경 상태
export type EnvironmentStatus = "양호" | "주의" | "나쁨" | "매우나쁨";

// 환경 상태별 스타일
export interface EnvironmentStatusStyle {
  fill: string;
  label: string;
}

// 환경 상태 스타일 맵
export const ENVIRONMENT_STATUS_STYLES: Record<EnvironmentStatus, EnvironmentStatusStyle> = {
  양호: {
    fill: "#11C208",
    label: "양호",
  },
  주의: {
    fill: "#FDC200",
    label: "주의",
  },
  나쁨: {
    fill: "#F86700",
    label: "나쁨",
  },
  매우나쁨: {
    fill: "#CA0014",
    label: "매우나쁨",
  },
};

// 환경 정보
export interface Environment {
  name: string;
  value: number;
  unit: string;
  status: EnvironmentStatus;
  fill: string;
  percentage: number;
}

// API 응답
export interface EnvironmentsResponse {
  data: Environment[];
}

export interface EnvironmentResponse {
  data: Environment;
}
