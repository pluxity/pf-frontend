import { cn } from "../../utils";

export interface NavigationBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo element (or use logoText for default) */
  logo?: React.ReactNode;
  /** Logo text (used if logo not provided) */
  logoText?: string;
  /** Children (composition pattern) */
  children?: React.ReactNode;
  /** Actions element (buttons, user menu, etc) */
  actions?: React.ReactNode;
}

export interface NavigationBarItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Item label */
  children: React.ReactNode;
  /** Link href */
  href?: string;
  /** Active state */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export interface NavigationBarLogoProps {
  /** Logo content */
  children: React.ReactNode;
  className?: string;
}

export interface NavigationBarActionsProps {
  /** Actions content */
  children: React.ReactNode;
  className?: string;
}

function NavigationBarItem({
  children,
  href,
  active,
  onClick,
  className,
  ...props
}: NavigationBarItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm transition-colors",
        active
          ? "font-bold text-brand dark:text-primary-400"
          : "font-medium text-muted hover:text-brand dark:text-dark-text-muted dark:hover:text-primary-400",
        className
      )}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

function NavigationBarLogo({ children, className }: NavigationBarLogoProps) {
  return <div className={cn("flex items-center", className)}>{children}</div>;
}

function NavigationBarActions({ children, className }: NavigationBarActionsProps) {
  return <div className={cn("flex items-center gap-3", className)}>{children}</div>;
}

function NavigationBar({
  className,
  logo,
  logoText = "Logo",
  children,
  actions,
  ...props
}: NavigationBarProps) {
  return (
    <nav
      className={cn(
        "flex h-16 w-full items-center justify-between border-b border-neutral-100 bg-white px-6",
        "dark:border-dark-border-default dark:bg-dark-bg-secondary",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-8">
        {logo || (
          <span className="text-xl font-bold text-brand dark:text-primary-400">{logoText}</span>
        )}

        {children && <div className="flex items-center gap-6">{children}</div>}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </nav>
  );
}

NavigationBar.Item = NavigationBarItem;
NavigationBar.Logo = NavigationBarLogo;
NavigationBar.Actions = NavigationBarActions;

export { NavigationBar };
