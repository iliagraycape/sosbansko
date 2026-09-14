import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./safety.css";
import "./reaction-engine.css";
import "./communication.css";

export const metadata: Metadata = {
  title: "SOS Bansko | Бърза реакция в критичните минути",
  description: "Мобилна система за бърза реакция на проверени доброволци и спасители в Банско и района. Първо 112 — SOS Bansko подпомага, не заменя спешните служби.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#d72d2d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
