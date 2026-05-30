import { z } from "zod/v4";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { trades } from "../../db/schema";

export const tradesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(200).optional().default(50),
        offset: z.number().min(0).optional().default(0),
        accountId: z.string().uuid().optional(),
        pair: z.string().optional(),
        setup: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const filters = [eq(trades.userId, ctx.userId)];

      if (input?.accountId) filters.push(eq(trades.accountId, input.accountId));
      if (input?.pair) filters.push(eq(trades.pair, input.pair));
      if (input?.setup) filters.push(eq(trades.setup, input.setup));
      if (input?.dateFrom) filters.push(gte(trades.tradeDate, input.dateFrom));
      if (input?.dateTo) filters.push(lte(trades.tradeDate, input.dateTo));

      const result = await db
        .select()
        .from(trades)
        .where(and(...filters))
        .orderBy(desc(trades.tradeDate))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);

      return result;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [trade] = await db
        .select()
        .from(trades)
        .where(and(eq(trades.id, input.id), eq(trades.userId, ctx.userId)));
      return trade ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string().uuid().optional(),
        pair: z.string().min(1),
        direction: z.enum(["long", "short"]),
        entryPrice: z.string().optional(),
        exitPrice: z.string().optional(),
        positionSize: z.string().optional(),
        pnl: z.string().optional(),
        riskReward: z.string().optional(),
        setup: z.string().optional(),
        session: z.string().optional(),
        grade: z.string().optional(),
        emotion: z.string().optional(),
        notes: z.string().optional(),
        mistakes: z.string().optional(),
        duration: z.string().optional(),
        tradeDate: z.string(),
        status: z.enum(["open", "closed"]).optional().default("closed"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [trade] = await db
        .insert(trades)
        .values({
          userId: ctx.userId,
          accountId: input.accountId ?? null,
          pair: input.pair.toUpperCase(),
          direction: input.direction,
          entryPrice: input.entryPrice ?? null,
          exitPrice: input.exitPrice ?? null,
          positionSize: input.positionSize ?? null,
          pnl: input.pnl ?? null,
          riskReward: input.riskReward ?? null,
          setup: input.setup ?? null,
          session: input.session ?? null,
          grade: input.grade ?? null,
          emotion: input.emotion ?? null,
          notes: input.notes ?? null,
          mistakes: input.mistakes ?? null,
          duration: input.duration ?? null,
          tradeDate: input.tradeDate,
          status: input.status,
        })
        .returning();

      return trade;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        pair: z.string().optional(),
        direction: z.enum(["long", "short"]).optional(),
        entryPrice: z.string().optional(),
        exitPrice: z.string().optional(),
        positionSize: z.string().optional(),
        pnl: z.string().optional(),
        riskReward: z.string().optional(),
        setup: z.string().optional(),
        session: z.string().optional(),
        grade: z.string().optional(),
        emotion: z.string().optional(),
        notes: z.string().optional(),
        mistakes: z.string().optional(),
        duration: z.string().optional(),
        status: z.enum(["open", "closed"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updates: Record<string, any> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) updates[k] = v;
      }
      if (Object.keys(updates).length === 0) return null;

      const [updated] = await db
        .update(trades)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(trades.id, id), eq(trades.userId, ctx.userId)))
        .returning();

      return updated ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(trades)
        .where(and(eq(trades.id, input.id), eq(trades.userId, ctx.userId)));
      return { success: true };
    }),

  stats: protectedProcedure
    .input(z.object({ days: z.number().optional().default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - (input?.days ?? 30));
      const dateStr = since.toISOString().slice(0, 10);

      const rows = await db
        .select()
        .from(trades)
        .where(
          and(
            eq(trades.userId, ctx.userId),
            gte(trades.tradeDate, dateStr)
          )
        );

      const total = rows.length;
      const wins = rows.filter((r) => Number(r.pnl ?? 0) > 0).length;
      const totalPnl = rows.reduce((s, r) => s + Number(r.pnl ?? 0), 0);
      const avgRR = total > 0 ? rows.reduce((s, r) => s + Number(r.riskReward ?? 0), 0) / total : 0;
      const winRate = total > 0 ? (wins / total) * 100 : 0;

      return { total, wins, losses: total - wins, totalPnl, avgRR, winRate };
    }),

  pnlByDate: protectedProcedure
    .input(z.object({ days: z.number().optional().default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - (input?.days ?? 30));
      const dateStr = since.toISOString().slice(0, 10);

      const rows = await db
        .select({ date: trades.tradeDate, pnl: trades.pnl })
        .from(trades)
        .where(and(eq(trades.userId, ctx.userId), gte(trades.tradeDate, dateStr)))
        .orderBy(trades.tradeDate);

      const byDate: Record<string, number> = {};
      for (const r of rows) {
        byDate[r.date] = (byDate[r.date] ?? 0) + Number(r.pnl ?? 0);
      }

      return Object.entries(byDate).map(([date, pnl]) => ({ date, pnl }));
    }),
});
