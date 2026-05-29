import { auth } from "@/server/auth";
import { stripe, PLANS } from "@/server/stripe";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { billing } = await req.json();
  const priceId =
    billing === "annual" ? PLANS.pro.annualPriceId : PLANS.pro.monthlyPriceId;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    metadata: {
      userId: session.user.id,
      plan: "pro",
    },
  });

  return Response.json({ url: checkoutSession.url });
}
