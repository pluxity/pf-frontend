import { useEffect, useRef, useState } from "react";
import { CronExpressionParser } from "cron-parser";
import { weatherService } from "../services/weather.service";
import { useWeatherStore } from "../stores";
import {
  calculateHourOffset,
  findT1H,
  extractHourFromBaseTime,
  extractWeatherState,
  extractSkyFromFcst,
} from "../utils/weather";
import type { UltraSrtNcstResponse, UltraSrtFcstResponse } from "../services/types";

interface UseWeatherOptions {
  nx: number;
  ny: number;
}

export interface HourlyTemp {
  hour: string;
  temp: string;
  pty: string | null;
  sky: string | null;
  isCurrent: boolean;
}

interface UseWeatherReturn {
  currentTemp: string | null;
  hourlyTemps: HourlyTemp[];
  currentHour: string;
  data: UltraSrtNcstResponse | null;
  fcstData: UltraSrtFcstResponse | null;
  isLoading: boolean;
  error: Error | null;
}

export function useWeather({ nx, ny }: UseWeatherOptions): UseWeatherReturn {
  const [currentTemp, setCurrentTemp] = useState<string | null>(null);
  const [hourlyTemps, setHourlyTemps] = useState<HourlyTemp[]>([]);
  const [currentHour, setCurrentHour] = useState<string>("");
  const [ncstData, setNcstData] = useState<UltraSrtNcstResponse | null>(null);
  const [fcstData, setFcstData] = useState<UltraSrtFcstResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function initializePastData() {
      try {
        const pastNcst = await weatherService.getPastNcstData(nx, ny);

        if (pastNcst && pastNcst.length > 0) {
          pastNcst.forEach((item) => {
            useWeatherStore.getState().addHourlyCache(item.hour, item.temp, item.pty, item.sky);
          });
        }
      } catch (err) {
        console.error("Failed to initialize past weather data:", err);
      }
    }

    initializePastData();
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);

        const [ncst, fcst] = await Promise.all([
          weatherService.getUltraSrtNcst(nx, ny),
          weatherService.getUltraSrtFcst(nx, ny),
        ]);

        setNcstData(ncst);
        setFcstData(fcst);

        // Store에 저장
        useWeatherStore.getState().setNcstData(ncst);
        useWeatherStore.getState().setFcstData(fcst);

        const temp = findT1H(ncst);
        if (temp) {
          setCurrentTemp(temp.obsrValue);
        }

        const now = new Date();
        const currentHourNum = now.getHours();
        const currentHourStr = String(currentHourNum).padStart(2, "0");
        setCurrentHour(currentHourStr);

        // Store에 실황 데이터 저장
        if (ncst && ncst.length > 0) {
          const baseTimeItem = findT1H(ncst);
          if (baseTimeItem) {
            const baseHour = extractHourFromBaseTime(baseTimeItem.baseTime);

            const weatherState = extractWeatherState(ncst);
            const sky = extractSkyFromFcst(fcst, baseHour);

            useWeatherStore
              .getState()
              .addHourlyCache(baseHour, baseTimeItem.obsrValue, weatherState.pty, sky);
          }
        }

        useWeatherStore.getState().cleanupOldData();

        // 미래 시간 데이터를 미리 그룹화 (성능 최적화)
        const fcstByTime = fcst.reduce(
          (acc, item) => {
            const time = item.fcstTime;
            if (!acc[time]) {
              acc[time] = {};
            }
            // 각 카테고리별로 가장 최신 baseTime의 데이터만 저장
            const existing = acc[time][item.category];
            if (!existing || parseInt(item.baseTime, 10) > parseInt(existing.baseTime, 10)) {
              acc[time][item.category] = item;
            }
            return acc;
          },
          {} as Record<string, Record<string, (typeof fcst)[0]>>
        );

        const hourlyData: HourlyTemp[] = [];
        const storeGetHourlyCache = useWeatherStore.getState().getHourlyCacheTemp;
        const storeGetHourlyWeather = useWeatherStore.getState().getHourlyCacheWeather;

        // 현재 시간 기준: 전 3시간 ~ 후 5시간 (총 9시간)
        for (let i = -3; i <= 5; i++) {
          const hour = calculateHourOffset(currentHourNum, i);

          const hourStr = String(hour).padStart(2, "0");
          let temp: string = "--";
          let pty: string | null = null;
          let sky: string | null = null;

          if (hour === currentHourNum) {
            // 현재 시간: temp & pty는 ncst (실황), sky는 fcst (예보)에서 가져오기
            const ncstTemp = findT1H(ncst);
            temp = ncstTemp?.obsrValue ?? "--";
            const weatherState = extractWeatherState(ncst);
            pty = weatherState.pty;

            // sky는 ncst에 없으므로 fcst에서 가져오기
            sky = extractSkyFromFcst(fcst, hourStr);
          } else if (hour < currentHourNum) {
            // 과거 시간: Store의 캐시에서 가져오기
            temp = storeGetHourlyCache(hourStr) ?? "--";
            const cachedWeather = storeGetHourlyWeather(hourStr);
            if (cachedWeather) {
              pty = cachedWeather.pty;
              sky = cachedWeather.sky;
            }
          } else {
            // 미래 시간: 미리 그룹화된 fcstByTime에서 O(1)로 조회
            const forecast = fcstByTime[`${hourStr}00`];
            if (forecast) {
              temp = forecast.T1H?.fcstValue ?? "--";
              pty = forecast.PTY?.fcstValue ?? null;
              sky = forecast.SKY?.fcstValue ?? null;
            }
          }

          const isCurrent = hour === currentHourNum;

          hourlyData.push({
            hour: hourStr,
            temp,
            pty,
            sky,
            isCurrent,
          });
        }
        setHourlyTemps(hourlyData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("날씨 데이터를 가져오는데 실패했습니다"));
      } finally {
        setIsLoading(false);
      }
    }

    // Cron 로직: 다음 정시에 자동으로 데이터 가져오기 (매 정시: "0 * * * *")
    const scheduleNextHour = () => {
      try {
        const interval = CronExpressionParser.parse("0 * * * *");
        const nextRun = interval.next().toDate();
        const waitTime = nextRun.getTime() - Date.now();

        timeoutRef.current = setTimeout(() => {
          fetchWeather();
          scheduleNextHour(); // 그 다음 정시를 위해 다시 스케줄
        }, waitTime);
      } catch (err) {
        console.error("Failed to schedule next weather fetch:", err);
      }
    };

    fetchWeather();
    scheduleNextHour();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nx, ny]);

  return { currentTemp, hourlyTemps, currentHour, data: ncstData, fcstData, isLoading, error };
}
