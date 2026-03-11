import { useState } from "react";
import { useCCTVPopupStore, selectPopups } from "@/stores/cctv.store";
import { CCTV_CAMERAS, getWHEPUrl } from "@/config/cctv.config";

const BUILDING_LABELS: Record<string, string> = {
  "main-factory": "본관",
  warehouse: "물류동",
  utility: "유틸리티동",
  "quality-lab": "품질동",
};

export function CCTVControl() {
  const [open, setOpen] = useState(false);
  const popups = useCCTVPopupStore(selectPopups);
  const openPopup = useCCTVPopupStore((s) => s.openPopup);
  const closePopup = useCCTVPopupStore((s) => s.closePopup);
  const closeAll = useCCTVPopupStore((s) => s.closeAll);

  const openIds = new Set(popups.map((p) => p.id));
  const activeCount = popups.length;

  const handleToggleCamera = (cam: (typeof CCTV_CAMERAS)[number]) => {
    if (openIds.has(cam.id)) {
      closePopup(cam.id);
    } else {
      openPopup({
        id: cam.id,
        label: cam.label,
        streamUrl: getWHEPUrl(cam.streamName),
      });
    }
  };

  return (
    <div className="relative">
      {/* CCTV toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          activeCount > 0
            ? "bg-[#DE4545]/20 text-[#DE4545] border border-[#DE4545]/30"
            : "text-[#6A6A7A] hover:text-white hover:bg-[#2A2A34] border border-transparent"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        CCTV
        {activeCount > 0 && (
          <span className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-[#DE4545] text-white text-[9px] font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {/* Camera list dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-lg bg-[#1A1A22]/95 backdrop-blur border border-[#2A2A34] shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2A34]">
              <span className="text-[11px] font-semibold text-[#B3B3BA]">CCTV 카메라</span>
              {activeCount > 0 && (
                <button
                  onClick={closeAll}
                  className="text-[10px] text-[#6A6A7A] hover:text-[#DE4545] transition-colors"
                >
                  전체 닫기
                </button>
              )}
            </div>

            {/* Camera list */}
            <div className="p-1.5 max-h-64 overflow-y-auto">
              {CCTV_CAMERAS.map((cam) => {
                const isActive = openIds.has(cam.id);
                return (
                  <button
                    key={cam.id}
                    onClick={() => handleToggleCamera(cam)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-all ${
                      isActive
                        ? "bg-[#DE4545]/10 border border-[#DE4545]/20"
                        : "hover:bg-[#2A2A34] border border-transparent"
                    }`}
                  >
                    {/* Status dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isActive
                          ? "bg-[#DE4545] shadow-[0_0_6px_rgba(222,69,69,0.5)]"
                          : "bg-[#3A3A44]"
                      }`}
                    />

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-[11px] font-medium truncate ${
                          isActive ? "text-white" : "text-[#B3B3BA]"
                        }`}
                      >
                        {cam.label}
                      </div>
                      <div className="text-[9px] text-[#6A6A7A]">
                        {BUILDING_LABELS[cam.buildingId] ?? cam.buildingId}
                        {cam.zone && ` · ${cam.zone}`}
                      </div>
                    </div>

                    {/* Toggle indicator */}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isActive ? "#DE4545" : "#3A3A44"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      {isActive ? (
                        <path d="M1 1l22 22M17 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11M21 12v3a2 2 0 01-2 2M23 3l-4 4m0-4l4 4" />
                      ) : (
                        <>
                          <path d="M1 3h15a2 2 0 012 2v10a2 2 0 01-2 2H1z" />
                          <path d="M23 7l-5 3 5 3z" />
                        </>
                      )}
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
