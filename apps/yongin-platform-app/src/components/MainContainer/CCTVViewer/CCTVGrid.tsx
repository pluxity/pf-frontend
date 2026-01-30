import { GridLayout, Widget } from "@pf-dev/ui";
import { CCTVCard } from "./CCTVCard";
import type { GridTemplate } from "./types";
import type { CCTVPath } from "@/services/types";

interface CCTVGridProps {
  template: GridTemplate;
  cctvs: CCTVPath[];
  getStreamUrl: (name: string) => string;
  onCardClick?: (index: number) => void;
}

/**
 * CCTV 그리드 레이아웃 (드래그앤드롭 지원)
 */
export function CCTVGrid({ template, cctvs, getStreamUrl, onCardClick }: CCTVGridProps) {
  // 1+5 레이아웃: GridLayout template 모드 사용
  if (template.id === "1+5") {
    const gridTemplate = {
      id: "1+5",
      name: "1+5",
      columns: 3,
      rows: 3,
      cells: [
        { id: "cell-1", colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 2 },
        { id: "cell-2", colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 1 },
        { id: "cell-3", colStart: 3, colSpan: 1, rowStart: 2, rowSpan: 1 },
        { id: "cell-4", colStart: 1, colSpan: 1, rowStart: 3, rowSpan: 1 },
        { id: "cell-5", colStart: 2, colSpan: 1, rowStart: 3, rowSpan: 1 },
        { id: "cell-6", colStart: 3, colSpan: 1, rowStart: 3, rowSpan: 1 },
      ],
    };

    return (
      <GridLayout
        template={gridTemplate}
        gap={0}
        editable={true}
        className="cctv-grid h-full"
        style={{ "--cctv-cols": 3, "--cctv-rows": 3 } as React.CSSProperties}
      >
        {Array.from({ length: 6 }, (_, i) => {
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
                  streamUrl={getStreamUrl(cctv.name)}
                  name={cctv.name}
                  onClick={() => onCardClick?.(i)}
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

  const cells = Array.from({ length: template.itemsPerPage }, (_, i) => ({
    id: `cell-${i + 1}`,
    colStart: (i % template.columns) + 1,
    colSpan: 1,
    rowStart: Math.floor(i / template.columns) + 1,
    rowSpan: 1,
  }));

  const gridTemplate = {
    id: template.id,
    name: template.name,
    columns: template.columns,
    rows: template.rows,
    cells,
  };

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
                streamUrl={getStreamUrl(cctv.name)}
                name={cctv.name}
                onClick={() => onCardClick?.(i)}
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
