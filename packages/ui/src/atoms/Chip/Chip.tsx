import type { Ref } from "react";
import { X, type IconSize } from "../Icon";
import { cn } from "../../utils";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "severity-normal"
    | "severity-caution"
    | "severity-warning"
    | "severity-danger"
    | "custom";
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const variantStyles = {
  default: "bg-neutral-50 text-secondary dark:bg-neutral-800 dark:text-dark-text-secondary",
  primary: "bg-brand text-white dark:bg-primary-600",
  success: "bg-success-brand text-white dark:bg-success-600",
  warning: "bg-warning-brand text-white dark:bg-warning-600",
  error: "bg-error-brand text-white dark:bg-error-600",
  "severity-normal":
    "bg-severity-normal-100 text-severity-normal-700 dark:bg-severity-normal-900 dark:text-severity-normal-300",
  "severity-caution":
    "bg-severity-caution-100 text-severity-caution-700 dark:bg-severity-caution-900 dark:text-severity-caution-300",
  "severity-warning":
    "bg-severity-warning-100 text-severity-warning-700 dark:bg-severity-warning-900 dark:text-severity-warning-300",
  "severity-danger":
    "bg-severity-danger-100 text-severity-danger-700 dark:bg-severity-danger-900 dark:text-severity-danger-300",
  custom: "",
};

const sizeStyles = {
  sm: "h-6 px-2 text-xs gap-1",
  md: "h-8 px-3 text-xs gap-1.5",
  lg: "h-9 px-4 text-sm gap-2",
};

const removeButtonStyles = {
  default: "hover:bg-neutral-200 text-secondary",
  primary: "hover:bg-white/20 text-white",
  success: "hover:bg-white/20 text-white",
  warning: "hover:bg-white/20 text-white",
  error: "hover:bg-white/20 text-white",
  "severity-normal":
    "hover:bg-severity-normal-200 text-severity-normal-700 dark:hover:bg-severity-normal-800 dark:text-severity-normal-300",
  "severity-caution":
    "hover:bg-severity-caution-200 text-severity-caution-700 dark:hover:bg-severity-caution-800 dark:text-severity-caution-300",
  "severity-warning":
    "hover:bg-severity-warning-200 text-severity-warning-700 dark:hover:bg-severity-warning-800 dark:text-severity-warning-300",
  "severity-danger":
    "hover:bg-severity-danger-200 text-severity-danger-700 dark:hover:bg-severity-danger-800 dark:text-severity-danger-300",
  custom: "hover:bg-white/20",
};

function Chip({
  variant = "default",
  size = "md",
  removable = false,
  onRemove,
  disabled = false,
  icon,
  className,
  children,
  ref,
  ...props
}: ChipProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onRemove?.();
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold transition-opacity",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 cursor-pointer rounded-full p-0.5 transition-colors",
            removeButtonStyles[variant],
            disabled && "cursor-not-allowed"
          )}
        >
          <X size={(size === "sm" ? "xs" : size === "lg" ? "sm" : "xs") as IconSize} />
        </button>
      )}
    </div>
  );
}

export { Chip };
