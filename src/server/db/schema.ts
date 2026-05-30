import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  date,
  boolean,
  integer,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("tv_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("tv_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authAccounts = pgTable("auth_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  firm: text("firm"),
  currency: text("currency").notNull().default("USD"),
  currentBalance: decimal("current_balance", { precision: 18, scale: 2 }).notNull().default("0"),
  initialBalance: decimal("initial_balance", { precision: 18, scale: 2 }),
  color: text("color"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  openedAt: date("opened_at"),
  closedAt: date("closed_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const fundedAccounts = pgTable("funded_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull().unique().references(() => accounts.id, { onDelete: "cascade" }),
  phase: text("phase").notNull().default("challenge"),
  challengeCost: decimal("challenge_cost", { precision: 18, scale: 2 }),
  profitTargetPct: decimal("profit_target_pct", { precision: 5, scale: 2 }),
  maxDrawdownType: text("max_drawdown_type").notNull().default("static"),
  maxDrawdownPct: decimal("max_drawdown_pct", { precision: 5, scale: 2 }),
  maxDrawdownAbs: decimal("max_drawdown_abs", { precision: 18, scale: 2 }),
  currentHighWaterMark: decimal("current_high_water_mark", { precision: 18, scale: 2 }),
  profitSplitPct: decimal("profit_split_pct", { precision: 5, scale: 2 }).default("80"),
  minTradingDays: integer("min_trading_days"),
  payoutThreshold: decimal("payout_threshold", { precision: 18, scale: 2 }),
  nextPayoutEligible: date("next_payout_eligible"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const balanceSnapshots = pgTable(
  "balance_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    balance: decimal("balance", { precision: 18, scale: 2 }).notNull(),
    equity: decimal("equity", { precision: 18, scale: 2 }),
    snapshotDate: date("snapshot_date").notNull(),
    source: text("source").default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.accountId, table.snapshotDate)]
);

export const income = pgTable("income", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  type: text("type").notNull().default("payout"),
  amountGross: decimal("amount_gross", { precision: 18, scale: 2 }).notNull(),
  amountNet: decimal("amount_net", { precision: 18, scale: 2 }),
  splitPct: decimal("split_pct", { precision: 5, scale: 2 }),
  platformFee: decimal("platform_fee", { precision: 18, scale: 2 }).default("0"),
  transferFee: decimal("transfer_fee", { precision: 18, scale: 2 }).default("0"),
  currency: text("currency").default("USD"),
  status: text("status").notNull().default("received"),
  requestedAt: date("requested_at"),
  receivedAt: date("received_at"),
  method: text("method"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceFrequency: text("recurrence_frequency"),
  vendor: text("vendor"),
  description: text("description"),
  expenseDate: date("expense_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Trades ───
export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  pair: text("pair").notNull(),
  direction: text("direction").notNull(),
  entryPrice: decimal("entry_price", { precision: 18, scale: 6 }),
  exitPrice: decimal("exit_price", { precision: 18, scale: 6 }),
  positionSize: decimal("position_size", { precision: 18, scale: 4 }),
  pnl: decimal("pnl", { precision: 18, scale: 2 }),
  riskReward: decimal("risk_reward", { precision: 6, scale: 2 }),
  setup: text("setup"),
  session: text("session"),
  grade: text("grade"),
  emotion: text("emotion"),
  notes: text("notes"),
  mistakes: text("mistakes"),
  duration: text("duration"),
  screenshotUrl: text("screenshot_url"),
  status: text("status").notNull().default("closed"),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  tradeDate: date("trade_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Playbook Setups ───
export const playbookSetups = pgTable("playbook_setups", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  rules: text("rules"),
  bestPair: text("best_pair"),
  bestSession: text("best_session"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Risk Rules ───
export const riskRules = pgTable("risk_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ruleType: text("rule_type").notNull(),
  limitValue: decimal("limit_value", { precision: 18, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 18, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  resetFrequency: text("reset_frequency").default("daily"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Daily Checklist ───
export const dailyChecklist = pgTable("daily_checklist", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  checkDate: date("check_date").notNull(),
  items: text("items").notNull(),
  completedItems: text("completed_items"),
  mindsetScore: integer("mindset_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("info"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  actionUrl: text("action_url"),
  isDismissed: boolean("is_dismissed").default(false),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
