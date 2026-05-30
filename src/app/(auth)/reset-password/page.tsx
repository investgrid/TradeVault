"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock } from "lucide-react";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const password = new FormData(e.currentTarget).get("password") as string;

    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      setError(error.message ?? "Failed to reset password");
      setLoading(false);
    } else {
      router.push("/login");
    }
  }

  if (!token) {
    return (
      <div className="card card-body text-center space-y-4">
        <h1 className="f-title">Invalid link</h1>
        <p className="f-sub">This reset link is invalid or expired.</p>
        <Link href="/forgot-password" className="text-[11px] text-brand">Request a new one</Link>
      </div>
    );
  }

  return (
    <div className="card card-body space-y-5">
      <div className="text-center">
        <h1 className="f-title mb-1">New password</h1>
        <p className="f-sub">Choose a new password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="password" className="f-label block mb-1.5">New Password</label>
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
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="card card-body"><div className="skeleton h-40 rounded-[var(--r-md)]" /></div>}>
      <ResetForm />
    </Suspense>
  );
}
