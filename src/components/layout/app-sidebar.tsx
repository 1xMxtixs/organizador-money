"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  LandmarkIcon,
  ArrowLeftRightIcon,
  TagsIcon,
  PiggyBankIcon,
  TargetIcon,
  CreditCardIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Cuentas", href: "/accounts", icon: LandmarkIcon },
  { title: "Transacciones", href: "/transactions", icon: ArrowLeftRightIcon },
  { title: "Categorías", href: "/categories", icon: TagsIcon },
  { title: "Presupuestos", href: "/budgets", icon: PiggyBankIcon },
  { title: "Metas de Ahorro", href: "/savings-goals", icon: TargetIcon },
  { title: "Deudas", href: "/debts", icon: CreditCardIcon },
  { title: "Patrimonio", href: "/net-worth", icon: TrendingUpIcon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-lg font-semibold tracking-tight text-sidebar-foreground"
        >
          <span className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
            $
          </span>
          <span className="group-data-[collapsible=icon]/sidebar:hidden">
            Finanzas
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuButton
                key={item.href}
                tooltip={item.title}
                isActive={isActive}
                render={<Link href={item.href} />}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]/sidebar:hidden">
                  {item.title}
                </span>
              </SidebarMenuButton>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
