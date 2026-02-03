import { Widget, cn, Spinner } from "@pf-dev/ui";
import { WeatherProps } from "./types";
import { useWeather } from "@/hooks";
import { DateTime } from "@/components/DateTime";

const PM_STATUS = {
  좋음: { icon: "pm-good.svg", color: "bg-[#0057FF]" },
  보통: { icon: "pm-moderate.svg", color: "bg-[#2DC000]" },
  나쁨: { icon: "pm-bad.svg", color: "bg-[#FF8901]" },
} as const;

function getPMStatus(status: string) {
  return PM_STATUS[status as keyof typeof PM_STATUS] ?? PM_STATUS["좋음"];
}

function getHumidityStatus(humidity: number): string {
  if (humidity < 40) return "건조";
  if (humidity <= 60) return "쾌적";
  return "습함";
}

function getWindSpeedStatus(windSpeed: number): string {
  if (windSpeed < 4) return "미풍";
  if (windSpeed < 9) return "약풍";
  if (windSpeed < 13) return "중풍";
  return "강풍";
}

function getRainFall(rainfall: number): string {
  if (rainfall === 0) return "없음";
  if (rainfall < 3) return "약한 비";
  if (rainfall < 15) return "보통 비";
  if (rainfall < 30) return "강한 비";
  return "폭우";
}

function getWeatherIcon(): string {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? "sunny.svg" : "cloudy.svg";
}

export function Weather({ id, className }: WeatherProps) {
  const { weather, isLoading, isError, error } = useWeather();

  if (isLoading) {
    return (
      <Widget id={id} className={cn(className, " bg-white/30")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        </div>
      </Widget>
    );
  }

  if (isError) {
    return (
      <Widget id={id} className={cn(className, " bg-white/30")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-500">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-gray-700">
              {error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다."}
            </p>
          </div>
        </div>
      </Widget>
    );
  }

  if (!weather) {
    return (
      <Widget id={id} className={cn(className, " bg-white/30")} contentClassName="h-full">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-gray-400">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500">표시할 날씨 데이터가 없습니다.</p>
          </div>
        </div>
      </Widget>
    );
  }

  const pm10Status = getPMStatus(weather.pm10Status);
  const pm25Status = getPMStatus(weather.pm25Status);

  const weatherData = [
    {
      label: "습도",
      value: `${Math.round(weather.humidity)}%`,
      status: getHumidityStatus(weather.humidity),
    },
    {
      label: "풍속",
      value: `${Math.round(weather.windSpeed)}m/s`,
      status: getWindSpeedStatus(weather.windSpeed),
    },
    {
      label: "풍향",
      value: weather.windDirection,
      status: "-",
    },
    {
      label: "강우",
      value: `${Math.round(weather.rainfall)}mm`,
      status: getRainFall(weather.rainfall),
    },
    {
      label: "소음",
      value: `${Math.round(weather.noise)}dB`,
      status: weather.noise ? "측정됨" : "-",
    },
  ];

  return (
    <Widget id={id} className={cn(className, " bg-white/30")} contentClassName="h-full">
      <div className="flex items-center gap-2 text-lg mb-2 text-[#55596C]">
        <DateTime format="YYYY년 MM월 DD일(ddd)" className="font-bold text-lg" />
        <DateTime format="HH:mm:ss" className="text-lg" />
      </div>
      <div className="flex flex-col justify-start gap-3 h-full overflow-hidden">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-md p-2 h-full flex flex-col justify-between items-center">
            <img
              src={`${import.meta.env.BASE_URL}assets/icons/${getWeatherIcon()}`}
              alt="날씨"
              className="w-10 h-10"
            />
            <span className="text-2xl">{Math.round(weather.temperature)}°C</span>
          </div>
          <div className="bg-white rounded-md p-2 h-full flex flex-col justify-between items-center">
            <div className="flex items-end">
              <img
                src={`${import.meta.env.BASE_URL}assets/icons/${pm10Status.icon}`}
                alt={weather.pm10Status}
                className="w-10 h-10"
              />
              <span
                className={cn(
                  "text-xs rounded-sm py-1 px-1 whitespace-nowrap text-white font-bold",
                  pm10Status.color
                )}
              >
                {weather.pm10Status}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs tracking-tight whitespace-nowrap">미세먼지(PM10)</span>
              <span className="text-sm font-bold">{Math.round(weather.pm10)} ㎍/㎥</span>
            </div>
          </div>
          <div className="bg-white rounded-md p-2 h-full flex flex-col justify-between items-center">
            <div className="flex items-end">
              <img
                src={`${import.meta.env.BASE_URL}assets/icons/${pm25Status.icon}`}
                alt={weather.pm25Status}
                className="w-10 h-10"
              />
              <span
                className={cn(
                  "text-xs rounded-sm py-1 px-1 whitespace-nowrap text-white font-bold",
                  pm25Status.color
                )}
              >
                {weather.pm25Status}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs tracking-tight whitespace-nowrap">초미세먼지(PM2.5)</span>
              <span className="text-sm font-bold">{Math.round(weather.pm25)} ㎍/㎥</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {weatherData.map((data) => (
            <div key={data.label} className="flex text-sm text-center">
              <span className="bg-[#9499B1] text-white font-bold rounded-sm block flex-1 p-1">
                {data.label}
              </span>
              <div className="flex flex-2 items-center">
                <span className="flex-1">{data.value}</span>
                <span className="w-0.5 bg-[#BBBFCF] h-4"></span>
                <span className="flex-1">{data.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Widget>
  );
}
