"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message ?? "Invalid credentials");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="card card-body space-y-5">
      <div className="text-center">
        <h1 className="f-title mb-1">Welcome back</h1>
        <p className="f-sub">Sign in to your workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="f-label block mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-t4" />
            <input id="email" name="email" type="email" required placeholder="you@example.com" className="w-full h-9 pl-9 pr-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="f-label block mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-t4" />
            <input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" className="w-full h-9 pl-9 pr-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        {error && (
          <div className="rounded-[var(--r-sm)] bg-down-soft border border-down/10 px-3 py-2">
            <p className="text-[11px] text-down">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="flex items-center justify-between text-[11px]">
        <Link href="/forgot-password" className="text-t3 hover:text-t1 transition-colors">Forgot password?</Link>
        <Link href="/signup" className="text-brand hover:text-brand/80 transition-colors">Create account</Link>
      </div>
    </div>
  );
}
