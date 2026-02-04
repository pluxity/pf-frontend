import { createContext, useContext, type ReactNode } from "react";
import { cn } from "../../utils";

interface NotificationCenterContextValue {
  onNotificationClick?: (id: string) => void;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(null);

const useNotificationCenterContext = () => {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error(
      "NotificationCenter compound components must be used within NotificationCenter"
    );
  }
  return context;
};

export interface NotificationCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Children (composition pattern) */
  children?: React.ReactNode;
  /** Callback when notification is clicked */
  onNotificationClick?: (id: string) => void;
  /** Maximum height of notification list */
  maxHeight?: number | string;
}

export interface NotificationCenterHeaderProps {
  /** Header content */
  children?: React.ReactNode;
  className?: string;
}

export interface NotificationCenterUnreadBadgeProps {
  /** Unread count */
  count: number;
  className?: string;
}

export interface NotificationCenterMarkAllReadProps {
  /** Click handler */
  onClick?: () => void;
  /** Button text */
  children?: React.ReactNode;
  className?: string;
}

export interface NotificationCenterItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Notification ID */
  id: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Notification title */
  title: ReactNode;
  /** Notification description */
  description?: string;
  /** Timestamp text */
  timestamp: string;
  /** Read status */
  read?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface NotificationCenterEmptyProps {
  /** Empty message */
  children?: React.ReactNode;
  className?: string;
}

export interface NotificationCenterCustomProps {
  /** Custom content */
  children: React.ReactNode;
  className?: string;
}

function NotificationCenterHeader({ children, className }: NotificationCenterHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-5 py-4", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-primary">Notifications</h3>
        {children}
      </div>
    </div>
  );
}

function NotificationCenterUnreadBadge({ count, className }: NotificationCenterUnreadBadgeProps) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "flex h-5 min-w-6 items-center justify-center rounded-full bg-error-500 px-2 text-xs font-bold text-white",
        className
      )}
    >
      {count}
    </span>
  );
}

function NotificationCenterMarkAllRead({
  onClick,
  children = "Mark all read",
  className,
}: NotificationCenterMarkAllReadProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("text-xs text-brand hover:underline", className)}
    >
      {children}
    </button>
  );
}

function NotificationCenterItem({
  id,
  icon,
  title,
  description,
  timestamp,
  read = false,
  onClick,
  className,
  ...props
}: NotificationCenterItemProps) {
  const { onNotificationClick } = useNotificationCenterContext();

  const handleClick = () => {
    onClick?.();
    onNotificationClick?.(id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      className={cn(
        "relative cursor-pointer px-5 py-4 transition-colors hover:bg-neutral-50",
        !read && "bg-neutral-50",
        className
      )}
      {...props}
    >
      {!read && <div className="absolute left-5 top-[2.625rem] h-2 w-2 rounded-full bg-brand" />}

      <div className="flex gap-3">
        {icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xl">
            {icon}
          </div>
        )}

        <div className={cn("flex-1", icon && "pl-0")}>
          <h4 className="text-sm font-bold text-primary">{title}</h4>
          {description && <p className="mt-1 text-xs text-muted">{description}</p>}
          <span className="mt-1 block text-xs text-placeholder">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}

function NotificationCenterEmpty({
  children = "No notifications",
  className,
}: NotificationCenterEmptyProps) {
  return (
    <div className={cn("flex h-32 items-center justify-center text-sm text-muted", className)}>
      {children}
    </div>
  );
}

function NotificationCenterCustom({ children, className }: NotificationCenterCustomProps) {
  return <div className={className}>{children}</div>;
}

function NotificationCenter({
  children,
  onNotificationClick,
  maxHeight = 400,
  className,
  ...props
}: NotificationCenterProps) {
  const contextValue: NotificationCenterContextValue = {
    onNotificationClick,
  };

  return (
    <NotificationCenterContext.Provider value={contextValue}>
      <div
        className={cn(
          "w-96 overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-[0_0.25rem_0.75rem_rgba(0,0,0,0.10)]",
          className
        )}
        {...props}
      >
        <div
          className="overflow-y-auto"
          style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
        >
          {children}
        </div>
      </div>
    </NotificationCenterContext.Provider>
  );
}

NotificationCenter.Header = NotificationCenterHeader;
NotificationCenter.UnreadBadge = NotificationCenterUnreadBadge;
NotificationCenter.MarkAllRead = NotificationCenterMarkAllRead;
NotificationCenter.Item = NotificationCenterItem;
NotificationCenter.Empty = NotificationCenterEmpty;
NotificationCenter.Custom = NotificationCenterCustom;

export { NotificationCenter, useNotificationCenterContext };
