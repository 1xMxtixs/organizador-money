# Design: Budget Planning Features

## Technical Approach

Five stacked PRs building additive features on the existing Next.js App Router + Prisma + shadcn/ui stack. Each PR is independently deployable, under 400 changed lines, and follows existing patterns: server API routes with `apiSuccess`/`apiError`, Zod validation, client components with `useState`/`useEffect` data fetching, and Recharts for visualization. No new npm dependencies required.

## Architecture Decisions

### Decision: BudgetPeriod auto-create strategy

**Choice**: On-demand creation (create-on-access) + manual catch-up endpoint
**Alternatives considered**: Cron job, middleware hook
**Rationale**: On-demand is simpler, avoids timezone edge cases with cron, and the catch-up endpoint handles gaps. The existing `BudgetPeriod` model already has `isProcessing` flag for concurrency safety.

### Decision: SavingsGoal progress calculation

**Choice**: Sum of `type: income` transactions to linked account since goal creation
**Alternatives considered**: Account balance delta, manual entry
**Rationale**: Tracks deposits made while goal was active, not pre-existing balance. Transfers excluded per spec. Simple SQL aggregate query.

### Decision: NetWorthSnapshot storage

**Choice**: Daily upsert (one snapshot per day per user via `@@unique([userId, snapshotAt])`)
**Alternatives considered**: Hourly snapshots, manual-only
**Rationale**: Daily granularity matches budget periods. Upsert prevents duplicates. Unique constraint enforced at DB level.

### Decision: State management approach

**Choice**: Local `useState`/`useEffect` with `fetch` (matches existing dashboard-content.tsx pattern)
**Alternatives considered**: Zustand stores (in config but not currently used in codebase)
**Rationale**: Existing codebase uses no global state stores. All data is page-scoped. Introducing Zustand for this change adds complexity without benefit — pages already refetch on mutation. Follow existing pattern.

### Decision: Debt tracker uses existing Account model

**Choice**: Filter `Account` where `type IN (credit_card, loan)` — no new model
**Alternatives considered**: Separate `Debt` model
**Rationale**: Account already has `balance`, `type`, `interestRate` fields. A separate model would duplicate data and require sync logic. Debt-specific fields (`minimumPayment`) can be computed (2% of balance) or added as optional Account field later.

### Decision: 50/30/20 classification

**Choice**: Category name heuristics with budget override
**Alternatives considered**: User-assigned tags, hardcoded category IDs
**Rationale**: Name heuristics work for common patterns (housing, food → needs). When budgets exist, their category classification takes precedence. Flexible without requiring user configuration.

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Client UI  │────▶│  API Route   │────▶│   Prisma    │
│  (fetch)    │◀────│ (auth check) │◀────│  (Postgres) │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │
       │              ┌─────┴──────┐
       │              │  Recharts  │
       │              └────────────┘
       │
  Budget vs Actual:
  GET /api/budgets/{id}/actual?month=YYYY-MM
  → aggregate Transaction WHERE categoryId + date range
  → return { budgetLimit, amountSpent, variance, status }

  Savings Goal Progress:
  GET /api/savings-goals
  → aggregate Transaction WHERE accountId + type=income + date >= goal.createdAt
  → return { progress, progressPercent }

  Debt Projection:
  GET /api/debts/{id}/projection?monthlyPayment=N
  → compound interest loop (balance, rate, payment)
  → return { monthsToPayoff, totalInterest, schedule[] }

  Net Worth Trend:
  GET /api/net-worth/trend?months=6
  → SELECT from NetWorthSnapshot WHERE userId, ORDER BY snapshotAt
  → return { month, netWorth, assets, liabilities }[]
