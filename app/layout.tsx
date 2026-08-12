import type { Metadata } from "next";
import { Commissioner } from "next/font/google";
import { getInitialLanguage } from "./components/getInitialLanguage";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

const commissioner = Commissioner({
  subsets: ["latin"],
  variable: "--font-commissioner",
});

export const metadata: Metadata = {
  title: "Sketo Coffee",
  description: "Главная страница кофейни Sketo",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLanguage = await getInitialLanguage();

  return (
    <html lang={initialLanguage} className={commissioner.variable}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
