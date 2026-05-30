import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "./db";
import { users, sessions, authAccounts, verification } from "./db/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const authSchema = {
  tv_users: users,
  tv_sessions: sessions,
  auth_accounts: authAccounts,
  verification: verification,
};

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "https://tradevault-three.vercel.app",
    "https://*.vercel.app",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  user: {
    modelName: "tv_users",
    fields: {
      image: "avatarUrl",
    },
  },
  session: {
    modelName: "tv_sessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  account: {
    modelName: "auth_accounts",
  },
  verification: {
    modelName: "verification",
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) return;
      await resend.emails.send({
        from: "TradeVault <noreply@tradevault.app>",
        to: user.email,
        subject: "Reset your password — TradeVault",
        html: `<p>Hi ${user.name ?? ""},</p><p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p><p>— TradeVault</p>`,
      });
    },
  },
});
