# Design: UI Design Overhaul

## Technical Approach

Modernize the UI across all dashboard pages in 5 stacked PRs (400-line budget each) to match whisper-money quality. The stack uses shadcn/ui base-nova style with `@base-ui/react` primitives. All new components follow existing base-nova patterns (CVA variants, `data-slot` attributes, `cn()` utility). No backend or data model changes — purely UI.

## Architecture Decisions

### Decision: Sidebar — shadcn sidebar component

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `npx shadcn@latest add sidebar` | Automatic base-nova compatibility, full feature set (icon collapse, mobile sheet, keyboard shortcut), but large component file (~400 lines) | **Chosen** — CLI handles base-nova styling; we customize within it |
| Manual build with @base-ui/react | Full control, smaller file, but must replicate cookie persistence, keyboard shortcuts, mobile sheet behavior from scratch | Rejected — too much reinvention for 400-line budget |
| Radix sidebar | Incompatible — project uses base-nova | Rejected |

### Decision: Theme persistence — next-themes cookie

| Option | Tradeoff | Decision |
|--------|----------|----------|
| next-themes with `localStorage` | Simple, but flash on SSR hydration | Rejected — SSR flash is a UX issue |
| next-themes with `attribute="class"` + `storageKey` | Persists via localStorage, applies `.dark` class on `<html>`, no flash with `suppressHydrationWarning` | **Chosen** — standard pattern, already a dependency |
| next-themes with `cookie` storage | Persists server-side, but requires API route | Rejected — overkill for theme |

### Decision: Mobile detection — CSS media query + JS hook

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `window.matchMedia` JS hook | Reactive, but requires client-side state | **Chosen** — shadcn sidebar already has `useIsMobile()` hook pattern |
| CSS-only `hidden md:block` | No JS overhead, but can't control Sheet open/close | Rejected — sidebar needs JS state for mobile sheet |
| Zustand store for viewport | Extra state management, unnecessary | Rejected |

### Decision: TanStack Table — manual integration

| Option | Tradeoff | Decision |
|--------|----------|----------|
| shadcn DataTable example pattern | Pre-built column definitions, sorting, filtering, pagination — well-documented | **Chosen** — matches existing shadcn patterns |
| Mantine React Table | Full-featured but adds heavy dependency | Rejected — overkill |
| Manual table with sorting | No dependency, but reinvents wheel | Rejected — TanStack is lightweight and standard |

### Decision: shadcn CLI for base-nova components

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `npx shadcn@latest add <component>` | Auto-generates base-nova styled components, respects `components.json` | **Chosen** — project already has `components.json` with `style: "base-nova"` |
| Manual copy from shadcn source | Full control, but must track upstream changes | Rejected — CLI is more maintainable |
| Radix-based components | Incompatible with base-nova | Rejected |

## Data Flow

```
PR1: ThemeProvider (root layout)
  └─ next-themes wraps <html>, toggles .dark class
  └─ ThemeToggle button in header

PR2: SidebarProvider (dashboard layout)
  ├─ AppSidebar (desktop: collapsible icon, mobile: Sheet)
  ├─ MobileNav (bottom bar, CSS media query)
  └─ SidebarTrigger in header

PR3: TanStack Table (transactions page)
  ├─ DataTable component (generic)
  ├─ Column definitions (date, desc, category, account, amount)
  └─ Sorting + filtering state (local React state)

PR4: Dashboard redesign
  ├─ Net worth chart (recharts AreaChart)
  ├─ Account cards (grid with trend indicators)
  └─ Cashflow summary (income vs expenses bar)

PR5: Polish
  ├─ Tooltips on sidebar icons
  ├─ Avatar in user menu
  ├─ Page headers with breadcrumbs
  └─ Skeleton states for all loading
```

## File Changes

### PR 1: Foundation (~380 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/app/layout.tsx` | Modify | Wrap `<html>` with `ThemeProvider` from next-themes, add `suppressHydrationWarning` |
| `src/components/theme-toggle.tsx` | Create | Dark mode toggle using `useTheme()` — button with Sun/Moon icons, cycles system/light/dark |
| `src/components/ui/skeleton.tsx` | Create | shadcn skeleton component (base-nova) — simple animated pulse div |
| `src/components/ui/separator.tsx` | Create | shadcn separator (base-nova) — horizontal/vertical line |
| `src/components/ui/dropdown-menu.tsx` | Create | shadcn dropdown-menu (base-nova) — Menu + Trigger + Content + Item |
| `src/components/ui/tooltip.tsx` | Create | shadcn tooltip (base-nova) — Tooltip + Trigger + Content |
| `src/components/ui/sheet.tsx` | Create | shadcn sheet (base-nova) — used by sidebar on mobile |

**Key patterns:**
- ThemeProvider: `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`
- ThemeToggle: `useTheme()` → `setTheme()` cycling system→light→dark
- All shadcn components use `data-slot` attributes, `cn()` utility, and `@base-ui/react` primitives

