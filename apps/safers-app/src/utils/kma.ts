import type { UltraSrtNcstItem, UltraSrtFcstItem } from "../services/types";

/**
 * GPS 좌표(위도, 경도)를 KMA 기상청 격자좌표로 변환
 * @param latitude
 * @param longitude
 * @returns { nx: 격자 X좌표, ny: 격자 Y좌표 }
 */
export function gpsToGrid(latitude: number, longitude: number): { nx: number; ny: number } {
  // KMA 격자 변환 파라미터
  const RE = 6371.00877; // 지구 반경 (km)
  const GRID = 5.0; // 격자 간격 (km)
  const SLAT1 = 30.0; // 투영 위도1 (degree)
  const SLAT2 = 60.0; // 투영 위도2 (degree)
  const OLON = 126.0; // 기준점 경도 (degree)
  const OLAT = 38.0; // 기준점 위도 (degree)
  const XO = 43; // 기준점 X좌표 (격자)
  const YO = 136; // 기준점 Y좌표 (격자)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + latitude * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = longitude * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx: x, ny: y };
}

/**
 * 기상청 API 호출용 base_date, base_time 계산 (-40분 offset)
 * @param now 기준 시간 (기본값: 현재 시간)
 * @returns { date: "YYYYMMDD", time: "HHMM" }
 */
export function getBaseDateTime(now = new Date()) {
  const baseTime = new Date(now);
  baseTime.setMinutes(baseTime.getMinutes() - 40);

  const year = baseTime.getFullYear();
  const month = String(baseTime.getMonth() + 1).padStart(2, "0");
  const day = String(baseTime.getDate()).padStart(2, "0");
  const date = `${year}${month}${day}`;

  const time = String(baseTime.getHours()).padStart(2, "0") + "00";

  return { date, time };
}

/**
 * 현재 시간에서 오프셋만큼 떨어진 시간 계산 (24시간 wrapping)
 * @param currentHour 현재 시간 (0-23)
 * @param offset 시간 오프셋 (음수: 과거, 양수: 미래)
 * @returns 계산된 시간 (0-23)
 */
export function calculateHourOffset(currentHour: number, offset: number): number {
  let hour = currentHour + offset;

  if (hour < 0) {
    hour = 24 + hour;
  } else if (hour >= 24) {
    hour = hour - 24;
  }

  return hour;
}

/**
 * T1H (1시간 기온) 데이터 추출
 * @param items API 응답의 items 배열
 * @returns T1H 카테고리 아이템 또는 null
 */
export function findT1H(items: UltraSrtNcstItem[]): UltraSrtNcstItem | null {
  return items.find((item) => item.category === "T1H") || null;
}

/**
 * baseTime 문자열에서 시간 추출
 * @param baseTime baseTime 값 (예: 1215 → "12")
 * @returns 시간 문자열 (2자리, padStart)
 */
export function extractHourFromBaseTime(baseTime: string | number): string {
  const timeStr = String(baseTime).padStart(4, "0");
  return timeStr.substring(0, 2);
}

/**
 * 강수형태(PTY) 코드를 날씨 상태 문자열로 변환
 * @param pty 강수형태 코드 (0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기)
 * @returns 날씨 상태 문자열
 */
export function getPrecipitationTypeLabel(pty: string | number): string {
  const ptyMap: Record<string | number, string> = {
    0: "없음",
    1: "비",
    2: "비/눈",
    3: "눈",
    4: "소나기",
  };
  return ptyMap[pty] || "알 수 없음";
}

/**
 * 하늘상태(SKY) 코드를 날씨 상태 문자열로 변환
 * @param sky 하늘상태 코드 (1=맑음, 3=구름많음, 4=흐림)
 * @returns 날씨 상태 문자열
 */
export function getSkyTypeLabel(sky: string | number): string {
  const skyMap: Record<string | number, string> = {
    1: "맑음",
    3: "구름많음",
    4: "흐림",
  };
  return skyMap[sky] || "알 수 없음";
}

/**
 * 날씨 상태에 맞는 아이콘 파일명 반환
 * PTY(강수형태)와 SKY(하늘상태)를 고려하여 최적의 아이콘 선택
 * @param pty 강수형태 (0=없음, 1=비, 2=비/눈, 3=눈, 4=소나기)
 * @param sky 하늘상태 (1=맑음, 3=구름많음, 4=흐림)
 * @param hour 시간 (0-23, 생략시 현재 시간)
 * @returns 아이콘 파일명 (예: "sunny.svg")
 */
