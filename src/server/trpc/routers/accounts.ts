import { z } from "zod/v4";
import { eq, and, desc, sql } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { accounts, fundedAccounts, balanceSnapshots, income } from "../../db/schema";
import { calculateDrawdown } from "../../services/drawdown.service";

export const accountsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, ctx.userId))
      .orderBy(desc(accounts.updatedAt));

    return result;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.userId)));

      if (!account) return null;

      let funded = null;
      let drawdown = null;

      if (account.type === "funded") {
        const [f] = await db
          .select()
          .from(fundedAccounts)
          .where(eq(fundedAccounts.accountId, account.id));
        funded = f ?? null;

        if (funded) {
          drawdown = calculateDrawdown({
            type: (funded.maxDrawdownType as "static" | "trailing" | "eod_trailing") ?? "static",
            currentBalance: Number(account.currentBalance),
            initialBalance: Number(account.initialBalance ?? account.currentBalance),
            highWaterMark: Number(funded.currentHighWaterMark ?? account.currentBalance),
            maxDrawdownPct: funded.maxDrawdownPct ? Number(funded.maxDrawdownPct) : undefined,
            maxDrawdownAbs: funded.maxDrawdownAbs ? Number(funded.maxDrawdownAbs) : undefined,
          });
        }
      }

      const history = await db
        .select()
        .from(balanceSnapshots)
        .where(eq(balanceSnapshots.accountId, account.id))
        .orderBy(desc(balanceSnapshots.snapshotDate))
        .limit(90);

      // Total payouts for this account
      const [payoutStats] = await db
        .select({
          total: sql<string>`COALESCE(SUM(CAST(amount_net AS DECIMAL)), 0)`,
          count: sql<string>`COUNT(*)`,
        })
        .from(income)
        .where(
          and(
            eq(income.accountId, account.id),
            eq(income.status, "received")
          )
        );

      const totalPayouts = Number(payoutStats?.total ?? 0);
      const payoutCount = Number(payoutStats?.count ?? 0);

      // ROI calculation (payouts - challenge cost) / challenge cost
      const challengeCost = funded ? Number(funded.challengeCost ?? 0) : 0;
      const roi = challengeCost > 0 ? ((totalPayouts - challengeCost) / challengeCost) * 100 : 0;

      return { ...account, funded, drawdown, history: history.reverse(), totalPayouts, payoutCount, roi };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        type: z.enum(["funded", "broker", "exchange", "wallet", "cash"]),
        firm: z.string().max(100).optional(),
        currency: z.string().default("USD"),
        currentBalance: z.string().default("0"),
        initialBalance: z.string().optional(),
        color: z.string().optional(),
        notes: z.string().max(500).optional(),
        openedAt: z.string().optional(),
        funded: z
          .object({
            phase: z.enum(["challenge", "funded", "evaluation"]).default("challenge"),
            challengeCost: z.string().optional(),
            profitTargetPct: z.string().optional(),
            maxDrawdownType: z.enum(["static", "trailing", "eod_trailing"]).default("static"),
            maxDrawdownPct: z.string().optional(),
            maxDrawdownAbs: z.string().optional(),
            profitSplitPct: z.string().default("80"),
            minTradingDays: z.number().int().optional(),
            payoutThreshold: z.string().optional(),
            nextPayoutEligible: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { funded, ...accountData } = input;

      const [account] = await db
        .insert(accounts)
        .values({
          ...accountData,
          userId: ctx.userId,
          initialBalance: accountData.initialBalance ?? accountData.currentBalance,
        })
        .returning();

      if (input.type === "funded" && funded) {
        await db.insert(fundedAccounts).values({
          accountId: account.id,
          ...funded,
          currentHighWaterMark: accountData.currentBalance,
        });
      }

      // Create initial balance snapshot
      if (Number(accountData.currentBalance) > 0) {
        await db.insert(balanceSnapshots).values({
          accountId: account.id,
          balance: accountData.currentBalance,
          snapshotDate: new Date().toISOString().split("T")[0],
          source: "manual",
        });
      }

      return account;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        firm: z.string().max(100).optional(),
        status: z.enum(["active", "paused", "closed", "breached"]).optional(),
        notes: z.string().max(500).optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [account] = await db
        .update(accounts)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(accounts.id, id), eq(accounts.userId, ctx.userId)))
        .returning();
      return account;
    }),

  updateBalance: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        balance: z.string(),
        snapshotDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [account] = await db
        .select()
        .from(accounts)
        .where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.userId)));

      if (!account) return null;

      const today = input.snapshotDate ?? new Date().toISOString().split("T")[0];
      const newBalance = input.balance;

      // Update current balance
      await db
        .update(accounts)
        .set({ currentBalance: newBalance, updatedAt: new Date() })
        .where(eq(accounts.id, input.id));

      // Update high water mark if needed (for funded accounts)
      if (account.type === "funded") {
        const [funded] = await db
          .select()
          .from(fundedAccounts)
          .where(eq(fundedAccounts.accountId, input.id));

        if (funded) {
          const currentHWM = Number(funded.currentHighWaterMark ?? 0);
          if (Number(newBalance) > currentHWM) {
            await db
              .update(fundedAccounts)
              .set({
                currentHighWaterMark: newBalance,
                updatedAt: new Date(),
              })
              .where(eq(fundedAccounts.accountId, input.id));
          }
        }
      }

      // Upsert balance snapshot
      await db
        .insert(balanceSnapshots)
        .values({
          accountId: input.id,
          balance: newBalance,
          snapshotDate: today,
          source: "manual",
        })
        .onConflictDoUpdate({
          target: [balanceSnapshots.accountId, balanceSnapshots.snapshotDate],
          set: { balance: newBalance },
        });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(accounts)
        .where(and(eq(accounts.id, input.id), eq(accounts.userId, ctx.userId)));
      return { success: true };
    }),
});
