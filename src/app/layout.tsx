import type { Metadata } from "next";
import { DM_Serif_Display, Source_Sans_3, Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body
        className={`${dmSerifDisplay.variable} ${sourceSans3.variable} ${notoSerifJP.variable} ${notoSansJP.variable} flex h-screen`}
      >
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-18 lg:p-8 lg:pt-8">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
