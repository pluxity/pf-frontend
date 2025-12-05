import { type AnchorHTMLAttributes, type Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

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
        default: ["text-brand", "hover:text-blue-700 hover:underline", "visited:text-purple-600"],
        muted: ["text-gray-500", "hover:text-gray-700 hover:underline"],
      },
      disabled: {
        true: "text-gray-400 pointer-events-none cursor-not-allowed",
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
      {external && (
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </a>
  );
}

export { Link, linkVariants };
