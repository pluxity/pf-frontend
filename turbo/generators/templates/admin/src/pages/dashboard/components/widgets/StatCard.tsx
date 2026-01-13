import { ChevronUp, ChevronDown } from "@pf-dev/ui/atoms";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, change, changeLabel, icon }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="mt-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>

        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1">
            {isPositive ? (
              <ChevronUp size="sm" className="text-green-500" />
            ) : (
              <ChevronDown size="sm" className="text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}
            >
              {isPositive ? "+" : ""}
              {change}%
            </span>
            {changeLabel && <span className="text-sm text-gray-400">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
