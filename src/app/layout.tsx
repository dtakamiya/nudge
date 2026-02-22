import "./globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

import { KeyboardShortcutProvider } from "@/components/layout/keyboard-shortcut-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { prisma } from "@/lib/prisma";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nudge - 1on1 Tracker",
  description: "1on1ログ & アクショントラッカー",
};

async function getSidebarData() {
  try {
    const [members, actionCount] = await Promise.all([
      prisma.member.findMany({
        orderBy: { name: "asc" },
        take: 5,
        select: { id: true, name: true },
      }),
      prisma.actionItem.count({
        where: { status: { not: "DONE" } },
      }),
    ]);
    return { members, actionCount };
  } catch {
    // ビルド時やDB未接続時はデフォルト値を返す
    return { members: [], actionCount: 0 };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { members, actionCount } = await getSidebarData();

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${notoSansJP.variable} flex h-screen`}>
        <Providers>
          <Sidebar members={members} actionCount={actionCount} />
          <main className="flex-1 overflow-auto p-6 pt-18 lg:p-10 lg:pt-10">
            <div className="max-w-5xl mx-auto">{children}</div>
          </main>
          <Toaster />
          <KeyboardShortcutProvider members={members} />
        </Providers>
      </body>
    </html>
  );
}
