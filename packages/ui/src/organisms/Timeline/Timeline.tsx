import { Children, type ReactNode } from "react";
import { cn } from "../../utils";

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Children (composition pattern) */
  children?: React.ReactNode;
}

export interface TimelineItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Item title */
  title: ReactNode;
  /** Item description */
  description?: string;
  /** Time label */
  time?: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Item variant */
  variant?:
    | "default"
    | "success"
    | "warning"
    | "error"
    | "severity-normal"
    | "severity-caution"
    | "severity-warning"
    | "severity-danger";
}

export interface TimelineCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: "bg-brand",
  success: "bg-success-brand",
  warning: "bg-warning-brand",
  error: "bg-error-brand",
  "severity-normal": "bg-severity-normal-500",
  "severity-caution": "bg-severity-caution-500",
  "severity-warning": "bg-severity-warning-500",
  "severity-danger": "bg-severity-danger-500",
};

function TimelineItem({
  title,
  description,
  time,
  icon,
  variant = "default",
  className,
  ...props
}: TimelineItemProps) {
  return (
    <div className={cn("relative flex gap-4 pb-8 last:pb-0", className)} {...props}>
      <div
        className={cn(
          "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
          variantStyles[variant]
        )}
      >
        {icon ? (
          <span className="text-white">{icon}</span>
        ) : (
          <div className="h-2 w-2 rounded-full bg-[#fff]" />
        )}
      </div>

      <div className="flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-secondary dark:text-dark-text-secondary">
            {title}
          </h4>
          {time && (
            <span className="flex-shrink-0 text-xs text-muted dark:text-dark-text-muted">
              {time}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted dark:text-dark-text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}

function TimelineCustom({ children, className }: TimelineCustomProps) {
  return <div className={cn("relative flex gap-4 pb-8 last:pb-0", className)}>{children}</div>;
}

function Timeline({ children, className, ...props }: TimelineProps) {
  const childrenArray = Children.toArray(children);

  return (
    <div className={cn("relative space-y-0", className)} {...props}>
      <div className="absolute left-[0.6875rem] top-6 h-[calc(100%-3rem)] w-0.5 bg-neutral-100 dark:bg-neutral-700" />
      {childrenArray}
    </div>
  );
}

Timeline.Item = TimelineItem;
Timeline.Custom = TimelineCustom;

export { Timeline };