### PR 2: Sidebar (~390 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/sidebar.tsx` | Create | Full shadcn sidebar component (base-nova) — SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarTrigger, SidebarInset, useSidebar |
| `src/components/layout/app-sidebar.tsx` | Create | Application sidebar — navigation items with lucide icons, active state, brand header |
| `src/components/layout/mobile-nav.tsx` | Create | Bottom navigation bar — fixed on mobile, shows 4 nav items with icons |
| `src/hooks/use-mobile.ts` | Create | `useIsMobile()` hook — `window.matchMedia("(max-width: 768px)")` reactive |
| `src/app/(dashboard)/layout.tsx` | Modify | Replace placeholder aside with SidebarProvider + AppSidebar + SidebarInset + MobileNav |
| `src/components/layout/breadcrumb-nav.tsx` | Create | Dynamic breadcrumb based on pathname segments |

**Key patterns:**
- Sidebar: `collapsible="icon"` on desktop, Sheet-based on mobile
- MobileNav: `fixed bottom-0 left-0 right-0 md:hidden` with 4 nav items
- Active state: `usePathname()` comparison against nav item href
- Cookie persistence: `SIDEBAR_COOKIE_NAME = "sidebar_state"` (from shadcn sidebar)

### PR 3: Data Table (~395 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/components/ui/data-table.tsx` | Create | Generic DataTable component wrapping TanStack Table — accepts columns + data, renders with shadcn Table |
| `src/components/transactions/transaction-columns.tsx` | Create | Column definitions for transactions — date, description, category, account, amount with sorting |
| `src/components/transactions/transaction-table.tsx` | Modify | Replace manual table with DataTable using column definitions |
| `src/app/(dashboard)/transactions/page.tsx` | Modify | Integrate DataTable, add skeleton loading state, update filter integration |
| `src/app/(dashboard)/transactions/loading.tsx` | Create | Skeleton loading state for transactions page |

**Key patterns:**
- TanStack Table: `useReactTable` with `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`
- Column defs: `accessorFn` for computed values, custom `cell` renderers for formatting
- Sorting: Client-side sorting via column header clicks
- Integration: Existing `fetchTransactions` + `filters` state remains unchanged

### PR 4: Dashboard Redesign (~385 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/components/dashboard/balance-card.tsx` | Modify | Add trend indicator (up/down arrow + percentage), AccountCard grid |
| `src/components/dashboard/balance-line-chart.tsx` | Modify | Upgrade to AreaChart with gradient fill, better axis formatting |
| `src/components/dashboard/cashflow-summary.tsx` | Create | New component: income vs expenses comparison bar chart |
| `src/components/dashboard/account-cards.tsx` | Create | Grid of account balance cards with trend indicators |
| `src/components/dashboard/dashboard-content.tsx` | Modify | Reorganize layout: net worth → account cards → charts → cashflow → top categories |
| `src/app/(dashboard)/page.tsx` | Modify | Add skeleton loading state for dashboard |

**Key patterns:**
- Charts: Recharts with CSS variable colors for dark mode compatibility
- Account cards: Grid layout `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- Cashflow: BarChart with income (green) vs expenses (red) side-by-side
- All existing data fetching preserved — just UI reorganization

### PR 5: Polish (~370 lines)

| File | Action | Description |
|------|--------|-------------|
| `src/components/auth/user-menu.tsx` | Modify | Add Avatar component, dropdown menu for sign out |
| `src/components/ui/avatar.tsx` | Create | shadcn avatar (base-nova) — Image + Fallback |
| `src/components/layout/page-header.tsx` | Create | Reusable page header with title, description, breadcrumbs, action slot |
| `src/app/(dashboard)/accounts/page.tsx` | Modify | Add skeleton loading, page header |
| `src/app/(dashboard)/accounts/[id]/page.tsx` | Modify | Add skeleton loading |
| `src/app/(dashboard)/categories/page.tsx` | Modify | Add skeleton loading, page header |
| `src/app/(dashboard)/accounts/loading.tsx` | Create | Skeleton for accounts page |
| `src/app/(dashboard)/categories/loading.tsx` | Create | Skeleton for categories page |
| Various dashboard components | Modify | Add skeleton variants for loading states |

**Key patterns:**
- Skeleton states: Match final layout structure (card skeleton, table skeleton)
- PageHeader: `title`, `description`, `children` (actions) props
- Avatar: `className="size-8"` with user initial fallback

## Interfaces / Contracts

```typescript
// Theme toggle (PR1)
interface ThemeToggleProps {
  className?: string;
}

// Sidebar navigation items (PR2)
interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
}

// DataTable generic props (PR3)
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
}

// Account card with trend (PR4)
interface AccountCardProps {
  account: {
    id: string;
    name: string;
    type: AccountType;
    bankName?: string | null;
    balance?: number;
    currencyCode: string;
  };
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
}

// Page header (PR5)
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Skeleton renders, ThemeToggle cycles themes | Vitest + Testing Library |
| Integration | Sidebar navigation active state, DataTable sorting | Vitest with mock pathname/data |
| Visual | Dark mode toggle, sidebar collapse, mobile bottom nav | Manual verification after each PR |
| Regression | All existing CRUD operations still work | Manual smoke test per page |

## Migration / Rollout

No data migration required. Each PR is independently revertible. Feature branch `feature/ui-design-overhaul` with stacked PRs targeting main.

## Open Questions

- [ ] Verify `npx shadcn@latest add sidebar` works with existing `components.json` base-nova config — if it fails, manually create sidebar.tsx from shadcn source
- [ ] Confirm `next-themes` works with App Router's `<html>` tag (needs `suppressHydrationWarning`)
- [ ] Check if TanStack Table's `getSortedRowModel` + `getFilteredRowModel` adds significant bundle size (expected minimal)
