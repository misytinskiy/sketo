import AuthForm from "../AuthForm";
export const metadata = { title: "Восстановление пароля — Sketo", robots: { index: false, follow: false } };
export default function ForgotPage() { return <AuthForm mode="forgot" />; }
