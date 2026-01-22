import { useState, useCallback } from "react";
import { SearchBar, Button } from "@pf-dev/ui";

export interface SearchFilters {
  search: string;
  startDate: string;
  endDate: string;
}

interface AgGridSearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  searchPlaceholder?: string;
  showDateRange?: boolean;
  dateValidation?: boolean;
  onDateError?: (message: string) => void;
}

export function AgGridSearchFilter({
  onSearch,
  onReset,
  searchPlaceholder = "검색...",
  showDateRange = true,
  dateValidation = true,
  onDateError,
}: AgGridSearchFilterProps) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  const handleSearch = useCallback(() => {
    if (dateValidation && startDate && endDate && startDate > endDate) {
      onDateError?.("시작일자가 종료일자보다 늦을 수 없습니다.");
      return;
    }
    onSearch({ search, startDate, endDate });
    setIsFiltered(true);
  }, [search, startDate, endDate, dateValidation, onDateError, onSearch]);

  const handleReset = useCallback(() => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setIsFiltered(false);
    onReset();
  }, [onReset]);

  const handleStartDateChange = (value: string) => {
    if (dateValidation && endDate && value > endDate) {
      onDateError?.("시작일자가 종료일자보다 늦을 수 없습니다.");
      return;
    }
    setStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    if (dateValidation && startDate && value < startDate) {
      onDateError?.("종료일자가 시작일자보다 빠를 수 없습니다.");
      return;
    }
    setEndDate(value);
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-700">검색어</label>
        <SearchBar
          className="w-full"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          onClear={() => setSearch("")}
        />
      </div>

      {showDateRange && (
        <>
          <div className="w-40">
            <label className="mb-1 block text-sm font-medium text-gray-700">시작일자</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-sm font-medium text-gray-700">종료일자</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      <div className="flex items-end gap-2">
        <Button onClick={handleSearch}>검색</Button>
        {isFiltered && (
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
        )}
      </div>
    </div>
  );
}
