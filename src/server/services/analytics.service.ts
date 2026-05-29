import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { db } from "../db";
import { accounts, income, expenses, balanceSnapshots, fundedAccounts } from "../db/schema";

export async function getMonthlyNetIncome(userId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const end = new Date(year, month, 0).toISOString().split("T")[0];

  const [incomeResult] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount_net), '0')` })
    .from(income)
    .where(
      and(
        eq(income.userId, userId),
        eq(income.status, "received"),
        gte(income.receivedAt, start),
        lte(income.receivedAt, end)
      )
    );

  const [expenseResult] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), '0')` })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.expenseDate, start),
        lte(expenses.expenseDate, end)
      )
    );

  return {
    grossIncome: Number(incomeResult?.total ?? 0),
    totalExpenses: Number(expenseResult?.total ?? 0),
    netIncome: Number(incomeResult?.total ?? 0) - Number(expenseResult?.total ?? 0),
  };
}

export async function getChallengeROI(userId: string) {
  const fundedAccountsList = await db
    .select({
      challengeCost: fundedAccounts.challengeCost,
      accountId: fundedAccounts.accountId,
    })
    .from(fundedAccounts)
    .innerJoin(accounts, eq(accounts.id, fundedAccounts.accountId))
    .where(eq(accounts.userId, userId));

  const totalChallengeCosts = fundedAccountsList.reduce(
    (sum, a) => sum + Number(a.challengeCost ?? 0),
    0
  );

  const [payoutsResult] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount_net), '0')` })
    .from(income)
    .where(
      and(
        eq(income.userId, userId),
        eq(income.status, "received"),
        eq(income.type, "payout")
      )
    );

  const totalPayouts = Number(payoutsResult?.total ?? 0);

  if (totalChallengeCosts === 0) return { roi: 0, totalPayouts, totalChallengeCosts };

  return {
    roi: ((totalPayouts - totalChallengeCosts) / totalChallengeCosts) * 100,
    totalPayouts,
    totalChallengeCosts,
  };
}

export async function getExpenseRatio(userId: string, year: number, month: number) {
  const { grossIncome, totalExpenses } = await getMonthlyNetIncome(userId, year, month);
  if (grossIncome === 0) return 0;
  return (totalExpenses / grossIncome) * 100;
}

export async function getPayoutConsistency(userId: string) {
  const result = await db
    .select({
      month: sql<string>`to_char(received_at::date, 'YYYY-MM')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(income)
    .where(
      and(
        eq(income.userId, userId),
        eq(income.status, "received"),
        eq(income.type, "payout")
      )
    )
    .groupBy(sql`to_char(received_at::date, 'YYYY-MM')`)
    .orderBy(sql`to_char(received_at::date, 'YYYY-MM')`);

  if (result.length === 0) return { consistency: 0, monthsWithPayout: 0, totalMonths: 0 };

  const firstMonth = result[0].month;
  const lastMonth = result[result.length - 1].month;

  const start = new Date(firstMonth + "-01");
  const end = new Date(lastMonth + "-01");
  const totalMonths = Math.max(1,
    (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1
  );

  return {
    consistency: (result.length / totalMonths) * 100,
    monthsWithPayout: result.length,
    totalMonths,
  };
}

export async function getAccountSurvivalRate(userId: string) {
  const allFunded = await db
    .select({ status: accounts.status })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.type, "funded")));

  if (allFunded.length === 0) return { rate: 0, active: 0, total: 0 };

  const active = allFunded.filter((a) => a.status === "active" || a.status === "paused").length;
  return {
    rate: (active / allFunded.length) * 100,
    active,
    total: allFunded.length,
  };
}

export async function getNetWorthHistory(userId: string, days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];

  const userAccountIds = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (userAccountIds.length === 0) return [];

  const snapshots = await db
    .select({
      date: balanceSnapshots.snapshotDate,
      total: sql<string>`SUM(balance)`,
    })
    .from(balanceSnapshots)
    .where(
      and(
        sql`${balanceSnapshots.accountId} IN (${sql.join(
          userAccountIds.map((a) => sql`${a.id}`),
          sql`, `
        )})`,
        gte(balanceSnapshots.snapshotDate, sinceStr)
      )
    )
    .groupBy(balanceSnapshots.snapshotDate)
    .orderBy(balanceSnapshots.snapshotDate);

  return snapshots.map((s) => ({
    date: s.date,
    netWorth: Number(s.total),
  }));
}

export async function getFirmPerformance(userId: string) {
  const firmPayouts = await db
    .select({
      firm: accounts.firm,
      totalPayouts: sql<string>`COALESCE(SUM(income.amount_net), '0')`,
      payoutCount: sql<number>`COUNT(income.id)`,
    })
    .from(income)
    .innerJoin(accounts, eq(accounts.id, income.accountId))
    .where(
      and(
        eq(income.userId, userId),
        eq(income.status, "received"),
        eq(income.type, "payout")
      )
    )
    .groupBy(accounts.firm);

  const firmCosts = await db
    .select({
      firm: accounts.firm,
      totalCost: sql<string>`COALESCE(SUM(funded_accounts.challenge_cost), '0')`,
      accountCount: sql<number>`COUNT(accounts.id)`,
    })
    .from(accounts)
    .innerJoin(fundedAccounts, eq(fundedAccounts.accountId, accounts.id))
    .where(eq(accounts.userId, userId))
    .groupBy(accounts.firm);

  const firms = new Map<string, { payouts: number; costs: number; roi: number; count: number }>();

  for (const p of firmPayouts) {
    const name = p.firm ?? "Unknown";
    firms.set(name, {
      payouts: Number(p.totalPayouts),
      costs: 0,
      roi: 0,
      count: Number(p.payoutCount),
    });
  }

  for (const c of firmCosts) {
    const name = c.firm ?? "Unknown";
    const existing = firms.get(name) ?? { payouts: 0, costs: 0, roi: 0, count: 0 };
    existing.costs = Number(c.totalCost);
    if (existing.costs > 0) {
      existing.roi = ((existing.payouts - existing.costs) / existing.costs) * 100;
    }
    firms.set(name, existing);
  }

  return Array.from(firms.entries()).map(([firm, data]) => ({
    firm,
    ...data,
  }));
}
