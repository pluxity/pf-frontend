import { useState, useCallback, useEffect, createContext, useContext } from "react";
import type {
  GridLayoutState,
  GridTemplate,
  WidgetPlacement,
  LayoutChangeEvent,
  DragDropContextValue,
  GridLayoutContextValue,
  GridCell,
} from "./types";

export const GridLayoutContext = createContext<GridLayoutContextValue | null>(null);
export const DragDropContext = createContext<DragDropContextValue | null>(null);

export function useGridLayoutContext() {
  return useContext(GridLayoutContext);
}

export function useDragDropContext() {
  return useContext(DragDropContext);
}

function swapWidgetPlacements(
  placements: WidgetPlacement[],
  widgetIdA: string,
  widgetIdB: string
): WidgetPlacement[] {
  const indexA = placements.findIndex((p) => p.widgetId === widgetIdA);
  const indexB = placements.findIndex((p) => p.widgetId === widgetIdB);

  if (indexA === -1 || indexB === -1) return placements;

  const placementA = placements[indexA];
  const placementB = placements[indexB];

  if (!placementA || !placementB) return placements;

  const newPlacements = [...placements];
  newPlacements[indexA] = { widgetId: placementA.widgetId, cellId: placementB.cellId };
  newPlacements[indexB] = { widgetId: placementB.widgetId, cellId: placementA.cellId };

  return newPlacements;
}

function createInitialPlacements(template: GridTemplate, widgetIds: string[]): WidgetPlacement[] {
  return template.cells
    .slice(0, widgetIds.length)
    .map((cell, index) => ({ widgetId: widgetIds[index]!, cellId: cell.id }));
}

export function useDragDropState(
  editable: boolean,
  onSwap: (widgetIdA: string, widgetIdB: string) => void
): DragDropContextValue {
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dropTargetWidgetId, setDropTargetWidgetId] = useState<string | null>(null);

  const handleDrop = useCallback(() => {
    if (draggedWidgetId && dropTargetWidgetId && draggedWidgetId !== dropTargetWidgetId) {
      onSwap(draggedWidgetId, dropTargetWidgetId);
    }
    setDraggedWidgetId(null);
    setDropTargetWidgetId(null);
  }, [draggedWidgetId, dropTargetWidgetId, onSwap]);

  return {
    editable,
    draggedWidgetId,
    dropTargetWidgetId,
    setDraggedWidgetId,
    setDropTargetWidgetId,
    handleDrop,
  };
}

export function useGridLayoutState(
  template: GridTemplate,
  initialLayout: GridLayoutState | undefined,
  onLayoutChange: ((event: LayoutChangeEvent) => void) | undefined,
  widgetIds: string[]
) {
  const getInitialState = useCallback((): GridLayoutState => {
    if (initialLayout) return initialLayout;
    return {
      templateId: template.id,
      placements: createInitialPlacements(template, widgetIds),
    };
  }, [template, initialLayout, widgetIds]);

  const [layoutState, setLayoutState] = useState<GridLayoutState>(getInitialState);

  useEffect(() => {
    const currentWidgetIds = layoutState.placements
      .map((p) => p.widgetId)
      .sort()
      .join(",");
    const newWidgetIds = [...widgetIds].sort().join(",");
    const templateChanged = layoutState.templateId !== template.id;
    const widgetsChanged = currentWidgetIds !== newWidgetIds;

    if (templateChanged || widgetsChanged) {
      const newState: GridLayoutState = {
        templateId: template.id,
        placements: createInitialPlacements(template, widgetIds),
      };

      setLayoutState(newState);

      onLayoutChange?.({
        layout: newState,
        type: templateChanged ? "template-change" : "widget-change",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layoutState 의존성 제외 (무한 루프 방지)
  }, [template, widgetIds, onLayoutChange]);

  const handleSwap = useCallback(
    (widgetIdA: string, widgetIdB: string) => {
      setLayoutState((prev) => {
        const newPlacements = swapWidgetPlacements(prev.placements, widgetIdA, widgetIdB);
        const newState: GridLayoutState = { ...prev, placements: newPlacements };

        onLayoutChange?.({
          layout: newState,
          type: "swap",
          swappedWidgets: [widgetIdA, widgetIdB],
        });

        return newState;
      });
    },
    [onLayoutChange]
  );

  const resetLayout = useCallback(() => {
    const newState: GridLayoutState = {
      templateId: template.id,
      placements: createInitialPlacements(template, widgetIds),
    };
    setLayoutState(newState);
    onLayoutChange?.({ layout: newState, type: "template-change" });
  }, [template, widgetIds, onLayoutChange]);

  const getCellForWidget = useCallback(
    (widgetId: string): GridCell | undefined => {
      const placement = layoutState.placements.find((p) => p.widgetId === widgetId);
      if (!placement) return undefined;
      return template.cells.find((c) => c.id === placement.cellId);
    },
    [template.cells, layoutState.placements]
  );

  return { layoutState, handleSwap, resetLayout, getCellForWidget };
}
