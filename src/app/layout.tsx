import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display, Source_Sans_3, Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading-jp",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-body-jp",
  display: "swap",
});

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
      <body
        className={`${dmSerifDisplay.variable} ${sourceSans3.variable} ${notoSerifJP.variable} ${notoSansJP.variable} flex h-screen`}
      >
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </body>
    </html>
  );
}
