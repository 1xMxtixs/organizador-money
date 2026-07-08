import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface CategoryRank {
  name: string;
  icon: string;
  amount: number;
  percentage: number;
}

interface TopCategoriesProps {
  categories: CategoryRank[];
}

export function TopCategories({ categories }: TopCategoriesProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top categorías de gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sin datos este mes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Top categorías de gasto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((cat, i) => (
          <div key={cat.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>
                {i + 1}. {cat.icon} {cat.name}
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(cat.amount)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
