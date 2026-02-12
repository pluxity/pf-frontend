import type { DataResponseBody } from "./common.types";

/** 날씨 카테고리 */
export type WeatherCategory =
  | "T1H" // 기온
  | "RN1" // 1시간 강수량
  | "SKY" // 하늘 상태
  | "UUU" // 동서바람성분
  | "VVV" // 남북바람성분
  | "REH" // 습도
  | "PTY" // 강수형태
  | "LGT" // 낙뢰
  | "VEC" // 풍향
  | "WSD"; // 풍속

/** 날씨 항목 (서버 응답) */
export interface WeatherItemResponse {
  category: WeatherCategory;
  value: string;
}

/** 시간별 날씨 그룹 (서버 응답) */
export interface WeatherTimeGroupResponse {
  fcstDate: string;
  fcstTime: string;
  items: WeatherItemResponse[];
}

/** 날씨 API 응답 */
export type SiteWeatherResponse = DataResponseBody<WeatherTimeGroupResponse[]>;

/** 파싱된 현재 날씨 */
export interface ParsedWeather {
  temperature: string | null;
  humidity: string | null;
  windSpeed: string | null;
  windDirection: string | null;
  pty: string | null;
  sky: string | null;
  rainfall: string | null;
  lightning: string | null;
}

/** 시간별 날씨 데이터 */
export interface HourlyWeather {
  hour: string;
  temp: string;
  pty: string | null;
  sky: string | null;
  isCurrent: boolean;
}
