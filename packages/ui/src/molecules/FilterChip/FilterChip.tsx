import type { Ref } from "react";
import { X, Check } from "../../atoms/Icon";
import { cn } from "../../utils";

export interface FilterChipProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange"> {
  selected?: boolean;
  disabled?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onChange?: (selected: boolean) => void;
  category?: string;
  showCheckIcon?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

function FilterChip({
  selected = false,
  disabled = false,
  removable = false,
  onRemove,
  onChange,
  category,
  showCheckIcon = false,
  className,
  children,
  ref,
  ...props
}: FilterChipProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange?.(!selected);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onRemove?.();
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm transition-all",
        selected
          ? "bg-brand font-bold text-white"
          : disabled
            ? "cursor-not-allowed bg-neutral-50 text-neutral-300"
            : "border border-border-default bg-white text-secondary hover:border-neutral-300 hover:bg-neutral-50",
        className
      )}
      {...props}
    >
      {showCheckIcon && selected && <Check size="sm" className="flex-shrink-0" />}

      {category ? (
        <span className="flex items-center gap-1">
          <span className={cn(selected ? "text-white/70" : "text-muted")}>{category}:</span>
          <span>{children}</span>
        </span>
      ) : (
        <span>{children}</span>
      )}

      {removable && selected && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 rounded-full p-0.5 transition-colors hover:bg-white/20",
            disabled && "cursor-not-allowed"
          )}
        >
          <X size="xs" />
        </button>
      )}
    </button>
  );
}

export interface FilterChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
}

function FilterChipGroup({ className, children, ref, ...props }: FilterChipGroupProps) {
  return (
    <div ref={ref} className={cn("flex flex-wrap gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export { FilterChip, FilterChipGroup };
