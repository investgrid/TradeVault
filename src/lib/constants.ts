export const ACCOUNT_TYPES = [
  "funded",
  "broker",
  "exchange",
  "wallet",
  "cash",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  funded: "Funded Account",
  broker: "Real Account",
  exchange: "Exchange",
  wallet: "Wallet",
  cash: "Cash Account",
};

export const ACCOUNT_STATUSES = [
  "active",
  "paused",
  "closed",
  "breached",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const PAYOUT_STATUSES = [
  "requested",
  "processing",
  "received",
  "rejected",
] as const;

export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const DRAWDOWN_TYPES = ["static", "trailing", "eod_trailing"] as const;

export type DrawdownType = (typeof DRAWDOWN_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  "challenge_fees",
  "failed_challenge_fees",
  "subscriptions",
  "vps",
  "data_feeds",
  "education",
  "software",
  "banking_fees",
  "crypto_fees",
  "taxes_estimated",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  challenge_fees: "Challenge Fees",
  failed_challenge_fees: "Failed Challenge Fees",
  subscriptions: "Subscriptions",
  vps: "VPS",
  data_feeds: "Data Feeds",
  education: "Education",
  software: "Software",
  banking_fees: "Banking Fees",
  crypto_fees: "Crypto Fees",
  taxes_estimated: "Estimated Taxes",
  other: "Other",
};

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Accounts", href: "/accounts", icon: "Wallet" },
  { label: "Payouts", href: "/payouts", icon: "ArrowUpDown" },
  { label: "Expenses", href: "/expenses", icon: "Receipt" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;
