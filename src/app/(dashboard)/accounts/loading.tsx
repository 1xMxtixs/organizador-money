import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function AccountCardSkeleton() {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-3 w-32 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-36 mt-2" />
      </CardContent>
    </Card>
  );
}

export default function AccountsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AccountCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}