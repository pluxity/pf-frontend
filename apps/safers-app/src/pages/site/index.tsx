import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "@pf-dev/ui";
import { SiteDetailLayout } from "./SiteDetailLayout";
import {
  SiteHeader,
  ViewerPlaceholder,
  EventPanel,
  WeatherPanel,
  SafetyScorePanel,
  WorkerInfoPanel,
} from "./components";
import { sitesService, siteDetailService, type Site, type SiteDetail } from "@/services";

export function SitePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [_detail, setDetail] = useState<SiteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    async function fetchData() {
      try {
        const [siteRes, detailRes] = await Promise.all([
          sitesService.getSite(id!),
          siteDetailService.getSiteDetail(id!),
        ]);
        setSite(siteRes.data);
        setDetail(detailRes.data);
      } catch (error) {
        console.error("Failed to fetch site detail:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  if (isLoading || !site || !_detail) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <SiteDetailLayout
      header={<SiteHeader siteName={site.name} />}
      leftPanel={<EventPanel />}
      rightTopPanel={<WeatherPanel />}
      rightMiddlePanel={<SafetyScorePanel data={_detail.safetyScore} />}
      rightBottomPanel={
        <WorkerInfoPanel personnel={_detail.personnel} totalPersonnel={_detail.totalPersonnel} />
      }
    >
      <ViewerPlaceholder />
    </SiteDetailLayout>
  );
}
