import { useState } from "react";
import { Film, X } from "lucide-react";

export function VideoSearchButton() {
  const [showVideoSearch, setShowVideoSearch] = useState(false);

  return (
    <>
      {/* 영상기록 검색 버튼 */}
      <button
        onClick={() => setShowVideoSearch(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0057FF] hover:bg-[#0046cc] text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:shadow-lg pointer-events-auto"
      >
        <Film className="h-4 w-4" />
        <span>영상기록 검색</span>
      </button>

      {/* 영상기록 검색 모달 */}
      {showVideoSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">영상기록 검색</h3>
              <button
                onClick={() => setShowVideoSearch(false)}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-8 text-center text-slate-400">
              <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">영상기록 검색 기능은 추후 구현 예정입니다.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
