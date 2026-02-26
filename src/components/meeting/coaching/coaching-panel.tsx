"use client";

import type { LucideIcon } from "lucide-react";
import { Ear, Heart, HelpCircle, Lightbulb, MessageSquare, Star } from "lucide-react";

import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CoachingCategory } from "@/lib/coaching-tips";
import { cn } from "@/lib/utils";

import { CoachingTipCard } from "./coaching-tip-card";

const CATEGORIES: {
  readonly category: CoachingCategory;
  readonly icon: LucideIcon;
  readonly description: string;
}[] = [
  { category: "傾聴", icon: Ear, description: "相手の話を聴く姿勢" },
  { category: "質問", icon: HelpCircle, description: "引き出す質問力" },
  { category: "承認・ねぎらい", icon: Heart, description: "ねぎらいの言葉" },
  { category: "フィードバック", icon: MessageSquare, description: "効果的な伝え方" },
];

interface CoachingPanelProps {
  compact?: boolean;
  className?: string;
}

export function CoachingPanel({ compact = false, className }: CoachingPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h2 className={cn("font-semibold tracking-tight", compact ? "text-base" : "text-lg")}>
          コーチングアシスト
        </h2>
      </div>

      {/* ベストプラクティス - 常時表示 */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">ベストプラクティス</span>
        </div>
        <CoachingTipCard category="ベストプラクティス" />
      </div>

      {/* カテゴリ別アコーディオン */}
      <AccordionRoot type="single" collapsible defaultValue="傾聴">
        {CATEGORIES.map(({ category, icon: Icon, description }) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                <span>{category}</span>
                <span className="ml-1 text-xs text-slate-600">- {description}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CoachingTipCard category={category} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </AccordionRoot>
    </div>
  );
}
