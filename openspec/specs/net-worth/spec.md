# Net Worth Specification

## Purpose

Track historical net worth as snapshots of assets minus liabilities over time, and visualize trends with a chart.

## Data Model Changes

### New Model: `NetWorthSnapshot`

```prisma
model NetWorthSnapshot {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @db.Uuid
  totalAssets Decimal @db.Decimal(15, 2)
  totalLiabilities Decimal @db.Decimal(15, 2)
  netWorth   Decimal  @db.Decimal(15, 2)
  snapshotAt DateTime @default(now())
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])

  @@unique([userId, snapshotAt])
  @@index([userId, snapshotAt])
}
```

### New Relation on `User`

```prisma
netWorthSnapshots NetWorthSnapshot[]
```

### Asset/Liability Classification

Assets = accounts with type IN (`checking`, `savings`, `investment`, `cash`, `real_estate`) with positive balance.
Liabilities = accounts with type IN (`credit_card`, `loan`) with negative balance (absolute value).

## Requirements

### Requirement: Snapshot Creation

The system SHALL create net worth snapshots either on-demand via API or automatically (e.g., daily batch). Each snapshot captures assets, liabilities, and computed net worth at a point in time.

#### Scenario: Create snapshot on-demand

- GIVEN the user has assets totaling 5000000 and liabilities of 1800000
- WHEN they POST `/api/net-worth/snapshots`
- THEN a snapshot is created with `totalAssets: 5000000`, `totalLiabilities: 1800000`, `netWorth: 3200000`
- AND `snapshotAt` is set to now

#### Scenario: Prevent duplicate snapshots same day

- GIVEN a snapshot already exists for today
- WHEN the user POST `/api/net-worth/snapshots` again today
- THEN the existing snapshot is updated (upserted) — not duplicated

#### Scenario: Snapshot with no accounts

- GIVEN the user has no accounts
- WHEN a snapshot is created
- THEN all values are 0

### Requirement: Historical Snapshots

The system SHALL return all snapshots for the user, ordered by date ascending, for chart rendering.

#### Scenario: Get snapshot history

- GIVEN the user has snapshots from Jan to Jul 2026
- WHEN they GET `/api/net-worth/snapshots`
- THEN they receive snapshots ordered by `snapshotAt` ascending
- AND each includes `{ id, totalAssets, totalLiabilities, netWorth, snapshotAt }`

#### Scenario: Filter by date range

- GIVEN the user has snapshots from Jan to Dec 2026
- WHEN they GET `/api/net-worth/snapshots?from=2026-04-01&to=2026-09-30`
- THEN only snapshots in that range are returned

### Requirement: Net Worth Summary

The system SHALL provide a current net worth summary derived from live account balances (not snapshots).

#### Scenario: Get current net worth

- GIVEN accounts: Checking (+2000000), Savings (+3000000), Credit Card (-500000), Loan (-1500000)
- WHEN they GET `/api/net-worth/summary`
- THEN response returns `{ totalAssets: 5000000, totalLiabilities: 2000000, netWorth: 3000000, assetBreakdown: [...], liabilityBreakdown: [...] }`

#### Scenario: Net worth with no accounts

- GIVEN no accounts exist
- WHEN summary is requested
- THEN all values are 0 with empty breakdowns

### Requirement: Trend Data for Charts

The system SHALL provide monthly-aggregated trend data optimized for Recharts consumption.

#### Scenario: Get 6-month trend

- GIVEN snapshots from Feb to Jul 2026
- WHEN they GET `/api/net-worth/trend?months=6`
- THEN the response returns 6 data points: `{ month: "Feb", netWorth: 2500000, assets: 4000000, liabilities: 1500000 }`

#### Scenario: Insufficient data points

- GIVEN only 2 snapshots exist and 6 months are requested
- WHEN trend is requested
- THEN only 2 data points are returned (no padding with zeros)

## API Contracts

### `POST /api/net-worth/snapshots`

```typescript
// Response 201 (or 200 if upserted)
{
  data: {
    id: string, totalAssets: number, totalLiabilities: number,
    netWorth: number, snapshotAt: string
  }
}
```

### `GET /api/net-worth/snapshots?from=&to=`

```typescript
// Response 200
{
  data: Array<{
    id: string, totalAssets: number, totalLiabilities: number,
    netWorth: number, snapshotAt: string
  }>
}
```

### `GET /api/net-worth/summary`

```typescript
// Response 200
{
  data: {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    assetBreakdown: Array<{ accountType: string, total: number }>
    liabilityBreakdown: Array<{ accountType: string, total: number }>
  }
}
```

### `GET /api/net-worth/trend?months=6`

```typescript
// Response 200
{
  data: Array<{
    month: string        // "Jan", "Feb", etc.
    netWorth: number
    assets: number
    liabilities: number
  }>
}
```

## UI Requirements

### Net Worth Section (dashboard widget or dedicated page)

- **NetWorthHero**: Large display of current net worth with +/- indicator vs previous snapshot
- **NetWorthChart**: Recharts `AreaChart` with assets (green), liabilities (red), netWorth (blue) lines over time
- **AssetBreakdown**: Horizontal bar or pie showing asset distribution by type
- **LiabilityBreakdown**: Horizontal bar showing liability distribution by type
- **SnapshotButton**: Manual "Take Snapshot" button — disabled if snapshot already exists today (shows "Snapshot taken today")

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| `NetWorthHero` | `src/components/net-worth/net-worth-hero.tsx` | Current net worth display |
| `NetWorthChart` | `src/components/net-worth/net-worth-chart.tsx` | Recharts AreaChart |
| `AssetBreakdown` | `src/components/net-worth/asset-breakdown.tsx` | Asset distribution |
| `LiabilityBreakdown` | `src/components/net-worth/liability-breakdown.tsx` | Liability distribution |
| `SnapshotButton` | `src/components/net-worth/snapshot-button.tsx` | Manual snapshot trigger |

## Edge Cases

- **Deleted accounts**: Accounts with `deletedAt` set MUST be excluded from current net worth calculation
- **Inactive accounts**: Accounts with `isActive: false` MUST be excluded from current calculation but historical snapshots are preserved as-is
- **Decimal precision**: All amounts are `Decimal(15,2)` — chart tooltips MUST format as CLP with no decimals
- **Snapshot stale data**: Snapshots capture point-in-time data — UI MUST label charts as "As of {date}" to indicate they reflect historical balances, not live
- **Very large numbers**: CLP amounts can be large (millions) — chart Y-axis MUST use compact notation (e.g., "3M", "1.5M")
