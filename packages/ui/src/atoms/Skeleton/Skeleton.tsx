import { cn } from "../../utils";
import { skeletonVariants } from "./variants";
import type { SkeletonProps } from "./types";

function Skeleton({ className, variant, size, ref, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Skeleton };
