import { Skeleton } from "@pf-dev/ui/atoms";

function CardSkeleton() {
  return <Skeleton variant="card" className="h-full w-full bg-surface-skeleton" />;
}

export function PageSkeleton() {
  return (
    <div className="grid grid-cols-[20rem_1fr_20rem] gap-4 px-4 py-2 h-full">
      <div className="grid grid-rows-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <CardSkeleton />

      <div className="grid grid-rows-3 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
