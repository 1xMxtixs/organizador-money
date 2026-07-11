import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMonthlyStore } from "../monthly-store";
import type { MonthlyData } from "@/types/monthly";

// ─── Mock fetch ─────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// ─── Test Data ──────────────────────────────────────────────────────────────

function makeMonthlyData(overrides?: Partial<MonthlyData>): MonthlyData {
  return {
    summary: {
      totalIncome: 1000000,
      totalExpenses: 600000,
      balance: 400000,
      savingsRate: 40,
    },
    categories: [
      {
        categoryId: "cat-1",
        name: "Alimentación",
        icon: "🍔",
        color: "#FF5733",
        type: "expense",
        actual: 200000,
        budget: { budgetId: "b-1", amountLimit: 300000, percentage: 67, status: "under" },
      },
      {
        categoryId: "cat-2",
        name: "Sueldo",
        icon: "💰",
        color: "#33FF57",
        type: "income",
        actual: 1000000,
        budget: null,
      },
    ],
    transactions: [],
    defaultAccountId: "acc-1",
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("useMonthlyStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useMonthlyStore.setState({
      month: new Date().getFullYear() +
        "-" +
        String(new Date().getMonth() + 1).padStart(2, "0"),
      data: null,
      loading: false,
      error: null,
    });
  });

  it("has correct initial state", () => {
    const state = useMonthlyStore.getState();
    expect(state.data).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.month).toMatch(/^\d{4}-\d{2}$/);
  });

  it("setMonth updates month and clears data", () => {
    useMonthlyStore.setState({ data: makeMonthlyData(), error: "old error" });

    // Mock fetch to prevent actual call
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: makeMonthlyData() }),
    });

    useMonthlyStore.getState().setMonth("2026-03");

    const state = useMonthlyStore.getState();
    expect(state.month).toBe("2026-03");
    expect(state.data).toBeNull();
    expect(state.error).toBeNull();
  });

  it("fetchData sets loading and fetches data", async () => {
    const mockData = makeMonthlyData();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockData }),
    });

    useMonthlyStore.getState().fetchData();

    // Should be loading immediately
    expect(useMonthlyStore.getState().loading).toBe(true);

    // Wait for async fetch
    await vi.waitFor(() => {
      expect(useMonthlyStore.getState().loading).toBe(false);
    });

    expect(useMonthlyStore.getState().data).toEqual(mockData);
    expect(useMonthlyStore.getState().error).toBeNull();
  });

  it("fetchData sets error on failure response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });

    await useMonthlyStore.getState().fetchData();

    const state = useMonthlyStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Unauthorized");
    expect(state.data).toBeNull();
  });

  it("fetchData sets error on network failure", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    await useMonthlyStore.getState().fetchData();

    const state = useMonthlyStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Error de red");
  });

  it("optimisticQuickEntry updates category actual", () => {
    const data = makeMonthlyData();
    useMonthlyStore.setState({ data });

    useMonthlyStore.getState().optimisticQuickEntry("cat-1", 50000);

    const state = useMonthlyStore.getState();
    const cat = state.data!.categories.find((c) => c.categoryId === "cat-1");
    expect(cat!.actual).toBe(250000); // 200000 + 50000
  });

  it("optimisticQuickEntry recalculates summary totals", () => {
    // Store recalculates totals FROM categories, not from old summary.
    // So test data must be internally consistent.
    const data = makeMonthlyData();
    data.categories[0].actual = 600000; // expense categories sum
    data.summary.totalExpenses = 600000;
    useMonthlyStore.setState({ data });

    // Add 50k expense to cat-1 → total expenses = 650000
    useMonthlyStore.getState().optimisticQuickEntry("cat-1", 50000);

    const state = useMonthlyStore.getState();
    expect(state.data!.summary.totalExpenses).toBe(650000);
    expect(state.data!.summary.balance).toBe(350000);       // 1000000 - 650000
    expect(state.data!.summary.savingsRate).toBe(35);       // 350000 / 1000000 * 100
  });

  it("optimisticQuickEntry recalculates savings rate", () => {
    const data = makeMonthlyData({
      summary: { totalIncome: 200000, totalExpenses: 100000, balance: 100000, savingsRate: 50 },
    });
    // Set up internally consistent data: income cat actual = 200000, expense cat actual = 100000
    data.categories[0].actual = 100000; // expense: Alimentación
    data.categories[1].actual = 200000; // income: Sueldo

    useMonthlyStore.setState({ data });

    // Add 50k expense → total expenses become 150000
    useMonthlyStore.getState().optimisticQuickEntry("cat-1", 50000);

    const state = useMonthlyStore.getState();
    expect(state.data!.summary.totalExpenses).toBe(150000);
    expect(state.data!.summary.balance).toBe(50000);      // 200000 - 150000
    expect(state.data!.summary.savingsRate).toBe(25);      // 50000 / 200000 * 100
  });

  it("optimisticQuickEntry does nothing when data is null", () => {
    useMonthlyStore.setState({ data: null });

    // Should not throw
    useMonthlyStore.getState().optimisticQuickEntry("cat-1", 50000);

    expect(useMonthlyStore.getState().data).toBeNull();
  });

  it("optimisticQuickEntry does not affect other categories", () => {
    const data = makeMonthlyData();
    useMonthlyStore.setState({ data });

    useMonthlyStore.getState().optimisticQuickEntry("cat-1", 50000);

    const otherCat = useMonthlyStore.getState().data!.categories.find(
      (c) => c.categoryId === "cat-2",
    );
    expect(otherCat!.actual).toBe(1000000); // unchanged
  });

  it("revertOptimistic restores previous data", () => {
    const originalData = makeMonthlyData();
    useMonthlyStore.setState({ data: originalData });

    // Make optimistic change
    useMonthlyStore.getState().optimisticQuickEntry("cat-1", 50000);
    expect(useMonthlyStore.getState().data!.categories[0].actual).toBe(250000);

    // Revert
    useMonthlyStore.getState().revertOptimistic(originalData);
    expect(useMonthlyStore.getState().data!.categories[0].actual).toBe(200000);
  });

  it("fetchData calls correct URL with month", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: makeMonthlyData() }),
    });

    useMonthlyStore.setState({ month: "2026-09" });
    await useMonthlyStore.getState().fetchData();

    expect(mockFetch).toHaveBeenCalledWith("/api/monthly?month=2026-09");
  });
});
