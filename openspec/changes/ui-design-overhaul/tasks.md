# Tasks: UI Design Overhaul

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1920 total across 5 PRs (avg 384/PR) |
| 400-line budget risk | Medium — PR 2 (sidebar) and PR 3 (data table) are tight |
| Chained PRs recommended | No — design already proposes 5 stacked PRs within budget |
| Suggested split | 5 stacked PRs as designed (PR 1 → PR 2 → PR 3 → PR 4 → PR 5) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: theme + shadcn base components | PR 1 | Base branch: main. All subsequent PRs depend on these components |
| 2 | Sidebar + mobile nav | PR 2 | Depends on PR 1 (sheet, tooltip, separator). Base: PR 1 branch |
| 3 | Data table with TanStack | PR 3 | Depends on PR 1 (dropdown-menu). Base: PR 2 branch |
| 4 | Dashboard redesign | PR 4 | Depends on PR 1 (skeleton). Base: PR 3 branch |
| 5 | Polish: avatar, page headers, skeletons | PR 5 | Depends on PR 1 (skeleton, tooltip). Base: PR 4 branch |

---

## PR 1: Foundation (~380 lines)

- [ ] 1.1 Install dependencies: `next-themes` (verify installed), `@tanstack/react-table` (for PR 3)
- [ ] 1.2 Create `src/components/ui/skeleton.tsx` — animated pulse div, base-nova style (`data-slot`, `cn()`)
- [ ] 1.3 Create `src/components/ui/separator.tsx` — horizontal/vertical line, base-nova
- [ ] 1.4 Create `src/components/ui/dropdown-menu.tsx` — Menu + Trigger + Content + Item, @base-ui/react primitives
- [ ] 1.5 Create `src/components/ui/tooltip.tsx` — Tooltip + Trigger + Content, @base-ui/react primitives
- [ ] 1.6 Create `src/components/ui/sheet.tsx` — Sheet + Trigger + Content (side variants), @base-ui/react primitives
- [ ] 1.7 Create `src/components/theme-toggle.tsx` — Sun/Moon icons, `useTheme()` cycling system→light→dark
- [ ] 1.8 Modify `src/app/layout.tsx` — wrap `<html>` with `ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`, add `suppressHydrationWarning`

### PR 1 File Manifest

| File | Action | ~Lines |
|------|--------|--------|
| `src/components/ui/skeleton.tsx` | Create | ~15 |
| `src/components/ui/separator.tsx` | Create | ~25 |
| `src/components/ui/dropdown-menu.tsx` | Create | ~120 |
| `src/components/ui/tooltip.tsx` | Create | ~55 |
| `src/components/ui/sheet.tsx` | Create | ~110 |
| `src/components/theme-toggle.tsx` | Create | ~40 |
| `src/app/layout.tsx` | Modify | ~15 changed |
| **Total** | | **~380** |

### PR 1 Verification
- Dark mode toggle visible in browser, cycles through system/light/dark
- `suppressHydrationWarning` prevents SSR flash
- Each shadcn component renders without errors
- `npx shadcn@latest add` attempted first — fallback to manual if base-nova fails

---

## PR 2: Sidebar (~390 lines)

- [ ] 2.1 Create `src/hooks/use-mobile.ts` — `useIsMobile()` via `window.matchMedia("(max-width: 768px)")` reactive
- [ ] 2.2 Create `src/components/ui/sidebar.tsx` — full shadcn sidebar (base-nova): SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarHeader, SidebarFooter, useSidebar. Cookie persistence with `SIDEBAR_COOKIE_NAME = "sidebar_state"`
- [ ] 2.3 Create `src/components/layout/app-sidebar.tsx` — navigation items (Dashboard, Cuentas, Transacciones, Categorías) with lucide icons, active state via `usePathname()`, brand header
- [ ] 2.4 Create `src/components/layout/mobile-nav.tsx` — fixed bottom bar `md:hidden`, 4 nav items with icons + labels, active state highlight
- [ ] 2.5 Create `src/components/layout/breadcrumb-nav.tsx` — dynamic breadcrumb from pathname segments
- [ ] 2.6 Modify `src/app/(dashboard)/layout.tsx` — replace placeholder `<aside>` with `SidebarProvider > AppSidebar + SidebarInset > SidebarTrigger + BreadcrumbNav + UserMenu`, add `MobileNav`

