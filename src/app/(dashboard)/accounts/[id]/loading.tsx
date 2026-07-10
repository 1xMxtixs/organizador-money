import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-48" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 justify-end">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}