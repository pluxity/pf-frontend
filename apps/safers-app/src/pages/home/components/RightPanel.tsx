import { useEffect, useMemo, useState } from "react";
import { useWeather } from "../../../hooks/useWeather";
import { gpsToGrid } from "../../../utils/kma";
import { Spinner } from "@pf-dev/ui";
import { Weather } from "./Weather";
import { EnvironmentStatus } from "./EnvironmentStatus";
import { mockEnvironments } from "../../../services/mocks/environments.mock";
import { SafetyStatus } from "./SafetyStatus";
import { CCTVViewer } from "./CCTVViewer";
import { sitesService, type Site } from "@/services";
import { useSitesStore, selectSelectedSiteId } from "@/stores";

export function RightPanel() {
  const selectedSiteId = useSitesStore(selectSelectedSiteId);
  const [selectedSiteData, setSelectedSiteData] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { nx, ny } = useMemo(() => {
    if (selectedSiteData[0]?.latitude && selectedSiteData[0]?.longitude) {
      return gpsToGrid(selectedSiteData[0].latitude, selectedSiteData[0].longitude);
    }
    return { nx: 0, ny: 0 };
  }, [selectedSiteData]);

  const { currentTemp, hourlyTemps, data } = useWeather({ nx, ny });

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        if (selectedSiteId) {
          const res = await sitesService.getSite(selectedSiteId);
          setSelectedSiteData([res.data]);
        } else {
          setSelectedSiteData([]);
        }
      } catch (error) {
        console.error("Failed to fetch site data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSiteData();
  }, [selectedSiteId]);

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
      <div className="flex items-center gap-2 rounded-3xl bg-brand p-4 h-[3rem] text-white text-lg">
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/map-pin.svg`}
          alt="location"
          className="w-6 h-6"
        />
        <span className="font-semibold">{selectedSiteData[0]?.name || "--"}</span>
        <span className="h-4 bg-white w-0.5"></span>
        <span>진행 458 Days</span>
        {/* 링크 동작 나중에 확인! 링크 가능 시 태그 변경 */}
        <img
          src={`${import.meta.env.VITE_CONTEXT_PATH}/assets/icons/external-link.svg`}
          alt="external link"
          className="w-4 h-4"
        />
      </div>
      {/* 현장 정보 + 날씨 */}
      <div className="rounded-lg border border-white/80 p-4 h-[12rem] shadow-[0_0.25rem_0.625rem_0_rgba(0,0,0,0.08)]">
        <Weather currentTemp={currentTemp} hourlyTemps={hourlyTemps} data={data} />
      </div>

      {/* 환경 데이터 */}
      <div className="rounded-lg bg-white h-[15rem] p-4 shadow-[0_0_0.0625rem_#0000000A,0_0.125rem_0.375rem_#0000000A]">
        <EnvironmentStatus data={mockEnvironments} />
      </div>

      {/* 안전 모니터링 */}
      <div className="rounded-lg bg-white h-[19rem] p-4 shadow-[0_0_0.0625rem_#0000000A,0_0.125rem_0.375rem_#0000000A]">
        <SafetyStatus />
      </div>

      {/* CCTV */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        <CCTVViewer />
      </div>
    </aside>
  );
}
