import { cn, Spinner } from "@pf-dev/ui";
import { useWeather } from "@/hooks";

function formatDateTime(dateString: string): { date: string; time: string } {
  const [date = "", time = ""] = dateString.split(" ");
  return { date, time };
}

const PM_STATUS = {
  좋음: { icon: "pm-good.svg", color: "bg-[#0057FF]" },
  보통: { icon: "pm-moderate.svg", color: "bg-[#2DC000]" },
  나쁨: { icon: "pm-bad.svg", color: "bg-[#FF8901]" },
} as const;

function getPMStatus(status: string) {
  return PM_STATUS[status as keyof typeof PM_STATUS] ?? PM_STATUS["좋음"];
}

function getHumidityStatus(humidity: number): string {
  if (humidity === 0) return "쾌적";
  if (humidity < 40) return "건조";
  if (humidity <= 60) return "쾌적";
  return "습함";
}

function getWindSpeedStatus(windSpeed: number): string {
  if (windSpeed === 0) return "미풍";
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

export function WeatherView() {
  const { weather, isLoading, isError, error } = useWeather();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
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
    );
  }

  if (!weather) {
    return (
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
    );
  }

  const { date, time } = formatDateTime(weather.measuredAt);
  const pm10Status = getPMStatus(weather.pm10Status);
  const pm25Status = getPMStatus(weather.pm25Status);

  return (
    <>
      <div className="flex items-center gap-2 text-xl mb-5 4k:text-4xl">
        <span className="text-[#333333] font-bold">{date}</span>
        <span className="text-[#55596C]">{time}</span>
      </div>
      <div className="flex flex-col justify-start gap-5 h-full 4k:gap-10">
        <div className="grid grid-cols-3 gap-2 min-h-32 4k:gap-6 4k:min-h-46">
          <div className="bg-white rounded-md p-2 h-full flex flex-col justify-between items-center">
            <img
              src={`${import.meta.env.BASE_URL}assets/icons/${getWeatherIcon()}`}
              alt="날씨"
              className="w-15 h-15 4k:w-25 4k:h-25"
            />
            <span className="text-2xl 4k:text-4xl">{Math.round(weather.temperature)}°C</span>
          </div>
          <div className="bg-white rounded-md p-2 h-full flex flex-col justify-between items-center">
            <div className="flex items-end">
              <img
                src={`${import.meta.env.BASE_URL}assets/icons/${pm10Status.icon}`}
                alt={weather.pm10Status}
                className="w-15 h-15 4k:w-25 4k:h-25"
              />
              <span
                className={cn(
                  "text-xs rounded-sm py-1 px-2 whitespace-nowrap text-white font-bold 4k:text-lg",
                  pm10Status.color
                )}
              >
                {weather.pm10Status}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs tracking-tight whitespace-nowrap 4k:text-lg">
                미세먼지(PM10)
              </span>
              <span className="text-sm font-bold 4k:text-xl">{Math.round(weather.pm10)} ㎍/㎥</span>
            </div>
          </div>
          <div className="bg-white rounded-md p-2 h-full flex flex-col justify-between items-center">
            <div className="flex items-end">
              <img
                src={`${import.meta.env.BASE_URL}assets/icons/${pm25Status.icon}`}
                alt={weather.pm25Status}
                className="w-15 h-15 4k:w-25 4k:h-25"
              />
              <span
                className={cn(
                  "text-xs rounded-sm py-1 px-2 whitespace-nowrap text-white font-bold 4k:text-lg",
                  pm25Status.color
                )}
              >
                {weather.pm25Status}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs tracking-tight whitespace-nowrap 4k:text-lg">
                초미세먼지(PM2.5)
              </span>
              <span className="text-sm font-bold 4k:text-xl">{Math.round(weather.pm25)} ㎍/㎥</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 4k:gap-4">
          <div className="flex text-sm text-center 4k:text-xl">
            <span className="bg-[#9499B1] text-white font-bold rounded-sm block flex-1 p-1 4k:p-2">
              습도
            </span>
            <div className="flex flex-2 items-center">
              <span className="flex-1">{Math.round(weather.humidity)}%</span>
              <span className="w-0.5 bg-[#BBBFCF] h-4 4k:w-1 4k:h-8"></span>
              <span className="flex-1">{getHumidityStatus(weather.humidity)}</span>
            </div>
          </div>
          <div className="flex text-sm text-center 4k:text-xl">
            <span className="bg-[#9499B1] text-white font-bold rounded-sm block flex-1 p-1 4k:p-2">
              풍속
            </span>
            <div className="flex flex-2 items-center">
              <span className="flex-1">{Math.round(weather.windSpeed)}m/s</span>
              <span className="w-0.5 bg-[#BBBFCF] h-4 4k:w-1 4k:h-8"></span>
              <span className="flex-1">{getWindSpeedStatus(weather.windSpeed)}</span>
            </div>
          </div>
          <div className="flex text-sm text-center 4k:text-xl">
            <span className="bg-[#9499B1] text-white font-bold rounded-sm block flex-1 p-1 4k:p-2">
              풍향
            </span>
            <div className="flex flex-2 items-center">
              <span className="flex-1">{weather.windDirection}</span>
              <span className="w-0.5 bg-[#BBBFCF] h-4 4k:w-1 4k:h-8"></span>
              <span className="flex-1">-</span>
            </div>
          </div>
          <div className="flex text-sm text-center 4k:text-xl">
            <span className="bg-[#9499B1] text-white font-bold rounded-sm block flex-1 p-1 4k:p-2">
              강우
            </span>
            <div className="flex flex-2 items-center">
              <span className="flex-1">{Math.round(weather.rainfall)}mm</span>
              <span className="w-0.5 bg-[#BBBFCF] h-4 4k:w-1 4k:h-8"></span>
              <span className="flex-1">{getRainFall(weather.rainfall)}</span>
            </div>
          </div>
          <div className="flex text-sm text-center 4k:text-xl">
            <span className="bg-[#9499B1] text-white font-bold rounded-sm block flex-1 p-1 4k:p-2">
              소음
            </span>
            <div className="flex flex-2 items-center">
              <span className="flex-1">{Math.round(weather.noise)}dB</span>
              <span className="w-0.5 bg-[#BBBFCF] h-4 4k:w-1 4k:h-8"></span>
              <span className="flex-1">{weather.noise ? "측정됨" : "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
