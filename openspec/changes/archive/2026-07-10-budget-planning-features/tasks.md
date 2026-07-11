# Tasks: Budget Planning Features

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1200-1500 across 5 PRs |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Budget CRUD API + BudgetPeriod lifecycle | PR 1 | Foundation — all budget features depend on this |
| 2 | Budget UI | PR 2 | Depends on PR 1 API |
| 3 | Savings Goals model + API + UI | PR 3 | Independent of PR 1-2, but stacked for review |
| 4 | Debt Tracker + Net Worth | PR 4 | Largest PR — 18 files, may need split |
| 5 | Planning Dashboard widgets | PR 5 | Depends on PR 1, 3, 4 data |

---

## PR 1: Budget CRUD API + BudgetPeriod Lifecycle

- [ ] 1.1 Run Prisma migration to add `note` field to Budget, `deletedAt` to Budget, and new models (SavingsGoal, NetWorthSnapshot)
- [ ] 1.2 Update `src/lib/soft-delete.ts` to add `budget` to `softDeleteModels` array
- [ ] 1.3 Create `src/lib/validations/budget.ts` with createBudgetSchema, updateBudgetSchema (Zod)
- [ ] 1.4 Create `src/app/api/budgets/route.ts` — GET (list with current period aggregation) + POST (create with duplicate check)
- [ ] 1.5 Create `src/app/api/budgets/[id]/route.ts` — PATCH + DELETE (soft-delete)
- [ ] 1.6 Create `src/lib/budget-period.ts` — ensurePeriodExists, computeAmountSpent helpers
- [ ] 1.7 Create `src/app/api/budgets/[id]/periods/route.ts` — GET with auto-create current period
- [ ] 1.8 Create `src/app/api/budgets/[id]/periods/catch-up/route.ts` — POST catch-up missing periods
- [ ] 1.9 Create `src/app/api/budgets/[id]/actual/route.ts` — GET budget vs actual comparison with variance calculation

**Dependencies**: None (foundation)
**Complexity**: 1.1 medium (migration), 1.2-1.3 simple, 1.4-1.9 medium

---

## PR 2: Budget UI

- [ ] 2.1 Create `src/app/(dashboard)/budgets/page.tsx` — budget management page with list
- [ ] 2.2 Create `src/app/(dashboard)/budgets/loading.tsx` — skeleton loading state
- [ ] 2.3 Create `src/components/budgets/budget-card.tsx` — card with progress bar + variance badge
- [ ] 2.4 Create `src/components/budgets/budget-form.tsx` — create/edit dialog with category selector
- [ ] 2.5 Create `src/components/budgets/budget-delete-dialog.tsx` — confirmation dialog
- [ ] 2.6 Create `src/components/budgets/variance-indicator.tsx` — color-coded percentage badge
- [ ] 2.7 Modify `src/components/layout/app-sidebar.tsx` — add "Presupuestos" nav item with Wallet icon

**Dependencies**: PR 1 (API must exist)
**Complexity**: 2.1-2.2 simple, 2.3-2.6 medium, 2.7 simple

---

## PR 3: Savings Goals

- [ ] 3.1 Create `src/lib/validations/savings-goal.ts` — createGoalSchema, updateGoalSchema (Zod)
- [ ] 3.2 Create `src/app/api/savings-goals/route.ts` — GET (list with progress) + POST (create)
- [ ] 3.3 Create `src/app/api/savings-goals/[id]/route.ts` — PATCH + DELETE
- [ ] 3.4 Create `src/app/api/savings-goals/[id]/complete/route.ts` — POST mark complete
- [ ] 3.5 Create `src/app/(dashboard)/savings-goals/page.tsx` — goals page
- [ ] 3.6 Create `src/app/(dashboard)/savings-goals/loading.tsx` — skeleton
- [ ] 3.7 Create `src/components/savings-goals/goal-card.tsx` — progress bar + deadline badge
- [ ] 3.8 Create `src/components/savings-goals/goal-form.tsx` — create/edit dialog
- [ ] 3.9 Create `src/components/savings-goals/goal-progress.tsx` — linear progress bar
- [ ] 3.10 Create `src/components/savings-goals/goal-complete-button.tsx` — mark done button
- [ ] 3.11 Modify `src/components/layout/app-sidebar.tsx` — add "Metas" nav item with Target icon

