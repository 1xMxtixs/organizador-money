import type { CategoryType } from "@/lib/validations/category";

interface CategoryBadgeProps {
  category: {
    icon: string;
    name: string;
    color: string;
    type: CategoryType;
  };
}

const typeBg: Record<CategoryType, string> = {
  expense: "bg-red-50 border-red-200",
  income: "bg-green-50 border-green-200",
  saving: "bg-blue-50 border-blue-200",
  investment: "bg-purple-50 border-purple-200",
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${typeBg[category.type]}`}
    >
      <span className="text-sm">{category.icon}</span>
      <span>{category.name}</span>
    </span>
  );
}
