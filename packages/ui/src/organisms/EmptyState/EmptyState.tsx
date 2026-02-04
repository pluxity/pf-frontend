import { type ReactNode, type Ref } from "react";
import { Inbox, Database, SearchX } from "../../atoms/Icon";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: "empty-inbox" | "no-data" | "no-results" | "custom";
  icon?: React.ReactNode;
  title?: ReactNode;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  ref?: Ref<HTMLDivElement>;
}

const defaultProps = {
  "empty-inbox": {
    icon: <Inbox size={48} />,
    title: "받은 메시지 없음",
    description: "새로운 메시지가 없습니다.",
  },
  "no-data": {
    icon: <Database size={48} />,
    title: "데이터 없음",
    description: "표시할 데이터가 없습니다.",
  },
  "no-results": {
    icon: <SearchX size={48} />,
    title: "검색 결과 없음",
    description: "검색어나 필터를 조정해 보세요.",
  },
  custom: {
    icon: null,
    title: "",
    description: "",
  },
};

function EmptyState({
  variant = "no-data",
  icon,
  title,
  description,
  action,
  className,
  ref,
  ...props
}: EmptyStateProps) {
  const defaults = defaultProps[variant];
  const displayIcon = icon ?? defaults.icon;
  const displayTitle = title ?? defaults.title;
  const displayDescription = description ?? defaults.description;

  return (
    <div
      ref={ref}
      className={cn("flex flex-col items-center justify-center px-4 py-16 text-center", className)}
      {...props}
    >
      {displayIcon && <div className="mb-4 text-neutral-300">{displayIcon}</div>}
      {displayTitle && <h3 className="mb-2 text-lg font-bold text-secondary">{displayTitle}</h3>}
      {displayDescription && (
        <p className="mb-6 max-w-sm text-sm text-muted">{displayDescription}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

export { EmptyState };
