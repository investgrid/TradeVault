import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { generateInsights, getActiveInsights, dismissInsight } from "../../services/insights.service";

export const insightsRouter = router({
  generate: protectedProcedure.query(async ({ ctx }) => {
    return generateInsights(ctx.userId);
  }),

  active: protectedProcedure.query(async ({ ctx }) => {
    return getActiveInsights(ctx.userId);
  }),

  dismiss: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await dismissInsight(ctx.userId, input.id);
      return { success: true };
    }),
});
