export type TemplateId = "1x1" | "2x2" | "3x3" | "4x4" | "1+5";

export interface GridTemplate {
  id: TemplateId;
  name: string;
  columns: number;
  rows: number;
  itemsPerPage: number;
}

/** 1+5 레이아웃의 GridLayout 셀 정의 */
export const GRID_TEMPLATE_1_PLUS_5_CELLS = [
  { id: "cell-1", colStart: 1, colSpan: 2, rowStart: 1, rowSpan: 2 },
  { id: "cell-2", colStart: 3, colSpan: 1, rowStart: 1, rowSpan: 1 },
  { id: "cell-3", colStart: 3, colSpan: 1, rowStart: 2, rowSpan: 1 },
  { id: "cell-4", colStart: 1, colSpan: 1, rowStart: 3, rowSpan: 1 },
  { id: "cell-5", colStart: 2, colSpan: 1, rowStart: 3, rowSpan: 1 },
  { id: "cell-6", colStart: 3, colSpan: 1, rowStart: 3, rowSpan: 1 },
];

export const GRID_TEMPLATES: Record<TemplateId, GridTemplate> = {
  "1x1": {
    id: "1x1",
    name: "1개",
    columns: 1,
    rows: 1,
    itemsPerPage: 1,
  },
  "2x2": {
    id: "2x2",
    name: "4개",
    columns: 2,
    rows: 2,
    itemsPerPage: 4,
  },
  "3x3": {
    id: "3x3",
    name: "9개",
    columns: 3,
    rows: 3,
    itemsPerPage: 9,
  },
  "4x4": {
    id: "4x4",
    name: "16개",
    columns: 4,
    rows: 4,
    itemsPerPage: 16,
  },
  "1+5": {
    id: "1+5",
    name: "1+5",
    columns: 3,
    rows: 3,
    itemsPerPage: 6,
  },
};
