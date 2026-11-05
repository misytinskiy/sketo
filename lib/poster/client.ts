/** Server/CLI transport. Import server.ts from Next.js to enforce the server boundary. */
export class PosterError extends Error {
  constructor(public readonly code: "config" | "network" | "http" | "api" | "response" | "account", public readonly status?: number) {
    // Do not attach fetch errors, request URLs or provider messages: they can contain tokens.
    super(`Poster ${code} error${status ? ` (HTTP ${status})` : ""}`);
    this.name = "PosterError";
  }
}

export function normalizePosterAccount(input: string): string {
  const value = input.trim().toLowerCase();
  if (/^[a-z0-9][a-z0-9-]{0,62}$/.test(value)) return value;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const match = url.hostname.match(/^([a-z0-9][a-z0-9-]{0,62})\.joinposter\.com$/);
    if (url.protocol !== "https:" || !match || url.username || url.password || url.port || url.search || url.hash) throw new Error();
    return match[1];
  } catch { throw new PosterError("config"); }
}

const methods = ["settings.getAllSettings", "access.getSpots", "menu.getCategories", "menu.getProducts", "clients.getGroups"] as const;
type ReadMethod = typeof methods[number];
export type PosterRecord = Record<string, unknown>;
const record = (value: unknown): value is PosterRecord => Boolean(value && typeof value === "object" && !Array.isArray(value));

export function createPosterClient(
  env: { POSTER_ACCOUNT?: string; POSTER_ACCESS_TOKEN?: string } = { POSTER_ACCOUNT: process.env.POSTER_ACCOUNT, POSTER_ACCESS_TOKEN: process.env.POSTER_ACCESS_TOKEN },
  fetcher: typeof fetch = fetch,
) {
  if (typeof window !== "undefined") throw new PosterError("config");
  const account = normalizePosterAccount(env.POSTER_ACCOUNT ?? "");
  const token = env.POSTER_ACCESS_TOKEN?.trim();
  if (!token || /\s/.test(token)) throw new PosterError("config");

  async function read(method: ReadMethod): Promise<unknown> {
    if (!methods.includes(method)) throw new PosterError("config");
    // Fixed host: neither POSTER_ACCOUNT nor caller input controls the token destination.
    const url = new URL(`https://joinposter.com/api/${method}`);
    url.searchParams.set("token", token!);
    let response: Response;
    let body: unknown;
    try {
      response = await fetcher(url, { method: "GET", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15_000) });
    } catch { throw new PosterError("network"); }
    if (!response.ok) throw new PosterError("http", response.status);
    try { body = await response.json(); } catch { throw new PosterError("response"); }
    if (!record(body)) throw new PosterError("response");
    if (body.error || body.error_code) throw new PosterError("api");
    if (!("response" in body)) throw new PosterError("response");
    return body.response;
  }

  async function verifyAccount() {
    const settings = await read("settings.getAllSettings");
    if (!record(settings) || typeof settings.COMPANY_ID !== "string") throw new PosterError("response");
    if (settings.COMPANY_ID.toLowerCase() !== account) throw new PosterError("account");
    const currency = record(settings.currency) ? settings.currency.currency_code_iso : null;
    return { account, currency: typeof currency === "string" ? currency : null };
  }

  async function list(method: Exclude<ReadMethod, "settings.getAllSettings">): Promise<PosterRecord[]> {
    const result = await read(method);
    if (!Array.isArray(result) || !result.every(record)) throw new PosterError("response");
    return result;
  }

  return {
    verifyAccount,
    async inspect() {
      const settings = await verifyAccount();
      // Sequential calls keep a diagnostic run within conservative API rate limits.
      const spots = await list("access.getSpots");
      const categories = await list("menu.getCategories");
      const products = await list("menu.getProducts");
      const groups = await list("clients.getGroups");
      return { settings, spots, categories, products, groups };
    },
  };
}
