"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Mail, Lock, User } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setError(error.message ?? "Something went wrong");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="card card-body space-y-5">
      <div className="text-center">
        <h1 className="f-title mb-1">Create account</h1>
        <p className="f-sub">Start tracking your trading business</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="name" className="f-label block mb-1.5">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-t4" />
            <input id="name" name="name" type="text" required placeholder="Your name" className="w-full h-9 pl-9 pr-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
          </div>
        </div>

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
            <input id="password" name="password" type="password" required minLength={6} placeholder="Min 6 characters" className="w-full h-9 pl-9 pr-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        {error && (
          <div className="rounded-[var(--r-sm)] bg-down-soft border border-down/10 px-3 py-2">
            <p className="text-[11px] text-down">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-[11px] text-t3">
        Already have an account? <Link href="/login" className="text-brand hover:text-brand/80 transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
