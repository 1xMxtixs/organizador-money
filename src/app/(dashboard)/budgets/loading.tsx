import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BudgetsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-7 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
