import type { Ref } from "react";
import { X, type IconSize } from "../Icon";
import { cn } from "../../utils";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const variantStyles = {
  default: "bg-neutral-50 text-secondary dark:text-dark-text-muted",
  primary: "bg-brand text-white",
  success: "bg-success-400 text-white",
  warning: "bg-warning-400 text-white",
  error: "bg-error-500 text-white",
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
