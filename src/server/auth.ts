import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { users, sessions, authAccounts, verification } from "./db/schema";

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
  },
});
