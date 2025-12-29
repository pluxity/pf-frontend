import type { ReactNode, HTMLAttributes } from "react";

export interface GridCell {
  id: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
}

export interface GridTemplate {
  id: string;
  name: string;
  columns: number;
  rows: number;
  cells: GridCell[];
}

export interface WidgetPlacement {
  widgetId: string;
  cellId: string;
}

export interface GridLayoutState {
  templateId: string;
  placements: WidgetPlacement[];
}

export interface LayoutChangeEvent {
  layout: GridLayoutState;
  type: "swap" | "template-change" | "widget-change";
  swappedWidgets?: [string, string];
}

export interface GridPaginationOptions {
  type: "pagination" | "carousel";
  perPage?: number;
  transition?: "slide" | "fade" | "none";
}

export interface GridLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  children: ReactNode;
  columns?: number;
  rows?: number;
  gap?: number;
  pagination?: GridPaginationOptions;
  template?: GridTemplate;
  editable?: boolean;
  onLayoutChange?: (event: LayoutChangeEvent) => void;
  initialLayout?: GridLayoutState;
}

export interface GridLayoutContextValue {
  template: GridTemplate | null;
  placements: WidgetPlacement[];
  getCellForWidget: (widgetId: string) => GridCell | undefined;
}

export interface DragDropContextValue {
  editable: boolean;
  draggedWidgetId: string | null;
  dropTargetWidgetId: string | null;
  setDraggedWidgetId: (id: string | null) => void;
  setDropTargetWidgetId: (id: string | null) => void;
  handleDrop: () => void;
}
