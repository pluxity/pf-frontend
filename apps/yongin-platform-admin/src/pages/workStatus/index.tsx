import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import { useRef, useState, useMemo } from "react";
import { Button, SearchBar } from "@pf-dev/ui";
import type { WorkStatusData } from "./types";
import { useToastContext } from "../../contexts/ToastContext";

ModuleRegistry.registerModules([AllCommunityModule]);

const MOCK_DATA: WorkStatusData[] = [
  {
    id: "1",
    inputDate: "2026-01-07",
    deviceName: "단말기1",
    todayContent: "토공 작업 진행",
  },
  {
    id: "2",
    inputDate: "2026-01-07",
    deviceName: "단말기2",
    todayContent: "도로공 작업 완료",
  },
  {
    id: "3",
    inputDate: "2026-01-07",
    deviceName: "단말기3",
    todayContent: "비계착 설치 중",
  },
];

export function WorkStatusPage() {
  const gridRef = useRef<AgGridReactType<WorkStatusData>>(null);
  const { toast } = useToastContext();
  const [rowData, setRowData] = useState<WorkStatusData[]>(MOCK_DATA);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editedRows, setEditedRows] = useState<Set<string>>(new Set());

  const columnDefs = useMemo<ColDef<WorkStatusData>[]>(
    () => [
      {
        headerName: "입력일자",
        field: "inputDate",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        editable: true,
      },
      {
        headerName: "단말기명",
        field: "deviceName",
        flex: 1,
        editable: true,
      },
      {
        headerName: "금일 작성 내용",
        field: "todayContent",
        flex: 2,
        editable: true,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  const handleSearch = () => {
    const filtered = MOCK_DATA.filter((row) => {
      const filterSearch =
        search === "" || row.deviceName.includes(search) || row.todayContent.includes(search);
      const filterDate =
        (!startDate || row.inputDate >= startDate) && (!endDate || row.inputDate <= endDate);

      return filterSearch && filterDate;
    });

    setRowData(filtered);
  };

  const handleExport = () => {
    gridRef.current?.api.exportDataAsCsv();
  };

  const handleCellValueChanged = (event: CellValueChangedEvent<WorkStatusData>) => {
    const rowId = event.data.id;
    setEditedRows((prev) => new Set(prev).add(rowId));

    console.log("Cell value changed:", {
      oldValue: event.oldValue,
      newValue: event.newValue,
      field: event.colDef.field,
      data: event.data,
    });
  };

  const handleCreate = () => {
    const date = new Date();
    const today = date.toISOString().split("T")[0];
    const newRow: WorkStatusData = {
      id: `${Date.now()}`,
      inputDate: today || "",
      deviceName: "",
      todayContent: "",
    };
    setRowData([newRow, ...rowData]);
  };

  const handleSave = async () => {
    const dataToSave = rowData.filter((row) => editedRows.has(row.id));

    if (dataToSave.length === 0) {
      toast.error("저장할 변경 사항이 없습니다.");
      return;
    }

    try {
      console.log("Saving data:", dataToSave);
      toast.success(`${dataToSave.length}건 저장되었습니다.`);
      setEditedRows(new Set());
    } catch (error) {
      console.error("Save error:", error);
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleDelete = () => {
    const selectedRows = gridRef.current?.api.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
      toast.error("삭제할 항목을 선택해주세요.");
      console.log("toast.error('삭제할 항목을 선택해주세요.');");
      return;
    }
    const selectedIds = selectedRows.map((row) => row.id);
    const newData = rowData.filter((row) => !selectedIds.includes(row.id));
    setRowData(newData);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">출역 현황</h1>
            <p className="mt-1 text-sm text-gray-500">출역 현황 관리</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">구분</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="device">단말기명</option>
              <option value="date">일자</option>
            </select>
          </div>

          <div className="flex-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">검색어</label>
            <SearchBar
              placeholder="검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={handleSearch}
              onClear={() => setSearch("")}
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">시작일자</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">종료일자</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleSearch}>검색</Button>
            <Button onClick={handleSave} variant="outline">
              저장 {editedRows.size > 0 && <span>({editedRows.size})</span>}
            </Button>
            <Button onClick={handleExport} variant="outline">
              내보내기
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={20}
          onCellValueChanged={handleCellValueChanged}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleCreate}>생성</Button>
        <Button onClick={handleDelete} variant="error">
          삭제
        </Button>
      </div>
    </div>
  );
}
