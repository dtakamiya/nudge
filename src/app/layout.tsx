import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Noto_Sans_JP } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nudge - 1on1 Tracker",
  description: "1on1ログ & アクショントラッカー",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${GeistSans.variable} ${notoSansJP.variable} flex h-screen`}>
        <Sidebar />
        <main className="flex-1 overflow-auto p-6 pt-18 lg:p-10 lg:pt-10">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
