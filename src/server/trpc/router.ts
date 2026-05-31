import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { accountsRouter } from "./routers/accounts";
import { incomeRouter } from "./routers/income";
import { expensesRouter } from "./routers/expenses";
import { analyticsRouter } from "./routers/analytics";
import { payoutsRouter } from "./routers/payouts";
import { insightsRouter } from "./routers/insights";
import { billingRouter } from "./routers/billing";
import { tradesRouter } from "./routers/trades";
import { playbookRouter } from "./routers/playbook";
import { checklistRouter } from "./routers/checklist";

export const appRouter = router({
  user: userRouter,
  accounts: accountsRouter,
  income: incomeRouter,
  expenses: expensesRouter,
  analytics: analyticsRouter,
  payouts: payoutsRouter,
  insights: insightsRouter,
  billing: billingRouter,
  trades: tradesRouter,
  playbook: playbookRouter,
  checklist: checklistRouter,
});

export type AppRouter = typeof appRouter;
