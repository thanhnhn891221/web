import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIO.MS — All-in-One Management System",
  description: "AIO.MS by AIO.ECOSYSTEM — Hệ thống Quản trị Toàn diện Doanh nghiệp",
  keywords: ["ERP", "management", "enterprise", "AIO.MS", "AIO.ECOSYSTEM", "quản trị doanh nghiệp"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
