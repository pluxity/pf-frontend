import { type Ref } from "react";
import { cn } from "../../utils";

export interface NotificationItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  timestamp: string;
  read?: boolean;
  onClick?: () => void;
}

export interface NotificationCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onNotificationClick?: (id: string) => void;
  emptyMessage?: string;
  maxHeight?: number | string;
  ref?: Ref<HTMLDivElement>;
}

function NotificationCenter({
  notifications,
  onMarkAllRead,
  onNotificationClick,
  emptyMessage = "No notifications",
  maxHeight = 400,
  className,
  ref,
  ...props
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: NotificationItem) => {
    notification.onClick?.();
    onNotificationClick?.(notification.id);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "w-[380px] overflow-hidden rounded-xl border border-[#E6E6E8] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.10)]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-[#1A1A26]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[24px] items-center justify-center rounded-full bg-[#DE4545] px-2 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-brand hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="h-px bg-[#F0F0F2]" />

      <div
        className="overflow-y-auto"
        style={{ maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }}
      >
        {notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-[#808088]">
            {emptyMessage}
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(notification)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleNotificationClick(notification);
                }
              }}
              className={cn(
                "relative cursor-pointer px-5 py-4 transition-colors hover:bg-[#F5F5F7]",
                !notification.read && "bg-[#FAFAFF]"
              )}
            >
              {!notification.read && (
                <div className="absolute left-5 top-[42px] h-2 w-2 rounded-full bg-brand" />
              )}

              <div className="flex gap-3">
                {notification.icon && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xl">
                    {notification.icon}
                  </div>
                )}

                <div className={cn("flex-1", notification.icon && "pl-0")}>
                  <h4 className="text-[13px] font-bold text-[#1A1A26]">{notification.title}</h4>
                  {notification.description && (
                    <p className="mt-1 text-xs text-[#808088]">{notification.description}</p>
                  )}
                  <span className="mt-1 block text-[11px] text-[#999999]">
                    {notification.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { NotificationCenter };
