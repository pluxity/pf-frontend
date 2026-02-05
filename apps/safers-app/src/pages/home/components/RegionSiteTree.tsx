import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@pf-dev/ui";
import type { Region, Site } from "@/services";

interface RegionSiteTreeProps {
  regions: Region[];
  onSiteSelect?: (site: Site) => void;
  selectedSiteId?: string;
}

export function RegionSiteTree({ regions, onSiteSelect, selectedSiteId }: RegionSiteTreeProps) {
  const firstRegionId = regions[0]?.id;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={firstRegionId}
      className="h-full overflow-y-none p-2"
    >
      {regions.map((region) => (
        <AccordionItem key={region.id} value={region.id} className="mb-1.5 border-b-0 last:mb-0">
          <AccordionTrigger className="rounded-lg px-4 py-2 text-sm font-medium hover:no-underline data-[state=closed]:bg-brand/10 data-[state=closed]:text-neutral-700 data-[state=closed]:hover:bg-brand/20 data-[state=open]:rounded-b-none data-[state=open]:bg-brand data-[state=open]:text-white data-[state=open]:hover:bg-brand">
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
                    selectedSiteId === site.id ? "bg-brand/5 text-brand" : "text-neutral-600"
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
