import type {
  UltraSrtNcstResponse,
  UltraSrtFcstResponse,
  UltraSrtNcstItem,
  UltraSrtFcstItem,
} from "./types";
import { getBaseDateTime, findT1H, getDateAndHourForPastData } from "../utils/weather";

const WEATHER_API_KEY = import.meta.env.VITE_API_WEATHER;

export const weatherService = {
  /**
   * 초단기실황 조회
   */
  getUltraSrtNcst: async (nx: number, ny: number): Promise<UltraSrtNcstResponse> => {
    const { date, time } = getBaseDateTime();

    const params = new URLSearchParams({
      pageNo: "1",
      numOfRows: "100",
      dataType: "JSON",
      base_date: date,
      base_time: time,
      nx: String(nx),
      ny: String(ny),
      authKey: WEATHER_API_KEY,
    });

    const response = await fetch(`/weather-api/forecast/getUltraSrtNcst?${params}`);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data.response.header.resultCode !== "00") {
      throw new Error(`기상청 API 에러: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items.item;
  },

  /**
   * 초단기예보 조회
   */
  getUltraSrtFcst: async (nx: number, ny: number): Promise<UltraSrtFcstResponse> => {
    const { date, time } = getBaseDateTime();

    const params = new URLSearchParams({
      pageNo: "1",
      numOfRows: "1000",
      dataType: "JSON",
      base_date: date,
      base_time: time,
      nx: String(nx),
      ny: String(ny),
      authKey: WEATHER_API_KEY,
    });

    const response = await fetch(`/weather-api/forecast/getUltraSrtFcst?${params}`);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();

    if (data.response.header.resultCode !== "00") {
      throw new Error(`기상청 API 에러: ${data.response.header.resultMsg}`);
    }

    return data.response.body.items.item;
  },

  /**
   * 과거 3시간 실황 데이터 조회
   * 현재 기준 -1h, -2h, -3h의 관측값 수집
   */
  getPastNcstData: async (
    nx: number,
    ny: number
  ): Promise<Array<{ hour: string; temp: string; pty: string | null; sky: string | null }>> => {
    try {
      const today = new Date();
      const pastDataList: Array<{
        hour: string;
        temp: string;
        pty: string | null;
        sky: string | null;
      }> = [];

      let allFcstItems: UltraSrtFcstItem[] = [];
      try {
        const { date, time } = getBaseDateTime();
        const fcstParams = new URLSearchParams({
          pageNo: "1",
          numOfRows: "1000",
          dataType: "JSON",
          base_date: date,
          base_time: time,
          nx: String(nx),
          ny: String(ny),
          authKey: WEATHER_API_KEY,
        });

        const fcstResponse = await fetch(`/weather-api/forecast/getUltraSrtFcst?${fcstParams}`);

        if (fcstResponse.ok) {
          const fcstData = await fcstResponse.json();
          if (fcstData.response.header.resultCode === "00") {
            allFcstItems = fcstData.response.body.items.item || [];
          }
        }
      } catch (fcstErr) {
        console.warn("예보 API 조회 실패 (SKY 데이터 없음):", {
          error: fcstErr instanceof Error ? fcstErr.message : "Unknown error",
          timestamp: new Date(),
        });
        // 예보 조회 실패해도 실황 데이터는 계속 수집
      }

      const pastDataPromises = Array.from({ length: 3 }, (_, index) => {
        const i = index + 1;
        const { dateStr, hour } = getDateAndHourForPastData(today, i);
        const time = String(hour).padStart(2, "0") + "00";

        const params = new URLSearchParams({
          pageNo: "1",
          numOfRows: "100",
          dataType: "JSON",
          base_date: dateStr,
          base_time: time,
          nx: String(nx),
          ny: String(ny),
          authKey: WEATHER_API_KEY,
        });

        return fetch(`/weather-api/forecast/getUltraSrtNcst?${params}`)
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
          .then((ncstData) => {
            if (ncstData?.response?.header?.resultCode !== "00") return null;

            const ncstItems: UltraSrtNcstItem[] = ncstData.response.body.items.item || [];
            const t1h = findT1H(ncstItems);

            if (t1h) {
              const ptyItem = ncstItems.find((item) => item.category === "PTY");
              const skyItem = allFcstItems.find(
                (item) =>
                  item.fcstDate === dateStr && item.fcstTime === time && item.category === "SKY"
              );
              return {
                hour: String(hour).padStart(2, "0"),
                temp: t1h.obsrValue,
                pty: ptyItem?.obsrValue ?? null,
                sky: skyItem?.fcstValue ?? null,
              };
            }
            return null;
          })
          .catch((err) => {
            console.warn(`과거 실황 데이터 조회 실패 (${i}시간 전):`, {
              error: err instanceof Error ? err.message : "Unknown error",
              timestamp: new Date(),
            });
            return null;
          });
      });

      const results = await Promise.all(pastDataPromises);
      pastDataList.push(...results.filter((item): item is NonNullable<typeof item> => !!item));

      return pastDataList;
    } catch (err) {
      console.error("Failed to get past weather data:", err);
      return [];
    }
  },
};
