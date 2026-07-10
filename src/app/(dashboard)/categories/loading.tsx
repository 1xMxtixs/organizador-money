import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CategoryBadgeSkeleton() {
  return (
    <Skeleton className="h-6 w-auto min-w-[80px] rounded-full" />
  );
}

function CategoryGroupSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          <Skeleton className="h-4 w-24" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryBadgeSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CategoryGroupSkeleton key={i} />
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}