### PR 2 File Manifest

| File | Action | ~Lines |
|------|--------|--------|
| `src/hooks/use-mobile.ts` | Create | ~15 |
| `src/components/ui/sidebar.tsx` | Create | ~250 |
| `src/components/layout/app-sidebar.tsx` | Create | ~55 |
| `src/components/layout/mobile-nav.tsx` | Create | ~45 |
| `src/components/layout/breadcrumb-nav.tsx` | Create | ~30 |
| `src/app/(dashboard)/layout.tsx` | Modify | ~40 changed |
| **Total** | | **~390** |

### PR 2 Verification
- Sidebar collapses to icons on desktop (click trigger or Cmd+B)
- Sidebar shows as Sheet overlay on mobile (< 768px)
- MobileNav visible only on mobile, fixed to bottom
- Active nav item highlighted based on current route
- Sidebar state persists across page reloads (cookie)

---

## PR 3: Data Table (~395 lines)

- [x] 3.1 Create `src/components/ui/data-table.tsx` — generic DataTable wrapping TanStack Table: `useReactTable` with `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`. Accepts `columns` + `data` props. Renders with shadcn Table. Column header sort indicators
- [x] 3.2 Create `src/components/transactions/transaction-columns.tsx` — column definitions: date (formatted es-CL), description + type badge, category icon+name, account name, amount (green/red color). Sorting enabled on all columns
- [x] 3.3 Modify `src/components/transactions/transaction-table.tsx` — replace manual table with `DataTable` using transaction columns. Keep existing interface for backward compat
- [x] 3.4 Create `src/app/(dashboard)/transactions/loading.tsx` — skeleton loading state matching table layout (8 skeleton rows)
- [x] 3.5 Modify `src/app/(dashboard)/transactions/page.tsx` — replace text "Cargando..." with skeleton import, integrate DataTable, keep existing filters/fetch logic

### PR 3 File Manifest

| File | Action | ~Lines |
|------|--------|--------|
| `src/components/ui/data-table.tsx` | Create | ~120 |
| `src/components/transactions/transaction-columns.tsx` | Create | ~80 |
| `src/components/transactions/transaction-table.tsx` | Modify | ~30 changed |
| `src/app/(dashboard)/transactions/loading.tsx` | Create | ~45 |
| `src/app/(dashboard)/transactions/page.tsx` | Modify | ~20 changed |
| **Total** | | **~395** |

### PR 3 Verification
- Transaction table renders with all 5 columns
- Clicking column headers sorts ascending/descending
- Existing filters still work with DataTable
- Skeleton loading visible during data fetch
- Type badge colors preserved (green/red/blue)

---

## PR 4: Dashboard Redesign (~385 lines)

- [ ] 4.1 Modify `src/components/dashboard/balance-card.tsx` — add trend indicator (up/down arrow + percentage from previous month), keep existing totalBalance prop
- [ ] 4.2 Modify `src/components/dashboard/balance-line-chart.tsx` — upgrade LineChart to AreaChart with gradient fill, better axis formatting, CSS variable colors for dark mode
- [ ] 4.3 Create `src/components/dashboard/cashflow-summary.tsx` — income vs expenses bar chart (Recharts BarChart), green bars for income, red for expenses, side-by-side
- [ ] 4.4 Create `src/components/dashboard/account-cards.tsx` — grid of account balance cards with trend indicators, using `grid gap-4 sm:grid-cols-2 lg:grid-cols-3`
- [ ] 4.5 Modify `src/components/dashboard/dashboard-content.tsx` — reorganize layout: balance card → account cards → area chart + cashflow side-by-side → top categories → quick actions. Replace text loading with skeleton
- [ ] 4.6 Create `src/app/(dashboard)/page.tsx` skeleton — or modify existing to use skeleton loading state during data fetch

