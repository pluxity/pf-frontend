import { getWeatherIcon, extractWeatherState, extractEnvironmentData } from "../../../utils/kma";
import type { HourlyTemp } from "../../../hooks";
import type { UltraSrtNcstResponse } from "../../../services/types";

interface WeatherProps {
  currentTemp: string | null;
  hourlyTemps: HourlyTemp[];
  data: UltraSrtNcstResponse | null;
}

export function Weather({ currentTemp, hourlyTemps, data }: WeatherProps) {
  const currentHour = new Date().getHours();
  const currentHourStr = String(currentHour).padStart(2, "0");

  const currentHourlyData = hourlyTemps.find((item) => item.hour === currentHourStr);
  const pty = data ? extractWeatherState(data).pty : null;
  const sky = currentHourlyData?.sky ?? null;

  const weatherIcon = getWeatherIcon(pty, sky, currentHour);
  const ncstData = data
    ? extractEnvironmentData(data)
    : { humidity: null, windDirection: "--", windSpeed: null };

  return (
    <div className="flex gap-6 h-full">
      <div className="bg-white rounded-xl w-38 h-full shrink-0 flex items-center justify-center">
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/${weatherIcon}`}
          alt="weather"
          className="w-20 h-20"
        />
      </div>
      <div className="flex flex-col flex-1 justify-between">
        <div className="flex gap-10 items-end">
          <strong className="text-5xl">{currentTemp ?? "--"}°</strong>
          <div className="flex items-center gap-2">
            습도 {ncstData.humidity ?? "--"}%
            {ncstData.windSpeed ? (
              <>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {ncstData.windDirection} {ncstData.windSpeed}m/s
              </>
            ) : null}
          </div>
        </div>
        <ul className="flex gap-3">
          {hourlyTemps.map((item) => (
            <li
              key={item.hour}
              className={`flex flex-col items-center min-w-13 p-2 gap-1 rounded-4xl shadow-[0_0.25rem_0.625rem_0_rgba(0,0,0,0.08)] text-sm ${
                item.isCurrent ? "bg-white/80 text-gray-800" : "bg-white/50 text-neutral-300"
              }`}
            >
              <span>{item.isCurrent ? "now" : `${item.hour}:00`}</span>
              <img
                src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/${item.isCurrent ? weatherIcon : getWeatherIcon(item.pty, item.sky, parseInt(item.hour, 10))}`}
                alt="weather"
                className="w-6 h-6"
              />
              <span className="font-bold">{item.temp}°</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
