// ─── Monthly View Data Types ──────────────────────────────────────────────────

export interface MonthlyData {
  summary: MonthlySummary;
  categories: CategoryActual[];
  transactions: RecentTransaction[];
  defaultAccountId: string | null;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number | null;
}

export interface CategoryActual {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  actual: number;
  budget: BudgetInfo | null;
}

export interface BudgetInfo {
  budgetId: string;
  amountLimit: number;
  percentage: number;
  status: "under" | "warning" | "over";
}

export interface RecentTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  category: { name: string; icon: string; color: string } | null;
  account: { name: string };
}

// ─── Component Props ──────────────────────────────────────────────────────────

export interface SummaryBarProps {
  summary: MonthlySummary;
}

export interface CategoryRowProps {
  category: CategoryActual;
  accountId: string;
  onQuickEntry: (categoryId: string, amount: number) => Promise<void>;
}

export interface QuickEntryInputProps {
  onSubmit: (amount: number) => Promise<void>;
  disabled?: boolean;
}

export interface MonthNavigatorProps {
  currentMonth: string;
  onChange: (month: string) => void;
}

export interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}
