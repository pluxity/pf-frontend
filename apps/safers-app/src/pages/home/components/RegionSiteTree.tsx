import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@pf-dev/ui";
import type { Region, Site } from "@/services";

interface RegionSiteTreeProps {
  regions: Region[];
  onSiteSelect?: (site: Site) => void;
  selectedSiteId?: string;
}

export function RegionSiteTree({ regions, onSiteSelect, selectedSiteId }: RegionSiteTreeProps) {
  const firstRegionId = regions[0]?.id ?? "";

  // 아코디언 열림 상태 (controlled mode)
  const [openRegionId, setOpenRegionId] = useState<string>(firstRegionId);

  // 이전 selectedSiteId 추적 (렌더링 중 상태 조정 패턴)
  const [prevSelectedSiteId, setPrevSelectedSiteId] = useState<string | undefined>(selectedSiteId);

  // selectedSiteId가 변경되면 해당 지역 아코디언 열기 (렌더링 중 처리)
  if (selectedSiteId !== prevSelectedSiteId) {
    setPrevSelectedSiteId(selectedSiteId);
    if (selectedSiteId) {
      const regionWithSite = regions.find((region) =>
        region.sites.some((site) => site.id === selectedSiteId)
      );
      if (regionWithSite && regionWithSite.id !== openRegionId) {
        setOpenRegionId(regionWithSite.id);
      }
    }
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openRegionId}
      onValueChange={setOpenRegionId}
      className="h-full overflow-y-none p-2"
    >
      {regions.map((region) => (
        <AccordionItem key={region.id} value={region.id} className="mb-1.5 border-b-0 last:mb-0">
          <AccordionTrigger className="rounded-lg px-4 py-2 text-sm font-medium hover:no-underline data-[state=closed]:bg-primary-500/10 data-[state=closed]:text-neutral-700 data-[state=closed]:hover:bg-primary-500/20 data-[state=open]:rounded-b-none data-[state=open]:bg-primary-500 data-[state=open]:text-white data-[state=open]:hover:bg-primary-500">
            <span>
              {region.name}
              <span className="ml-1 text-xs font-normal opacity-70">({region.sites.length})</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="rounded-b-lg bg-white pb-0">
            <div className="max-h-42 overflow-y-auto ">
              {region.sites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => onSiteSelect?.(site)}
                  className={`flex w-full items-center px-4 py-1.5 pl-6 text-left text-sm hover:bg-neutral-100 ${
                    selectedSiteId === site.id
                      ? "bg-primary-500/5 text-primary-500"
                      : "text-neutral-600"
                  }`}
                >
                  <span className="truncate">{site.name}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
