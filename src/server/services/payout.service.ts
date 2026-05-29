import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "../db";
import { income, accounts, fundedAccounts } from "../db/schema";

export async function getAveragePayoutTime(userId: string, firm?: string) {
  const conditions = [
    eq(income.userId, userId),
    eq(income.status, "received"),
    eq(income.type, "payout"),
    sql`requested_at IS NOT NULL`,
    sql`received_at IS NOT NULL`,
  ];

  if (firm) {
    const firmAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.firm, firm)));

    if (firmAccounts.length === 0) return 0;

    conditions.push(
      sql`${income.accountId} IN (${sql.join(
        firmAccounts.map((a) => sql`${a.id}`),
        sql`, `
      )})`
    );
  }

  const [result] = await db
    .select({
      avgDays: sql<string>`COALESCE(AVG(received_at::date - requested_at::date), 0)`,
    })
    .from(income)
    .where(and(...conditions));

  return Math.round(Number(result?.avgDays ?? 0));
}

export async function getNextEligiblePayouts(userId: string) {
  const result = await db
    .select({
      name: accounts.name,
      firm: accounts.firm,
      nextPayoutEligible: fundedAccounts.nextPayoutEligible,
    })
    .from(fundedAccounts)
    .innerJoin(accounts, eq(accounts.id, fundedAccounts.accountId))
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.status, "active"),
        sql`${fundedAccounts.nextPayoutEligible} IS NOT NULL`,
        sql`${fundedAccounts.nextPayoutEligible} >= CURRENT_DATE`
      )
    )
    .orderBy(fundedAccounts.nextPayoutEligible)
    .limit(5);

  return result;
}

export async function getPayoutsByMonth(userId: string, months = 12) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const sinceStr = since.toISOString().split("T")[0];

  const result = await db
    .select({
      month: sql<string>`to_char(received_at::date, 'YYYY-MM')`,
      total: sql<string>`SUM(amount_net)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(income)
    .where(
      and(
        eq(income.userId, userId),
        eq(income.status, "received"),
        eq(income.type, "payout"),
        sql`received_at >= ${sinceStr}`
      )
    )
    .groupBy(sql`to_char(received_at::date, 'YYYY-MM')`)
    .orderBy(sql`to_char(received_at::date, 'YYYY-MM')`);

  return result.map((r) => ({
    month: r.month,
    total: Number(r.total),
    count: Number(r.count),
  }));
}

export async function getPendingPayoutsDetail(userId: string) {
  return db
    .select({
      id: income.id,
      accountId: income.accountId,
      amountGross: income.amountGross,
      amountNet: income.amountNet,
      status: income.status,
      requestedAt: income.requestedAt,
      method: income.method,
      accountName: accounts.name,
      firm: accounts.firm,
    })
    .from(income)
    .leftJoin(accounts, eq(accounts.id, income.accountId))
    .where(
      and(
        eq(income.userId, userId),
        sql`status IN ('requested', 'processing')`
      )
    )
    .orderBy(desc(income.createdAt));
}
