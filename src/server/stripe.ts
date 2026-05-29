import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: { accounts: 1, historyDays: 30, transactions: 10 },
  },
  pro: {
    name: "Pro",
    monthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    annualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
    monthlyPrice: 9,
    annualPrice: 49,
    limits: { accounts: -1, historyDays: -1, transactions: -1 },
  },
} as const;
