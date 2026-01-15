import { Card, CardHeader, CardTitle, CardContent } from "@pf-dev/ui/molecules";
import { User, PawPrint, Car, Info } from "lucide-react";

export interface EventLogItem {
  id: string;
  type: "person" | "vehicle" | "wildlife" | "system";
  message: string;
  timestamp: number;
  isTrackingEnd?: boolean;
}

interface EventLogProps {
  logs?: EventLogItem[];
  onLogClick?: (log: EventLogItem) => void;
}

const eventTypeStyles = {
  person: {
    bgColor: "bg-[#D4C5B0]",
    iconBg: "bg-[#E8A500]",
    icon: User,
  },
  wildlife: {
    bgColor: "bg-[#B8D4E8]",
    iconBg: "bg-[#4A90B8]",
    icon: PawPrint,
  },
  vehicle: {
    bgColor: "bg-[#E8B8C8]",
    iconBg: "bg-[#C83C3C]",
    icon: Car,
  },
  system: {
    bgColor: "bg-slate-700/50",
    iconBg: "bg-slate-600",
    icon: Info,
  },
} as const;

export function EventLog({ logs = [], onLogClick }: EventLogProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card className="h-full flex flex-col bg-[#181A1D]/80 backdrop-blur-md border-slate-600/30 rounded-xl">
      <CardHeader className="py-2 border-b border-slate-600/20 text-center">
        <CardTitle className="text-sm font-semibold text-white">이벤트 로그</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-800/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/70 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80">
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-8">이벤트가 없습니다</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              if (log.type === "system") {
                return (
                  <div
                    key={log.id}
                    className="bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-600/30"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <div className="text-[10px] text-slate-400">{formatTime(log.timestamp)}</div>
                      <div className="text-[10px] text-slate-300 flex-1">{log.message}</div>
                    </div>
                  </div>
                );
              }

              const style = eventTypeStyles[log.type] || eventTypeStyles.person;
              const Icon = style.icon;
              const bgColor = log.isTrackingEnd ? "bg-slate-500/50" : style.bgColor;
              const iconBg = log.isTrackingEnd ? "bg-slate-600" : style.iconBg;

              return (
                <div
                  key={log.id}
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => onLogClick?.(log)}
                >
                  <div className={`${bgColor} rounded-lg p-2.5 shadow-sm`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`${iconBg} rounded-full p-2 flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-slate-700 mb-0.5">
                          {formatTime(log.timestamp)}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 leading-relaxed">
                          {log.message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
