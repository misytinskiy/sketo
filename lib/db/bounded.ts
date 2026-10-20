import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
type Lane = "accessory-read" | "accessory-write" | "staff-auth";
declare global {
  var __sketoDatabaseLanesV1__: Partial<Record<Lane, number>> | undefined;
}
const limits: Record<Lane, number> = { "accessory-read": 3, "accessory-write": 2, "staff-auth": 2 };

/** An operation owns its connection, so a deadline can close it without killing
 * another request. Admission is bounded: no unbounded pool wait queue.
 * SET LOCAL is deliberate: startup settings are not reliable with transaction poolers.
 * No automatic retry, especially after a potentially committed write.
 */
export async function withBoundedDatabase<T>(lane: Lane, run: (tx: Transaction) => Promise<T>): Promise<T> {
  const counts = globalThis.__sketoDatabaseLanesV1__ ??= {};
  if ((counts[lane] ?? 0) >= limits[lane]) {
    throw new Error("Сервис занят. Повторите попытку через несколько секунд.");
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const writing = lane === "accessory-write";
  const client = postgres(url, { prepare: false, max: 1, connect_timeout: 5, idle_timeout: 5,
    max_lifetime: 60, connection: { application_name: `sketo-${lane}` } });
  counts[lane] = (counts[lane] ?? 0) + 1;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closing: Promise<void> | undefined;
  const close = () => closing ??= client.end({ timeout: 0 });
  try {
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        // Do not merely reject Promise.race and leave a running query in the pool.
        void close().catch(() => {});
        reject(new Error(writing
          ? "Превышено время сохранения. Обновите карточку и проверьте результат перед повторной попыткой."
          : "Превышено время загрузки данных. Повторите попытку."));
      }, writing ? 45_000 : 12_000);
    });
    const operation = drizzle(client, { schema }).transaction(async tx => {
      await tx.execute(sql`SET LOCAL statement_timeout = '8s'`);
      await tx.execute(sql`SET LOCAL lock_timeout = '2s'`);
      await tx.execute(sql`SET LOCAL idle_in_transaction_session_timeout = '10s'`);
      return run(tx);
    }, { accessMode: writing ? "read write" : "read only" });
    return await Promise.race([operation, deadline]);
  } finally {
    if (timer) clearTimeout(timer);
    try { await close(); } finally { counts[lane] = Math.max(0, (counts[lane] ?? 1) - 1); }
  }
}
