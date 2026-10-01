import PasswordShell from "../PasswordShell";
import { ForgotPasswordForm } from "../PasswordForms";

export const metadata = { title: "Восстановление пароля — Sketo", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <PasswordShell title="Восстановить пароль"><ForgotPasswordForm /></PasswordShell>;
}
