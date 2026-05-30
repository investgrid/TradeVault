import { z } from "zod/v4";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { income } from "../../db/schema";

export const incomeRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["requested", "processing", "received", "rejected"]).optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(income.userId, ctx.userId)];
      if (input?.status) {
        conditions.push(eq(income.status, input.status));
      }

      return db
        .select()
        .from(income)
        .where(and(...conditions))
        .orderBy(desc(income.createdAt))
        .limit(input?.limit ?? 50);
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string().uuid().optional(),
        type: z.enum(["payout", "affiliate", "other"]).default("payout"),
        amountGross: z.string(),
        amountNet: z.string().optional(),
        splitPct: z.string().optional(),
        platformFee: z.string().optional(),
        transferFee: z.string().optional(),
        currency: z.string().default("USD"),
        status: z.enum(["requested", "processing", "received", "rejected"]).default("received"),
        requestedAt: z.string().optional(),
        receivedAt: z.string().optional(),
        method: z.string().max(50).optional(),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [record] = await db
        .insert(income)
        .values({ ...input, userId: ctx.userId })
        .returning();
      return record;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        accountId: z.string().uuid().optional(),
        amountGross: z.string().optional(),
        amountNet: z.string().optional(),
        splitPct: z.string().optional(),
        platformFee: z.string().optional(),
        transferFee: z.string().optional(),
        status: z.enum(["requested", "processing", "received", "rejected"]).optional(),
        requestedAt: z.string().nullable().optional(),
        receivedAt: z.string().nullable().optional(),
        method: z.string().max(50).optional(),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [record] = await db
        .update(income)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(income.id, id), eq(income.userId, ctx.userId)))
        .returning();
      return record;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["requested", "processing", "received", "rejected"]),
        receivedAt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [record] = await db
        .update(income)
        .set({
          status: input.status,
          receivedAt: input.receivedAt,
          updatedAt: new Date(),
        })
        .where(and(eq(income.id, input.id), eq(income.userId, ctx.userId)))
        .returning();
      return record;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(income)
        .where(and(eq(income.id, input.id), eq(income.userId, ctx.userId)));
      return { success: true };
    }),
});
