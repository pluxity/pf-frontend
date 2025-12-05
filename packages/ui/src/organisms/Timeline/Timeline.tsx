import { type Ref } from "react";
import { cn } from "../../utils";

export interface TimelineItemProps {
  title: string;
  description?: string;
  time?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItemProps[];
  ref?: Ref<HTMLDivElement>;
}

const variantStyles = {
  default: "bg-brand",
  success: "bg-success-brand",
  warning: "bg-warning-brand",
  error: "bg-error-brand",
};

interface TimelineItemComponentProps extends TimelineItemProps {
  isLast?: boolean;
  ref?: Ref<HTMLDivElement>;
}

function TimelineItem({
  title,
  description,
  time,
  icon,
  variant = "default",
  isLast = false,
  ref,
}: TimelineItemComponentProps) {
  return (
    <div ref={ref} className="relative flex gap-4 pb-8 last:pb-0">
      {!isLast && (
        <div className="absolute left-[11px] top-6 h-[calc(100%-24px)] w-0.5 bg-[#E6E6E8]" />
      )}

      <div
        className={cn(
          "relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
          variantStyles[variant]
        )}
      >
        {icon ? (
          <span className="text-white">{icon}</span>
        ) : (
          <div className="h-2 w-2 rounded-full bg-white" />
        )}
      </div>

      <div className="flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-[#333340]">{title}</h4>
          {time && <span className="flex-shrink-0 text-xs text-[#808088]">{time}</span>}
        </div>
        {description && <p className="mt-1 text-sm text-[#666673]">{description}</p>}
      </div>
    </div>
  );
}

function Timeline({ items, className, ref, ...props }: TimelineProps) {
  return (
    <div ref={ref} className={cn("space-y-0", className)} {...props}>
      {items.map((item, index) => (
        <TimelineItem key={index} {...item} isLast={index === items.length - 1} />
      ))}
    </div>
  );
}

export { Timeline, TimelineItem };
