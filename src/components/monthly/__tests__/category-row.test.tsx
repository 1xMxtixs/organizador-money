import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryRow } from "../category-row";
import type { CategoryActual } from "@/types/monthly";

// Mock QuickEntryInput
vi.mock("../quick-entry-input", () => ({
  QuickEntryInput: ({ onSubmit, disabled }: any) => (
    <button
      data-testid="quick-entry"
      onClick={() => onSubmit(50000)}
      disabled={disabled}
    >
      Entry
    </button>
  ),
}));

describe("CategoryRow", () => {
  const mockOnQuickEntry = vi.fn().mockResolvedValue(undefined);

  const expenseCategory: CategoryActual = {
    categoryId: "cat-1",
    name: "Alimentación",
    icon: "🍔",
    color: "#FF5733",
    type: "expense",
    actual: 200000,
    budget: {
      budgetId: "b-1",
      amountLimit: 300000,
      percentage: 67,
      status: "under",
    },
  };

  const categoryWithoutBudget: CategoryActual = {
    categoryId: "cat-3",
    name: "Ocio",
    icon: "🎮",
    color: "#9B59B6",
    type: "expense",
    actual: 50000,
    budget: null,
  };

  const overBudgetCategory: CategoryActual = {
    categoryId: "cat-4",
    name: "Transporte",
    icon: "🚗",
    color: "#3357FF",
    type: "expense",
    actual: 600000,
    budget: {
      budgetId: "b-4",
      amountLimit: 500000,
      percentage: 120,
      status: "over",
    },
  };

  const warningBudgetCategory: CategoryActual = {
    categoryId: "cat-5",
    name: "Salud",
    icon: "🏥",
    color: "#E74C3C",
    type: "expense",
    actual: 420000,
    budget: {
      budgetId: "b-5",
      amountLimit: 500000,
      percentage: 84,
      status: "warning",
    },
  };

  it("renders category name and icon", () => {
    render(<CategoryRow category={expenseCategory} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    expect(screen.getByText("Alimentación")).toBeDefined();
    expect(screen.getByText("🍔")).toBeDefined();
  });

  it("displays actual amount", () => {
    render(<CategoryRow category={expenseCategory} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    expect(screen.getByText("$200.000")).toBeDefined();
  });

  it("shows progress bar when budget exists", () => {
    render(<CategoryRow category={expenseCategory} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    expect(screen.getByText("67%")).toBeDefined();
  });

  it("hides progress bar when no budget", () => {
    render(<CategoryRow category={categoryWithoutBudget} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    expect(screen.queryByText(/%/)).toBeNull();
  });

  it("applies green bar color for under budget", () => {
    render(<CategoryRow category={expenseCategory} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    const bar = document.querySelector(".bg-emerald-500");
    expect(bar).toBeTruthy();
  });

  it("applies red bar color for over budget", () => {
    render(<CategoryRow category={overBudgetCategory} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    const bar = document.querySelector(".bg-red-500");
    expect(bar).toBeTruthy();
  });

  it("applies yellow bar color for warning budget", () => {
    render(<CategoryRow category={warningBudgetCategory} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    const bar = document.querySelector(".bg-yellow-500");
    expect(bar).toBeTruthy();
  });

  it("disables quick entry when no accountId", () => {
    render(<CategoryRow category={expenseCategory} accountId="" onQuickEntry={mockOnQuickEntry} />);

    const entry = screen.getByTestId("quick-entry");
    expect(entry).toBeDisabled();
  });

  it("enables quick entry when accountId is provided", () => {
    render(<CategoryRow category={expenseCategory} accountId="acc-1" onQuickEntry={mockOnQuickEntry} />);

    const entry = screen.getByTestId("quick-entry");
    expect(entry).not.toBeDisabled();
  });
});
