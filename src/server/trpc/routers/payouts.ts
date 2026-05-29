import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import {
  getAveragePayoutTime,
  getNextEligiblePayouts,
  getPayoutsByMonth,
  getPendingPayoutsDetail,
} from "../../services/payout.service";

export const payoutsRouter = router({
  averageTime: protectedProcedure
    .input(z.object({ firm: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return getAveragePayoutTime(ctx.userId, input?.firm);
    }),

  nextEligible: protectedProcedure.query(async ({ ctx }) => {
    return getNextEligiblePayouts(ctx.userId);
  }),

  byMonth: protectedProcedure
    .input(z.object({ months: z.number().int().default(12) }).optional())
    .query(async ({ ctx, input }) => {
      return getPayoutsByMonth(ctx.userId, input?.months ?? 12);
    }),

  pending: protectedProcedure.query(async ({ ctx }) => {
    return getPendingPayoutsDetail(ctx.userId);
  }),
});
