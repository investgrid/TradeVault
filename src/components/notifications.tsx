"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/server/trpc/client";
import { Bell, X, AlertTriangle, TrendingUp, Zap, CheckCircle } from "lucide-react";

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const { data: insights } = trpc.insights.generate.useQuery();
  const notifications = insights ?? [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative h-[26px] w-[26px] flex items-center justify-center rounded-[var(--r-sm)] text-t4 hover:text-t2 hover:bg-layer-3 transition-colors"
      >
        <Bell className="h-3.5 w-3.5" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand text-[7px] font-bold text-white flex items-center justify-center ring-2 ring-layer-0">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 w-[340px] z-50 rounded-[var(--r-lg)] border border-line-2 bg-layer-2 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-line-1">
                <span className="text-[12px] font-semibold text-t1">Notifications</span>
                <button onClick={() => setOpen(false)} className="p-0.5 text-t4 hover:text-t1 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-line-0">
                    {notifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-2.5 px-4 py-3 hover:bg-layer-3/50 transition-colors">
                        <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          n.severity === "critical" ? "bg-down-soft" :
                          n.severity === "warning" ? "bg-warn-soft" : "bg-brand-soft"
                        }`}>
                          {n.severity === "critical" ? <AlertTriangle className="h-3 w-3 text-down" /> :
                           n.severity === "warning" ? <AlertTriangle className="h-3 w-3 text-warn" /> :
                           <Zap className="h-3 w-3 text-brand" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium text-t1 leading-tight">{n.title}</div>
                          <div className="text-[10px] text-t4 mt-0.5 leading-snug line-clamp-2">{n.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <CheckCircle className="h-5 w-5 text-t4" />
                    <span className="f-sub">All clear — no alerts</span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
