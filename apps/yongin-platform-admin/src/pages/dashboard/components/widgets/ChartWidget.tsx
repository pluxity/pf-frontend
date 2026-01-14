export interface ChartWidgetProps {
  title: string;
  type: "line" | "bar" | "pie";
  data?: unknown;
}

export function ChartWidget({ title, type }: ChartWidgetProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>

      <div className="mt-4 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <ChartPlaceholder type={type} />
          <span className="text-xs">{getChartLabel(type)} 차트</span>
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholder({ type }: { type: "line" | "bar" | "pie" }) {
  switch (type) {
    case "line":
      return (
        <svg
          className="h-16 w-16"
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="8,48 20,32 32,40 44,20 56,28" />
        </svg>
      );
    case "bar":
      return (
        <svg className="h-16 w-16" viewBox="0 0 64 64" fill="currentColor">
          <rect x="8" y="32" width="10" height="24" rx="2" />
          <rect x="22" y="20" width="10" height="36" rx="2" />
          <rect x="36" y="28" width="10" height="28" rx="2" />
          <rect x="50" y="16" width="10" height="40" rx="2" />
        </svg>
      );
    case "pie":
      return (
        <svg className="h-16 w-16" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M32,32 L32,8 A24,24 0 0,1 53.8,43.2 Z" fill="currentColor" opacity="0.3" />
          <path d="M32,32 L53.8,43.2 A24,24 0 0,1 10.2,43.2 Z" fill="currentColor" opacity="0.5" />
        </svg>
      );
  }
}

function getChartLabel(type: "line" | "bar" | "pie") {
  switch (type) {
    case "line":
      return "라인";
    case "bar":
      return "막대";
    case "pie":
      return "파이";
  }
}
