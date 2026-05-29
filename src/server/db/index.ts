import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to your .env file.");
  }
  const client = postgres(url, {
    prepare: false,
    ssl: "require",
  });
  return drizzle(client, { schema });
}

let _db: ReturnType<typeof createDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) {
      _db = createDb();
    }
    return (_db as any)[prop];
  },
});
