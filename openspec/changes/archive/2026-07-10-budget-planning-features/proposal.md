# Proposal: Budget Planning Features

## Intent

The app has transactions, accounts, categories, and budget models — but no budgeting workflow, no savings goals, no debt tracking, and no planning intelligence. Users currently rely on external spreadsheets for budgeting. This change brings budget-vs-actual tracking, savings goals, debt payoff planning, net worth tracking, and a 50/30/20 dashboard view into the app, replacing the need for Excel.

## Scope

### In Scope
- **Budget CRUD + Budget vs Actual**: API routes + UI for managing budgets per category, with period-based actual spending comparison and visual progress indicators
- **Auto-create BudgetPeriods**: Background job (cron or on-demand) to create monthly BudgetPeriod records from active Budgets
- **Savings Goals**: New `SavingsGoal` model (target amount, deadline, progress linked to account), API, and goal-tracking UI component
- **Debt Tracker**: Dedicated view listing debts (credit_card/loan accounts) with payoff strategy toggle (snowball/avalanche), projected payoff date, and progress bars
- **Net Worth Dashboard**: Historical net worth snapshots (assets - liabilities over time) stored in a new `NetWorthSnapshot` model, with trend chart
- **50/30/20 Dashboard Widget**: Compute needs/wants/savings split from category types + budget allocations, render as a horizontal stacked bar or donut chart
- **Savings Rate Metric**: Exposed in dashboard summary — `(income - expenses) / income * 100`

### Out of Scope
- Kakeibo-style monthly reflection (deferred — low priority, niche use case)
- Zero-Based budgeting mode (deferred — the existing Budget model already supports this conceptually)
- Envelope method visualization (deferred — same as zero-based, just UI framing)
- Cash flow report as standalone page (already partially covered by dashboard monthly-summary)
- Debt payoff calculator interactive tool (deferred — projected dates suffice)
- Net worth manual entry (use account balances directly)

## Capabilities

### New Capabilities
- `budget-management`: Budget CRUD, BudgetPeriod lifecycle, budget vs actual comparison with variance indicators
- `savings-goals`: Target-based savings tracking with progress and deadlines
- `debt-tracker`: Debt-focused view with payoff strategies and projected dates
- `net-worth`: Historical net worth snapshots and trend visualization
- `planning-dashboard`: 50/30/20 visualization and savings rate metric on main dashboard

### Modified Capabilities
None — existing capabilities are preserved as-is.

## Approach

**5 stacked PRs** following the existing app patterns (server-first API routes, client components with fetch):

| PR | Focus | Files |
|----|-------|-------|
| 1 | Budget CRUD API + BudgetPeriod auto-create + Budget vs Actual API | `src/app/api/budgets/`, `prisma/schema.prisma`, cron utility |
| 2 | Budget UI: category budget management page + budget vs actual cards | `src/app/(dashboard)/budgets/`, new components |
| 3 | SavingsGoal model + API + goal tracking UI component | `prisma/schema.prisma`, `src/app/api/savings-goals/`, `src/components/savings-goals/` |
| 4 | Debt tracker view + net worth snapshots + trend chart | `src/app/(dashboard)/debts/`, `prisma/schema.prisma`, `src/app/api/net-worth/` |
| 5 | Planning dashboard: 50/30/20 widget + savings rate + summary enhancements | `src/components/dashboard/` |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Add SavingsGoal, NetWorthSnapshot models; optional BudgetPeriod reflection field |
| `src/app/api/budgets/` | New | Budget CRUD, period management, budget vs actual endpoint |
| `src/app/api/savings-goals/` | New | SavingsGoal CRUD with progress tracking |
| `src/app/api/net-worth/` | New | Snapshot creation and historical retrieval |
| `src/app/(dashboard)/budgets/` | New | Budget management page with period comparison |
| `src/app/(dashboard)/debts/` | New | Debt tracker view |
| `src/components/dashboard/*` | Modified | New widgets: 50/30/20 chart, savings rate, net worth mini-chart |
| `src/app/api/dashboard/summary/route.ts` | Modified | Add savings rate to response |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| BudgetPeriod auto-create timing issues (timezone, missing months) | Med | On-demand create-on-access pattern + manual catch-up endpoint |
| Net worth snapshot accuracy (no real-time balance sync) | Low | Snapshot on account balance change or daily batch; clearly labeled as "as of" |
| SavingsGoal progress accounting (transfers vs actual deposits) | Med | Link goal to account; progress = sum of income transactions to that account since goal creation |

## Rollback Plan

Each PR is independently revertible. All new features are additive — new pages, new API routes, new model fields. Budget and BudgetPeriod models already exist; only new models (SavingsGoal, NetWorthSnapshot) need a rollback migration. No destructive schema changes.

## Dependencies

- Prisma migration for new models
- No new npm dependencies — existing Recharts, shadcn/ui, and TanStack Table suffice

## Success Criteria

- [ ] User can create/edit/delete budgets per category with monthly periods
- [ ] Budget vs actual comparison shows spent vs limit with color-coded progress bars
- [ ] SavingsGoal creation tracks progress toward target with deadline display
- [ ] Debt view lists credit card/loan accounts with payoff projection
- [ ] Net worth chart shows balance trend over 6+ months
- [ ] Dashboard shows 50/30/20 distribution and savings rate percentage
- [ ] All existing functionality preserved — no regressions
- [ ] Each PR stays under 400 changed lines
