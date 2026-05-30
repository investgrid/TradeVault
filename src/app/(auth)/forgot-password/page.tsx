"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const email = new FormData(e.currentTarget).get("email") as string;

    const res = await fetch("/api/auth/forget-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirectTo: "/reset-password" }),
    });
    const error = res.ok ? null : { message: "Failed to send email" };
    if (error) {
      setError(error.message ?? "Failed to send email");
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card card-body text-center space-y-4">
        <div className="h-10 w-10 rounded-full bg-up-soft flex items-center justify-center mx-auto">
          <CheckCircle className="h-5 w-5 text-up" />
        </div>
        <div>
          <h1 className="f-title mb-1">Check your email</h1>
          <p className="f-sub">We sent a password reset link to your inbox.</p>
        </div>
        <Link href="/login" className="text-[11px] text-brand hover:text-brand/80 transition-colors">Back to sign in</Link>
      </div>
    );
  }

  return (
    <div className="card card-body space-y-5">
      <div className="text-center">
        <h1 className="f-title mb-1">Reset password</h1>
        <p className="f-sub">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="f-label block mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-t4" />
            <input id="email" name="email" type="email" required placeholder="you@example.com" className="w-full h-9 pl-9 pr-3 rounded-[var(--r-md)] border border-line-1 bg-layer-1 text-[12px] text-t1 placeholder:text-t4 focus:outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        {error && (
          <div className="rounded-[var(--r-sm)] bg-down-soft border border-down/10 px-3 py-2">
            <p className="text-[11px] text-down">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full h-9 rounded-[var(--r-md)] bg-brand text-white text-[12px] font-medium hover:bg-brand-dim transition-colors disabled:opacity-50">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-[11px] text-t3">
        <Link href="/login" className="text-brand hover:text-brand/80 transition-colors">Back to sign in</Link>
      </p>
    </div>
  );
}
