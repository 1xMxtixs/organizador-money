import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder — will be implemented in later PRs */}
      <aside className="hidden w-64 border-r bg-muted/30 lg:block">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="text-lg font-semibold">
            💰 Finanzas
          </Link>
        </div>
        <nav className="space-y-1 p-2">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Dashboard
          </Link>
          <Link
            href="/accounts"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Cuentas
          </Link>
          <Link
            href="/transactions"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Transacciones
          </Link>
          <Link
            href="/categories"
            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Categorías
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
          <span className="text-sm text-muted-foreground lg:hidden">
            💰 Finanzas
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
