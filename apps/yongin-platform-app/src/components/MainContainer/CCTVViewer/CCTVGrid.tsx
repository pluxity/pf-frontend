import { GridLayout, Widget } from "@pf-dev/ui";
import { CCTVCard } from "./CCTVCard";
import { GRID_TEMPLATE_1_PLUS_5_CELLS } from "./types";
import type { GridTemplate } from "./types";
import type { CCTVResponse } from "@/services/types";

interface CCTVGridProps {
  template: GridTemplate;
  cctvs: CCTVResponse[];
  getStreamUrl: (name: string) => string;
  onCardClick?: (index: number) => void;
  showBookmark?: boolean;
  onMaxBookmarkReached?: () => void;
}

function buildGridTemplate(template: GridTemplate) {
  if (template.id === "1+5") {
    return {
      id: "1+5",
      name: "1+5",
      columns: 3,
      rows: 3,
      cells: GRID_TEMPLATE_1_PLUS_5_CELLS,
    };
  }

  const cells = Array.from({ length: template.itemsPerPage }, (_, i) => ({
    id: `cell-${i + 1}`,
    colStart: (i % template.columns) + 1,
    colSpan: 1,
    rowStart: Math.floor(i / template.columns) + 1,
    rowSpan: 1,
  }));

  return {
    id: template.id,
    name: template.name,
    columns: template.columns,
    rows: template.rows,
    cells,
  };
}

/**
 * CCTV 그리드 레이아웃 (드래그앤드롭 지원)
 */
export function CCTVGrid({
  template,
  cctvs,
  getStreamUrl,
  onCardClick,
  showBookmark = false,
  onMaxBookmarkReached,
}: CCTVGridProps) {
  const gridTemplate = buildGridTemplate(template);

  return (
    <GridLayout
      template={gridTemplate}
      gap={0}
      editable={true}
      className="cctv-grid h-full"
      style={
        { "--cctv-cols": template.columns, "--cctv-rows": template.rows } as React.CSSProperties
      }
    >
      {Array.from({ length: template.itemsPerPage }, (_, i) => {
        const cctv = cctvs[i];
        return (
          <Widget
            key={`cell-${i + 1}`}
            id={`cell-${i + 1}`}
            border={false}
            contentClassName="p-0 h-full"
            className="h-full"
          >
            {cctv ? (
              <CCTVCard
                streamUrl={getStreamUrl(cctv.streamName)}
                streamName={cctv.streamName}
                name={cctv.name}
                onClick={() => onCardClick?.(i)}
                showBookmark={showBookmark}
                onMaxBookmarkReached={onMaxBookmarkReached}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg text-gray-500 text-sm">
                No Signal
              </div>
            )}
          </Widget>
        );
      })}
    </GridLayout>
  );
}
