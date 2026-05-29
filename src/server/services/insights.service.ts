import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "../db";
import { income, expenses, accounts, fundedAccounts, aiInsights } from "../db/schema";
import { getExpenseRatio, getPayoutConsistency, getChallengeROI } from "./analytics.service";

interface Insight {
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  actionUrl?: string;
}

export async function generateInsights(userId: string): Promise<Insight[]> {
  const insights: Insight[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Expense ratio alert
  const expenseRatio = await getExpenseRatio(userId, currentYear, currentMonth);
  if (expenseRatio > 30) {
    insights.push({
      type: "expense_ratio_high",
      severity: expenseRatio > 50 ? "critical" : "warning",
      title: "High expense ratio",
      body: `Your expense ratio this month is ${expenseRatio.toFixed(0)}%. Consider reviewing your costs.`,
      actionUrl: "/expenses",
    });
  }

  // Failed challenge cost alert (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const [failedChallenges] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), '0')` })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        eq(expenses.category, "failed_challenge_fees"),
        gte(expenses.expenseDate, ninetyDaysAgo.toISOString().split("T")[0])
      )
    );

  const failedTotal = Number(failedChallenges?.total ?? 0);
  if (failedTotal > 200) {
    insights.push({
      type: "failed_challenges_high",
      severity: failedTotal > 500 ? "critical" : "warning",
      title: "High failed challenge costs",
      body: `You've spent $${failedTotal.toFixed(0)} on failed challenges in the last 90 days.`,
      actionUrl: "/expenses",
    });
  }

  // Accounts near breach
  const userAccounts = await db
    .select({
      name: accounts.name,
      currentBalance: accounts.currentBalance,
      initialBalance: accounts.initialBalance,
      maxDrawdownPct: fundedAccounts.maxDrawdownPct,
      maxDrawdownAbs: fundedAccounts.maxDrawdownAbs,
      maxDrawdownType: fundedAccounts.maxDrawdownType,
      highWaterMark: fundedAccounts.currentHighWaterMark,
    })
    .from(accounts)
    .innerJoin(fundedAccounts, eq(fundedAccounts.accountId, accounts.id))
    .where(and(eq(accounts.userId, userId), eq(accounts.status, "active")));

  for (const acc of userAccounts) {
    const balance = Number(acc.currentBalance);
    const initial = Number(acc.initialBalance ?? balance);
    const ddPct = Number(acc.maxDrawdownPct ?? 10);
    const maxDD = Number(acc.maxDrawdownAbs ?? 0) || initial * ddPct / 100;
    const used = Math.max(0, initial - balance);
    const usedPct = maxDD > 0 ? (used / maxDD) * 100 : 0;

    if (usedPct >= 80) {
      insights.push({
        type: "account_near_breach",
        severity: usedPct >= 90 ? "critical" : "warning",
        title: `${acc.name} near breach`,
        body: `Drawdown at ${usedPct.toFixed(0)}%. Only $${(maxDD - used).toFixed(0)} remaining.`,
        actionUrl: "/accounts",
      });
    }
  }

  // Payout consistency
  const consistency = await getPayoutConsistency(userId);
  if (consistency.totalMonths >= 3 && consistency.consistency < 50) {
    insights.push({
      type: "low_payout_consistency",
      severity: "info",
      title: "Low payout consistency",
      body: `Payouts received in ${consistency.monthsWithPayout}/${consistency.totalMonths} months (${consistency.consistency.toFixed(0)}%).`,
      actionUrl: "/payouts",
    });
  }

  return insights.slice(0, 5);
}

export async function getActiveInsights(userId: string) {
  return db
    .select()
    .from(aiInsights)
    .where(
      and(
        eq(aiInsights.userId, userId),
        eq(aiInsights.isDismissed, false),
        sql`(expires_at IS NULL OR expires_at > NOW())`
      )
    )
    .orderBy(sql`CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END`);
}

export async function dismissInsight(userId: string, insightId: string) {
  await db
    .update(aiInsights)
    .set({ isDismissed: true })
    .where(and(eq(aiInsights.id, insightId), eq(aiInsights.userId, userId)));
}
