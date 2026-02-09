import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UltraSrtNcstResponse, UltraSrtFcstResponse } from "../services/types";

export interface HourlyWeatherCache {
  hour: string;
  temp: string;
  pty: string | null;
  sky: string | null;
  timestamp: number;
}

export interface WeatherState {
  ncstData: UltraSrtNcstResponse | null;
  fcstData: UltraSrtFcstResponse | null;
  hourlyCache: HourlyWeatherCache[];
}

export interface WeatherActions {
  setNcstData: (data: UltraSrtNcstResponse | null) => void;
  setFcstData: (data: UltraSrtFcstResponse | null) => void;
  addHourlyCache: (hour: string, temp: string, pty: string | null, sky: string | null) => void;
  cleanupOldData: () => void;
  getHourlyCacheTemp: (hour: string) => string | null;
  getHourlyCacheWeather: (hour: string) => { pty: string | null; sky: string | null } | null;
}

type WeatherStore = WeatherState & WeatherActions;

const CACHE_RETENTION_HOURS = 24;

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      ncstData: null,
      fcstData: null,
      hourlyCache: [],

      setNcstData: (data) => {
        set({ ncstData: data });
      },

      setFcstData: (data) => {
        set({ fcstData: data });
      },

      addHourlyCache: (hour, temp, pty, sky) => {
        set((state) => {
          const existingIndex = state.hourlyCache.findIndex((item) => item.hour === hour);
          let newCache: HourlyWeatherCache[];

          if (existingIndex !== -1) {
            newCache = [...state.hourlyCache];
            newCache[existingIndex] = { hour, temp, pty, sky, timestamp: Date.now() };
          } else {
            newCache = [...state.hourlyCache, { hour, temp, pty, sky, timestamp: Date.now() }];
          }

          newCache.sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

          return { hourlyCache: newCache };
        });
      },

      cleanupOldData: () => {
        set((state) => {
          const now = Date.now();
          const cutoffTime = now - CACHE_RETENTION_HOURS * 60 * 60 * 1000;

          const filteredCache = state.hourlyCache.filter((item) => item.timestamp > cutoffTime);

          return { hourlyCache: filteredCache };
        });
      },

      getHourlyCacheTemp: (hour) => {
        const state = get();
        const cached = state.hourlyCache.find((item) => item.hour === hour);
        return cached?.temp ?? null;
      },

      getHourlyCacheWeather: (hour) => {
        const state = get();
        const cached = state.hourlyCache.find((item) => item.hour === hour);
        return cached ? { pty: cached.pty, sky: cached.sky } : null;
      },
    }),
    {
      name: "weather-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ncstData: state.ncstData,
        hourlyCache: state.hourlyCache,
      }),
    }
  )
);
