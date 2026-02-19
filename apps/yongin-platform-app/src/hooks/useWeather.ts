import useSWR from "swr";
import { weatherService } from "@/services";

interface OpenWeatherData {
  id: number;
  description: string;
  icon: string;
  temp: number;
}

const WEATHER_KEY = "/weather";
const OPEN_WEATHER_KEY = "openweather";
const REFRESH_INTERVAL = 600000;

const OPEN_WEATHER_API_KEY = import.meta.env.VITE_API_WEATHER;
const OPEN_WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const OPEN_WEATHER_CITY = "Yongin";

async function fetchOpenWeather(): Promise<OpenWeatherData> {
  const url = `${OPEN_WEATHER_BASE_URL}/weather?q=${OPEN_WEATHER_CITY}&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=kr`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("OpenWeather API 요청 실패");
  }

  const data = await res.json();
  const weather = data.weather[0];

  return {
    id: weather.id,
    description: weather.description,
    icon: weather.icon,
    temp: data.main.temp,
  };
}

export function useWeather() {
  const { data: weather, error, isLoading } = useSWR(WEATHER_KEY, () => weatherService.get());

  const { data: openWeather } = useSWR(OPEN_WEATHER_KEY, fetchOpenWeather, {
    refreshInterval: REFRESH_INTERVAL,
  });

  return {
    weather,
    openWeather,
    isLoading,
    isError: !!error,
    error,
  };
}
