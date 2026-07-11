# Planning Dashboard Specification

## Purpose

Enhance the main dashboard with a 50/30/20 budget allocation visualization and a savings rate metric, providing at-a-glance financial health indicators.

## Data Model Changes

No new models. This capability is a read-only aggregation of existing data.

## Requirements

### Requirement: 50/30/20 Budget Distribution Widget

The system SHALL compute and display the user's spending distribution across three categories: **Needs** (50% target), **Wants** (30% target), **Savings/Debt** (20% target). Classification is derived from category `cashflowDirection` and `type`.

#### Classification Rules:
- **Needs**: expense categories where `cashflowDirection = outflow` AND category name matches common need patterns (housing, food, utilities, transportation, insurance, healthcare, minimum debt payments)
- **Wants**: expense categories where `cashflowDirection = outflow` AND NOT matching need patterns (entertainment, dining out, subscriptions, hobbies, travel)
- **Savings/Debt**: income categories with `type = saving`, OR expense categories where `cashflowDirection = outflow` AND name matches debt payments beyond minimum

#### Scenario: Display 50/30/20 split

- GIVEN monthly expenses: 300000 Needs, 180000 Wants, 120000 Savings (total 600000)
- WHEN the planning dashboard loads
- THEN the widget shows: Needs 50%, Wants 30%, Savings 20%
- AND each segment is color-coded: Needs (blue), Wants (amber), Savings (green)
- AND a reference line shows the ideal 50/30/20 target

#### Scenario: Over-spending on wants

- GIVEN: Needs 250000, Wants 300000, Savings 50000 (total 600000)
- WHEN the widget renders
- THEN Wants segment shows "50%" (over target) with a warning indicator
- AND Needs shows "42%" (under target)
- AND Savings shows "8%" (significantly under target)

#### Scenario: No expenses in period

- GIVEN no expense transactions for the current month
- WHEN the widget loads
- THEN it shows "Sin datos de gastos este mes" with empty chart

### Requirement: Savings Rate Metric

The system SHALL calculate and display the savings rate as `(income - expenses) / income * 100` for the current month.

#### Scenario: Display savings rate

- GIVEN monthly income 1000000 and expenses 700000
- WHEN the savings rate metric is displayed
- THEN it shows "30%" with a positive indicator (green)

#### Scenario: Negative savings rate

- GIVEN income 500000 and expenses 700000
- WHEN the metric is displayed
- THEN it shows "-40%" with a negative indicator (red)

#### Scenario: No income in period

- GIVEN no income transactions and expenses of 300000
- WHEN the metric is displayed
- THEN it shows "N/A" with explanation "No hay ingresos registrados este mes"

### Requirement: Dashboard Summary Enhancement

The system SHALL extend the existing `/api/dashboard/summary` response to include the new metrics.

#### Scenario: Enhanced summary response

- GIVEN the user has income, expenses, and budgets
- WHEN they GET `/api/dashboard/summary`
- THEN the response includes all existing fields PLUS: `savingsRate`, `budgetDistribution`, `netWorth`

### Requirement: Budget Distribution by Category Type

The system SHALL show how the user's actual spending compares to the 50/30/20 ideal allocation, using budget data when available and falling back to category type classification.

#### Scenario: Distribution with budgets

- GIVEN budgets exist for some categories and the user has spending across all three groups
- WHEN the distribution is computed
- THEN budgets provide the target amounts, and actual spending is measured against them

#### Scenario: Distribution without budgets

- GIVEN no budgets are set
- WHEN distribution is computed
- THEN the 50/30/20 ideal percentages are used as reference, and actual spending is classified by category type

## API Contracts

### `GET /api/dashboard/summary` (Modified)

```typescript
// Response 200 (existing fields + new)
{
  data: {
    // Existing
    totalBalance: number
    monthlyIncome: number
    monthlyExpenses: number
    monthlySavings: number
    // New
    savingsRate: number | null        // percentage, null if no income
    budgetDistribution: {
      needs: { amount: number, percent: number }
      wants: { amount: number, percent: number }
      savings: { amount: number, percent: number }
      total: number
    }
    netWorth: {
      totalAssets: number
      totalLiabilities: number
      netWorth: number
    }
  }
}
```

### `GET /api/dashboard/planning`

```typescript
// Dedicated planning endpoint for detailed widget data
// Response 200
{
  data: {
    savingsRate: number | null
    monthlyIncome: number
    monthlyExpenses: number
    distribution: {
      needs: { amount: number, percent: number, categories: Array<{ name: string, amount: number }> }
      wants: { amount: number, percent: number, categories: Array<{ name: string, amount: number }> }
      savings: { amount: number, percent: number, categories: Array<{ name: string, amount: number }> }
    }
    netWorth: { current: number, previousMonth: number | null, change: number | null }
    recentBudgets: Array<{ category: string, limit: number, spent: number, status: string }>
  }
}
```

## UI Requirements

### Planning Dashboard Widget (on main dashboard page)

- **DistributionChart**: Recharts `PieChart` (donut variant) showing 50/30/20 split with labels and percentages
- **SavingsRateBadge**: Large numeric display with percentage and color indicator (green > 20%, yellow 0-20%, red < 0%)
- **BudgetStatusRow**: Horizontal row of mini budget cards showing top 5 budgets by spending
- **NetWorthMini**: Compact net worth display with sparkline (last 6 months from snapshots)

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| `DistributionChart` | `src/components/dashboard/distribution-chart.tsx` | Donut/pie chart 50/30/20 |
| `SavingsRateBadge` | `src/components/dashboard/savings-rate-badge.tsx` | Rate with color indicator |
| `BudgetStatusRow` | `src/components/dashboard/budget-status-row.tsx` | Top budgets mini-cards |
| `NetWorthMini` | `src/components/dashboard/net-worth-mini.tsx` | Compact net worth + sparkline |
| `PlanningWidget` | `src/components/dashboard/planning-widget.tsx` | Container composing all above |

### Layout

- The planning widget sits below the existing summary cards on the main dashboard
- Takes full width on desktop, stacks vertically on mobile
- Uses `Card` from shadcn/ui as container with header "Planeamiento Financiero"

## Edge Cases

- **Mixed category types**: A category with `type: expense` but name matching "savings" SHOULD be classified as savings — classification uses name heuristics, not just type
- **New user with no data**: Widget shows empty state "Registra transacciones para ver tu distribución"
- **Month with only income, no expenses**: Distribution chart shows 0/0/0 — display "Sin gastos este mes" instead of empty chart
- **Budget overrides classification**: When a budget exists for a category, use the budget's category classification rather than name heuristics
- **Performance**: Distribution calculation MUST be cached or computed in a single DB query — do not N+1 on categories
