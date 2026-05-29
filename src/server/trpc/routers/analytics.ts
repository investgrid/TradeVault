import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { accounts, income, expenses, balanceSnapshots } from "../../db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import {
  getMonthlyNetIncome,
  getChallengeROI,
  getExpenseRatio,
  getPayoutConsistency,
  getAccountSurvivalRate,
  getNetWorthHistory,
  getFirmPerformance,
} from "../../services/analytics.service";
import { calculateDrawdown } from "../../services/drawdown.service";

export const analyticsRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, ctx.userId), eq(accounts.status, "active")));

    const netWorth = userAccounts.reduce(
      (sum, a) => sum + Number(a.currentBalance),
      0
    );

    const fundedCapital = userAccounts
      .filter((a) => a.type === "funded")
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    const realCapital = userAccounts
      .filter((a) => a.type !== "funded")
      .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const [monthlyIncome] = await db
      .select({ total: sql<string>`COALESCE(SUM(amount_net), '0')` })
      .from(income)
      .where(
        and(
          eq(income.userId, ctx.userId),
          eq(income.status, "received"),
          gte(income.receivedAt, monthStart)
        )
      );

    const [monthlyExp] = await db
      .select({ total: sql<string>`COALESCE(SUM(amount), '0')` })
      .from(expenses)
      .where(
        and(eq(expenses.userId, ctx.userId), gte(expenses.expenseDate, monthStart))
      );

    const [pendingPayouts] = await db
      .select({ total: sql<string>`COALESCE(SUM(amount_gross), '0')` })
      .from(income)
      .where(
        and(
          eq(income.userId, ctx.userId),
          sql`status IN ('requested', 'processing')`
        )
      );

    const monthlyNet =
      Number(monthlyIncome?.total ?? 0) - Number(monthlyExp?.total ?? 0);

    // Growth MoM
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const prevNetWorth = await getNetWorthAtDate(ctx.userId, thirtyDaysAgo);
    const growthMoM = prevNetWorth > 0 ? ((netWorth - prevNetWorth) / prevNetWorth) * 100 : 0;

    return {
      netWorth,
      fundedCapital,
      realCapital,
      pendingPayouts: Number(pendingPayouts?.total ?? 0),
      monthlyNet,
      growthMoM,
      activeAccounts: userAccounts.length,
      fundedCount: userAccounts.filter((a) => a.type === "funded").length,
    };
  }),

  monthlyIncome: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number() }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const year = input?.year ?? now.getFullYear();
      const month = input?.month ?? now.getMonth() + 1;
      return getMonthlyNetIncome(ctx.userId, year, month);
    }),

  challengeROI: protectedProcedure.query(async ({ ctx }) => {
    return getChallengeROI(ctx.userId);
  }),

  expenseRatio: protectedProcedure
    .input(z.object({ year: z.number(), month: z.number() }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      return getExpenseRatio(
        ctx.userId,
        input?.year ?? now.getFullYear(),
        input?.month ?? now.getMonth() + 1
      );
    }),

  payoutConsistency: protectedProcedure.query(async ({ ctx }) => {
    return getPayoutConsistency(ctx.userId);
  }),

  accountSurvival: protectedProcedure.query(async ({ ctx }) => {
    return getAccountSurvivalRate(ctx.userId);
  }),

  netWorthHistory: protectedProcedure
    .input(z.object({ days: z.number().int().default(90) }).optional())
    .query(async ({ ctx, input }) => {
      return getNetWorthHistory(ctx.userId, input?.days ?? 90);
    }),

  firmPerformance: protectedProcedure.query(async ({ ctx }) => {
    return getFirmPerformance(ctx.userId);
  }),

  cashflow: protectedProcedure
    .input(z.object({ months: z.number().int().default(12) }).optional())
    .query(async ({ ctx, input }) => {
      const months = input?.months ?? 12;
      const results = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const { grossIncome, totalExpenses, netIncome } = await getMonthlyNetIncome(
          ctx.userId,
          year,
          month
        );
        results.push({
          month: `${year}-${String(month).padStart(2, "0")}`,
          income: grossIncome,
          expenses: totalExpenses,
          net: netIncome,
        });
      }

      return results;
    }),
});

async function getNetWorthAtDate(userId: string, date: Date): Promise<number> {
  const dateStr = date.toISOString().split("T")[0];

  const userAccountIds = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  if (userAccountIds.length === 0) return 0;

  const snapshots = await db
    .select({
      accountId: balanceSnapshots.accountId,
      balance: balanceSnapshots.balance,
    })
    .from(balanceSnapshots)
    .where(
      and(
        sql`${balanceSnapshots.accountId} IN (${sql.join(
          userAccountIds.map((a) => sql`${a.id}`),
          sql`, `
        )})`,
        sql`snapshot_date <= ${dateStr}`
      )
    )
    .orderBy(sql`snapshot_date DESC`);

  const latestByAccount = new Map<string, number>();
  for (const s of snapshots) {
    if (!latestByAccount.has(s.accountId)) {
      latestByAccount.set(s.accountId, Number(s.balance));
    }
  }

  return Array.from(latestByAccount.values()).reduce((sum, b) => sum + b, 0);
}
