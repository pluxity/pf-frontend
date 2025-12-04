import { type Ref } from "react";
import { cn } from "../../utils";

export interface NavItemProps {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface NavigationBarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoText?: string;
  items?: NavItemProps[];
  actions?: React.ReactNode;
  ref?: Ref<HTMLElement>;
}

function NavigationBar({ className, logo, logoText = "Logo", items = [], actions, ref, ...props }: NavigationBarProps) {
  return (
    <nav
      ref={ref}
      className={cn(
        "flex h-16 w-full items-center justify-between border-b border-[#E6E6E8] bg-white px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-8">
        {logo || (
          <span className="text-xl font-bold text-brand">{logoText}</span>
        )}

        {items.length > 0 && (
          <div className="flex items-center gap-6">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={item.onClick}
                className={cn(
                  "text-sm transition-colors",
                  item.active
                    ? "font-bold text-brand"
                    : "font-medium text-[#666673] hover:text-brand"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </nav>
  );
}

export { NavigationBar };
