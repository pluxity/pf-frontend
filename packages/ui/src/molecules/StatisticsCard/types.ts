import type { ReactNode } from "react";

export interface StatisticsCardProps {
  title: ReactNode;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "severity-normal"
    | "severity-caution"
    | "severity-warning"
    | "severity-danger";
  className?: string;
}
