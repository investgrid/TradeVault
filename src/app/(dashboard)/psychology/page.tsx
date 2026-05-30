"use client";

import { Brain, Smile, Meh, Frown, AlertTriangle } from "lucide-react";

const LOG = [
  { date: "2026-05-30", emotion: "Confident", score: 8, pnl: 235.5, note: "Followed plan perfectly" },
  { date: "2026-05-29", emotion: "FOMO", score: 3, pnl: -180, note: "Entered too early, chased price" },
  { date: "2026-05-28", emotion: "Disciplined", score: 9, pnl: 680, note: "Patient wait for setup" },
  { date: "2026-05-27", emotion: "Neutral", score: 6, pnl: 408, note: "Standard execution" },
  { date: "2026-05-26", emotion: "Anxious", score: 4, pnl: -40, note: "Moved SL to BE too early" },
];

const PATTERNS = [
  { trigger: "FOMO after missing move", freq: 8, impact: -1240, fix: "Set alerts. Walk away after missed entry." },
  { trigger: "Revenge trading after loss", freq: 4, impact: -890, fix: "30min break after loss. Journal before re-entry." },
  { trigger: "Overconfidence after streak", freq: 3, impact: -520, fix: "Keep size constant. Reduce 50% after 5 wins." },
];

export default function PsychologyPage() {
  const avg = LOG.reduce((s, e) => s + e.score, 0) / LOG.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="t-heading text-text-primary">Trading Psychology</h2>
        <span className="pill pill-accent"><Brain className="h-2.5 w-2.5" /> {avg.toFixed(1)}/10</span>
      </div>

      <div className="kpi-grid grid-cols-2 lg:grid-cols-4">
        <div className="kpi-cell"><span className="t-label">Avg Mindset</span><span className="t-metric-sm text-text-primary">{avg.toFixed(1)}/10</span></div>
        <div className="kpi-cell"><span className="t-label">Best State</span><span className="t-metric-sm text-profit">Disciplined</span></div>
        <div className="kpi-cell"><span className="t-label">Worst Trigger</span><span className="t-metric-sm text-loss">FOMO</span></div>
        <div className="kpi-cell"><span className="t-label">Tilt Cost</span><span className="t-metric-sm text-loss">-$2,650</span></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 panel-flush">
          <div className="panel-header"><span className="t-label">Emotion Log</span></div>
          <div className="divide-y divide-border-subtle">
            {LOG.map((e) => (
              <div key={e.date} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-elevated/40 transition-colors">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${e.score >= 7 ? "bg-profit-muted" : e.score >= 5 ? "bg-pending-muted" : "bg-loss-muted"}`}>
                  {e.score >= 7 ? <Smile className="h-3 w-3 text-profit" /> : e.score >= 5 ? <Meh className="h-3 w-3 text-pending" /> : <Frown className="h-3 w-3 text-loss" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-text-primary">{e.emotion}</span>
                    <span className="text-[9px] text-text-muted">{e.date}</span>
                  </div>
                  <span className="text-[10px] text-text-tertiary truncate block">{e.note}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`t-mono text-[11px] ${e.pnl >= 0 ? "text-profit" : "text-loss"}`}>{e.pnl >= 0 ? "+" : ""}${e.pnl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 panel">
          <div className="panel-header"><span className="t-label">Destructive Patterns</span><AlertTriangle className="h-3 w-3 text-pending" /></div>
          <div className="panel-body-compact flex flex-col gap-3">
            {PATTERNS.map((p, i) => (
              <div key={i} className="rounded-[var(--radius-md)] border border-border-subtle p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-text-primary">{p.trigger}</span>
                  <span className="t-mono text-loss text-[10px]">{p.freq}x</span>
                </div>
                <span className="pill pill-loss text-[8px] mb-1.5">Impact: -${Math.abs(p.impact)}</span>
                <p className="text-[10px] text-text-tertiary leading-relaxed">{p.fix}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
