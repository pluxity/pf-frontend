import { useWeather } from "../../../hooks/useWeather";
import {
  extractWeatherState,
  getWeatherIcon,
  extractEnvironmentData,
} from "../../../utils/weather";

export function RightPanel() {
  const nx = Number(import.meta.env.VITE_SITE_NX);
  const ny = Number(import.meta.env.VITE_SITE_NY);

  const { currentTemp, hourlyTemps, data } = useWeather({ nx, ny });

  const weatherState = data ? extractWeatherState(data) : { pty: null, sky: null };
  const currentHour = new Date().getHours();
  const weatherIcon = getWeatherIcon(weatherState.pty, weatherState.sky, currentHour);
  const ncstData = data
    ? extractEnvironmentData(data)
    : { humidity: null, windDirection: "--", windSpeed: null };

  return (
    <aside className="z-10 flex h-full w-[50rem] flex-shrink-0 flex-col gap-4 p-4">
      {/* 현장 기본 정보 */}
      <div className="flex items-center gap-2 rounded-3xl bg-[#FF7500] p-4 h-[3rem] text-white text-lg">
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/map-pin.svg`}
          alt="location"
          className="w-6 h-6"
        />
        <span className="font-semibold">{import.meta.env.VITE_SITE_NAME}</span>
        <span className="h-4 bg-[#FFE5B5] w-0.5"></span>
        <span>진행 458 Days</span>
        {/* 링크 동작 나중에 확인! 링크 가능 시 태그 변경 */}
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/external-link.svg`}
          alt="external link"
          className="w-4 h-4"
        />
      </div>

      {/* 현장 정보 + 날씨 */}
      <div className="rounded-lg border border-white/80 p-4 h-[12rem] shadow-[0_4px_10px_0_rgba(0,0,0,0.08)]">
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
                    <span className="w-1 h-1 bg-[#999999] rounded-full"></span>
                    {ncstData.windDirection} {ncstData.windSpeed}m/s
                  </>
                ) : null}
              </div>
            </div>
            <ul className="flex gap-3">
              {hourlyTemps.map((item) => (
                <li
                  key={item.hour}
                  className={`flex flex-col items-center min-w-13 p-2 gap-1 rounded-4xl shadow-[0_4px_10px_0_rgba(0,0,0,0.08)] text-sm ${
                    item.isCurrent ? "bg-white/80 text-[#333333]" : "bg-white/50 text-[#9499B1]"
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
      </div>

      {/* 환경 데이터 */}
      <div className="rounded-lg border border-neutral-300 bg-white/50 p-4">
        <div className="h-[6rem]">{/* 환경 데이터 영역 */}</div>
      </div>

      {/* 안전 모니터링 */}
      <div className="rounded-lg border border-neutral-300 bg-white/50 p-4">
        <div className="h-[6rem]">{/* 안전 모니터링 영역 */}</div>
      </div>

      {/* CCTV */}
      <div className="flex-1 rounded-lg border border-neutral-300 bg-white/50 p-4">
        {/* CCTV 영역 */}
      </div>
    </aside>
  );
}
