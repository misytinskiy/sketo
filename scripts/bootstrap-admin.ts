import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

// One-time operator command; never expose bootstrap as an HTTP endpoint.
async function main() {
  loadEnvConfig(process.cwd());
  const args = process.argv.slice(2);
  const email = args[args.indexOf("--email") + 1]?.trim().toLowerCase();
  const credentialsFile = args[args.indexOf("--credentials-file") + 1];
  if (!args.includes("--email") || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Pass --email ADDRESS");
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key, DATABASE_URL: databaseUrl } = process.env;
  if (!url || !key || !databaseUrl) throw new Error("Supabase and database environment variables are required");
  const auth = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }).auth.admin;
  const sql = postgres(databaseUrl, { prepare: false, max: 1, connect_timeout: 10 });
  let createdId: string | undefined;
  let committed = false;
  try {
    const existingAdmins = await sql`select email from staff_members where role = 'admin' and is_active = true`;
    if (existingAdmins.length) {
      if (existingAdmins.some((row) => row.email.toLowerCase() === email)) { console.log("Requested administrator already exists."); return; }
      throw new Error("An administrator already exists. Use the users page to manage accounts.");
    }
    let user;
    for (let page = 1; ; page++) {
      const { data, error } = await auth.listUsers({ page, perPage: 100 });
      if (error) throw new Error(`Cannot list Auth users: ${error.code ?? error.status}`);
      user = data.users.find((entry) => entry.email?.toLowerCase() === email);
      if (user || data.users.length < 100) break;
    }
    if (user && !user.email_confirmed_at) throw new Error("Existing account email must be verified in Supabase before promotion");
    if (!user) {
      if (!args.includes("--credentials-file") || !credentialsFile) throw new Error("New account requires --credentials-file PATH (created exclusively, mode 0600)");
      const password = randomBytes(24).toString("base64url");
      // Save before creating the account: a disk failure must not leave unknown credentials.
      writeFileSync(credentialsFile, `Email: ${email}\nPassword: ${password}\nLogin: /login\n`, { flag: "wx", mode: 0o600 });
      const result = await auth.createUser({ email, password, email_confirm: true });
      if (result.error || !result.data.user) throw new Error(`Cannot create account: ${result.error?.code ?? "unknown"}`);
      user = result.data.user;
      createdId = user.id;
    }
    const userId = user.id;
    await sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(hashtext('staff:members'))`;
      const admins = await tx`select id from staff_members where role = 'admin' and is_active = true`;
      if (admins.length) throw new Error("An administrator was created concurrently; bootstrap aborted");
      const [member] = await tx`
        insert into staff_members (user_id, email, display_name, role, is_active)
        values (${userId}, ${email}, 'Администратор', 'admin', true)
        on conflict (user_id) do update set role = 'admin', is_active = true, email = excluded.email
        returning id`;
      await tx`insert into audit_logs (entity_type, entity_id, action, actor_id, summary)
        values ('staff', ${member.id}, 'create', ${member.id}, 'Первый администратор создан оператором')`;
    });
    committed = true;
    console.log(createdId ? `Administrator created. Credentials saved to ${credentialsFile}` : "Existing Auth user granted administrator access; password unchanged.");
  } catch (error) {
    if (createdId && !committed) {
      const result = await auth.deleteUser(createdId);
      if (result.error) console.error("Account cleanup failed; membership was not granted.");
    }
    throw error;
  } finally { await sql.end({ timeout: 1 }); }
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Bootstrap failed"); process.exitCode = 1; });
