"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "@/i18n";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
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
      setError(error.message ?? t("auth.invalidCredentials"));
      setLoading(false);
    } else {
      router.push("/");
    }
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
          <h1 className="text-heading-lg text-text-primary">
            {t("auth.loginTitle")}
          </h1>
          <p className="text-[13px] text-text-secondary">
            {t("auth.loginSubtitle")}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <motion.div variants={staggerItem}>
            <Input
              id="email"
              name="email"
              label={t("auth.email")}
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              icon={<Mail className="h-3.5 w-3.5" />}
              required
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <Input
              id="password"
              name="password"
              label={t("auth.password")}
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              icon={<Lock className="h-3.5 w-3.5" />}
              required
            />
          </motion.div>
          <motion.div variants={staggerItem} className="flex justify-end -mt-1">
            <Link href="/forgot-password" className="text-[11px] font-medium text-text-tertiary hover:text-accent transition-colors">
              Forgot password?
            </Link>
          </motion.div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[12px] text-loss font-medium"
            >
              {error}
            </motion.p>
          )}
          <motion.div variants={staggerItem}>
            <Button type="submit" variant="gradient" className="mt-1 w-full" isLoading={loading}>
              {t("auth.signIn")}
            </Button>
          </motion.div>
        </form>

        <motion.p variants={staggerItem} className="text-center text-[12px] text-text-muted">
          {t("auth.noAccount")}{" "}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover transition-colors">
            {t("auth.createOne")}
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
