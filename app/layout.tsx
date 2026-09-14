import type { Metadata } from "next";
import "./globals.css";
import "./safety.css";

export const metadata: Metadata = {
  title: "SOS Bansko | Бърза помощ от общността",
  description: "Система за бърза реакция на проверени доброволци и спасители в Банско и района. Първо 112 — SOS Bansko подпомага, не заменя спешните служби.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
