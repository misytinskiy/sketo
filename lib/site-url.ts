/** Set SITE_URL to the public production origin, never to a request Host header. */
export function getSiteUrl(): URL {
  const configured = process.env.SITE_URL;
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("Set SITE_URL to the public site origin before building for production.");
  }
  const url = new URL(configured || "http://localhost:3000");
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("SITE_URL must be an http(s) origin without credentials, path, query or hash.");
  }
  return url;
}

export function publicProductPath(kind: "coffee" | "equipment", slug: string) {
  return `${kind === "coffee" ? "/catalog" : "/equipment"}/${encodeURIComponent(slug)}`;
}
