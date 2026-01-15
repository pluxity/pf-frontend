import { useMqttAutoConnect } from "@/mqtt";
import { Wifi, WifiOff } from "lucide-react";

/**
 * MQTT 연결 상태 표시 - 개발 환경에서만 사용
 */
export function MqttDebugPanel() {
  const { status, isConnected } = useMqttAutoConnect();

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 px-3 py-2 z-50">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-400" />
        )}
        <span className="text-xs text-white">MQTT: {status}</span>
      </div>
    </div>
  );
}
