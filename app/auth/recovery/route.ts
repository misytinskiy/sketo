import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSiteUrl } from "@/lib/site-url";
import { createRecoveryGrant, RECOVERY_COOKIE, RECOVERY_TTL } from "@/lib/password-recovery";

export async function GET(request: Request) {
  const origin = getSiteUrl();
  let destination = "/login/reset-password?invalid=1";
  const jar = await cookies();
  jar.delete(RECOVERY_COOKIE);
  try {
    const code = new URL(request.url).searchParams.get("code");
    if (code) {
      const client = await createClient();
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && data.user && "redirectType" in data && data.redirectType === "recovery") {
        const member = await getCurrentStaff();
        if (member?.userId === data.user.id) {
          jar.set(RECOVERY_COOKIE, createRecoveryGrant(member.userId), {
            httpOnly: true, secure: origin.protocol === "https:", sameSite: "lax", path: "/", maxAge: RECOVERY_TTL,
          });
          destination = "/login/reset-password";
        } else {
          await client.auth.signOut({ scope: "local" });
        }
      }
    }
  } catch { /* Invalid, expired and already used links all get the same recovery screen. */ }
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
