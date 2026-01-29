import { lazy, Suspense, useState } from "react";
import { Tabs, TabsContent } from "@pf-dev/ui";
import { cn } from "@pf-dev/ui/utils";

const BirdsEyeView = lazy(() =>
  import("./views/BirdsEyeView").then((m) => ({ default: m.BirdsEyeView }))
);
const BIMView = lazy(() => import("./views/BIMView").then((m) => ({ default: m.BIMView })));
const GPSMapView = lazy(() =>
  import("./views/GPSMapView").then((m) => ({ default: m.GPSMapView }))
);
const CCTVView = lazy(() => import("./views/CCTVView").then((m) => ({ default: m.CCTVView })));

type TabValue = "birds-eye" | "bim" | "gps" | "management" | "cctv";

interface Tab {
  value: TabValue;
  label: string;
}

const TABS: Tab[] = [
  { value: "birds-eye", label: "조감도" },
  { value: "bim", label: "BIM" },
  { value: "gps", label: "GPS" },
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

export function MainContainer({ className, defaultTab = "birds-eye" }: MainContainerProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as TabValue)}
      className={cn("relative h-full", className)}
    >
      <div className="h-full overflow-hidden rounded-lg">
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
          <div className="flex items-center justify-center h-full text-gray-400">
            주요 관리 사항 (준비 중)
          </div>
        </TabsContent>

        <TabsContent value="cctv" className="h-full mt-0">
          <Suspense fallback={<LoadingFallback />}>
            <CCTVView />
          </Suspense>
        </TabsContent>
      </div>

      <div className="absolute bottom-0 right-4 flex" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-5 py-2 text-sm font-medium transition-all rounded-t-lg shadow-[0.25rem_0_0.5rem_0_rgba(0,0,0,0.4)]",
              activeTab === tab.value
                ? "bg-brand text-white z-10 scale-110 origin-bottom"
                : "bg-surface-dark text-gray-300 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </Tabs>
  );
}
