import type { Ref } from "react";
import { cn } from "../../utils";
import type {
  BreadcrumbProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbSeparatorProps,
  BreadcrumbPageProps,
} from "./types";

interface BreadcrumbPropsWithRef extends BreadcrumbProps {
  ref?: Ref<HTMLElement>;
}

function Breadcrumb({ className, ref, ...props }: BreadcrumbPropsWithRef) {
  return <nav ref={ref} aria-label="breadcrumb" className={cn(className)} {...props} />;
}

interface BreadcrumbListPropsWithRef extends BreadcrumbListProps {
  ref?: Ref<HTMLOListElement>;
}

function BreadcrumbList({ className, ref, ...props }: BreadcrumbListPropsWithRef) {
  return (
    <ol
      ref={ref}
      className={cn(
        "flex h-10 flex-wrap items-center gap-2 break-words text-sm text-secondary dark:text-dark-text-secondary",
        className
      )}
      {...props}
    />
  );
}

interface BreadcrumbItemPropsWithRef extends BreadcrumbItemProps {
  ref?: Ref<HTMLLIElement>;
}

function BreadcrumbItem({ className, ref, ...props }: BreadcrumbItemPropsWithRef) {
  return <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
}

interface BreadcrumbLinkPropsWithRef extends BreadcrumbLinkProps {
  ref?: Ref<HTMLAnchorElement>;
}

function BreadcrumbLink({ className, ref, ...props }: BreadcrumbLinkPropsWithRef) {
  return (
    <a
      ref={ref}
      className={cn(
        "transition-colors hover:text-primary hover:underline dark:hover:text-dark-text-primary",
        className
      )}
      {...props}
    />
  );
}

interface BreadcrumbSeparatorPropsWithRef extends BreadcrumbSeparatorProps {
  ref?: Ref<HTMLLIElement>;
}

function BreadcrumbSeparator({
  className,
  children,
  ref,
  ...props
}: BreadcrumbSeparatorPropsWithRef) {
  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("text-placeholder dark:text-dark-text-placeholder", className)}
      {...props}
    >
      {children ?? "/"}
    </li>
  );
}

interface BreadcrumbPagePropsWithRef extends BreadcrumbPageProps {
  ref?: Ref<HTMLSpanElement>;
}

function BreadcrumbPage({ className, ref, ...props }: BreadcrumbPagePropsWithRef) {
  return (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-bold text-primary dark:text-dark-text-primary", className)}
      {...props}
    />
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
};
