import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nudge - 1on1 Tracker",
  description: "1on1ログ & アクショントラッカー",
};

function Sidebar() {
  return (
    <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-2">
      <Link href="/" className="text-xl font-bold mb-6 block">
        Nudge
      </Link>
      <nav className="flex flex-col gap-1">
        <Link href="/" className="px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium">
          ダッシュボード
        </Link>
        <Link
          href="/members/new"
          className="px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          メンバー追加
        </Link>
        <Link
          href="/actions"
          className="px-3 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          アクション一覧
        </Link>
      </nav>
    </aside>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </body>
    </html>
  );
}
