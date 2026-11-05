import AuthForm from "../AuthForm";
export const metadata = { title: "Вход — Sketo", robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  return <AuthForm mode="login" invalid={Boolean((await searchParams).invalid)} />;
}
