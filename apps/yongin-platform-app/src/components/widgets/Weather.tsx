import { Widget, cn, Spinner } from "@pf-dev/ui";
import { WeatherProps } from "./types";
import { useWeather } from "@/hooks";
import {
  getPMStatus,
  getHumidityStatus,
  getWindSpeedStatus,
  getRainFall,
  getNoiseStatus,
  getWeatherIcon,
} from "@/utils/weather";
import humIcon from "@/assets/icons/hum.svg";
import windIcon from "@/assets/icons/wind.svg";
import directionIcon from "@/assets/icons/direction.svg";
import rainIcon from "@/assets/icons/rain.svg";
import noiseIcon from "@/assets/icons/noise.svg";

export function Weather({ id, className }: WeatherProps) {
  const { weather, openWeather, isLoading, isError, error } = useWeather();

  if (isLoading) {
    return (
      <Widget id={id} className={cn(className, "bg-white/30")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Widget>
    );
  }

  if (isError || !weather) {
    return (
      <Widget id={id} className={cn(className, "bg-white/30")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-gray-500">
            {isError
              ? error instanceof Error
                ? error.message
                : "데이터를 불러오는데 실패했습니다."
              : "표시할 날씨 데이터가 없습니다."}
          </p>
        </div>
      </Widget>
    );
  }

  const pm10Status = getPMStatus(weather.pm10Status);
  const pm25Status = getPMStatus(weather.pm25Status);

  const weatherData = [
    {
      icon: humIcon,
      label: "습도",
      value: `${Math.round(weather.humidity)}%`,
      status: getHumidityStatus(weather.humidity),
    },
    {
      icon: windIcon,
      label: "풍속",
      value: `${Math.round(weather.windSpeed)}m/s`,
      status: getWindSpeedStatus(weather.windSpeed),
    },
    {
      icon: directionIcon,
      label: "풍향",
      value: weather.windDirection,
      status: "-",
    },
    {
      icon: rainIcon,
      label: "강우",
      value: `${Math.round(weather.rainfall)}mm`,
      status: getRainFall(weather.rainfall),
    },
    {
      icon: noiseIcon,
      label: "소음",
      value: `${Math.round(weather.noise)}dB`,
      status: getNoiseStatus(weather.noise),
    },
  ];

  return (
    <Widget id={id} className={cn(className, "bg-white")} contentClassName="h-full p-3">
      <div className="flex flex-col h-full">
        {/* 상단: 날씨 아이콘 + 온도 | PM2.5 | PM10 */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          {/* 날씨 아이콘 + 온도 */}
          <div className="flex flex-col items-center justify-end">
            {openWeather ? (
              <img
                src={getWeatherIcon(openWeather.id)}
                alt={openWeather.description}
                className="w-14 h-14"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
            )}
            <span className="text-lg font-bold">
              {openWeather
                ? `${openWeather.temp.toFixed(1)}°C`
                : `${Math.round(weather.temperature)}°C`}
            </span>
          </div>

          {/* PM2.5 */}
          <div className="flex flex-col items-center justify-end gap-0.5">
            <span
              className={cn(
                "rounded-full w-14 h-14 text-white font-bold flex flex-col text-sm inline-flex items-center justify-center",
                pm25Status.color
              )}
            >
              {Math.round(weather.pm25)}
              <span className="text-xs font-normal">µg/m³</span>
            </span>
            <span className="text-xs text-gray-600 leading-tight text-center">초미세먼지</span>
            <span className="text-xs text-gray-500 leading-tight">(PM2.5)</span>
          </div>

          {/* PM10 */}
          <div className="flex flex-col items-center justify-end gap-0.5">
            <span
              className={cn(
                "rounded-full w-14 h-14 text-white font-bold flex flex-col text-sm inline-flex items-center justify-center",
                pm10Status.color
              )}
            >
              {Math.round(weather.pm10)}
              <span className="text-xs font-normal">µg/m³</span>
            </span>
            <span className="text-xs text-gray-600 leading-tight text-center">미세먼지</span>
            <span className="text-xs text-gray-500 leading-tight">(PM10)</span>
          </div>
        </div>

        {/* 하단: 데이터 행 */}
        <div className="flex flex-1 flex-col gap-1 min-h-0 py-2">
          {weatherData.map((data) => (
            <div key={data.label} className="flex items-stretch text-xs px-2">
              <span className="flex items-center justify-center gap-1 bg-[#DAE4F4] rounded-sm p-2 min-w-[4.5rem]">
                <img src={data.icon} alt={data.label} className="w-3.5 h-3.5" />
                {data.label}
              </span>
              <div className="flex flex-1 items-center min-w-0">
                <span className="flex-1 text-center">{data.value}</span>
                <span className="w-px bg-[#BBBFCF] h-3.5" />
                <span className="flex-1 text-center">{data.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  );
}
