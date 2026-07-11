# Savings Goals Specification

## Purpose

Allow users to define target-based savings goals with deadlines, track progress linked to an account, and visualize goal completion.

## Data Model Changes

### New Model: `SavingsGoal`

```prisma
model SavingsGoal {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  accountId   String    @db.Uuid
  name        String
  icon        String    @default("🎯") // Emoji
  targetAmount Decimal @db.Decimal(15, 2)
  deadline    DateTime?
  isCompleted Boolean   @default(false)
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  user        User      @relation(fields: [userId], references: [id])
  account     Account   @relation(fields: [accountId], references: [id])

  @@index([userId])
  @@index([userId, deletedAt])
}
```

### New Relation on `User`

```prisma
savingsGoals SavingsGoal[]
```

### New Relation on `Account`

```prisma
savingsGoals SavingsGoal[]
```

## Requirements

### Requirement: Savings Goal CRUD

The system SHALL allow users to create, read, update, and delete savings goals. Each goal is linked to a specific account and tracks a target amount.

#### Scenario: Create a savings goal

- GIVEN the user is authenticated and has at least one account
- WHEN they POST `/api/savings-goals` with `{ accountId, name, targetAmount, deadline }`
- THEN a SavingsGoal record is created
- AND the response returns `201` with the goal including `progress: 0` and `progressPercent: 0`

#### Scenario: Update a savings goal

- GIVEN the user owns goal G
- WHEN they PATCH `/api/savings-goals/{id}` with `{ targetAmount: 5000000 }`
- THEN the goal is updated
- AND `progress` is recalculated

#### Scenario: Delete a savings goal

- GIVEN the user owns goal G
- WHEN they DELETE `/api/savings-goals/{id}`
- THEN the goal is soft-deleted
- AND it no longer appears in active goal lists

### Requirement: Goal Progress Calculation

The system SHALL calculate goal progress as the sum of income transactions to the linked account since the goal's creation date. Progress is NOT account balance — it tracks deposits made while the goal was active.

#### Scenario: Progress from income transactions

- GIVEN a goal linked to account A, created on 2026-01-01 with target 3000000
- AND account A has income transactions: +500000 (Jan 15), +300000 (Feb 10), +400000 (Mar 5)
- WHEN the goal's progress is computed
- THEN `progress` is 1200000 and `progressPercent` is 40

#### Scenario: No income yet

- GIVEN a goal created today with target 1000000
- WHEN the goal is retrieved
- THEN `progress` is 0 and `progressPercent` is 0

#### Scenario: Goal exceeded

- GIVEN a goal with target 2000000 and progress of 2500000
- WHEN the goal is retrieved
- THEN `progressPercent` is 125 and `isCompleted` remains `false` until manually marked complete

### Requirement: Goal Completion

The system SHALL allow users to manually mark a goal as complete. Auto-completion is NOT triggered — users decide when a goal is achieved.

#### Scenario: Mark goal complete

- GIVEN a goal with progress >= targetAmount
- WHEN the user POST `/api/savings-goals/{id}/complete`
- THEN `isCompleted` is set to `true` and `completedAt` is set to now

#### Scenario: Complete goal before target reached

- GIVEN a goal with progress < targetAmount
- WHEN the user POST `/api/savings-goals/{id}/complete`
- THEN the goal is marked complete (user override)
- AND `completedAt` is set to now

### Requirement: Goal List with Progress

The system SHALL return all active goals with computed progress in a single list endpoint.

#### Scenario: List active goals

- GIVEN the user has 3 active goals (1 completed)
- WHEN they GET `/api/savings-goals`
- THEN they receive 3 goals (completed excluded by default)
- AND each includes `{ id, name, icon, targetAmount, progress, progressPercent, deadline, account: { id, name } }`

#### Scenario: Include completed goals

- GIVEN the user has completed goals
- WHEN they GET `/api/savings-goals?includeCompleted=true`
- THEN completed goals are included in the response

## API Contracts

### `POST /api/savings-goals`

```typescript
// Request
{ accountId: string, name: string, targetAmount: number, icon?: string, deadline?: string }
// Response 201
{ data: SavingsGoalWithProgress }
```

### `GET /api/savings-goals?includeCompleted=false`

```typescript
// Response 200
{
  data: Array<{
    id: string, name: string, icon: string, targetAmount: number,
    deadline: string | null, isCompleted: boolean, completedAt: string | null,
    progress: number, progressPercent: number,
    account: { id: string, name: string }
  }>
}
```

### `PATCH /api/savings-goals/{id}`

```typescript
// Request (all optional)
{ name?: string, targetAmount?: number, icon?: string, deadline?: string | null }
// Response 200
{ data: SavingsGoalWithProgress }
```

### `DELETE /api/savings-goals/{id}`

```typescript
// Response 200
{ data: { deleted: true } }
```

### `POST /api/savings-goals/{id}/complete`

```typescript
// Response 200
{ data: { isCompleted: true, completedAt: "2026-07-10T..." } }
```

## UI Requirements

### Savings Goals Page (`/savings-goals`)

- **GoalCard**: Card per goal with icon, name, progress bar (linear), "X of Y CLP" text, deadline badge (countdown or "No deadline")
- **GoalForm**: Dialog to create/edit goals — account selector, name input, target amount (CLP), optional deadline date picker
- **GoalCompleteButton**: Appears when progress >= target, marks goal complete
- **EmptyState**: "Define your first savings goal" with CTA

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| `GoalCard` | `src/components/savings-goals/goal-card.tsx` | Progress bar + deadline badge |
| `GoalForm` | `src/components/savings-goals/goal-form.tsx` | Create/edit dialog |
| `GoalProgress` | `src/components/savings-goals/goal-progress.tsx` | Linear progress bar with percentage |
| `GoalCompleteButton` | `src/components/savings-goals/goal-complete-button.tsx` | Mark as done |

## Edge Cases

- **Account deleted**: Goals linked to a deleted account MUST be orphaned — API excludes from lists, returns 404 on access
- **Deadline in the past**: MUST accept but show "Overdue" badge in UI
- **Zero targetAmount**: MUST reject with "El monto objetivo debe ser mayor a 0"
- **Transfer transactions**: Transfers between accounts are NOT counted as income — only `type: income` transactions count toward progress
- **Multiple goals per account**: ALLOWED — a user may have multiple goals linked to the same account
