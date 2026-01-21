import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import { useRef, useState, useMemo, useEffect } from "react";
import {
  Button,
  SearchBar,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@pf-dev/ui";
import type { AttendanceData } from "./types";
import { useToastContext } from "../../contexts/ToastContext";
import { v4 as uuidv4 } from "uuid";
import { getAttendanceList } from "./services/attendanceService";

export function AttendancePage() {
  const gridRef = useRef<AgGridReactType<AttendanceData>>(null);
  const { toast } = useToastContext();
  const [allData, setAllData] = useState<AttendanceData[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceData[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editedRows, setEditedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      const data = await getAttendanceList();
      setAllData(data);
      setFilteredData(data);
    };
    loadData();
  }, []);

  const columnDefs = useMemo<ColDef<AttendanceData>[]>(
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
    const filtered = allData.filter((row) => {
      const filterSearch =
        search === "" ||
        (category === "all"
          ? row.deviceName.includes(search) || row.todayContent.includes(search)
          : category === "device"
            ? row.deviceName.includes(search)
            : row.todayContent.includes(search));

      const filterDate =
        (!startDate || row.inputDate >= startDate) && (!endDate || row.inputDate <= endDate);

      return filterSearch && filterDate;
    });

    setFilteredData(filtered);
  };

  const handleExport = () => {
    const date = new Date();
    const dateString = date.toISOString().split("T")[0];
    const fileName = `출역현황_${dateString}.csv`;

    gridRef.current?.api.exportDataAsCsv({
      fileName: fileName,
      suppressQuotes: true,
    });
  };

  const handleCellValueChanged = (event: CellValueChangedEvent<AttendanceData>) => {
    const rowId = event.data.id;
    setEditedRows((prev) => new Set(prev).add(rowId));
  };

  const handleCreate = () => {
    const date = new Date();
    const today = date.toISOString().split("T")[0];
    const newId = uuidv4();
    const newRow: AttendanceData = {
      id: newId,
      inputDate: today || "",
      deviceName: "",
      todayContent: "",
    };
    const newAllData = [newRow, ...allData];
    setAllData(newAllData);
    setFilteredData(newAllData);
    setEditedRows((prev) => new Set(prev).add(newId));
  };

  const handleSave = async () => {
    const dataToSave = allData.filter((row) => editedRows.has(row.id));

    if (dataToSave.length === 0) {
      toast.error("저장할 변경 사항이 없습니다.");
      return;
    }

    try {
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
      return;
    }
    const selectedIds = selectedRows.map((row) => row.id);
    const newData = allData.filter((row) => !selectedIds.includes(row.id));
    setAllData(newData);
    setFilteredData(newData);
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
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="device">단말기명</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">검색어</label>
            <SearchBar
              className="w-full"
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
          rowData={filteredData}
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
