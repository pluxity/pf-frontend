import type { ColDef } from "ag-grid-community";
import type { KeyManagementType } from "./types";

interface MatrixRow {
  rowIndex: number;
  displayOrder: number;
  [key: string]: unknown;
}

export const DEFAULT_COL_DEF: ColDef = {
  sortable: false,
  filter: false,
  resizable: true,
};

export function createColumnDefs(
  types: KeyManagementType[],
  cellRenderer: ColDef<MatrixRow>["cellRenderer"]
): ColDef<MatrixRow>[] {
  return types.map((type) => ({
    headerName: type.description,
    field: type.code as string,
    flex: 1,
    editable: false,
    cellRenderer,
    valueFormatter: (params) => {
      const item = params.value as { title?: string } | undefined;
      return item?.title || "";
    },
    cellClass: "cursor-pointer",
  }));
}
