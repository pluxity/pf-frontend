import { getApiClient, type DataResponse } from "@pf-dev/api";
import type { WeatherResponse } from "./types/weather";

export const weatherService = {
  get: async (): Promise<WeatherResponse> => {
    const result = await getApiClient().get<DataResponse<WeatherResponse>>("/weather");
    return result.data;
  },
};