**Dependencies**: Prisma migration (1.1), independent of PR 1-2 API
**Complexity**: 3.1-3.4 medium, 3.5-3.6 simple, 3.7-3.11 medium

---

## PR 4: Debt Tracker + Net Worth

- [ ] 4.1 Create `src/app/api/debts/route.ts` — GET debt accounts list (filter by type)
- [ ] 4.2 Create `src/app/api/debts/summary/route.ts` — GET aggregate metrics
- [ ] 4.3 Create `src/lib/debt-projection.ts` — compound interest calculation + payoff schedule
- [ ] 4.4 Create `src/app/api/debts/[id]/projection/route.ts` — GET payoff projection
- [ ] 4.5 Create `src/app/api/net-worth/snapshots/route.ts` — GET history + POST create/upsert
- [ ] 4.6 Create `src/app/api/net-worth/summary/route.ts` — GET current net worth from live balances
- [ ] 4.7 Create `src/app/api/net-worth/trend/route.ts` — GET monthly trend data
- [ ] 4.8 Create `src/app/(dashboard)/debts/page.tsx` — debt tracker page
- [ ] 4.9 Create `src/app/(dashboard)/debts/loading.tsx` — skeleton
- [ ] 4.10 Create `src/components/debts/debt-summary-card.tsx` — aggregate metrics
- [ ] 4.11 Create `src/components/debts/debt-table.tsx` — TanStack Table with sorting
- [ ] 4.12 Create `src/components/debts/payoff-strategy-toggle.tsx` — Snowball/Avalanche switch
- [ ] 4.13 Create `src/components/debts/payoff-schedule.tsx` — month-by-month projection table
- [ ] 4.14 Create `src/components/debts/debt-progress-bar.tsx` — paid/remaining visual
- [ ] 4.15 Create `src/components/net-worth/net-worth-hero.tsx` — current net worth display
- [ ] 4.16 Create `src/components/net-worth/net-worth-chart.tsx` — Recharts AreaChart
- [ ] 4.17 Create `src/components/net-worth/asset-breakdown.tsx` — asset distribution
- [ ] 4.18 Create `src/components/net-worth/liability-breakdown.tsx` — liability distribution
- [ ] 4.19 Create `src/components/net-worth/snapshot-button.tsx` — manual snapshot trigger
- [ ] 4.20 Modify `src/components/layout/app-sidebar.tsx` — add "Deudas" nav item with CreditCard icon

**Dependencies**: Prisma migration (1.1), independent of PR 1-3
**Complexity**: 4.1-4.4 medium, 4.5-4.7 medium, 4.8-4.20 medium (4.3 complex — projection math)

---

## PR 5: Planning Dashboard

- [ ] 5.1 Create `src/app/api/dashboard/planning/route.ts` — GET planning data (distribution, savings rate, net worth)
- [ ] 5.2 Modify `src/app/api/dashboard/summary/route.ts` — add savingsRate, budgetDistribution, netWorth fields
- [ ] 5.3 Create `src/components/dashboard/distribution-chart.tsx` — Recharts PieChart (donut) 50/30/20
- [ ] 5.4 Create `src/components/dashboard/savings-rate-badge.tsx` — rate with color indicator
- [ ] 5.5 Create `src/components/dashboard/budget-status-row.tsx` — top budgets mini-cards
- [ ] 5.6 Create `src/components/dashboard/net-worth-mini.tsx` — compact net worth + sparkline
- [ ] 5.7 Create `src/components/dashboard/planning-widget.tsx` — container composing all widgets
- [ ] 5.8 Modify `src/components/dashboard/dashboard-content.tsx` — add PlanningWidget below existing cards

**Dependencies**: PR 1 (budget data), PR 3 (savings data), PR 4 (net worth data)
**Complexity**: 5.1-5.2 medium, 5.3-5.7 medium, 5.8 simple
