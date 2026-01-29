import useSWR from "swr";
import { weatherService } from "@/services";

const WEATHER_KEY = "/weather";
const REFRESH_INTERVAL = 600000;

export function useWeather() {
  const { data, error, isLoading } = useSWR(WEATHER_KEY, () => weatherService.get(), {
    refreshInterval: REFRESH_INTERVAL,
  });

  return {
    weather: data,
    isLoading,
    isError: !!error,
    error,
  };
}
