import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryBar } from "../summary-bar";
import type { MonthlySummary } from "@/types/monthly";

// Mock lucide-react icons to avoid SSR issues
vi.mock("lucide-react", () => ({
  TrendingUpIcon: () => <span data-testid="icon-income" />,
  TrendingDownIcon: () => <span data-testid="icon-expenses" />,
  WalletIcon: () => <span data-testid="icon-balance" />,
  PercentIcon: () => <span data-testid="icon-savings" />,
}));

// Mock Card components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

describe("SummaryBar", () => {
  const defaultSummary: MonthlySummary = {
    totalIncome: 1000000,
    totalExpenses: 600000,
    balance: 400000,
    savingsRate: 40,
  };

  it("renders all four metric cards", () => {
    render(<SummaryBar summary={defaultSummary} />);

    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(4);
  });

  it("displays correct labels", () => {
    render(<SummaryBar summary={defaultSummary} />);

    expect(screen.getByText("Ingresos")).toBeDefined();
    expect(screen.getByText("Gastos")).toBeDefined();
    expect(screen.getByText("Balance")).toBeDefined();
    expect(screen.getByText("Ahorro")).toBeDefined();
  });

  it("formats currency values correctly", () => {
    render(<SummaryBar summary={defaultSummary} />);

    // CLP format: no decimals, uses dots as thousands separator
    expect(screen.getByText("$1.000.000")).toBeDefined();  // income
    expect(screen.getByText("$600.000")).toBeDefined();    // expenses
    expect(screen.getByText("$400.000")).toBeDefined();    // balance
    expect(screen.getByText("40%")).toBeDefined();         // savings rate
  });

  it("displays dash when savings rate is null", () => {
    const summary: MonthlySummary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      savingsRate: null,
    };

    render(<SummaryBar summary={summary} />);

    expect(screen.getByText("—")).toBeDefined();
  });

  it("renders zero values correctly", () => {
    const summary: MonthlySummary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      savingsRate: null,
    };

    render(<SummaryBar summary={summary} />);

    // Three metrics show $0 (income, expenses, balance); savings shows "—"
    const zeros = screen.getAllByText("$0");
    expect(zeros).toHaveLength(3);
  });
});
