import AuthForm from "../AuthForm";
export const metadata = { title: "Регистрация — Sketo", robots: { index: false, follow: false } };
export default function RegisterPage() { return <AuthForm mode="register" />; }
