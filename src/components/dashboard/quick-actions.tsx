import Link from "next/link";
import { Plus } from "lucide-react";

export function QuickActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Link
        href="/transactions/new"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/80"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
