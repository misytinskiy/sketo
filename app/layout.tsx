import type { Metadata } from "next";
import { Commissioner } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={commissioner.variable}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
