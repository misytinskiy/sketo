import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { createRecoveryGrant, RECOVERY_COOKIE, RECOVERY_TTL } from "@/lib/password-recovery";

export async function GET(request: Request) {
  const origin = getSiteUrl();
  const params = new URL(request.url).searchParams;
  const recovery = params.get("recovery") === "1";
  let destination = recovery ? "/account/reset-password?invalid=1" : "/account/login?invalid=1";
  const jar = await cookies();
  jar.delete(RECOVERY_COOKIE);
  try {
    const code = params.get("code");
    if (code) {
      const client = await createClient();
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        if ("redirectType" in data && data.redirectType === "recovery") {
          jar.set(RECOVERY_COOKIE, createRecoveryGrant(data.user.id), {
            httpOnly: true, secure: origin.protocol === "https:", sameSite: "lax", path: "/", maxAge: RECOVERY_TTL,
          });
          destination = "/account/reset-password";
        } else if (!recovery) destination = "/account";
      }
    }
  } catch { /* All invalid links have the same public response. */ }
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
