import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { zhCN } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "实习小霸王 — 一站式实习求职平台",
  description: "实习岗位聚合 + AI 简历锐评，助你拿下心仪 Offer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="zh-CN" className="dark">
        <body className="min-h-screen bg-background text-foreground antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
