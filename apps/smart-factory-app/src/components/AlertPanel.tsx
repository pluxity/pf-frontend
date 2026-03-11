import { useFactoryStore, selectPowerAlerts } from "@/stores/factory.store";
import { LOAD_COLORS } from "@/config/campus-layout.config";

export function AlertPanel() {
  const alerts = useFactoryStore(selectPowerAlerts);
  const dismissAlert = useFactoryStore((s) => s.dismissAlert);

  if (alerts.length === 0) return null;

  return (
    <div className="w-72 max-h-52 overflow-y-auto rounded-xl bg-[#1A1A22]/95 backdrop-blur border border-[#2A2A34] shadow-xl">
      <div className="px-4 py-2 border-b border-[#2A2A34] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#DE4545]">전력 경고 ({alerts.length})</h3>
        <button
          onClick={() => useFactoryStore.getState().clearAlerts()}
          className="text-[10px] text-[#6A6A7A] hover:text-white transition-colors"
        >
          모두 닫기
        </button>
      </div>

      <div className="divide-y divide-[#2A2A34]">
        {alerts.map((alert) => (
          <div key={alert.id} className="px-4 py-2 flex items-start gap-2">
            <span
              className="mt-0.5 w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: LOAD_COLORS[alert.level === "critical" ? "critical" : "high"],
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{alert.message}</p>
              <p className="text-[10px] text-[#6A6A7A] mt-0.5">
                {new Date(alert.timestamp).toLocaleTimeString("ko-KR")}
              </p>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-[#6A6A7A] hover:text-white text-xs"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
