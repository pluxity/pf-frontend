import { useEffect, useState } from "react";
import { useWeather } from "../../../hooks/useWeather";
import { Weather } from "./Weather";
import { EnvironmentStatus } from "./EnvironmentStatus";
import { generateEnvironments } from "../../../services/mocks/environments.mock";
import { SafetyStatus } from "./SafetyStatus";
import { CCTVViewer } from "./CCTVViewer";
import { sitesService, type Site } from "@/services";
import { useSitesStore, selectSelectedSiteId } from "@/stores";

export function RightPanel() {
  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const [displayData, setDisplayData] = useState<Site | null>(null);
  const [progressDays, setProgressDays] = useState<number | null>(null);

  const { currentWeather, hourlyWeather } = useWeather({ siteId: selectedSiteId });

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        if (selectedSiteId != null) {
          const res = await sitesService.getSite(selectedSiteId);
          setDisplayData(res.data);
          const start = new Date(res.data.constructionStartDate ?? "").getTime();
          setProgressDays(
            Number.isNaN(start)
              ? null
              : Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)))
          );
        }
      } catch {
        // 사이트 데이터 로드 실패 — 이전 데이터 유지
      }
    };
    fetchSiteData();
  }, [selectedSiteId]);

  return (
    <aside className="z-10 flex h-full w-[50rem] flex-shrink-0 flex-col gap-4 p-4">
      {/* 현장 기본 정보 */}
      <div className="flex items-center gap-2 rounded-3xl bg-brand p-4 h-[3rem] text-white text-lg">
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/map-pin.svg`}
          alt="location"
          className="w-6 h-6"
        />
        <span className="font-semibold">{displayData?.name || "--"}</span>
        <span className="h-4 bg-white w-0.5"></span>
        <span>진행 {progressDays ?? "--"} Days</span>
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/external-link.svg`}
          alt="external link"
          className="w-4 h-4"
        />
      </div>
      {/* 현장 정보 + 날씨 */}
      <div className="rounded-lg border border-white/80 p-4 h-[12rem] shadow-[0_0.25rem_0.625rem_0_rgba(0,0,0,0.08)]">
        <Weather currentWeather={currentWeather} hourlyWeather={hourlyWeather} />
      </div>

      {/* 환경 데이터 */}
      <div className="rounded-lg bg-white h-[15rem] p-4 shadow-[0_0_0.0625rem_#0000000A,0_0.125rem_0.375rem_#0000000A]">
        <EnvironmentStatus data={generateEnvironments(selectedSiteId ?? 17)} />
      </div>

      {/* 안전 모니터링 */}
      <div className="rounded-lg bg-white h-[19rem] p-4 shadow-[0_0_0.0625rem_#0000000A,0_0.125rem_0.375rem_#0000000A]">
        <SafetyStatus siteId={selectedSiteId} />
      </div>

      {/* CCTV — grid row를 명시적으로 1fr 지정하여 flex-1 높이를 채움 */}
      <div className="grid grid-cols-3 gap-4 flex-1 [grid-template-rows:1fr]">
        <CCTVViewer siteId={selectedSiteId} />
      </div>
    </aside>
  );
}
