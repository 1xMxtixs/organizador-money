# Budget Management Specification

## Purpose

Enable users to set spending limits per category, automatically track actual spending per period, and compare budget vs actual with visual variance indicators.

## Data Model Changes

### New Fields on `Budget`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `note` | String? | null | Optional budget note (encrypted) |

No new models — `Budget` and `BudgetPeriod` already exist. `BudgetPeriod.amountSpent` is recalculated on access from transactions.

### Modified: `BudgetPeriod`

| Field | Change | Description |
|-------|--------|-------------|
| `amountSpent` | Recalc | Derived from `SUM(Transaction.amount)` WHERE `type=expense` AND `date` within `[startsAt, endsAt]` AND `categoryId` matches budget's category |

## Requirements

### Requirement: Budget CRUD

The system SHALL allow users to create, read, update, and delete budgets per category. Each budget is scoped to the authenticated user and linked to exactly one category of type `expense`.

#### Scenario: Create a budget

- GIVEN the user is authenticated and has at least one expense category
- WHEN they POST `/api/budgets` with `{ categoryId, amountLimit, period }`
- THEN a Budget record is created with `isActive: true`
- AND the response returns `201` with the created budget

#### Scenario: Duplicate budget for same category

- GIVEN the user already has an active budget for category X
- WHEN they POST `/api/budgets` with the same `categoryId`
- THEN the API returns `409` with message "Ya existe un presupuesto para esta categoría"

#### Scenario: Update a budget

- GIVEN the user owns budget B
- WHEN they PATCH `/api/budgets/{id}` with `{ amountLimit: 200000 }`
- THEN the budget's `amountLimit` is updated
- AND the response returns the updated budget

#### Scenario: Delete a budget

- GIVEN the user owns budget B with associated BudgetPeriods
- WHEN they DELETE `/api/budgets/{id}`
- THEN the budget and all its BudgetPeriods are soft-deleted
- AND the response returns `200` with `{ deleted: true }`

### Requirement: BudgetPeriod Lifecycle

The system SHALL automatically create BudgetPeriod records for active budgets. Periods are created on-demand when accessed or via a manual catch-up endpoint.

#### Scenario: Auto-create current month period on GET

- GIVEN the user has an active monthly budget B and no BudgetPeriod for the current month
- WHEN they GET `/api/budgets/{id}/periods?month=2026-07`
- THEN a BudgetPeriod is created with `startsAt` = first day of month, `endsAt` = last day of month
- AND `amountSpent` is calculated from matching transactions

#### Scenario: Catch-up missing periods

- GIVEN the user has an active budget with gaps in periods (e.g., missing May and June)
- WHEN they POST `/api/budgets/{id}/periods/catch-up`
- THEN BudgetPeriods are created for all missing months from the budget's creation date to the current month
- AND each period's `amountSpent` is calculated

#### Scenario: Period already exists

- GIVEN a BudgetPeriod already exists for budget B covering July 2026
- WHEN the auto-create logic runs for July 2026
- THEN no duplicate period is created

### Requirement: Budget vs Actual Comparison

The system SHALL compute actual spending per BudgetPeriod by summing expense transactions in that period's date range for the budget's category. The API SHALL return both the budget limit and actual spent amount with a variance percentage.

#### Scenario: Get budget vs actual for current period

- GIVEN the user has a budget B for "Groceries" with `amountLimit: 200000` and a current July BudgetPeriod with transactions totaling 150000
- WHEN they GET `/api/budgets/{id}/actual?month=2026-07`
- THEN the response returns `{ budgetLimit: 200000, amountSpent: 150000, variance: 25, status: "under" }`

#### Scenario: Over-budget indicator

- GIVEN a budget with `amountLimit: 100000` and actual spending of 120000
- WHEN the comparison endpoint is called
- THEN `status` is `"over"` and `variance` is `-20`

#### Scenario: On-budget indicator

- GIVEN actual spending equals the limit exactly
- WHEN the comparison endpoint is called
- THEN `status` is `"on-target"` and `variance` is `0`

### Requirement: Budget List with Aggregation

The system SHALL return all user budgets with their current period's actual spending in a single endpoint.

#### Scenario: List budgets with current month data

- GIVEN the user has 3 active budgets
- WHEN they GET `/api/budgets`
- THEN each budget includes `{ id, category: { name, icon, color }, amountLimit, period, currentPeriod: { amountSpent, variance, status } }`

## API Contracts

### `POST /api/budgets`

```typescript
// Request
{ categoryId: string, amountLimit: number, period: "monthly" | "weekly" | "yearly" }
// Response 201
{ data: Budget }
// Response 409
{ error: "Ya existe un presupuesto para esta categoría" }
```

### `GET /api/budgets`

```typescript
// Response 200
{
  data: Array<{
    id: string
    categoryId: string
    category: { name: string, icon: string, color: string }
    amountLimit: number
    period: "monthly" | "weekly" | "yearly"
    isActive: boolean
    currentPeriod: {
      amountSpent: number
      variance: number   // percentage, negative = over
      status: "under" | "on-target" | "over"
    } | null
  }>
}
```

### `PATCH /api/budgets/{id}`

```typescript
// Request (all optional)
{ amountLimit?: number, period?: "monthly" | "weekly" | "yearly", isActive?: boolean }
// Response 200
{ data: Budget }
```

### `DELETE /api/budgets/{id}`

```typescript
// Response 200
{ data: { deleted: true } }
```

### `GET /api/budgets/{id}/actual?month=YYYY-MM`

```typescript
// Response 200
{
  data: {
    budgetLimit: number
    amountSpent: number
    variance: number
    status: "under" | "on-target" | "over"
    transactions: Array<{ id: string, amount: number, description: string, date: string }>
  }
}
```

### `POST /api/budgets/{id}/periods/catch-up`

```typescript
// Response 200
{ data: { created: number } } // count of periods created
```

## UI Requirements

### Budget Management Page (`/budgets`)

- **BudgetCard**: Card per budget showing category icon/name, limit, progress bar (green < 75%, yellow 75-100%, red > 100%), current period spent/limit
- **BudgetForm**: Dialog/modal to create/edit budgets — category selector (dropdown of expense categories), amount input (CLP formatted), period selector
- **BudgetDeleteDialog**: Confirmation dialog with warning about losing period history
- **EmptyState**: Message when no budgets exist, CTA to create first budget

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| `BudgetCard` | `src/components/budgets/budget-card.tsx` | Progress bar + variance badge |
| `BudgetForm` | `src/components/budgets/budget-form.tsx` | Create/edit form |
| `BudgetDeleteDialog` | `src/components/budgets/budget-delete-dialog.tsx` | Confirm delete |
| `VarianceIndicator` | `src/components/budgets/variance-indicator.tsx` | Color-coded +/- percentage badge |

## Edge Cases

- **Deleted category**: If a budget's category is deleted, the budget is orphaned — API MUST exclude it from lists and return 404 on direct access
- **Zero amountLimit**: MUST reject with validation error "El monto debe ser mayor a 0"
- **Future-dated transactions**: Transactions with future dates MUST count toward the period they fall in
- **Currency mismatch**: Budget limit and transaction amounts are both in CLP (Decimal 15,2) — no conversion needed
- **Soft-deleted budget**: Deleted budgets MUST NOT appear in active budget lists but historical BudgetPeriods are preserved for audit
