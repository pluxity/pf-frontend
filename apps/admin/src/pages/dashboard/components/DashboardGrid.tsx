import type { ReactNode } from "react";
import { GridLayout } from "@pf-dev/ui/organisms";

import type { StatCardProps } from "./widgets/StatCard";
import type { ChartWidgetProps } from "./widgets/ChartWidget";
import type { TableWidgetProps } from "./widgets/TableWidget";
import type { EmptyWidgetProps } from "./widgets/EmptyWidget";

interface StatWidgetConfig {
  id: string;
  type: "stat";
  props: StatCardProps;
}

interface ChartWidgetConfig {
  id: string;
  type: "chart";
  props: ChartWidgetProps;
}

interface TableWidgetConfig {
  id: string;
  type: "table";
  props: TableWidgetProps<Record<string, unknown>>;
}

interface EmptyWidgetConfig {
  id: string;
  type: "empty";
  props: EmptyWidgetProps;
}

export type WidgetConfig =
  | StatWidgetConfig
  | ChartWidgetConfig
  | TableWidgetConfig
  | EmptyWidgetConfig;

export interface DashboardGridProps {
  children: ReactNode;
  columns?: number;
  rows?: number;
  gap?: number;
}

export function DashboardGrid({ children, columns = 4, rows, gap = 16 }: DashboardGridProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">대시보드</h1>
      </div>

      <GridLayout columns={columns} rows={rows} gap={gap} className="min-h-0 flex-1">
        {children}
      </GridLayout>
    </div>
  );
}
