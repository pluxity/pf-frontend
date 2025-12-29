import type { Ref } from "react";
import { cn } from "../../utils";
import type { WidgetProps, WidgetHeaderProps, WidgetContentProps } from "./types";

interface WidgetPropsWithRef extends WidgetProps {
  ref?: Ref<HTMLDivElement>;
}

function Widget({
  colSpan,
  rowSpan,
  title,
  border = true,
  className,
  contentClassName,
  children,
  style,
  ref,
  ...props
}: WidgetPropsWithRef) {
  const gridStyle = {
    ...style,
    ...(colSpan && { gridColumn: `span ${colSpan}` }),
    ...(rowSpan && { gridRow: `span ${rowSpan}` }),
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl bg-white shadow-card",
        border && "border border-border-light",
        className
      )}
      style={gridStyle}
      {...props}
    >
      {title && <WidgetHeader>{title}</WidgetHeader>}
      <WidgetContent className={contentClassName}>{children}</WidgetContent>
    </div>
  );
}

interface WidgetHeaderPropsWithRef extends WidgetHeaderProps {
  ref?: Ref<HTMLDivElement>;
}

function WidgetHeader({ className, children, ref, ...props }: WidgetHeaderPropsWithRef) {
  return (
    <div
      ref={ref}
      className={cn(
        "px-4 py-3 border-b border-border-light",
        "text-sm font-semibold text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface WidgetContentPropsWithRef extends WidgetContentProps {
  ref?: Ref<HTMLDivElement>;
}

function WidgetContent({ className, children, ref, ...props }: WidgetContentPropsWithRef) {
  return (
    <div ref={ref} className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
}

export { Widget, WidgetHeader, WidgetContent };
