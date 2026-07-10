"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  LandmarkIcon,
  ArrowLeftRightIcon,
  TagsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Cuentas", href: "/accounts", icon: LandmarkIcon },
  { title: "Transacciones", href: "/transactions", icon: ArrowLeftRightIcon },
  { title: "Categorías", href: "/categories", icon: TagsIcon },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-background py-2 md:hidden">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <item.icon className="size-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
