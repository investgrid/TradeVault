"use client";

import { useState } from "react";
import { trpc } from "@/server/trpc/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: pnlData } = trpc.trades.pnlByDate.useQuery({ days: 90 });

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const offset = first === 0 ? 6 : first - 1;

  const pnlMap: Record<string, number> = {};
  for (const entry of pnlData ?? []) {
    pnlMap[entry.date] = entry.pnl;
  }

  const monthPnls = Object.entries(pnlMap).filter(([d]) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));
  const vals = monthPnls.map(([, v]) => v);
  const sum = vals.reduce((a, b) => a + b, 0);
  const green = vals.filter((v) => v > 0).length;
  const red = vals.filter((v) => v < 0).length;
  const best = vals.length > 0 ? Math.max(...vals) : 0;
  const worst = vals.length > 0 ? Math.min(...vals) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="f-title">P&L Calendar</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }} className="h-6 w-6 flex items-center justify-center rounded border border-line-1 text-t4 hover:text-t1 hover:border-line-2 transition-colors"><ChevronLeft className="h-3 w-3" /></button>
          <span className="text-[12px] font-medium text-t1 min-w-[100px] text-center">{MONTHS[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} className="h-6 w-6 flex items-center justify-center rounded border border-line-1 text-t4 hover:text-t1 hover:border-line-2 transition-colors"><ChevronRight className="h-3 w-3" /></button>
        </div>
      </div>

      <div className="metric-grid grid-cols-2 lg:grid-cols-5">
        <div className="metric-cell"><span className="f-label">Monthly</span><span className={`f-num font-semibold ${sum >= 0 ? "text-up" : "text-down"}`}>{sum >= 0 ? "+" : ""}${sum.toFixed(0)}</span></div>
        <div className="metric-cell"><span className="f-label">Win Rate</span><span className="f-num text-t1">{(green + red) > 0 ? ((green / (green + red)) * 100).toFixed(0) : 0}%</span></div>
        <div className="metric-cell"><span className="f-label">Green Days</span><span className="f-num text-up">{green}</span></div>
        <div className="metric-cell"><span className="f-label">Best</span><span className="f-num text-up">{best > 0 ? `+$${best.toFixed(0)}` : "—"}</span></div>
        <div className="metric-cell"><span className="f-label">Worst</span><span className="f-num text-down">{worst < 0 ? `$${worst.toFixed(0)}` : "—"}</span></div>
      </div>

      <div className="card card-body">
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => <div key={d} className="text-center f-label py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: total }).map((_, i) => {
            const day = i + 1;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const pnl = pnlMap[key];
            const has = pnl !== undefined;
            return (
              <div key={day} className={`aspect-square rounded-[4px] flex flex-col items-center justify-center cursor-pointer transition-all ${
                has ? pnl > 0 ? "bg-up-soft hover:bg-up/15 ring-1 ring-up/10" : pnl < 0 ? "bg-down-soft hover:bg-down/15 ring-1 ring-down/10" : "bg-layer-3" : "hover:bg-layer-3"
              }`}>
                <span className={`text-[10px] font-medium ${has ? "text-t1" : "text-t4"}`}>{day}</span>
                {has && pnl !== 0 && <span className={`text-[7px] font-semibold mt-0.5 ${pnl > 0 ? "text-up" : "text-down"}`}>{pnl > 0 ? "+" : ""}{Math.abs(pnl) >= 1000 ? `${(pnl / 1000).toFixed(1)}k` : `$${pnl.toFixed(0)}`}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
