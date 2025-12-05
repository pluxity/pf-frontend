import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils";
import { buttonVariants } from "./variants";
import type { ButtonProps } from "./types";

function Button({ className, variant, size, asChild = false, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
}

export { Button };
