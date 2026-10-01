import { requireStaff } from "@/lib/staff-auth";
import { NewPasswordForm } from "@/app/login/PasswordForms";
import styles from "../access.module.css";

export const metadata = { title: "Смена пароля — Sketo" };

export default async function SecurityPage() {
  await requireStaff();
  return <main className={styles.usersPage}><div className={styles.passwordWorkspace}>
    <header className={styles.loginPanelHeader}><p className={styles.loginIndex}>staff / account security</p><h1>Смена пароля</h1></header>
    <NewPasswordForm mode="change" />
  </div></main>;
}
