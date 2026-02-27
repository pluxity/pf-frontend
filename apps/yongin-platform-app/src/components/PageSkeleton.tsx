import { Skeleton } from "@pf-dev/ui/atoms";

function CardSkeleton() {
  return <Skeleton variant="card" className="h-full w-full bg-surface-skeleton" />;
}

function CenterSkeleton() {
  return (
    <Skeleton variant="card" className="h-full w-full bg-surface-skeleton rounded-[0.9375rem]" />
  );
}

export function PageSkeleton() {
  return (
    <div className="grid grid-cols-[20rem_1fr_20rem] gap-5 px-5 pt-5 pb-[0.9375rem] h-full">
      <div className="grid grid-rows-[repeat(3,18.75rem)] content-center gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <CenterSkeleton />

      <div className="grid grid-rows-[repeat(3,18.75rem)] content-center gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
