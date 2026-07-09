"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, HouseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const labelMap: Record<string, string> = {
  accounts: "Cuentas",
  transactions: "Transacciones",
  categories: "Categorías",
};

function formatSegment(segment: string): string {
  // Try known label or format it nicely
  if (labelMap[segment]) return labelMap[segment];
  // Convert kebab-case to Title Case
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function BreadcrumbNav() {
  const pathname = usePathname();

  // Skip root "/" — no breadcrumb needed on the dashboard
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/"
        className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <HouseIcon className="size-4" />
        <span className="sr-only">Dashboard</span>
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = formatSegment(segment);

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
            {isLast ? (
              <span
                className={cn(
                  "truncate",
                  "text-foreground font-medium",
                  "max-w-[120px] sm:max-w-[200px]",
                )}
                aria-current="page"
              >
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
