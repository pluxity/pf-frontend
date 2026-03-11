import { useIFCViewerStore, selectMepAlarms } from "@/stores/ifc-viewer.store";
import type { MepAlarm } from "@/babylon/types";

const LEVEL_COLORS: Record<string, string> = {
  critical: "#EF4444",
  warning: "#F59E0B",
};

export function MepStatusPanel() {
  const alarms = useIFCViewerStore(selectMepAlarms);
  const { dismissMepAlarm } = useIFCViewerStore();

  if (alarms.length === 0) return null;

  function formatTime(ts: number): string {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  }

  return (
    <div className="absolute top-16 right-4 w-64 bg-[#1A1D27]/95 rounded-lg border border-[#2D3140] shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2D3140]">
        <span className="text-white text-xs font-semibold">설비 알람</span>
        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded">
          {alarms.length}
        </span>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {alarms.map((alarm: MepAlarm) => (
          <div
            key={alarm.id}
            className="flex items-start gap-2 px-3 py-2 border-b border-[#2D3140]/50 hover:bg-[#2D3140]/30"
          >
            <div
              className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: LEVEL_COLORS[alarm.level] }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{alarm.type}</div>
              <div className="text-[10px] text-gray-400 truncate">{alarm.message}</div>
              <div className="text-[10px] text-gray-600">{formatTime(alarm.timestamp)}</div>
            </div>
            <button
              onClick={() => dismissMepAlarm(alarm.id)}
              className="text-gray-600 hover:text-gray-300 text-xs flex-shrink-0"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
