import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { accounts, income, expenses } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const type = request.nextUrl.searchParams.get("type") ?? "all";

  const rows: string[] = [];

  if (type === "all" || type === "accounts") {
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.updatedAt));

    rows.push("--- ACCOUNTS ---");
    rows.push("Name,Type,Firm,Balance,Initial Balance,Status,Currency,Opened");
    for (const a of userAccounts) {
      rows.push(
        [a.name, a.type, a.firm ?? "", a.currentBalance, a.initialBalance ?? "", a.status, a.currency, a.openedAt ?? ""].join(",")
      );
    }
    rows.push("");
  }

  if (type === "all" || type === "payouts") {
    const userIncome = await db
      .select()
      .from(income)
      .where(eq(income.userId, userId))
      .orderBy(desc(income.createdAt));

    rows.push("--- PAYOUTS ---");
    rows.push("Type,Gross,Net,Split%,Platform Fee,Transfer Fee,Status,Method,Requested,Received");
    for (const i of userIncome) {
      rows.push(
        [i.type, i.amountGross, i.amountNet ?? "", i.splitPct ?? "", i.platformFee ?? "", i.transferFee ?? "", i.status, i.method ?? "", i.requestedAt ?? "", i.receivedAt ?? ""].join(",")
      );
    }
    rows.push("");
  }

  if (type === "all" || type === "expenses") {
    const userExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.expenseDate));

    rows.push("--- EXPENSES ---");
    rows.push("Category,Amount,Vendor,Description,Date,Recurring,Frequency");
    for (const e of userExpenses) {
      rows.push(
        [e.category, e.amount, e.vendor ?? "", (e.description ?? "").replace(/,/g, ";"), e.expenseDate, e.isRecurring ? "yes" : "no", e.recurrenceFrequency ?? ""].join(",")
      );
    }
  }

  const csv = rows.join("\n");
  const filename = `tradevault-export-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
