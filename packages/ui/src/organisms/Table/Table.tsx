import { type Ref } from "react";
import { cn } from "../../utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  ref?: Ref<HTMLTableElement>;
}

function Table({ className, ref, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto border-y border-t-2 border-neutral-300 dark:border-neutral-600">
      <table ref={ref} className={cn("w-full caption-bottom text-xs", className)} {...props} />
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableHeader({ className, ref, ...props }: TableHeaderProps) {
  return (
    <thead
      ref={ref}
      className={cn("bg-neutral-200/90 dark:bg-neutral-800 [&_tr]:border-b", className)}
      {...props}
    />
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableBody({ className, ref, ...props }: TableBodyProps) {
  return <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableFooter({ className, ref, ...props }: TableFooterProps) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        "border-t border-neutral-300 dark:border-neutral-600 text-xs font-bold [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  ref?: Ref<HTMLTableRowElement>;
}

function TableRow({ className, ref, ...props }: TableRowProps) {
  return (
    <tr
      ref={ref}
      className={cn(
        "h-9 border-b border-neutral-300 dark:border-neutral-600 transition-colors data-[state=selected]:bg-primary-50 dark:data-[state=selected]:bg-primary-900/30",
        className
      )}
      {...props}
    />
  );
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
}

function TableHead({ className, ref, ...props }: TableHeadProps) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-9 px-4 text-center align-middle text-xs font-bold text-muted dark:text-dark-text-muted border-r border-neutral-300 dark:border-neutral-600 last:border-r-0 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
}

function TableCell({ className, ref, ...props }: TableCellProps) {
  return (
    <td
      ref={ref}
      className={cn(
        "px-4 py-3 align-middle text-center text-xs text-secondary dark:text-dark-text-secondary border-r border-neutral-300 dark:border-neutral-600 last:border-r-0 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  ref?: Ref<HTMLTableCaptionElement>;
}

function TableCaption({ className, ref, ...props }: TableCaptionProps) {
  return (
    <caption
      ref={ref}
      className={cn("mt-4 text-xs text-muted dark:text-dark-text-muted", className)}
      {...props}
    />
  );
}

interface TableStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status:
    | "active"
    | "inactive"
    | "pending"
    | "severity-normal"
    | "severity-caution"
    | "severity-warning"
    | "severity-danger";
  ref?: Ref<HTMLSpanElement>;
}

function TableStatusBadge({ status, className, children, ref, ...props }: TableStatusBadgeProps) {
  const statusClasses = {
    active: "bg-success-brand text-white",
    inactive: "bg-neutral-50 text-secondary dark:bg-neutral-700 dark:text-dark-text-secondary",
    pending: "bg-warning-brand text-white",
    "severity-normal":
      "bg-severity-normal-100 text-severity-normal-700 dark:bg-severity-normal-900 dark:text-severity-normal-300",
    "severity-caution":
      "bg-severity-caution-100 text-severity-caution-700 dark:bg-severity-caution-900 dark:text-severity-caution-300",
    "severity-warning":
      "bg-severity-warning-100 text-severity-warning-700 dark:bg-severity-warning-900 dark:text-severity-warning-300",
    "severity-danger":
      "bg-severity-danger-100 text-severity-danger-700 dark:bg-severity-danger-900 dark:text-severity-danger-300",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
        statusClasses[status],
        className
      )}
      {...props}
    >
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface TableActionLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
}

function TableActionLink({ className, ref, ...props }: TableActionLinkProps) {
  return (
    <button
      ref={ref}
      className={cn("text-xs text-brand hover:underline focus:outline-none", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableStatusBadge,
  TableActionLink,
};
