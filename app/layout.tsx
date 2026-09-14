import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./safety.css";
import "./reaction-engine.css";
import "./communication.css";

export const metadata: Metadata = {
  title: "SOS Bansko | Доброволна мрежа за бърза реакция",
  description: "Мобилна система за бърза локална реакция на одобрени доброволци в Банско и района. При непосредствена опасност се обадете отделно на 112.",
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
