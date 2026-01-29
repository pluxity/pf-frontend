import { lazy, Suspense, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pf-dev/ui";
import { cn } from "@pf-dev/ui/utils";

const BirdsEyeView = lazy(() =>
  import("./views/BirdsEyeView").then((m) => ({ default: m.BirdsEyeView }))
);
const BIMView = lazy(() => import("./views/BIMView").then((m) => ({ default: m.BIMView })));
const GPSMapView = lazy(() =>
  import("./views/GPSMapView").then((m) => ({ default: m.GPSMapView }))
);
const CCTVView = lazy(() => import("./views/CCTVView").then((m) => ({ default: m.CCTVView })));

type TabValue = "birds-eye" | "bim" | "gps" | "cctv";

interface Tab {
  value: TabValue;
  label: string;
}

const TABS: Tab[] = [
  { value: "birds-eye", label: "조감도" },
  { value: "bim", label: "BIM" },
  { value: "gps", label: "GPS" },
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
      className={cn("flex flex-col h-full", className)}
    >
      <div className="flex-1 overflow-hidden">
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

        <TabsContent value="cctv" className="h-full mt-0">
          <Suspense fallback={<LoadingFallback />}>
            <CCTVView />
          </Suspense>
        </TabsContent>
      </div>

      <TabsList className="justify-center border-t border-gray-200 bg-white h-12 shrink-0">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="px-6">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
