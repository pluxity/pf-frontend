import type { ReactNode, HTMLAttributes } from "react";

/**
 * 그리드 셀 정의
 */
export interface GridCell {
  id: string;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
}

/**
 * 그리드 템플릿 정의
 */
export interface GridTemplate {
  id: string;
  name: string;
  columns: number;
  rows: number;
  cells: GridCell[];
}

/**
 * 위젯 배치 정보
 */
export interface WidgetPlacement {
  widgetId: string;
  cellId: string;
}

/**
 * 레이아웃 상태
 */
export interface GridLayoutState {
  templateId: string;
  placements: WidgetPlacement[];
}

/**
 * 레이아웃 변경 이벤트
 */
export interface LayoutChangeEvent {
  layout: GridLayoutState;
  type: "swap" | "template-change" | "widget-change";
  swappedWidgets?: [string, string];
}

/**
 * 페이지네이션 옵션
 */
export interface GridPaginationOptions {
  type: "pagination" | "carousel";
  perPage?: number;
  transition?: "slide" | "fade" | "none";
}

/**
 * GridLayout Props
 */
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

/**
 * GridLayout Context
 */
export interface GridLayoutContextValue {
  template: GridTemplate | null;
  placements: WidgetPlacement[];
  getCellForWidget: (widgetId: string) => GridCell | undefined;
}

/**
 * DragDrop Context
 */
export interface DragDropContextValue {
  editable: boolean;
  draggedWidgetId: string | null;
  dropTargetWidgetId: string | null;
  setDraggedWidgetId: (id: string | null) => void;
  setDropTargetWidgetId: (id: string | null) => void;
  handleDrop: () => void;
}
