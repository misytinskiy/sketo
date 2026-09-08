import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

declare global {
  var __sketoPostgresClient__: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const databaseUrl = connectionString;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const client =
  globalThis.__sketoPostgresClient__ ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sketoPostgresClient__ = client;
}

export const db = drizzle(client, { schema });
