import { auth } from "../auth";
import { headers } from "next/headers";

export interface Context {
  userId: string | null;
}

export async function createContext(opts?: { headers?: Headers }): Promise<Context> {
  const session = await auth.api.getSession({
    headers: opts?.headers ?? (await headers()),
  });

  return {
    userId: session?.user?.id ?? null,
  };
}
