import type { ColDef, CellClassParams } from "ag-grid-community";
import type { ProcessStatusData, WorkType } from "./types";
import { isValidProcessStatus, OVERALL_WORK_TYPE_NAME } from "./validation";
import { AgGridComboBox } from "../../components";

interface ColumnDepsParams {
  workTypes: WorkType[];
  duplicateKeys: Set<string>;
  addWorkType: (name: string) => Promise<void>;
  removeWorkType: (id: number) => Promise<void>;
  toast: { success: (msg: string) => void };
  workTypeNameCellRenderer: ColDef<ProcessStatusData>["cellRenderer"];
  plannedRateCellRenderer: ColDef<ProcessStatusData>["cellRenderer"];
  actualRateCellRenderer: ColDef<ProcessStatusData>["cellRenderer"];
}

export function createColumnDefs(params: ColumnDepsParams): ColDef<ProcessStatusData>[] {
  const {
    workTypes,
    duplicateKeys,
    addWorkType,
    removeWorkType,
    toast,
    workTypeNameCellRenderer,
    plannedRateCellRenderer,
    actualRateCellRenderer,
  } = params;

  return [
    {
      headerName: "입력일자",
      field: "workDate",
      width: 200,
      editable: true,
      cellEditor: "agDateStringCellEditor",
      cellClassRules: {
        "bg-red-100": (p: CellClassParams<ProcessStatusData>) =>
          p.data ? duplicateKeys.has(`${p.data.workDate}:${p.data.workTypeId}`) : false,
      },
    },
    {
      headerName: "공정명",
      field: "workTypeId",
      flex: 2,
      editable: true,
      cellEditor: AgGridComboBox,
      cellEditorParams: {
        items: workTypes,
        onAdd: addWorkType,
        onDelete: removeWorkType,
        onAddSuccess: (name: string) => toast.success(`"${name}" 공정명이 추가되었습니다.`),
        onDeleteSuccess: () => toast.success("공정명이 삭제되었습니다."),
        isDeleteDisabled: (item: { name: string }) => item.name === OVERALL_WORK_TYPE_NAME,
        placeholder: "새 공정명",
      },
      cellEditorPopup: true,
      valueFormatter: (p) => {
        const workType = workTypes.find((wt) => wt.id === p.value);
        return workType?.name ?? "";
      },
      valueSetter: (p) => {
        const workType = workTypes.find((wt) => wt.id === p.newValue);
        if (workType) {
          p.data.workTypeId = workType.id;
          p.data.workTypeName = workType.name;
          return true;
        }
        return false;
      },
      cellRenderer: workTypeNameCellRenderer,
    },
    {
      headerName: "목표율 (%)",
      field: "plannedRate",
      flex: 1,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        precision: 0,
        step: 1,
        min: 0,
        max: 100,
      },
      cellRenderer: plannedRateCellRenderer,
      cellClassRules: {
        "bg-red-100": (p: CellClassParams<ProcessStatusData>) =>
          p.data ? !isValidProcessStatus(p.data) : false,
      },
    },
    {
      headerName: "공정률 (%)",
      field: "actualRate",
      flex: 1,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellEditorParams: {
        precision: 0,
        step: 1,
        min: 0,
        max: 100,
      },
      cellRenderer: actualRateCellRenderer,
      cellClassRules: {
        "bg-red-100": (p: CellClassParams<ProcessStatusData>) =>
          p.data ? !isValidProcessStatus(p.data) : false,
      },
    },
  ];
}

export const DEFAULT_COL_DEF: ColDef = {
  sortable: true,
  resizable: true,
  headerClass: "ag-header-cell-center",
  cellStyle: { textAlign: "center" },
};
