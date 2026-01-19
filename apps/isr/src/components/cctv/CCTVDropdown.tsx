import { useState, useEffect, useCallback } from "react";
import { Camera, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { cctvService } from "../../services";
import type { CCTVStream } from "../../services/types";
import { CCTVModal } from "./CCTVModal";

export function CCTVDropdown() {
  const [cctvList, setCCTVList] = useState<CCTVStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCCTVName, setSelectedCCTVName] = useState<string | undefined>();

  const fetchCCTVList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cctvService.fetchList();
      setCCTVList(response.items);
    } catch (err) {
      console.error("Failed to fetch CCTV list:", err);
      setError("목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dropdownOpen && cctvList.length === 0 && !error) {
      fetchCCTVList();
    }
  }, [dropdownOpen, cctvList.length, error, fetchCCTVList]);

  const handleCCTVSelect = (cctvName: string) => {
    setSelectedCCTVName(cctvName);
    setModalOpen(true);
    setDropdownOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg shadow-lg hover:bg-slate-700/90 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span className="text-sm font-medium">CCTV</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 overflow-hidden z-50">
            <div className="p-2 border-b border-slate-700">
              <span className="text-xs text-slate-400 uppercase tracking-wider px-2">
                카메라 목록
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                  <button
                    onClick={fetchCCTVList}
                    className="text-xs text-slate-400 hover:text-white underline"
                  >
                    다시 시도
                  </button>
                </div>
              ) : cctvList.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400">
                  사용 가능한 카메라가 없습니다
                </div>
              ) : (
                <div className="py-1">
                  {cctvList.map((cctv) => (
                    <button
                      key={cctv.name}
                      onClick={() => handleCCTVSelect(cctv.name)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${cctv.readers.length > 0 ? "bg-green-500" : "bg-yellow-500"}`}
                      />
                      <span className="truncate">{cctv.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CCTVModal open={modalOpen} onOpenChange={setModalOpen} initialCCTVName={selectedCCTVName} />
    </>
  );
}
