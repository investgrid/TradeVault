"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "@/i18n";
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
    <Card variant="glow" className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-lg font-semibold text-text-primary">
          {t("auth.loginTitle")}
        </h1>
        <p className="text-[13px] text-text-secondary">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          label={t("auth.email")}
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          required
        />
        <Input
          id="password"
          name="password"
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          required
        />
        {error && <p className="text-[12px] text-loss">{error}</p>}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>

      <p className="text-center text-[12px] text-text-muted">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-accent hover:text-accent-hover transition-colors">
          {t("auth.createOne")}
        </Link>
      </p>
    </Card>
  );
}
