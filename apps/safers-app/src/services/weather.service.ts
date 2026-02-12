import type {
  SiteWeatherResponse,
  WeatherTimeGroupResponse,
  ParsedWeather,
  HourlyWeather,
} from "./types/weather.types";

const API_BASE_URL = "/api";

const WIND_DIRECTIONS = [
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

function degreesToDirection(degrees: string | number | null): string {
  if (degrees == null) return "--";
  const deg = Number(degrees);
  const index = Math.round((deg % 360) / 22.5) % 16;
  return WIND_DIRECTIONS[index] ?? "북풍";
}

/** GET /sites/{siteId}/weather */
async function getSiteWeather(siteId: number): Promise<SiteWeatherResponse> {
  const response = await fetch(`${API_BASE_URL}/sites/${siteId}/weather`);
  if (!response.ok) throw new Error("Failed to fetch site weather");
  return response.json();
}

/** 시간 그룹에서 특정 카테고리 값 추출 */
function findItemValue(group: WeatherTimeGroupResponse, category: string): string | null {
  const item = group.items.find((i) => i.category === category);
  return item?.value ?? null;
}

/** 현재 시간에 가장 가까운 시간 그룹 찾기 */
function findCurrentGroup(groups: WeatherTimeGroupResponse[]): WeatherTimeGroupResponse | null {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, "0") + "00";
  const currentDate =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const exact = groups.find((g) => g.fcstDate === currentDate && g.fcstTime === currentHour);
  if (exact) return exact;

  const sorted = [...groups].sort((a, b) => {
    const aKey = `${a.fcstDate}${a.fcstTime}`;
    const bKey = `${b.fcstDate}${b.fcstTime}`;
    return bKey.localeCompare(aKey);
  });

  const nowKey = `${currentDate}${currentHour}`;
  return sorted.find((g) => `${g.fcstDate}${g.fcstTime}` <= nowKey) ?? sorted[0] ?? null;
}

/** 날씨 응답 → 현재 날씨 파싱 */
function parseCurrentWeather(groups: WeatherTimeGroupResponse[]): ParsedWeather {
  const current = findCurrentGroup(groups);
  if (!current) {
    return {
      temperature: null,
      humidity: null,
      windSpeed: null,
      windDirection: null,
      pty: null,
      sky: null,
      rainfall: null,
      lightning: null,
    };
  }

  const vec = findItemValue(current, "VEC");

  return {
    temperature: findItemValue(current, "T1H"),
    humidity: findItemValue(current, "REH"),
    windSpeed: findItemValue(current, "WSD"),
    windDirection: vec ? degreesToDirection(vec) : null,
    pty: findItemValue(current, "PTY"),
    sky: findItemValue(current, "SKY"),
    rainfall: findItemValue(current, "RN1"),
    lightning: findItemValue(current, "LGT"),
  };
}

/** 날씨 응답 → 시간별 데이터 변환 (서버가 -3h ~ +5h 범위를 반환) */
function parseHourlyWeather(groups: WeatherTimeGroupResponse[]): HourlyWeather[] {
  const currentHourNum = new Date().getHours();

  const groupByTime = new Map<string, WeatherTimeGroupResponse>();
  for (const g of groups) {
    groupByTime.set(`${g.fcstDate}_${g.fcstTime}`, g);
  }

  const now = new Date();
  const hourlyData: HourlyWeather[] = [];

  for (let i = -3; i <= 5; i++) {
    let hour = currentHourNum + i;
    const targetDate = new Date(now);

    if (hour < 0) {
      hour += 24;
      targetDate.setDate(targetDate.getDate() - 1);
    } else if (hour >= 24) {
      hour -= 24;
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const hourStr = String(hour).padStart(2, "0");
    const dateStr =
      String(targetDate.getFullYear()) +
      String(targetDate.getMonth() + 1).padStart(2, "0") +
      String(targetDate.getDate()).padStart(2, "0");

    const key = `${dateStr}_${hourStr}00`;
    const group = groupByTime.get(key);

    hourlyData.push({
      hour: hourStr,
      temp: group ? (findItemValue(group, "T1H") ?? "--") : "--",
      pty: group ? findItemValue(group, "PTY") : null,
      sky: group ? findItemValue(group, "SKY") : null,
      isCurrent: hour === currentHourNum,
    });
  }

  return hourlyData;
}

/** PTY/SKY 코드 → 날씨 아이콘 파일명 */
function getWeatherIcon(
  pty?: string | number | null,
  sky?: string | number | null,
  hour?: number
): string {
  const ptyNum = pty ? Number(pty) : 0;
  const skyNum = sky ? Number(sky) : 1;
  const isDay = (hour ?? new Date().getHours()) >= 6 && (hour ?? new Date().getHours()) < 18;

  if (ptyNum === 1 || ptyNum === 2 || ptyNum === 4) return "rainy.svg";
  if (ptyNum === 3) return "snow.svg";

  if (!isDay) {
    return skyNum >= 3 ? "cloudy.svg" : "partly-cloudy.svg";
  }
  if (skyNum === 3) return "partly-cloudy.svg";
  if (skyNum === 4) return "cloudy.svg";
  return "sunny.svg";
}

export const weatherService = {
  getSiteWeather,
  parseCurrentWeather,
  parseHourlyWeather,
  getWeatherIcon,
};
