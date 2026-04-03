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
  description: "Hệ thống Quản trị Toàn diện Doanh nghiệp — Khơi Nguồn Thịnh Vượng",
  keywords: ["ERP", "management", "enterprise", "AIO.MS", "quản trị doanh nghiệp"],
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
