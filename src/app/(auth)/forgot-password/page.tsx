"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/reset-password" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  if (sent) {
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
            <h1 className="text-heading-lg text-text-primary mb-1">Check your email</h1>
            <p className="text-[13px] text-text-secondary">
              If an account exists with that email, we sent a reset link.
            </p>
          </div>
          <Link href="/login" className="text-[13px] font-medium text-accent hover:text-accent-hover transition-colors mt-2">
            Back to login
          </Link>
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
          <h1 className="text-heading-lg text-text-primary">Reset password</h1>
          <p className="text-[13px] text-text-secondary">
            Enter your email and we'll send you a reset link
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <motion.div variants={staggerItem}>
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-3.5 w-3.5" />}
              required
            />
          </motion.div>
          {error && (
            <p className="text-[12px] text-loss font-medium">{error}</p>
          )}
          <motion.div variants={staggerItem}>
            <Button type="submit" variant="gradient" className="w-full" isLoading={loading}>
              Send reset link
            </Button>
          </motion.div>
        </form>

        <motion.p variants={staggerItem} className="text-center text-[12px] text-text-muted">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