### PR 4 File Manifest

| File | Action | ~Lines |
|------|--------|--------|
| `src/components/dashboard/balance-card.tsx` | Modify | ~25 changed |
| `src/components/dashboard/balance-line-chart.tsx` | Modify | ~30 changed |
| `src/components/dashboard/cashflow-summary.tsx` | Create | ~70 |
| `src/components/dashboard/account-cards.tsx` | Create | ~65 |
| `src/components/dashboard/dashboard-content.tsx` | Modify | ~50 changed |
| `src/app/(dashboard)/page.tsx` | Modify | ~15 changed |
| **Total** | | **~385** |

### PR 4 Verification
- Balance card shows trend arrow and percentage
- Area chart renders with gradient fill, no console errors
- Cashflow summary shows income vs expenses bars
- Account cards display in responsive grid
- Dashboard layout reorganized with all sections visible
- Skeleton loading visible during data fetch

---

## PR 5: Polish (~370 lines)

- [ ] 5.1 Create `src/components/ui/avatar.tsx` — shadcn avatar (base-nova): Avatar + AvatarImage + AvatarFallback, `@base-ui/react` primitive
- [ ] 5.2 Create `src/components/layout/page-header.tsx` — reusable header: title, description, children slot (actions), optional breadcrumbs
- [ ] 5.3 Modify `src/components/auth/user-menu.tsx` — replace email text with Avatar (initial fallback) + DropdownMenu (profile, sign out)
- [ ] 5.4 Create `src/app/(dashboard)/accounts/loading.tsx` — skeleton grid matching account card layout (6 skeleton cards)
- [ ] 5.5 Modify `src/app/(dashboard)/accounts/page.tsx` — replace text loading with skeleton import, add PageHeader with title + total balance
- [ ] 5.6 Create `src/app/(dashboard)/accounts/[id]/page.tsx` skeleton — loading state for account detail
- [ ] 5.7 Create `src/app/(dashboard)/categories/loading.tsx` — skeleton matching category card layout (3 skeleton cards)
- [ ] 5.8 Modify `src/app/(dashboard)/categories/page.tsx` — replace text loading with skeleton import, add PageHeader with title + description

### PR 5 File Manifest

| File | Action | ~Lines |
|------|--------|--------|
| `src/components/ui/avatar.tsx` | Create | ~35 |
| `src/components/layout/page-header.tsx` | Create | ~30 |
| `src/components/auth/user-menu.tsx` | Modify | ~30 changed |
| `src/app/(dashboard)/accounts/loading.tsx` | Create | ~40 |
| `src/app/(dashboard)/accounts/page.tsx` | Modify | ~15 changed |
| `src/app/(dashboard)/accounts/[id]/page.tsx` | Modify | ~10 changed |
| `src/app/(dashboard)/categories/loading.tsx` | Create | ~40 |
| `src/app/(dashboard)/categories/page.tsx` | Modify | ~15 changed |
| **Total** | | **~370** |

### PR 5 Verification
- User menu shows avatar with initial fallback, dropdown opens
- Page headers render on accounts and categories pages
- Skeleton loading visible on accounts, categories, account detail pages
- All existing CRUD operations still work
- No visual regressions across all pages

---

## Cross-PR Verification

After all 5 PRs merge:
- [ ] Run `next build` — zero errors
- [ ] Dark mode toggle persists across sessions
- [ ] Sidebar collapses/expands on desktop, shows sheet on mobile
- [ ] MobileNav visible on screens < 768px
- [ ] All loading states use skeletons (zero "Cargando..." text)
- [ ] Transaction table sorts by all columns
- [ ] Dashboard shows area chart, account cards, cashflow summary
- [ ] All CRUD operations (create/edit/delete transactions, accounts, categories) still work
- [ ] No console errors in browser
