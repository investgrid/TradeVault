import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { users } from "../../db/schema";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        plan: users.plan,
        currency: users.currency,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.userId));

    return user ?? null;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        currency: z.string().length(3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [user] = await db
        .update(users)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(users.id, ctx.userId))
        .returning();
      return user;
    }),
});
