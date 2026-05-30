"use client";

import { trpc } from "@/server/trpc/client";
import { Brain, BarChart3, AlertTriangle, TrendingUp, Lightbulb, ChevronRight } from "lucide-react";

const FALLBACK = [
  { type: "performance", severity: "info" as const, title: "London session outperforms NY by 34%", body: "72% win rate in London vs 54% NY. Consider tightening NY criteria.", category: "Session" },
  { type: "risk", severity: "warning" as const, title: "Position sizing inconsistent", body: "Last 5 trades vary 0.3-2.0 lots. Standardize for consistent risk.", category: "Risk" },
  { type: "pattern", severity: "info" as const, title: "OB setup edge decaying", body: "Win rate dropped 72% → 58% in 2 weeks. Review market conditions.", category: "Setup" },
  { type: "psychology", severity: "critical" as const, title: "FOMO pattern on Tuesdays", body: "3/4 Tuesday trades were FOMO. Use pre-session checklist.", category: "Psychology" },
  { type: "opportunity", severity: "info" as const, title: "XAU/USD showing strong edge", body: "78% WR, 2.8 avg RR over 15 trades. Most profitable pair.", category: "Opportunity" },
];

export default function InsightsPage() {
  const { data: live } = trpc.insights.generate.useQuery();
  const insights = (live && live.length > 0) ? live.map((i) => ({ ...i, category: i.type })) : FALLBACK;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="t-heading text-text-primary">AI Insights</h2>
        <span className="pill pill-accent"><Brain className="h-2.5 w-2.5" /> {insights.length} active</span>
      </div>

      <div className="flex flex-col gap-2">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={`panel panel-body cursor-pointer hover:border-border-default transition-colors ${
              ins.severity === "critical" ? "border-loss/15" : ins.severity === "warning" ? "border-pending/15" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`h-7 w-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${
                ins.severity === "critical" ? "bg-loss-muted" : ins.severity === "warning" ? "bg-pending-muted" : "bg-accent-soft"
              }`}>
                {ins.type === "performance" ? <BarChart3 className="h-3.5 w-3.5 text-accent" /> :
                 ins.type === "risk" ? <AlertTriangle className="h-3.5 w-3.5 text-pending" /> :
                 ins.type === "psychology" ? <Brain className="h-3.5 w-3.5 text-loss" /> :
                 ins.type === "opportunity" ? <TrendingUp className="h-3.5 w-3.5 text-profit" /> :
                 <Lightbulb className="h-3.5 w-3.5 text-accent" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-text-primary mb-0.5">{ins.title}</div>
                <span className={`pill text-[8px] ${ins.severity === "critical" ? "pill-loss" : ins.severity === "warning" ? "pill-pending" : "pill-accent"}`}>{ins.category}</span>
                <p className="text-[11px] text-text-tertiary mt-1.5 leading-relaxed">{ins.body}</p>
              </div>
              <ChevronRight className="h-3 w-3 text-text-muted shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
