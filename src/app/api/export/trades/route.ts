import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { trades } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(trades)
    .where(eq(trades.userId, session.user.id))
    .orderBy(desc(trades.tradeDate));

  const csvHeaders = ["Date", "Pair", "Direction", "Entry", "Exit", "Size", "P&L", "R:R", "Setup", "Session", "Grade", "Emotion", "Notes"];
  const csvRows = rows.map((t) => [
    t.tradeDate,
    t.pair,
    t.direction,
    t.entryPrice ?? "",
    t.exitPrice ?? "",
    t.positionSize ?? "",
    t.pnl ?? "",
    t.riskReward ?? "",
    t.setup ?? "",
    t.session ?? "",
    t.grade ?? "",
    t.emotion ?? "",
    (t.notes ?? "").replace(/,/g, ";").replace(/\n/g, " "),
  ]);

  const csv = [csvHeaders.join(","), ...csvRows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="tradevault-trades-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
