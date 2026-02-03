import { useMemo, Children, isValidElement, type ReactNode } from "react";
import { cn } from "../../utils";
import { Carousel } from "../../molecules/Carousel";
import type { GridLayoutProps, GridTemplate, GridLayoutContextValue } from "./types";
import { GridLayoutContext, DragDropContext, useDragDropState, useGridLayoutState } from "./hooks";

function extractWidgetIds(children: ReactNode): string[] {
  const ids: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const props = child.props as { id?: string };
      if (props.id) {
        ids.push(props.id);
      }
    }
  });
  return ids;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function createGridStyle(columns: number, rows: number | undefined, gap: number) {
  return {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: rows ? `repeat(${rows}, 1fr)` : undefined,
    gap: `${gap}px`,
  };
}

const EMPTY_TEMPLATE: GridTemplate = {
  id: "",
  name: "",
  columns: 0,
  rows: 0,
  cells: [],
};

export function GridLayout({
  children,
  columns = 12,
  rows,
  gap = 16,
  pagination,
  template,
  editable = false,
  onLayoutChange,
  initialLayout,
  className,
  ref,
  ...props
}: GridLayoutProps) {
  const isTemplateMode = !!template;
  const isPaginationMode = !!pagination;

  const widgetIds = useMemo(() => extractWidgetIds(children), [children]);

  const { layoutState, handleSwap, getCellForWidget } = useGridLayoutState(
    template || EMPTY_TEMPLATE,
    initialLayout,
    onLayoutChange,
    widgetIds
  );

  const dragDropState = useDragDropState(editable, handleSwap);

  const gridLayoutContextValue: GridLayoutContextValue = {
    template: template || null,
    placements: layoutState.placements,
    getCellForWidget,
  };

  if (isPaginationMode && pagination) {
    const childArray = Children.toArray(children);
    const perPage = pagination.perPage || columns * (rows || 1);
    const pages = chunkArray(childArray, perPage);
    const gridStyle = createGridStyle(columns, rows, gap);

    if (pagination.type === "carousel") {
      return (
        <div ref={ref} className={cn("h-full p-4", className)} {...props}>
          <Carousel
            transition={pagination.transition || "slide"}
            showArrows={true}
            showIndicators={true}
            lazy={true}
            className="h-full"
          >
            {pages.map((pageChildren, pageIndex) => (
              <div key={pageIndex} className="grid h-full" style={gridStyle}>
                {pageChildren}
              </div>
            ))}
          </Carousel>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("h-full p-4", className)} {...props}>
        <div className="grid h-full" style={gridStyle}>
          {pages[0]}
        </div>
      </div>
    );
  }

  if (isTemplateMode && template) {
    return (
      <DragDropContext.Provider value={dragDropState}>
        <GridLayoutContext.Provider value={gridLayoutContextValue}>
          <div ref={ref} className={cn("h-full overflow-y-auto p-4", className)} {...props}>
            <div
              className="grid h-full"
              style={createGridStyle(template.columns, template.rows, gap)}
            >
              {children}
            </div>
          </div>
        </GridLayoutContext.Provider>
      </DragDropContext.Provider>
    );
  }

  return (
    <div ref={ref} className={cn("h-full p-4", !rows && "overflow-y-auto", className)} {...props}>
      <div className={cn("grid", rows && "h-full")} style={createGridStyle(columns, rows, gap)}>
        {children}
      </div>
    </div>
  );
}
