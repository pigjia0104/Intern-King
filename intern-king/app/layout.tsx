import type { Metadata } from "next";
import "./globals.css";
import "./design-system.css";

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
    <html lang="zh-CN" className="ds-page">
      <body className="ds-body min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
