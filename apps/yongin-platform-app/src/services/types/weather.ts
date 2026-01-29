export interface WeatherResponse {
  id: number;
  measuredAt: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  rainfall: number;
  pm10: number;
  pm25: number;
  pm10Status: string;
  pm25Status: string;
  noise: number;
}
