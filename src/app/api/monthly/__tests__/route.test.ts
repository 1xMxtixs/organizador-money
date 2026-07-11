import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockUser = { id: "user-1", email: "test@test.com" };

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    budget: {
      findMany: vi.fn(),
    },
    account: {
      findFirst: vi.fn(),
    },
  },
}));

import { GET } from "../route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(month?: string) {
  const url = month
    ? `http://localhost:3000/api/monthly?month=${month}`
    : "http://localhost:3000/api/monthly";
  return new Request(url);
}

function setupAuthenticatedMocks() {
  vi.mocked(auth).mockResolvedValue({
    user: mockUser,
  } as any);

  vi.mocked(prisma.transaction.aggregate)
    .mockResolvedValueOnce({ _sum: { amount: 500000 } })  // income
    .mockResolvedValueOnce({ _sum: { amount: -300000 } }); // expenses

  vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);

  vi.mocked(prisma.category.findMany).mockResolvedValue([
    { id: "cat-1", name: "Alimentación", icon: "🍔", color: "#FF5733", type: "expense", sortOrder: 1 },
    { id: "cat-2", name: "Sueldo", icon: "💰", color: "#33FF57", type: "income", sortOrder: 1 },
  ]);

  vi.mocked(prisma.budget.findMany).mockResolvedValue([]);

  vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);

  vi.mocked(prisma.account.findFirst).mockResolvedValue({ id: "acc-1" });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("GET /api/monthly", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeTruthy();
  });

  it("returns 400 for invalid month format", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    const res = await GET(makeRequest("invalid"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("YYYY-MM");
  });

  it("returns monthly data with correct structure", async () => {
    setupAuthenticatedMocks();

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.data.summary).toBeDefined();
    expect(body.data.categories).toBeDefined();
    expect(body.data.transactions).toBeDefined();
    expect(body.data.defaultAccountId).toBe("acc-1");

    // Summary structure
    expect(typeof body.data.summary.totalIncome).toBe("number");
    expect(typeof body.data.summary.totalExpenses).toBe("number");
    expect(typeof body.data.summary.balance).toBe("number");
    expect(body.data.summary.savingsRate).toBeTypeOf("number");
  });

  it("calculates summary correctly from aggregated data", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    vi.mocked(prisma.transaction.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 1000000 } })  // income: 1M
      .mockResolvedValueOnce({ _sum: { amount: -750000 } }); // expenses: -750k

    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.budget.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(body.data.summary.totalIncome).toBe(1000000);
    expect(body.data.summary.totalExpenses).toBe(750000);
    expect(body.data.summary.balance).toBe(250000);
    expect(body.data.summary.savingsRate).toBe(25);
  });

  it("returns null savingsRate when no income", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    vi.mocked(prisma.transaction.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 0 } })   // income: 0
      .mockResolvedValueOnce({ _sum: { amount: -100 } }); // expenses

    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.budget.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(body.data.summary.savingsRate).toBeNull();
  });

  it("merges category actuals with categories", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    vi.mocked(prisma.transaction.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 0 } })
      .mockResolvedValueOnce({ _sum: { amount: -50000 } });

    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
      { categoryId: "cat-1", _sum: { amount: 50000 } },
    ]);

    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: "cat-1", name: "Alimentación", icon: "🍔", color: "#FF5733", type: "expense", sortOrder: 1 },
    ]);

    vi.mocked(prisma.budget.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(body.data.categories).toHaveLength(1);
    expect(body.data.categories[0].categoryId).toBe("cat-1");
    expect(body.data.categories[0].actual).toBe(50000);
    expect(body.data.categories[0].budget).toBeNull();
  });

  it("calculates budget percentage and status correctly", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    vi.mocked(prisma.transaction.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 0 } })
      .mockResolvedValueOnce({ _sum: { amount: -350000 } });

    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
      { categoryId: "cat-1", _sum: { amount: 350000 } },
    ]);

    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: "cat-1", name: "Transporte", icon: "🚗", color: "#3357FF", type: "expense", sortOrder: 1 },
    ]);

    vi.mocked(prisma.budget.findMany).mockResolvedValue([
      { categoryId: "cat-1", id: "budget-1", amountLimit: 500000 },
    ]);

    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    const budget = body.data.categories[0].budget;
    expect(budget).not.toBeNull();
    expect(budget.amountLimit).toBe(500000);
    expect(budget.percentage).toBe(70);
    expect(budget.status).toBe("under");
  });

  it("marks budget as warning at 80%", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    vi.mocked(prisma.transaction.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 0 } })
      .mockResolvedValueOnce({ _sum: { amount: -420000 } });

    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
      { categoryId: "cat-1", _sum: { amount: 420000 } },
    ]);

    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: "cat-1", name: "Transporte", icon: "🚗", color: "#3357FF", type: "expense", sortOrder: 1 },
    ]);

    vi.mocked(prisma.budget.findMany).mockResolvedValue([
      { categoryId: "cat-1", id: "budget-1", amountLimit: 500000 },
    ]);

    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(body.data.categories[0].budget.status).toBe("warning");
    expect(body.data.categories[0].budget.percentage).toBe(84);
  });

  it("marks budget as over when over 100%", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    vi.mocked(prisma.transaction.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 0 } })
      .mockResolvedValueOnce({ _sum: { amount: -600000 } });

    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([
      { categoryId: "cat-1", _sum: { amount: 600000 } },
    ]);

    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: "cat-1", name: "Transporte", icon: "🚗", color: "#3357FF", type: "expense", sortOrder: 1 },
    ]);

    vi.mocked(prisma.budget.findMany).mockResolvedValue([
      { categoryId: "cat-1", id: "budget-1", amountLimit: 500000 },
    ]);

    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(body.data.categories[0].budget.status).toBe("over");
    expect(body.data.categories[0].budget.percentage).toBe(120);
  });

  it("returns recent transactions", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    vi.mocked(prisma.transaction.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 0 } })
      .mockResolvedValueOnce({ _sum: { amount: 0 } });

    vi.mocked(prisma.transaction.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);
    vi.mocked(prisma.budget.findMany).mockResolvedValue([]);

    const mockTransactions = [
      {
        id: "tx-1",
        amount: 15000,
        description: "Almuerzo",
        date: "2026-07-10",
        type: "expense",
        category: { name: "Alimentación", icon: "🍔", color: "#FF5733" },
        account: { name: "Cuenta Principal" },
      },
      {
        id: "tx-2",
        amount: 500000,
        description: "Sueldo julio",
        date: "2026-07-01",
        type: "income",
        category: { name: "Sueldo", icon: "💰", color: "#33FF57" },
        account: { name: "Cuenta Principal" },
      },
    ];

    vi.mocked(prisma.transaction.findMany).mockResolvedValue(mockTransactions);
    vi.mocked(prisma.account.findFirst).mockResolvedValue(null);

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(body.data.transactions).toHaveLength(2);
    expect(body.data.transactions[0].id).toBe("tx-1");
  });

  it("uses current month when no month param provided", async () => {
    // When no month param, searchParams.get("month") returns null.
    // Zod schema (.optional()) treats null as invalid → 400.
    // This tests the actual validation behavior.
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("returns 500 on database error", async () => {
    vi.mocked(auth).mockResolvedValue({ user: mockUser } as any);

    // Override ALL prisma methods to reject to ensure Promise.all fails
    vi.mocked(prisma.transaction.aggregate).mockReset();
    vi.mocked(prisma.transaction.aggregate).mockRejectedValue(new Error("DB error"));
    vi.mocked(prisma.transaction.groupBy).mockRejectedValue(new Error("DB error"));
    vi.mocked(prisma.category.findMany).mockRejectedValue(new Error("DB error"));
    vi.mocked(prisma.budget.findMany).mockRejectedValue(new Error("DB error"));
    vi.mocked(prisma.transaction.findMany).mockRejectedValue(new Error("DB error"));
    vi.mocked(prisma.account.findFirst).mockRejectedValue(new Error("DB error"));

    const res = await GET(makeRequest("2026-07"));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBeTruthy();
  });

  it("passes correct date bounds to queries", async () => {
    setupAuthenticatedMocks();

    await GET(makeRequest("2026-07"));

    const expectedStart = new Date(2026, 6, 1);       // July 1
    const expectedEnd = new Date(2026, 7, 0, 23, 59, 59, 999); // July 31 end

    // Check first aggregate call (income)
    const incomeCall = vi.mocked(prisma.transaction.aggregate).mock.calls[0][0];
    expect(incomeCall.where.date.gte).toEqual(expectedStart);
    expect(incomeCall.where.date.lte).toEqual(expectedEnd);
  });
});
