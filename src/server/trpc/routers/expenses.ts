import { z } from "zod/v4";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { expenses } from "../../db/schema";

export const expensesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(expenses.userId, ctx.userId)];
      if (input?.category) {
        conditions.push(eq(expenses.category, input.category));
      }

      return db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.expenseDate))
        .limit(input?.limit ?? 50);
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string().uuid().optional(),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        amount: z.string(),
        currency: z.string().default("USD"),
        isRecurring: z.boolean().default(false),
        recurrenceFrequency: z.enum(["weekly", "monthly", "quarterly", "annual"]).optional(),
        vendor: z.string().max(100).optional(),
        description: z.string().max(500).optional(),
        expenseDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [record] = await db
        .insert(expenses)
        .values({ ...input, userId: ctx.userId })
        .returning();
      return record;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        category: z.string().min(1).optional(),
        amount: z.string().optional(),
        vendor: z.string().max(100).optional(),
        description: z.string().max(500).optional(),
        expenseDate: z.string().optional(),
        isRecurring: z.boolean().optional(),
        recurrenceFrequency: z.enum(["weekly", "monthly", "quarterly", "annual"]).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [record] = await db
        .update(expenses)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(expenses.id, id), eq(expenses.userId, ctx.userId)))
        .returning();
      return record;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(expenses)
        .where(and(eq(expenses.id, input.id), eq(expenses.userId, ctx.userId)));
      return { success: true };
    }),
});
