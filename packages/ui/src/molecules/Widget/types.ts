import type { HTMLAttributes, ReactNode } from "react";

export interface WidgetProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  colSpan?: number;
  rowSpan?: number;
  title?: ReactNode;
  border?: boolean;
  contentClassName?: string;
  children: ReactNode;
}

export type WidgetHeaderProps = HTMLAttributes<HTMLDivElement>;

export type WidgetContentProps = HTMLAttributes<HTMLDivElement>;
