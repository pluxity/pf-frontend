import { lazy, Suspense, useState, useEffect, startTransition } from "react";
import { Tabs, TabsContent } from "@pf-dev/ui";
import { cn } from "@pf-dev/ui/utils";
import { useKeyManagementStore } from "@/stores/keyManagement.store";
import { useDashboardStore } from "@/stores/dashboard.store";
import { useMainContainerStore } from "@/stores/mainContainer.store";

const BirdsEyeView = lazy(() =>
  import("./views/BirdsEyeView").then((m) => ({ default: m.BirdsEyeView }))
);
const BIMView = lazy(() => import("./views/BIMView").then((m) => ({ default: m.BIMView })));
const GPSMapView = lazy(() =>
  import("./views/GPSMapView").then((m) => ({ default: m.GPSMapView }))
);
const CCTVView = lazy(() => import("./views/CCTVView").then((m) => ({ default: m.CCTVView })));
const KeyManagementView = lazy(() =>
  import("./views/KeyManagementView").then((m) => ({ default: m.KeyManagementView }))
);

type TabValue = "birds-eye" | "bim" | "gps" | "management" | "cctv";

interface Tab {
  value: TabValue;
  label: string;
}

const TABS: Tab[] = [
  { value: "birds-eye", label: "조감도" },
  { value: "bim", label: "BIM" },
  { value: "gps", label: "위치정보" },
  { value: "management", label: "주요 관리 사항" },
  { value: "cctv", label: "CCTV" },
];

interface MainContainerProps {
  className?: string;
  defaultTab?: TabValue;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
    </div>
  );
}

// 탭 → 대시보드 사이드 위젯 페이지 매핑
const TAB_PAGE_MAP: Partial<Record<TabValue, number>> = {
  management: 0,
  cctv: 1,
};

export function MainContainer({ className, defaultTab = "birds-eye" }: MainContainerProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  const { shouldShowView, resetShowView } = useKeyManagementStore();
  const { pause, setPage } = useDashboardStore();
  const requestedTab = useMainContainerStore((s) => s.requestedTab);
  const clearRequest = useMainContainerStore((s) => s.clearRequest);

  const switchTab = (tab: TabValue) => {
    setActiveTab(tab);
    const targetPage = TAB_PAGE_MAP[tab];
    if (targetPage !== undefined) {
      setPage(targetPage);
      pause();
    }
  };

  useEffect(() => {
    if (shouldShowView) {
      startTransition(() => {
        switchTab("management");
        resetShowView();
      });
    }
  }, [shouldShowView, resetShowView]);

  useEffect(() => {
    if (requestedTab) {
      startTransition(() => {
        switchTab(requestedTab as TabValue);
        clearRequest();
      });
    }
  }, [requestedTab, clearRequest]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => switchTab(v as TabValue)}
      className={cn("flex flex-col h-full", className)}
    >
      {/* 콘텐츠 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-[0.9375rem] rounded-bl-none border border-[#9499B1]">
        <TabsContent value="birds-eye" className="h-full mt-0">
          <Suspense fallback={<LoadingFallback />}>
            <BirdsEyeView />
          </Suspense>
        </TabsContent>

        <TabsContent value="bim" className="h-full mt-0">
          <Suspense fallback={<LoadingFallback />}>
            <BIMView />
          </Suspense>
        </TabsContent>

        <TabsContent value="gps" className="h-full mt-0">
          <Suspense fallback={<LoadingFallback />}>
            <GPSMapView />
          </Suspense>
        </TabsContent>

        <TabsContent value="management" className="h-full mt-0">
          <Suspense fallback={<LoadingFallback />}>
            <KeyManagementView />
          </Suspense>
        </TabsContent>

        <TabsContent value="cctv" className="h-full mt-0">
          <Suspense fallback={<LoadingFallback />}>
            <CCTVView />
          </Suspense>
        </TabsContent>
      </div>

      {/* 탭 트리거 */}
      <div className="flex items-start gap-px shrink-0 h-[2.5rem]" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => switchTab(tab.value)}
            className={cn(
              "px-[3.125rem] transition-all rounded-b-lg flex items-center justify-center",
              activeTab === tab.value
                ? "bg-brand text-white z-10 h-[2.5rem] text-base font-bold min-w-[5.625rem]"
                : "bg-[#BBBFCF] text-[#55596C] hover:text-white h-[1.875rem] text-sm font-normal min-w-[5rem]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </Tabs>
  );
}
