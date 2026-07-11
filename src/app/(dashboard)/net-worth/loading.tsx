import { Skeleton } from "@/components/ui/skeleton";

export default function NetWorthLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="h-24 animate-pulse rounded-lg bg-muted" />
      <div className="h-[300px] animate-pulse rounded-lg bg-muted" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
