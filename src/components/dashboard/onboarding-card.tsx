import { ArrowRight, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function OnboardingCard() {
  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 mb-8 text-center animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
        <MessageSquare className="w-7 h-7 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
        Nudge へようこそ！
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        1on1 ミーティングをより効果的に。まずはメンバーを追加して、 最初の 1on1
        を記録してみましょう。
      </p>

      <div className="flex items-center justify-center gap-3 mb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
            1
          </span>
          <span>メンバーを追加</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">
            2
          </span>
          <span>1on1 を記録</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">
            3
          </span>
          <span>フォローアップ</span>
        </div>
      </div>

      <Link href="/members/new">
        <Button size="lg" className="gap-2">
          <UserPlus className="w-4 h-4" />
          最初のメンバーを追加する
        </Button>
      </Link>
    </div>
  );
}
