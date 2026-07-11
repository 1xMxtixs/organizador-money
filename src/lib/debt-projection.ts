// Decimal type for Prisma
type DecimalLike = { toNumber(): number } | number | string;

export type PayoffStrategy = "snowball" | "avalanche";

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // annual %
  type: string;
  bankName: string | null;
}

export interface ProjectionParams {
  debts: DebtAccount[];
  monthlyPayment: number;
  strategy: PayoffStrategy;
}

export interface PayoffMonth {
  month: number;
  balance: number;
  interest: number;
  principal: number;
  totalPaid: number;
}

export interface PayoffResult {
  months: PayoffMonth[];
  totalInterest: number;
  totalPaid: number;
  payoffDate: number; // months from now
  monthlyInterestWarning: boolean; // true if payment < monthly interest
}

/**
 * Sort debts by strategy:
 * - Snowball: lowest balance first
 * - Avalanche: highest interest rate first
 */
export function sortDebts(
  debts: DebtAccount[],
  strategy: PayoffStrategy,
): DebtAccount[] {
  return [...debts].sort((a, b) => {
    if (strategy === "snowball") {
      return a.balance - b.balance;
    }
    return b.interestRate - a.interestRate;
  });
}

/**
 * Calculate monthly interest on a balance
 */
export function monthlyInterest(balance: number, annualRate: number): number {
  return balance * (annualRate / 100 / 12);
}

/**
 * Calculate payoff schedule for a single debt using compound interest.
 * Uses the snowball/avalanche approach: minimum payment to each debt,
 * extra goes to the priority debt.
 *
 * Formula: A = P(1 + r/n)^(nt) but simplified for monthly iterations.
 */
export function calculatePayoffSchedule(
  debts: DebtAccount[],
  monthlyPayment: number,
  strategy: PayoffStrategy,
): PayoffResult {
  if (debts.length === 0) {
    return {
      months: [],
      totalInterest: 0,
      totalPaid: 0,
      payoffDate: 0,
      monthlyInterestWarning: false,
    };
  }

  const sorted = sortDebts(debts, strategy);
  const monthCount = 600; // Max 50 years safety cap

  // Track state per debt
  const state = sorted.map((d) => ({
    ...d,
    remaining: d.balance,
  }));

  const months: PayoffMonth[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let anyWarning = false;

  for (let m = 1; m <= monthCount; m++) {
    let monthInterest = 0;
    let monthPrincipal = 0;
    let remainingPayment = monthlyPayment;

    // Calculate interest for all debts
    for (const debt of state) {
      if (debt.remaining <= 0) continue;
      const interest = monthlyInterest(debt.remaining, debt.interestRate);
      monthInterest += interest;
      // Check warning: payment less than interest for any debt
      if (debt.remaining > 0 && remainingPayment <= interest) {
        anyWarning = true;
      }
    }

    // Apply payments: priority debt gets extra
    for (const debt of state) {
      if (debt.remaining <= 0) continue;
      const interest = monthlyInterest(debt.remaining, debt.interestRate);
      const minPayment = Math.min(
        remainingPayment,
        debt.remaining + interest,
      );
      const principal = Math.max(0, minPayment - interest);
      debt.remaining = Math.max(0, debt.remaining + interest - principal);
      remainingPayment -= minPayment;
      monthPrincipal += principal;
    }

    totalInterest += monthInterest;
    totalPaid += monthInterest + monthPrincipal;

    months.push({
      month: m,
      balance: state.reduce((sum, d) => sum + Math.max(0, d.remaining), 0),
      interest: monthInterest,
      principal: monthPrincipal,
      totalPaid,
    });

    // Check if all debts paid off
    if (state.every((d) => d.remaining <= 0)) {
      break;
    }
  }

  return {
    months,
    totalInterest,
    totalPaid,
    payoffDate: months.length,
    monthlyInterestWarning: anyWarning,
  };
}

/**
 * Calculate payoff projection for a single debt account
 */
export function calculateSingleDebtProjection(
  balance: number,
  interestRate: number,
  monthlyPayment: number,
): PayoffResult {
  return calculatePayoffSchedule(
    [{ id: "single", name: "", balance, interestRate, type: "", bankName: null }],
    monthlyPayment,
    "snowball",
  );
}

/**
 * Convert Prisma Decimal to number
 */
export function toNumber(val: DecimalLike | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val) || 0;
  return val.toNumber();
}
