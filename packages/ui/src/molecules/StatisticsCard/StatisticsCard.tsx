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
    default:
      "bg-white border-neutral-200 dark:bg-dark-bg-secondary dark:border-dark-border-default",
    primary: "bg-primary-50 border-primary-200 dark:bg-primary-900 dark:border-primary-800",
    success: "bg-success-50 border-success-200 dark:bg-success-900 dark:border-success-800",
    warning: "bg-warning-50 border-warning-200 dark:bg-warning-900 dark:border-warning-800",
    error: "bg-error-50 border-error-200 dark:bg-error-900 dark:border-error-800",
    "severity-normal":
      "bg-severity-normal-50 border-severity-normal-200 dark:bg-severity-normal-900 dark:border-severity-normal-800",
    "severity-caution":
      "bg-severity-caution-50 border-severity-caution-200 dark:bg-severity-caution-900 dark:border-severity-caution-800",
    "severity-warning":
      "bg-severity-warning-50 border-severity-warning-200 dark:bg-severity-warning-900 dark:border-severity-warning-800",
    "severity-danger":
      "bg-severity-danger-50 border-severity-danger-200 dark:bg-severity-danger-900 dark:border-severity-danger-800",
  };

  const iconStyles = {
    default: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    primary: "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400",
    success: "bg-success-100 text-success-600 dark:bg-success-900 dark:text-success-400",
    warning: "bg-warning-100 text-warning-600 dark:bg-warning-900 dark:text-warning-400",
    error: "bg-error-100 text-error-600 dark:bg-error-900 dark:text-error-400",
    "severity-normal":
      "bg-severity-normal-100 text-severity-normal-600 dark:bg-severity-normal-900 dark:text-severity-normal-400",
    "severity-caution":
      "bg-severity-caution-100 text-severity-caution-600 dark:bg-severity-caution-900 dark:text-severity-caution-400",
    "severity-warning":
      "bg-severity-warning-100 text-severity-warning-600 dark:bg-severity-warning-900 dark:text-severity-warning-400",
    "severity-danger":
      "bg-severity-danger-100 text-severity-danger-600 dark:bg-severity-danger-900 dark:text-severity-danger-400",
  };

  return (
    <div className={cn("rounded-xl border p-6 shadow-sm", variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-secondary dark:text-dark-text-secondary">
            {title}
          </p>
          <p className="text-3xl font-bold text-primary dark:text-dark-text-primary">{value}</p>
          {description && (
            <p className="text-sm text-secondary dark:text-dark-text-secondary">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center text-sm font-medium",
                  trend.isPositive
                    ? "text-success-600 dark:text-success-400"
                    : "text-error-600 dark:text-error-400"
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
              <span className="text-sm text-secondary dark:text-dark-text-secondary">
                vs last month
              </span>
            </div>
          )}
        </div>
        {icon && <div className={cn("rounded-lg p-3", iconStyles[variant])}>{icon}</div>}
      </div>
    </div>
  );
};

StatisticsCard.displayName = "StatisticsCard";

export { StatisticsCard };
