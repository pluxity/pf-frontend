import { create } from "zustand";
import type { WeatherTimeGroupResponse, ParsedWeather, HourlyWeather } from "../services/types";

export interface WeatherState {
  weatherGroups: WeatherTimeGroupResponse[] | null;
  currentWeather: ParsedWeather | null;
  hourlyWeather: HourlyWeather[];
  siteId: number | null;
}

export interface WeatherActions {
  setWeatherData: (
    siteId: number,
    groups: WeatherTimeGroupResponse[],
    current: ParsedWeather,
    hourly: HourlyWeather[]
  ) => void;
  clearWeatherData: () => void;
}

type WeatherStore = WeatherState & WeatherActions;

export const useWeatherStore = create<WeatherStore>()((set) => ({
  weatherGroups: null,
  currentWeather: null,
  hourlyWeather: [],
  siteId: null,

  setWeatherData: (siteId, groups, current, hourly) => {
    set({
      siteId,
      weatherGroups: groups,
      currentWeather: current,
      hourlyWeather: hourly,
    });
  },

  clearWeatherData: () => {
    set({
      siteId: null,
      weatherGroups: null,
      currentWeather: null,
      hourlyWeather: [],
    });
  },
}));
