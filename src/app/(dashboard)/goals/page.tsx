"use client";

import { useState, useEffect, useCallback } from "react";
import { Target, CheckCircle, Circle, Flame, Trophy, Brain } from "lucide-react";
import { trpc } from "@/server/trpc/client";

const DEFAULT_ITEMS = [
  "Follow trading plan",
  "Max 3 trades",
  "No revenge trading",
  "Journal all trades",
  "Pre-session review",
];

const STREAKS = [
  { label: "Profitable Days", current: 5, best: 12 },
  { label: "Plan Followed", current: 8, best: 15 },
  { label: "Journal Streak", current: 3, best: 20 },
];

export default function GoalsPage() {
  const { data: todayEntry, isLoading } = trpc.checklist.getToday.useQuery();
  const upsert = trpc.checklist.upsert.useMutation();
  const utils = trpc.useUtils();

  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [completed, setCompleted] = useState<string[]>([]);
  const [mindsetScore, setMindsetScore] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Load from server once
  useEffect(() => {
    if (todayEntry && !initialized) {
      try {
        const parsed = JSON.parse(todayEntry.items);
        if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
      } catch {}
      try {
        const parsed = JSON.parse(todayEntry.completedItems ?? "[]");
        if (Array.isArray(parsed)) setCompleted(parsed);
      } catch {}
      setMindsetScore(todayEntry.mindsetScore ?? 5);
      setNotes(todayEntry.notes ?? "");
      setInitialized(true);
    } else if (!todayEntry && !isLoading && !initialized) {
      setInitialized(true);
    }
  }, [todayEntry, isLoading, initialized]);

  const save = useCallback(
    (newCompleted: string[], newMindset: number, newNotes: string) => {
      upsert.mutate(
        {
          items: JSON.stringify(items),
          completedItems: JSON.stringify(newCompleted),
          mindsetScore: newMindset,
          notes: newNotes,
        },
        { onSuccess: () => utils.checklist.getToday.invalidate() }
      );
    },
    [items, upsert, utils]
  );

  const toggleItem = (item: string) => {
    const next = completed.includes(item)
      ? completed.filter((i) => i !== item)
      : [...completed, item];
    setCompleted(next);
    save(next, mindsetScore, notes);
  };

  const handleMindset = (val: number) => {
    setMindsetScore(val);
    save(completed, val, notes);
  };

  const handleNotes = (val: string) => {
    setNotes(val);
  };

  const saveNotes = () => {
    save(completed, mindsetScore, notes);
  };

  const done = completed.length;
  const total = items.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-[var(--r-md)]" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="skeleton h-[280px] rounded-[var(--r-md)]" />
          <div className="skeleton h-[280px] rounded-[var(--r-md)]" />
          <div className="skeleton h-[280px] rounded-[var(--r-md)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="f-title text-t1">Goals & Discipline</h2>
        <span className="pill pill-brand"><Flame className="h-2.5 w-2.5" /> {STREAKS[1].current} day streak</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Daily Checklist */}
        <div className="card">
          <div className="card-header">
            <span className="f-label">Today&apos;s Checklist</span>
            <span className="f-num-sm text-t3">{done}/{total}</span>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {items.map((item) => {
              const isDone = completed.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-[var(--r-sm)] hover:bg-layer-3 transition-colors text-left w-full"
                >
                  {isDone ? (
                    <CheckCircle className="h-3.5 w-3.5 text-up shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-t4 shrink-0" />
                  )}
                  <span className={`text-[11px] ${isDone ? "text-t3 line-through" : "text-t1"}`}>{item}</span>
                </button>
              );
            })}
            <div className="mt-3 dd-track">
              <div className={`dd-fill ${pct >= 80 ? "dd-fill-safe" : pct >= 50 ? "dd-fill-warn" : "dd-fill-danger"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="f-micro text-center mt-1">
              {pct === 100 ? "All done — great discipline!" : `${total - done} remaining`}
            </span>
          </div>
        </div>

        {/* Mindset & Notes */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-1.5">
              <Brain className="h-3 w-3 text-t4" />
              <span className="f-label">Mindset</span>
            </div>
            <span className="f-num-sm text-brand">{mindsetScore}/10</span>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div>
              <label className="f-micro block mb-2">How do you feel about trading today?</label>
              <input
                type="range"
                min={1}
                max={10}
                value={mindsetScore}
                onChange={(e) => handleMindset(Number(e.target.value))}
                className="w-full accent-[var(--brand)]"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="f-micro text-down">Tilted</span>
                <span className="f-micro text-up">Locked in</span>
              </div>
            </div>
            <div>
              <label className="f-micro block mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => handleNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Pre-session thoughts, plan for the day..."
                className="w-full h-[90px] rounded-[var(--r-sm)] bg-layer-3 border border-line-1 px-3 py-2 text-[11px] text-t1 placeholder:text-t4 resize-none focus:outline-none focus:ring-1 focus:ring-brand/40"
              />
            </div>
          </div>
        </div>

        {/* Streaks */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3 w-3 text-t4" />
              <span className="f-label">Streaks</span>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {STREAKS.map((s) => {
              const streakPct = s.best > 0 ? Math.min(100, (s.current / s.best) * 100) : 0;
              return (
                <div key={s.label} className="rounded-[var(--r-sm)] p-3 bg-layer-2 border border-line-0">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-[var(--r-sm)] bg-brand-soft flex items-center justify-center shrink-0">
                      <Target className="h-3.5 w-3.5 text-brand" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-medium text-t1">{s.label}</div>
                      <div className="f-micro">Best: {s.best} days</div>
                    </div>
                    <div className="text-right">
                      <div className="f-num text-brand">{s.current}</div>
                      <div className="f-micro">days</div>
                    </div>
                  </div>
                  <div className="dd-track mt-2">
                    <div className="dd-fill dd-fill-safe" style={{ width: `${streakPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
