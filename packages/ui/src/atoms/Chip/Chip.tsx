import type { Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import { X, type IconSize } from "../Icon";
import { cn } from "../../utils";
import { chipVariants, chipRemoveButtonVariants } from "./variants";

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, VariantProps<typeof chipVariants> {
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
}

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
        chipVariants({ variant, size }),
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
          className={cn(chipRemoveButtonVariants({ variant }), disabled && "cursor-not-allowed")}
        >
          <X size={(size === "sm" ? "xs" : size === "lg" ? "sm" : "xs") as IconSize} />
        </button>
      )}
    </div>
  );
}

export { Chip };