export function getWeatherIcon(
  pty?: string | number | null,
  sky?: string | number | null,
  hour?: number
): string {
  const ptyNum = pty ? Number(pty) : 0;
  const skyNum = sky ? Number(sky) : 1;
  const currentHour = hour ?? new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 18;

  // 강수형태 우선 (비, 눈 등이 있으면 그것 표시)
  switch (ptyNum) {
    case 1:
      return "rainy.svg";
    case 2:
      return "rainy.svg";
    case 3:
      return "snow.svg";
    case 4:
      return "rainy.svg";
    case 0:
    default:
      // 강수 없으면 하늘상태로 표시 (낮/밤 구분)
      if (!isDay) {
        // 밤
        switch (skyNum) {
          case 1:
            return "partly-cloudy.svg";
          case 3:
            return "cloudy.svg";
          case 4:
            return "cloudy.svg";
          default:
            return "partly-cloudy.svg";
        }
      }
      // 낮
      switch (skyNum) {
        case 1:
          return "sunny.svg";
        case 3:
          return "partly-cloudy.svg";
        case 4:
          return "cloudy.svg";
        default:
          return "sunny.svg";
      }
  }
}

/**
 * ncstData에서 강수형태(PTY) 추출
 * ncst(초단기실황)는 SKY 데이터를 제공하지 않습니다.
 * @param ncstItems ncstData 배열
 * @returns { pty: 강수형태(PTY) 또는 null }
 */
export function extractWeatherState(ncstItems: UltraSrtNcstItem[]): {
  pty: string | null;
} {
  const ptyItem = ncstItems.find((item) => item.category === "PTY");
  return {
    pty: ptyItem?.obsrValue ?? null,
  };
}

/**
 * fcstData에서 주어진 시간의 SKY(하늘상태) 추출
 * @param fcstItems
 * @param hourStr
 * @returns SKY 값 또는 null (최신 baseTime 기준)
 */
export function extractSkyFromFcst(fcstItems: UltraSrtFcstItem[], hourStr: string): string | null {
  const skyCandidates = fcstItems.filter(
    (item) => item.category === "SKY" && item.fcstTime === `${hourStr}00`
  );

  if (skyCandidates.length > 0) {
    const latestSky = skyCandidates.reduce((latest, current) =>
      parseInt(current.baseTime, 10) > parseInt(latest.baseTime, 10) ? current : latest
    );
    return latestSky?.fcstValue ?? null;
  }

  return null;
}

/**
 * 풍향(도)을 방위로 변환
 * @param degrees 풍향 (0-360도)
 * @returns 방위 문자열 (예: "남동풍", "북서풍")
 */
export function degreesToDirection(degrees: string | number | null): string {
  if (degrees === null || degrees === undefined) return "--";

  const deg = Number(degrees);
  const directions = [
    "북풍",
    "북북동풍",
    "북동풍",
    "동북동풍",
    "동풍",
    "동남동풍",
    "남동풍",
    "남남동풍",
    "남풍",
    "남남서풍",
    "남서풍",
    "서남서풍",
    "서풍",
    "서북서풍",
    "북서풍",
    "북북서풍",
  ];

  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index] || "북풍";
}

/**
 * ncstData에서 환경 데이터 추출 (습도, 풍향, 풍속)
 * @param ncstItems ncstData 배열
 * @returns { humidity: string, windDirection: string, windSpeed: string }
 */
export function extractEnvironmentData(ncstItems: UltraSrtNcstItem[]): {
  humidity: string | null;
  windDirection: string;
  windSpeed: string | null;
} {
  const rehItem = ncstItems.find((item) => item.category === "REH");
  const vecItem = ncstItems.find((item) => item.category === "VEC");
  const wsdItem = ncstItems.find((item) => item.category === "WSD");

  return {
    humidity: rehItem?.obsrValue ?? null,
    windDirection: vecItem ? degreesToDirection(vecItem.obsrValue) : "--",
    windSpeed: wsdItem?.obsrValue ?? null,
  };
}

/**
 * 대상 날짜와 시간에 대한 date 문자열 생성
 * @param date 기준 날짜
 * @param hour 대상 시간 (음수면 전날)
 * @returns { date: "YYYYMMDD", hour: 0-23 }
 */
export function getDateAndHourForPastData(date: Date, hourOffset: number) {
  let targetHour = date.getHours() - hourOffset;
  let targetDate = date;

  if (targetHour < 0) {
    targetHour = 24 + targetHour;
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    targetDate = yesterday;
  }

  const year = String(targetDate.getFullYear());
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  return { dateStr, hour: targetHour };
}

/**
 * 기상특보 코드를 한글 문자열로 변환
 * @param wrnCode 특보 코드 (예: "HCWO")
 * @returns 특보 텍스트 (예: "폭염, 한파, 강풍, 해일")
 */
export function formatWeatherWarning(wrnCode: string | null | undefined): string {
  if (!wrnCode || wrnCode.length === 0) {
    return "특보 없음";
  }

  const wrnMap: Record<string, string> = {
    W: "강풍",
    R: "호우",
    C: "한파",
    D: "건조",
    O: "해일",
    N: "지진해일",
    V: "풍랑",
    T: "태풍",
    S: "대설",
    Y: "황사",
    H: "폭염",
    F: "안개",
  };

  const codes = wrnCode.split("");
  const warnings = codes.map((code) => wrnMap[code]).filter((warning) => warning !== undefined);

  return warnings.length > 0 ? warnings.join(", ") : "특보 없음";
}
