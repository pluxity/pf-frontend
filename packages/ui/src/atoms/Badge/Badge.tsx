import { cn } from "../../utils";
import { badgeVariants } from "./variants";
import type { BadgeProps } from "./types";

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
