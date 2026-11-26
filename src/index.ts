import "server-only";
import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to connect to Lakebase Postgres.");
}

export const db = drizzle(databaseUrl);
