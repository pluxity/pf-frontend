import { cn } from "../../utils";
import type { StatisticsCardProps } from "./types";

const StatisticsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
  className,
}: StatisticsCardProps) => {
  const variantStyles = {
    default: "bg-white border-gray-200",
    primary: "bg-primary-50 border-primary-200",
    success: "bg-success-50 border-success-200",
    warning: "bg-warning-50 border-warning-200",
    error: "bg-error-50 border-error-200",
  };

  const iconStyles = {
    default: "bg-gray-100 text-gray-600",
    primary: "bg-primary-100 text-primary-600",
    success: "bg-success-100 text-success-600",
    warning: "bg-warning-100 text-warning-600",
    error: "bg-error-100 text-error-600",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6 shadow-sm",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center text-sm font-medium",
                  trend.isPositive ? "text-success-600" : "text-error-600"
                )}
              >
                {trend.isPositive ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
                {trend.value}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "rounded-lg p-3",
              iconStyles[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

StatisticsCard.displayName = "StatisticsCard";

export { StatisticsCard };
