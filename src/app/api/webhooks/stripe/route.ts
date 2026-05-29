import { headers } from "next/headers";
import { stripe } from "@/server/stripe";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (userId && session.subscription) {
        await db
          .update(users)
          .set({
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan: session.metadata?.plan ?? "pro",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const plan = subscription.status === "active" ? "pro" : "free";

      await db
        .update(users)
        .set({ plan, updatedAt: new Date() })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await db
        .update(users)
        .set({
          plan: "free",
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
