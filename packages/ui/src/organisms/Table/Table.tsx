import { type Ref } from "react";
import { cn } from "../../utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  ref?: Ref<HTMLTableElement>;
}

function Table({ className, ref, ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-[#E6E6E8]">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

function TableHeader({ className, ref, ...props }: TableHeaderProps) {
  return <thead ref={ref} className={cn("bg-[#FAFAFC] [&_tr]:border-b", className)} {...props} />;
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
        "border-t border-[#E6E6E8] bg-[#FAFAFC] font-medium [&>tr]:last:border-b-0",
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
        "h-12 border-b border-[#E6E6E8] transition-colors hover:bg-gray-50 data-[state=selected]:bg-blue-50",
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
        "h-11 px-4 text-left align-middle text-[13px] font-bold text-[#666673] [&:has([role=checkbox])]:pr-0",
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
        "px-4 py-3 align-middle text-sm text-[#333340] [&:has([role=checkbox])]:pr-0",
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
  return <caption ref={ref} className={cn("mt-4 text-sm text-[#808088]", className)} {...props} />;
}

interface TableStatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "active" | "inactive" | "pending";
  ref?: Ref<HTMLSpanElement>;
}

function TableStatusBadge({ status, className, children, ref, ...props }: TableStatusBadgeProps) {
  const statusClasses = {
    active: "bg-success-brand text-white",
    inactive: "bg-[#E6E6E8] text-[#808088]",
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
      className={cn("text-sm font-medium text-brand hover:underline focus:outline-none", className)}
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
