"use client";

import { Target, CheckCircle, Circle, Flame, Trophy } from "lucide-react";

const DAILY = [
  { id: "1", label: "Follow trading plan", done: true },
  { id: "2", label: "Max 3 trades", done: true },
  { id: "3", label: "No revenge trading", done: true },
  { id: "4", label: "Journal all trades", done: false },
  { id: "5", label: "Pre-session review", done: true },
];

const WEEKLY = [
  { label: "Profit target $1,000", current: 735, target: 1000 },
  { label: "Win rate > 60%", current: 67, target: 60 },
  { label: "Avg RR > 2.0", current: 2.4, target: 2.0 },
  { label: "Max DD < 2%", current: 1.1, target: 2.0 },
];

const STREAKS = [
  { label: "Profitable Days", current: 5, best: 12 },
  { label: "Plan Followed", current: 8, best: 15 },
  { label: "Journal Streak", current: 3, best: 20 },
];

export default function GoalsPage() {
  const done = DAILY.filter((g) => g.done).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="t-heading text-text-primary">Goals & Discipline</h2>
        <span className="pill pill-profit"><Flame className="h-2.5 w-2.5" /> 5 day streak</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Daily */}
        <div className="panel">
          <div className="panel-header">
            <span className="t-label">Today</span>
            <span className="t-mono text-text-secondary text-[10px]">{done}/{DAILY.length}</span>
          </div>
          <div className="panel-body-compact flex flex-col gap-1.5">
            {DAILY.map((g) => (
              <div key={g.id} className="flex items-center gap-2 px-1 py-0.5">
                {g.done ? <CheckCircle className="h-3.5 w-3.5 text-profit shrink-0" /> : <Circle className="h-3.5 w-3.5 text-text-muted shrink-0" />}
                <span className={`text-[11px] ${g.done ? "text-text-secondary line-through" : "text-text-primary"}`}>{g.label}</span>
              </div>
            ))}
            <div className="mt-2 dd-bar">
              <div className="dd-bar-fill dd-safe" style={{ width: `${(done / DAILY.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Weekly targets */}
        <div className="panel">
          <div className="panel-header"><span className="t-label">Weekly Targets</span></div>
          <div className="panel-body-compact flex flex-col gap-3">
            {WEEKLY.map((t) => {
              const met = t.label.includes("<") ? t.current <= t.target : t.current >= t.target;
              const pct = t.label.includes("<") ? 100 : Math.min(100, (t.current / t.target) * 100);
              return (
                <div key={t.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-text-primary">{t.label}</span>
                    <span className={`t-mono text-[10px] ${met ? "text-profit" : "text-text-secondary"}`}>{t.current}</span>
                  </div>
                  <div className="dd-bar"><div className={`dd-bar-fill ${met ? "dd-safe" : "bg-accent"}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streaks */}
        <div className="panel">
          <div className="panel-header"><span className="t-label">Streaks</span></div>
          <div className="panel-body-compact flex flex-col gap-3">
            {STREAKS.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-[var(--radius-sm)] p-2 bg-bg-panel border border-border-subtle">
                <div className="h-7 w-7 rounded bg-accent-soft flex items-center justify-center shrink-0">
                  <Target className="h-3.5 w-3.5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-text-primary">{s.label}</div>
                  <div className="text-[9px] text-text-muted">Best: {s.best}</div>
                </div>
                <div className="text-right">
                  <div className="t-metric-sm text-accent">{s.current}</div>
                  <div className="text-[8px] text-text-muted">days</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
