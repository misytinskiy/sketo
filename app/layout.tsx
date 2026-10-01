import type { Metadata } from "next";
import { Commissioner } from "next/font/google";
import { getInitialLanguage } from "./components/getInitialLanguage";
import LanguageProvider from "./components/LanguageProvider";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const commissioner = Commissioner({
  subsets: ["latin"],
  variable: "--font-commissioner",
});

export async function generateMetadata(): Promise<Metadata> {
  const language = await getInitialLanguage();
  return {
    metadataBase: getSiteUrl(),
    title: "Sketo Coffee",
    description: language === "kz" ? "Sketo кофеханасының басты беті" : "Главная страница кофейни Sketo",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLanguage = await getInitialLanguage();

  return (
    <html lang={initialLanguage === "kz" ? "kk" : initialLanguage} className={commissioner.variable}>
      <body>
        <LanguageProvider language={initialLanguage}>
          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
