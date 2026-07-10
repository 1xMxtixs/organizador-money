# Proposal: UI Design Overhaul

## Intent

organizador-money has a functional but basic UI — text-only sidebar, text loading states, no dark mode toggle, and basic shadcn Table for transactions. whisper-money demonstrates what a polished personal finance app UI looks like: collapsible sidebar with icons, mobile bottom nav, loading skeletons, dark mode, TanStack Table with sorting/filtering, and rich dashboard charts. This overhaul modernizes the UI across all pages in 5 stacked PRs (400-line budget each) to match that quality bar while preserving all existing functionality.

## Scope

### In Scope
- Dark mode toggle wired to next-themes (dependency already installed)
- Collapsible sidebar with icons, active state highlighting, keyboard shortcut (Cmd+B)
- Mobile bottom navigation bar
- Loading skeleton components replacing text "Cargando..." states
- TanStack Table for transactions with sorting, filtering, pagination
- Dashboard redesign: net worth chart, account cards with trend indicators, cashflow summary
- Foundation components: skeleton, separator, dropdown-menu, tooltip, sheet, avatar, breadcrumb
- Page headers with descriptions and breadcrumbs

### Out of Scope
- Animation/motion (framer-motion) — deferred
- Command palette (cmdk) — deferred
- Drawer component (vaul) — deferred
- Data export/CSV functionality
- Chart color customization beyond defaults
- Accessibility audit beyond basic a11y
- React Query migration (data fetching stays as-is)

## Capabilities

### New Capabilities
- `ui-sidebar`: Collapsible sidebar with icons, mobile sheet, keyboard shortcut
- `ui-dark-mode`: Theme toggle with system/light/dark persistence
- `ui-data-table`: TanStack Table integration for transactions with sorting/filtering/pagination
- `ui-loading-states`: Skeleton components and loading patterns across all pages
- `ui-dashboard-layout`: Dashboard with net worth chart, account cards, cashflow summary

### Modified Capabilities
None — all capabilities are new. Existing functionality is preserved as-is.

## Approach

**5 stacked PRs**, each self-contained and reviewable:

| PR | Focus | Key Files |
|----|-------|-----------|
| 1 | Foundation: ThemeProvider + dark mode toggle + skeleton + separator + dropdown-menu | `globals.css` (no change), `layout.tsx`, new `theme-toggle.tsx`, shadcn components |
| 2 | Sidebar: collapsible with icons + mobile bottom nav + breadcrumb | `layout.tsx`, new `app-sidebar.tsx`, `mobile-nav.tsx`, shadcn sidebar/sheet |
| 3 | Data Table: TanStack Table for transactions + sorting/filtering | `transaction-table.tsx`, `transactions/page.tsx`, new `data-table.tsx` |
| 4 | Dashboard redesign: charts + account cards + cashflow | `dashboard-content.tsx`, `balance-card.tsx`, `balance-line-chart.tsx`, new components |
| 5 | Polish: tooltip, avatar, page headers, remaining skeleton states | Various page components, user-menu |

**Critical constraint**: shadcn uses `@base-ui/react` primitives (base-nova style). New shadcn components must be compatible with this style. Check `shadcn` CLI availability for base-nova components before manual implementation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/(dashboard)/layout.tsx` | Modified | Sidebar replacement, ThemeProvider wrapper |
| `src/app/globals.css` | Modified | Minor additions if needed for new components |
| `src/components/dashboard/*` | Modified | Dashboard redesign with new chart layouts |
| `src/components/transactions/transaction-table.tsx` | Modified | TanStack Table migration |
| `src/app/(dashboard)/transactions/page.tsx` | Modified | Loading skeletons, table integration |
| `src/components/ui/*` | New | ~12 new shadcn components |
| `src/components/layout/*` | New | Sidebar, mobile-nav, breadcrumb |
| `src/components/auth/user-menu.tsx` | Modified | Avatar, dropdown integration |
| `src/hooks/*` | New | useTheme, useMobile hooks if needed |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| shadcn base-nova missing components (sidebar, skeleton) | Med | Check `npx shadcn@latest add` for base-nova compatibility; fallback to manual implementation using @base-ui/react primitives |
| Sidebar complexity exceeding 400-line PR budget | Med | Split sidebar into 2 PRs if needed (structure first, mobile second) |
| TanStack Table + base-nova styling conflicts | Low | Test with minimal columns first, iterate styling in follow-up |
| Breaking existing functionality during layout refactor | Low | Feature branch, visual regression testing after each PR |

## Rollback Plan

Each PR is independently revertible via `git revert`. No database migrations involved. ThemeProvider removal reverts to light-only mode. Sidebar revert restores text-only sidebar. TanStack Table revert restores basic shadcn Table. All changes are UI-only — no API or data model changes.

## Dependencies

- `next-themes` v0.4.6 — already installed ✅
- `@tanstack/react-table` — needs install
- shadcn components — install via `npx shadcn@latest add` (check base-nova compatibility)
- No backend changes required

## Success Criteria

- [ ] Dark mode toggle works and persists across sessions
- [ ] Sidebar collapses to icons on desktop, shows as sheet on mobile
- [ ] Mobile bottom navigation visible on screens < 768px
- [ ] All loading states use skeleton components (zero "Cargando..." text)
- [ ] Transaction table supports column sorting and type/account filtering
- [ ] Dashboard shows net worth trend chart, account balance cards, cashflow summary
- [ ] All existing functionality (CRUD, transfers, filters) still works
- [ ] No visual regressions in existing pages
- [ ] Each PR stays under 400 changed lines
