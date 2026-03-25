import { type AnchorHTMLAttributes, type Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";
import { ExternalLink as ExternalLinkIcon } from "../Icon";

const linkVariants = cva(
  "inline-flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
      variant: {
        default: [
          "text-brand dark:text-primary-400",
          "hover:text-primary-700 hover:underline dark:hover:text-primary-300",
          "visited:text-primary-700 dark:visited:text-primary-300",
        ],
        muted: [
          "text-secondary dark:text-dark-text-secondary",
          "hover:text-primary hover:underline dark:hover:text-dark-text-primary",
        ],
      },
      disabled: {
        true: "text-placeholder pointer-events-none cursor-not-allowed dark:text-dark-text-placeholder",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      disabled: false,
    },
  }
);

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  ref?: Ref<HTMLAnchorElement>;
  external?: boolean;
  disabled?: boolean;
}

function Link({
  className,
  size,
  variant,
  disabled = false,
  external = false,
  children,
  ref,
  ...props
}: LinkProps) {
  return (
    <a
      ref={ref}
      className={cn(linkVariants({ size, variant, disabled }), className)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-disabled={disabled}
      {...props}
    >
      {children}
      {external && <ExternalLinkIcon size="xs" />}
    </a>
  );
}

export { Link, linkVariants };
