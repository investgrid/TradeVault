"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ROUTES: Record<string, string> = {
  "g d": "/",
  "g a": "/accounts",
  "g p": "/payouts",
  "g e": "/expenses",
  "g r": "/risk",
  "g n": "/analytics",
  "g j": "/journal",
  "g t": "/trades",
  "g c": "/calendar",
  "g o": "/goals",
  "g s": "/settings",
};

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let buffer = "";
    let timer: ReturnType<typeof setTimeout>;

    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      clearTimeout(timer);
      buffer += e.key.toLowerCase();
      timer = setTimeout(() => { buffer = ""; }, 800);

      const route = ROUTES[buffer];
      if (route) {
        e.preventDefault();
        buffer = "";
        router.push(route);
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [router]);

  return null;
}
