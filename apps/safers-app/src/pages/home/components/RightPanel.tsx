import { useWeather } from "../../../hooks/useWeather";
import { Spinner } from "@pf-dev/ui";
import { Weather } from "./Weather";
import { EnvironmentMonitor } from "./EnvironmentMonitor";
import { mockEnvironments } from "../../../services/mocks/environments.mock";
import { SafetyMonitor } from "./SafetyMonitor";

export function RightPanel() {
  const nx = Number(import.meta.env.VITE_SITE_NX);
  const ny = Number(import.meta.env.VITE_SITE_NY);

  const { currentTemp, hourlyTemps, data, isLoading } = useWeather({ nx, ny });

  if (isLoading) {
    return (
      <aside className="z-10 flex h-full w-[50rem] flex-shrink-0 items-center justify-center">
        <Spinner size="lg" />
      </aside>
    );
  }

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
        <Weather currentTemp={currentTemp} hourlyTemps={hourlyTemps} data={data} />
      </div>

      {/* 환경 데이터 */}
      <div className="rounded-lg bg-white h-[15rem] p-4 shadow-[0_0_1px_#0000000A,0_2px_6px_#0000000A]">
        <EnvironmentMonitor data={mockEnvironments} />
      </div>

      {/* 안전 모니터링 */}
      <div className="rounded-lg bg-white h-[19rem] p-4 shadow-[0_0_1px_#0000000A,0_2px_6px_#0000000A]">
        <SafetyMonitor />
      </div>

      {/* CCTV */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white border border-2 border-gray-200">{/* CCTV 1 */}</div>
        <div className="rounded-lg bg-white border border-2 border-gray-200">{/* CCTV 2 */}</div>
        <div className="rounded-lg bg-white border border-2 border-gray-200">{/* CCTV 3 */}</div>
      </div>
    </aside>
  );
}
