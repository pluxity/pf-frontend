import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Progress, Checkbox } from "@pf-dev/ui";
import type { GoalData, ConstructionSection } from "./types";
import { AgGridComboBox } from "../../components";
import { highlightText } from "@/utils";

interface ColumnDepsParams {
  constructionSections: ConstructionSection[];
  addConstructionSection: (name: string) => unknown;
  removeConstructionSection: (id: number) => unknown;
  onToastSuccess: (message: string) => void;
  onToastDeleteSuccess: () => void;
  activeSearchTerm: string;
  onIsActiveChange: (rowId: number, value: string) => void;
}

export function createColumnDefs({
  constructionSections,
  addConstructionSection,
  removeConstructionSection,
  onToastSuccess,
  onToastDeleteSuccess,
  activeSearchTerm,
  onIsActiveChange,
}: ColumnDepsParams): ColDef<GoalData>[] {
  return [
    {
      headerName: "작업일",
      field: "inputDate",
      flex: 1.3,
      cellEditor: "agDateStringCellEditor",
      sortable: false,
    },
    {
      headerName: "시공구간",
      field: "constructionSectionId",
      flex: 1,
      cellClass: "bg-primary-200",
      editable: true,
      cellEditor: AgGridComboBox,
      cellEditorParams: {
        items: constructionSections,
        onAdd: addConstructionSection,
        onDelete: removeConstructionSection,
        onAddSuccess: (name: string) => onToastSuccess(`"${name}" 시공구간이 추가되었습니다.`),
        onDeleteSuccess: onToastDeleteSuccess,
        placeholder: "새 시공구간",
      },
      cellEditorPopup: true,
      valueFormatter: (params) => {
        const section = constructionSections.find((s) => s.id === params.value);
        return section?.name ?? "";
      },
      valueSetter: (params) => {
        const section = constructionSections.find((s) => s.id === params.newValue);
        if (section) {
          params.data.constructionSectionId = section.id;
          params.data.constructionSectionName = section.name;
          return true;
        }
        return false;
      },
      cellRenderer: (params: ICellRendererParams<GoalData>) => {
        const value = params.data?.constructionSectionName ?? "";
        if (activeSearchTerm) {
          return <>{highlightText(value, activeSearchTerm)}</>;
        }
        return <>{value}</>;
      },
    },
    {
      headerName: "진행률",
      field: "progressRate",
      headerTooltip: "누계량/전체량",
      flex: 1.5,
      editable: false,
      cellRenderer: (params: ICellRendererParams<GoalData, number>) => {
        const value = params.value || 0;
        return (
          <div className="flex items-center gap-2">
            <Progress value={value} />
            <span className="font-semibold">{value}%</span>
          </div>
        );
      },
    },
    {
      headerName: "전체량",
      field: "totalQuantity",
      flex: 1,
      cellClass: "bg-primary-200",
      editable: true,
      cellEditor: "agNumberCellEditor",
    },
    {
      headerName: "누계량",
      field: "cumulativeQuantity",
      headerTooltip: "전일 누계량+금일 작업량",
      flex: 1,
      editable: false,
    },
    {
      headerName: "목표량",
      field: "targetQuantity",
      headerTooltip: "전체량/(준공일-착공일)",
      flex: 1,
      editable: false,
    },
    {
      headerName: "작업량",
      field: "workQuantity",
      flex: 1,
      cellClass: "bg-primary-200",
      editable: true,
      cellEditor: "agNumberCellEditor",
    },
    {
      headerName: "공정률",
      field: "constructionRate",
      headerTooltip: "작업량/목표량",
      flex: 0.8,
      editable: false,
      cellRenderer: (params: ICellRendererParams<GoalData, number>) => {
        const value = params.value || 0;
        return `${value}%`;
      },
    },
    {
      headerName: "착공일",
      field: "startDate",
      flex: 1,
      editable: true,
      cellClass: "bg-primary-200",
      cellEditor: "agDateStringCellEditor",
    },
    {
      headerName: "준공일",
      field: "completionDate",
      flex: 1,
      editable: true,
      cellClass: "bg-primary-200",
      cellEditor: "agDateStringCellEditor",
    },
    {
      headerName: "계획작업일",
      field: "plannedWorkDays",
      headerTooltip: "준공일-착공일",
      flex: 1,
      editable: false,
    },
    {
      headerName: "지연일",
      field: "delayDays",
      headerTooltip: "(목표량*(일자-착공일)-누계량)/목표량",
      flex: 1,
      editable: false,
      cellRenderer: (params: ICellRendererParams<GoalData, number>) => {
        const value = params.value ?? 0;
        return value >= 0 ? `+${value}` : value;
      },
    },
    {
      headerName: "화면노출",
      field: "isActive",
      flex: 0.8,
      editable: false,
      cellRenderer: (params: ICellRendererParams<GoalData, boolean>) => {
        const rowId = params.data?.id;

        return (
          <div className="flex h-full items-center">
            <Checkbox
              checked={!!params.value}
              onCheckedChange={(checked) => {
                if (rowId === undefined) return;
                onIsActiveChange(rowId, checked ? "Y" : "N");
              }}
            />
          </div>
        );
      },
    },
  ];
}
