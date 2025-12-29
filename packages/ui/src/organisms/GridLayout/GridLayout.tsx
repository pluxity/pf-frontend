import { forwardRef, useMemo, Children, isValidElement, type ReactNode } from "react";
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

const EMPTY_TEMPLATE: GridTemplate = {
  id: "",
  name: "",
  columns: 0,
  rows: 0,
  cells: [],
};

export const GridLayout = forwardRef<HTMLDivElement, GridLayoutProps>(
  (
    {
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
      ...props
    },
    ref
  ) => {
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

    // 페이지네이션 모드
    if (isPaginationMode && pagination) {
      const childArray = Children.toArray(children);
      const perPage = pagination.perPage || columns * (rows || 1);
      const pages = chunkArray(childArray, perPage);

      const gridStyle = {
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: rows ? `repeat(${rows}, 1fr)` : undefined,
        gap: `${gap}px`,
      };

      if (pagination.type === "carousel") {
        return (
          <div ref={ref} className={cn("h-full", className)} {...props}>
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

      // pagination type: 일반 페이지네이션 (추후 구현)
      return (
        <div ref={ref} className={cn("h-full", className)} {...props}>
          <div className="grid h-full" style={gridStyle}>
            {pages[0]}
          </div>
        </div>
      );
    }

    // 템플릿 모드
    if (isTemplateMode && template) {
      return (
        <DragDropContext.Provider value={dragDropState}>
          <GridLayoutContext.Provider value={gridLayoutContextValue}>
            <div ref={ref} className={cn("h-full overflow-y-auto", className)} {...props}>
              <div
                className="grid h-full"
                style={{
                  gridTemplateColumns: `repeat(${template.columns}, 1fr)`,
                  gridTemplateRows: `repeat(${template.rows}, 1fr)`,
                  gap: `${gap}px`,
                }}
              >
                {children}
              </div>
            </div>
          </GridLayoutContext.Provider>
        </DragDropContext.Provider>
      );
    }

    // 기본 모드
    return (
      <div ref={ref} className={cn("h-full overflow-y-auto", className)} {...props}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: rows ? `repeat(${rows}, 1fr)` : undefined,
            gap: `${gap}px`,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

GridLayout.displayName = "GridLayout";
