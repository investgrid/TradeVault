import { z } from "zod/v4";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../trpc";
import { stripe, PLANS } from "../../stripe";
import { db } from "../../db";
import { users } from "../../db/schema";

export const billingRouter = router({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select({
        plan: users.plan,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, ctx.userId));

    if (!user) return null;

    let subscription = null;
    if (user.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId) as any;
        subscription = {
          status: sub.status as string,
          currentPeriodEnd: sub.current_period_end as number,
          cancelAtPeriodEnd: sub.cancel_at_period_end as boolean,
        };
      } catch {
        // Subscription may have been deleted
      }
    }

    return {
      plan: user.plan,
      subscription,
    };
  }),

  createCheckout: protectedProcedure
    .input(z.object({ billing: z.enum(["monthly", "annual"]) }))
    .mutation(async ({ ctx, input }) => {
      const priceId =
        input.billing === "annual"
          ? PLANS.pro.annualPriceId
          : PLANS.pro.monthlyPriceId;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?upgraded=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
        metadata: {
          userId: ctx.userId,
          plan: "pro",
        },
      });

      return { url: session.url };
    }),

  createPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const [user] = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, ctx.userId));

    if (!user?.stripeCustomerId) {
      return { url: null };
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return { url: session.url };
  }),
});
