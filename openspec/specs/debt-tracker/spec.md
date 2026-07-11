# Debt Tracker Specification

## Purpose

Provide a dedicated view for debt-focused accounts (credit cards, loans) with payoff strategy selection, projected payoff dates, and progress visualization.

## Data Model Changes

No new models. Debt tracking uses existing `Account` model with `type: credit_card` or `type: loan`. Account `balance` is used as the current debt amount (negative balance = debt).

## Requirements

### Requirement: Debt Account Detection

The system SHALL identify debt accounts as accounts with `type: credit_card` or `type: loan` and `isActive: true`. These are automatically surfaced in the debt tracker view.

#### Scenario: List debt accounts

- GIVEN the user has accounts: Checking (balance 500000), Visa (type: credit_card, balance -300000), Personal Loan (type: loan, balance -1500000)
- WHEN they GET `/api/debts`
- THEN they receive 2 debt accounts: Visa and Personal Loan
- AND each includes `{ id, name, type, bankName, balance, interestRate }` (balance as positive number representing debt)

#### Scenario: No debt accounts

- GIVEN the user has no credit_card or loan accounts
- WHEN they GET `/api/debts`
- THEN response returns `{ data: [] }` with a `message: "No hay deudas registradas"`

### Requirement: Payoff Strategy

The system SHALL support two payoff strategies that order debt accounts by payoff priority: **Snowball** (lowest balance first) and **Avalanche** (highest interest rate first). The strategy is a view-only preference, not a model field.

#### Scenario: Snowball strategy

- GIVEN debts: Visa (-300000, 15%), Loan (-1500000, 10%)
- WHEN the user selects snowball strategy
- THEN debts are ordered: Visa first (lowest balance), then Loan

#### Scenario: Avalanche strategy

- GIVEN the same debts
- WHEN the user selects avalanche strategy
- THEN debts are ordered: Visa first (15% > 10%), then Loan

#### Scenario: Equal interest rates in avalanche

- GIVEN two debts with the same interest rate
- WHEN avalanche strategy is applied
- THEN debts are ordered by balance (highest first) as tiebreaker

### Requirement: Projected Payoff Date

The system SHALL estimate payoff dates based on current balance, minimum payment (user-provided or default 2% of balance), and interest rate.

#### Scenario: Calculate projected payoff for single debt

- GIVEN a debt with balance 1500000, interest rate 10% annually, minimum monthly payment 50000
- WHEN the user GET `/api/debts/{id}/projection?monthlyPayment=50000`
- THEN the response includes `projectedPayoffDate` (estimated months to pay off) and `totalInterest` (estimated total interest paid)

#### Scenario: Debt with no interest rate

- GIVEN a debt with balance 500000 and no interest rate set (0%)
- WHEN the projection is calculated
- THEN `projectedPayoffDate` is based on balance / monthlyPayment
- AND `totalInterest` is 0

#### Scenario: Minimum payment only

- GIVEN a debt with balance 2000000, interest 18% annually
- WHEN the user requests projection with minimum payment (2% = 40000/month)
- THEN the response includes a realistic payoff date reflecting compound interest

### Requirement: Debt Summary Dashboard

The system SHALL provide aggregate debt metrics in the debt tracker view.

#### Scenario: Get debt summary

- GIVEN debts totaling 1800000 with weighted average interest 11.5%
- WHEN the user GET `/api/debts/summary`
- THEN the response returns `{ totalDebt: 1800000, debtCount: 2, averageInterestRate: 11.5, nextPaymentDue: "2026-08-01" }`

### Requirement: Debt Payoff Progress

The system SHALL track how much of each debt has been paid off since tracking began, using transaction history.

#### Scenario: Calculate payoff progress

- GIVEN a credit card account with current balance -300000 and the user has made expense payments (type: expense, positive amount to credit card) totaling 200000 since account creation
- WHEN the debt's progress is computed
- THEN `paidAmount` is 200000 and `remainingPercent` is 60

## API Contracts

### `GET /api/debts`

```typescript
// Response 200
{
  data: Array<{
    id: string
    name: string
    type: "credit_card" | "loan"
    bankName: string | null
    balance: number          // positive = debt amount
    interestRate: number     // annual percentage, 0 if not set
    minimumPayment: number   // calculated or user-set
    paidAmount: number       // total payments made
    remainingPercent: number // 0-100
    projectedPayoffDate: string | null
  }>
}
```

### `GET /api/debts/summary`

```typescript
// Response 200
{
  data: {
    totalDebt: number
    debtCount: number
    averageInterestRate: number
    totalMonthlyPayments: number
  }
}
```

### `GET /api/debts/{id}/projection?monthlyPayment=50000`

```typescript
// Response 200
{
  data: {
    balance: number
    monthlyPayment: number
    interestRate: number
    monthsToPayoff: number
    totalInterest: number
    projectedPayoffDate: string   // ISO date
    payoffSchedule: Array<{       // optional, first 12 months
      month: string
      payment: number
      principal: number
      interest: number
      remainingBalance: number
    }>
  }
}
```

## UI Requirements

### Debt Tracker Page (`/debts`)

- **DebtSummaryCard**: Total debt, count, average interest rate — top of page
- **DebtTable**: TanStack Table listing all debts with columns: Name, Type, Balance, Interest Rate, Progress Bar, Projected Payoff
- **PayoffStrategyToggle**: Segmented control switching between Snowball/Avalanche ordering
- **DebtDetailCard**: Expandable row showing payoff schedule table (first 12 months)
- **EmptyState**: "No hay deudas registradas" when no credit_card/loan accounts exist

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| `DebtSummaryCard` | `src/components/debts/debt-summary-card.tsx` | Aggregate metrics |
| `DebtTable` | `src/components/debts/debt-table.tsx` | TanStack Table with sorting |
| `PayoffStrategyToggle` | `src/components/debts/payoff-strategy-toggle.tsx` | Snowball/Avalanche switch |
| `PayoffSchedule` | `src/components/debts/payoff-schedule.tsx` | Month-by-month projection table |
| `DebtProgressBar` | `src/components/debts/debt-progress-bar.tsx` | Paid/remaining visual |

## Edge Cases

- **Account type change**: If a user changes an account type from `credit_card` to `checking`, it MUST disappear from the debt tracker immediately
- **Positive balance on credit card**: Credit cards with positive balance (overpayment) MUST show 0% remaining with "Pagado" status
- **No interest rate set**: Default to 0% — projection uses simple division (balance / monthlyPayment)
- **Minimum payment below interest**: If monthly payment < monthly interest, debt grows — projection MUST show this with a warning badge "El pago mínimo no cubre los intereses"
- **Multiple currencies**: Debt accounts use the account's `currencyCode` — currently CLP only, no conversion needed
