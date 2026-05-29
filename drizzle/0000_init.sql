CREATE TABLE "tv_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"name" text,
	"avatar_url" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tv_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tv_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tv_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"firm" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"current_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"initial_balance" numeric(18, 2),
	"color" text,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"opened_at" date,
	"closed_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funded_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"phase" text DEFAULT 'challenge' NOT NULL,
	"challenge_cost" numeric(18, 2),
	"profit_target_pct" numeric(5, 2),
	"max_drawdown_type" text DEFAULT 'static' NOT NULL,
	"max_drawdown_pct" numeric(5, 2),
	"max_drawdown_abs" numeric(18, 2),
	"current_high_water_mark" numeric(18, 2),
	"profit_split_pct" numeric(5, 2) DEFAULT '80',
	"min_trading_days" integer,
	"payout_threshold" numeric(18, 2),
	"next_payout_eligible" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "funded_accounts_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "balance_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"balance" numeric(18, 2) NOT NULL,
	"equity" numeric(18, 2),
	"snapshot_date" date NOT NULL,
	"source" text DEFAULT 'manual',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "balance_snapshots_account_id_snapshot_date_unique" UNIQUE("account_id","snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "income" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"type" text DEFAULT 'payout' NOT NULL,
	"amount_gross" numeric(18, 2) NOT NULL,
	"amount_net" numeric(18, 2),
	"split_pct" numeric(5, 2),
	"platform_fee" numeric(18, 2) DEFAULT '0',
	"transfer_fee" numeric(18, 2) DEFAULT '0',
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'received' NOT NULL,
	"requested_at" date,
	"received_at" date,
	"method" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"category" text NOT NULL,
	"subcategory" text,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"is_recurring" boolean DEFAULT false,
	"recurrence_frequency" text,
	"vendor" text,
	"description" text,
	"expense_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"severity" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"action_url" text,
	"is_dismissed" boolean DEFAULT false,
	"generated_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tv_sessions" ADD CONSTRAINT "tv_sessions_user_id_tv_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tv_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_tv_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tv_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_tv_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tv_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funded_accounts" ADD CONSTRAINT "funded_accounts_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_user_id_tv_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tv_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_tv_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tv_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_tv_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."tv_users"("id") ON DELETE cascade ON UPDATE no action;
