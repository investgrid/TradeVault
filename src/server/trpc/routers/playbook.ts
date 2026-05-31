import { z } from "zod/v4";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { playbookSetups } from "../../db/schema";

export const playbookRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.select().from(playbookSetups).where(eq(playbookSetups.userId, ctx.userId)).orderBy(desc(playbookSetups.updatedAt));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      rules: z.string().optional(),
      bestPair: z.string().optional(),
      bestSession: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [setup] = await db.insert(playbookSetups).values({
        userId: ctx.userId,
        name: input.name,
        description: input.description ?? null,
        rules: input.rules ?? null,
        bestPair: input.bestPair ?? null,
        bestSession: input.bestSession ?? null,
      }).returning();
      return setup;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      description: z.string().optional(),
      rules: z.string().optional(),
      bestPair: z.string().optional(),
      bestSession: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updates: Record<string, any> = {};
      for (const [k, v] of Object.entries(data)) { if (v !== undefined) updates[k] = v; }
      if (Object.keys(updates).length === 0) return null;
      const [updated] = await db.update(playbookSetups).set({ ...updates, updatedAt: new Date() }).where(and(eq(playbookSetups.id, id), eq(playbookSetups.userId, ctx.userId))).returning();
      return updated ?? null;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(playbookSetups).where(and(eq(playbookSetups.id, input.id), eq(playbookSetups.userId, ctx.userId)));
      return { success: true };
    }),
});