```

## File Changes

### PR 1: Budget CRUD API + BudgetPeriod lifecycle

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `note` field to Budget, add `deletedAt` to Budget for soft-delete |
| `src/lib/validations/budget.ts` | Create | Zod schemas: createBudgetSchema, updateBudgetSchema |
| `src/app/api/budgets/route.ts` | Create | GET (list with current period), POST (create) |
| `src/app/api/budgets/[id]/route.ts` | Create | PATCH, DELETE |
| `src/app/api/budgets/[id]/periods/route.ts` | Create | GET with auto-create current period |
| `src/app/api/budgets/[id]/periods/catch-up/route.ts` | Create | POST catch-up missing periods |
| `src/app/api/budgets/[id]/actual/route.ts` | Create | GET budget vs actual comparison |
| `src/lib/budget-period.ts` | Create | Helper: ensurePeriodExists, computeAmountSpent |

### PR 2: Budget UI

| File | Action | Description |
|------|--------|-------------|
| `src/app/(dashboard)/budgets/page.tsx` | Create | Budget management page |
| `src/app/(dashboard)/budgets/loading.tsx` | Create | Skeleton loading state |
| `src/components/budgets/budget-card.tsx` | Create | Card with progress bar + variance badge |
| `src/components/budgets/budget-form.tsx` | Create | Create/edit dialog |
| `src/components/budgets/budget-delete-dialog.tsx` | Create | Confirmation dialog |
| `src/components/budgets/variance-indicator.tsx` | Create | Color-coded percentage badge |
| `src/components/layout/app-sidebar.tsx` | Modify | Add Budgets nav item |

### PR 3: Savings Goals

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add SavingsGoal model, relations on User/Account |
| `src/lib/validations/savings-goal.ts` | Create | Zod schemas |
| `src/app/api/savings-goals/route.ts` | Create | GET (list), POST (create) |
| `src/app/api/savings-goals/[id]/route.ts` | Create | PATCH, DELETE |
| `src/app/api/savings-goals/[id]/complete/route.ts` | Create | POST mark complete |
| `src/app/(dashboard)/savings-goals/page.tsx` | Create | Goals page |
| `src/app/(dashboard)/savings-goals/loading.tsx` | Create | Skeleton |
| `src/components/savings-goals/goal-card.tsx` | Create | Progress bar + deadline badge |
| `src/components/savings-goals/goal-form.tsx` | Create | Create/edit dialog |
| `src/components/savings-goals/goal-progress.tsx` | Create | Linear progress bar |
| `src/components/savings-goals/goal-complete-button.tsx` | Create | Mark done button |
| `src/components/layout/app-sidebar.tsx` | Modify | Add Savings Goals nav item |

### PR 4: Debt Tracker + Net Worth

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add NetWorthSnapshot model, relation on User |
| `src/app/api/debts/route.ts` | Create | GET debt accounts list |
| `src/app/api/debts/summary/route.ts` | Create | GET aggregate metrics |
| `src/app/api/debts/[id]/projection/route.ts` | Create | GET payoff projection |
| `src/lib/debt-projection.ts` | Create | Compound interest calculation |
| `src/app/api/net-worth/snapshots/route.ts` | Create | GET history, POST create/upsert |
| `src/app/api/net-worth/summary/route.ts` | Create | GET current net worth |
| `src/app/api/net-worth/trend/route.ts` | Create | GET monthly trend data |
| `src/app/(dashboard)/debts/page.tsx` | Create | Debt tracker page |
| `src/app/(dashboard)/debts/loading.tsx` | Create | Skeleton |
| `src/components/debts/debt-summary-card.tsx` | Create | Aggregate metrics |
| `src/components/debts/debt-table.tsx` | Create | TanStack Table |
| `src/components/debts/payoff-strategy-toggle.tsx` | Create | Snowball/Avalanche switch |
| `src/components/debts/payoff-schedule.tsx` | Create | Projection table |
| `src/components/debts/debt-progress-bar.tsx` | Create | Paid/remaining visual |
| `src/components/net-worth/net-worth-hero.tsx` | Create | Current net worth display |
| `src/components/net-worth/net-worth-chart.tsx` | Create | Recharts AreaChart |
| `src/components/net-worth/asset-breakdown.tsx` | Create | Asset distribution |
| `src/components/net-worth/liability-breakdown.tsx` | Create | Liability distribution |
| `src/components/net-worth/snapshot-button.tsx` | Create | Manual snapshot trigger |
| `src/components/layout/app-sidebar.tsx` | Modify | Add Debts nav item |

### PR 5: Planning Dashboard

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/dashboard/planning/route.ts` | Create | GET planning data |
| `src/app/api/dashboard/summary/route.ts` | Modify | Add savingsRate, budgetDistribution, netWorth |
| `src/components/dashboard/distribution-chart.tsx` | Create | Recharts PieChart (donut) 50/30/20 |
| `src/components/dashboard/savings-rate-badge.tsx` | Create | Rate with color indicator |
| `src/components/dashboard/budget-status-row.tsx` | Create | Top budgets mini-cards |
| `src/components/dashboard/net-worth-mini.tsx` | Create | Compact net worth + sparkline |
| `src/components/dashboard/planning-widget.tsx` | Create | Container composing all widgets |
| `src/components/dashboard/dashboard-content.tsx` | Modify | Add PlanningWidget below existing cards |

## Interfaces / Contracts

```typescript
// Budget with current period (API response)
interface BudgetWithPeriod {
  id: string
  categoryId: string
  category: { name: string; icon: string; color: string }
  amountLimit: number
  period: "monthly" | "weekly" | "yearly"
  isActive: boolean
  currentPeriod: {
    amountSpent: number
    variance: number  // percentage, negative = over
    status: "under" | "on-target" | "over"
  } | null
}

// SavingsGoal with progress
interface SavingsGoalWithProgress {
  id: string
  name: string
  icon: string
  targetAmount: number
  deadline: string | null
  isCompleted: boolean
  completedAt: string | null
  progress: number
  progressPercent: number
  account: { id: string; name: string }
}

// Debt with projection
interface DebtWithProjection {
  id: string
  name: string
  type: "credit_card" | "loan"
  balance: number
  interestRate: number
  paidAmount: number
  remainingPercent: number
  projectedPayoffDate: string | null
}

// Net worth snapshot
interface NetWorthSnapshotData {
  id: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  snapshotAt: string
}

// Planning dashboard distribution
interface BudgetDistribution {
  needs: { amount: number; percent: number }
  wants: { amount: number; percent: number }
  savings: { amount: number; percent: number }
  total: number
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Budget period creation, debt projection math, savings progress calculation | Vitest with mock Prisma |
| Unit | Zod validation schemas | Vitest — valid/invalid inputs |
| Integration | API routes (auth, CRUD, edge cases) | Vitest + mock auth + in-memory DB |
| E2E | Full budget workflow, goal creation → progress | Playwright (if available) |

## Migration / Rollout

1. **Schema migration**: `prisma migrate dev` adds `SavingsGoal`, `NetWorthSnapshot` tables + `Budget.note` field + `Budget.deletedAt`
2. **Soft-delete extension**: Add `budget` to `softDeleteModels` array in `src/lib/soft-delete.ts`
3. **No data migration**: All new tables are empty on deploy; existing Budget/BudgetPeriod data untouched
4. **Rollback**: Drop new tables + revert schema changes — no data loss

## Open Questions

- [ ] Should `minimumPayment` on debt accounts be a user-editable Account field or always computed as 2% of balance?
- [ ] Should net worth snapshots be auto-created daily via cron, or only on-demand?
- [ ] Should the 50/30/20 classification be configurable by the user or fixed heuristics?
