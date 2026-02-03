import { type Ref } from "react";
import { cn } from "../../utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  ref?: Ref<HTMLTableElement>;
}

function Table({ className, ref, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto border-y border-t-2 border-neutral-300">
      <table ref={ref} className={cn("w-full caption-bottom text-xs", className)} {...props} />
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableHeader({ className, ref, ...props }: TableHeaderProps) {
  return (
    <thead ref={ref} className={cn("bg-neutral-200/90 [&_tr]:border-b", className)} {...props} />
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
        "border-t border-neutral-300 text-xs font-bold [&>tr]:last:border-b-0",
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
        "h-9 border-b border-neutral-300 transition-colors data-[state=selected]:bg-blue-50",
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
        "h-9 px-4 text-center align-middle text-xs font-bold text-muted border-r border-neutral-300 last:border-r-0 [&:has([role=checkbox])]:pr-0",
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
        "px-4 py-3 align-middle text-center text-xs text-secondary border-r border-neutral-300 last:border-r-0 [&:has([role=checkbox])]:pr-0",
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
  return <caption ref={ref} className={cn("mt-4 text-xs text-secondary", className)} {...props} />;
}

interface TableStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "active" | "inactive" | "pending";
  ref?: Ref<HTMLSpanElement>;
}

function TableStatusBadge({ status, className, children, ref, ...props }: TableStatusBadgeProps) {
  const statusClasses = {
    active: "bg-success-brand text-white",
    inactive: "bg-neutral-50 text-text-secondary",
    pending: "bg-warning-brand text-white",
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
