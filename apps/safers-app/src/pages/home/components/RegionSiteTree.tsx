import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@pf-dev/ui";
import type { RegionGroup, Site } from "@/services";

interface RegionSiteTreeProps {
  regionGroups: RegionGroup[];
  onSiteSelect?: (site: Site) => void;
  selectedSiteId?: number;
}

/** 지역별 사이트 목록을 아코디언 형태로 표시하는 컴포넌트 */
export function RegionSiteTree({
  regionGroups,
  onSiteSelect,
  selectedSiteId,
}: RegionSiteTreeProps) {
  const firstRegion = regionGroups[0]?.region ?? "";
  const [openRegionId, setOpenRegionId] = useState<string>(firstRegion);
  const [prevSelectedSiteId, setPrevSelectedSiteId] = useState<number | undefined>(selectedSiteId);

  if (selectedSiteId !== prevSelectedSiteId) {
    setPrevSelectedSiteId(selectedSiteId);
    if (selectedSiteId != null) {
      const regionWithSite = regionGroups.find((group) =>
        group.sites.some((site) => site.id === selectedSiteId)
      );
      if (regionWithSite && regionWithSite.region !== openRegionId) {
        setOpenRegionId(regionWithSite.region);
      }
    }
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openRegionId}
      onValueChange={setOpenRegionId}
      className="h-full overflow-y-auto p-2"
    >
      {regionGroups.map((group) => (
        <AccordionItem
          key={group.region}
          value={group.region}
          className="mb-1.5 border-b-0 last:mb-0"
        >
          <AccordionTrigger className="rounded-lg px-4 py-2 text-sm font-medium hover:no-underline data-[state=closed]:bg-primary-500/10 data-[state=closed]:text-neutral-700 data-[state=closed]:hover:bg-primary-500/20 data-[state=open]:rounded-b-none data-[state=open]:bg-primary-500 data-[state=open]:text-white data-[state=open]:hover:bg-primary-500">
            <span>
              {group.displayName}
              <span className="ml-1 text-xs font-normal opacity-70">({group.sites.length})</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="rounded-b-lg bg-white pb-0">
            <div className="max-h-42 overflow-y-auto ">
              {group.sites.map((site) => (
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
