import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils";
import { badgeVariants } from "./variants";
import type { BadgeProps } from "./types";

function Badge({ className, variant, asChild = false, ref, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp className={cn(badgeVariants({ variant, className }))} ref={ref} {...props} />;
}

export { Badge };
