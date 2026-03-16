import { useEffect, useRef, useState } from "react";
import { weatherService } from "../services/weather.service";
import { useWeatherStore } from "../stores";
import type { ParsedWeather, HourlyWeather } from "../services/types";

interface UseWeatherOptions {
  siteId: number | null;
}

interface UseWeatherReturn {
  currentWeather: ParsedWeather | null;
  hourlyWeather: HourlyWeather[];
  isLoading: boolean;
  error: Error | null;
}

export function useWeather({ siteId }: UseWeatherOptions): UseWeatherReturn {
  const [currentWeather, setCurrentWeather] = useState<ParsedWeather | null>(null);
  const [hourlyWeather, setHourlyWeather] = useState<HourlyWeather[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (siteId == null) {
      setCurrentWeather(null);
      setHourlyWeather([]);
      setIsLoading(false);
      return;
    }

    async function fetchWeather() {
      if (siteId == null) return;

      try {
        setIsLoading(true);
        setError(null);

        const res = await weatherService.getSiteWeather(siteId);
        const groups = res.data;

        const current = weatherService.parseCurrentWeather(groups);
        const hourly = weatherService.parseHourlyWeather(groups);

        setCurrentWeather(current);
        setHourlyWeather(hourly);

        useWeatherStore.getState().setWeatherData(siteId, groups, current, hourly);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("날씨 데이터를 가져오는데 실패했습니다"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeather();

    // 매 정시에 갱신 (다음 정시까지 대기 후 1시간 간격)
    const msToNextHour = (60 - new Date().getMinutes()) * 60_000 - new Date().getSeconds() * 1000;

    const timeout = setTimeout(() => {
      fetchWeather();
      intervalRef.current = setInterval(fetchWeather, 3_600_000);
    }, msToNextHour);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [siteId]);

  return { currentWeather, hourlyWeather, isLoading, error };
}
