import { z } from "zod/v4";
import { eq, and, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { dailyChecklist } from "../../db/schema";

export const checklistRouter = router({
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().slice(0, 10);
    const [entry] = await db.select().from(dailyChecklist).where(and(eq(dailyChecklist.userId, ctx.userId), eq(dailyChecklist.checkDate, today)));
    return entry ?? null;
  }),

  upsert: protectedProcedure
    .input(z.object({
      items: z.string(),
      completedItems: z.string().optional(),
      mindsetScore: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().slice(0, 10);
      const [existing] = await db.select().from(dailyChecklist).where(and(eq(dailyChecklist.userId, ctx.userId), eq(dailyChecklist.checkDate, today)));
      if (existing) {
        const [updated] = await db.update(dailyChecklist).set({ items: input.items, completedItems: input.completedItems ?? null, mindsetScore: input.mindsetScore ?? null, notes: input.notes ?? null }).where(eq(dailyChecklist.id, existing.id)).returning();
        return updated;
      }
      const [created] = await db.insert(dailyChecklist).values({ userId: ctx.userId, checkDate: today, items: input.items, completedItems: input.completedItems ?? null, mindsetScore: input.mindsetScore ?? null, notes: input.notes ?? null }).returning();
      return created;
    }),
});
