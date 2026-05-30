"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Lock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-64" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const newPassword = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (newPassword !== confirm) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword, token }),
    });
    const error = res.ok ? null : { message: "Failed to reset password" };

    if (error) {
      setError(error.message ?? "Something went wrong");
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (success) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-6 card-shadow text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-profit-muted">
            <CheckCircle className="h-6 w-6 text-profit" />
          </div>
          <div>
            <h1 className="text-heading-lg text-text-primary mb-1">Password updated</h1>
            <p className="text-[13px] text-text-secondary">Redirecting to login...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="rounded-[var(--radius-xl)] border border-border-default bg-bg-surface p-6 card-shadow gradient-border"
    >
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6">
        <motion.div variants={staggerItem} className="flex flex-col items-center gap-1.5">
          <h1 className="text-heading-lg text-text-primary">New password</h1>
          <p className="text-[13px] text-text-secondary">
            Choose a strong password for your account
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <motion.div variants={staggerItem}>
            <Input
              id="password"
              name="password"
              label="New password"
              type="password"
              placeholder="Min 6 characters"
              icon={<Lock className="h-3.5 w-3.5" />}
              minLength={6}
              required
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <Input
              id="confirm"
              name="confirm"
              label="Confirm password"
              type="password"
              placeholder="Repeat password"
              icon={<Lock className="h-3.5 w-3.5" />}
              minLength={6}
              required
            />
          </motion.div>
          {error && (
            <p className="text-[12px] text-loss font-medium">{error}</p>
          )}
          <motion.div variants={staggerItem}>
            <Button type="submit" variant="gradient" className="w-full" isLoading={loading}>
              Update password
            </Button>
          </motion.div>
        </form>

        <motion.p variants={staggerItem} className="text-center text-[12px] text-text-muted">
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Back to login
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
