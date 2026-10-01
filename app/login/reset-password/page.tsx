import Link from "next/link";
import { cookies } from "next/headers";
import { getCurrentStaff } from "@/lib/staff-auth";
import { RECOVERY_COOKIE, verifyRecoveryGrant } from "@/lib/password-recovery";
import PasswordShell from "../PasswordShell";
import { NewPasswordForm } from "../PasswordForms";
import styles from "../../staff/access.module.css";

export const metadata = { title: "Новый пароль — Sketo", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  const params = await searchParams;
  const member = await getCurrentStaff();
  const jar = await cookies();
  const valid = !params.invalid && member && verifyRecoveryGrant(member.userId, jar.get(RECOVERY_COOKIE)?.value ?? "");
  return <PasswordShell title="Новый пароль">
    {valid ? <NewPasswordForm mode="recovery" /> : <div className={styles.loginForm}>
      <p className={styles.passwordMessage} role="alert">Ссылка недействительна, уже использована или истекла. Запросите новую и откройте её в том же браузере.</p>
      <Link href="/login/forgot-password" className={styles.passwordLink}>Получить новую ссылку ↗</Link>
    </div>}
  </PasswordShell>;
}
