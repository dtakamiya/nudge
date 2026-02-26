"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  type CoachingCategory,
  type CoachingTip,
  getRandomTipByCategory,
  getTipsByCategory,
} from "@/lib/coaching-tips";

interface CoachingTipCardProps {
  category: CoachingCategory;
  className?: string;
}

export function CoachingTipCard({ category, className }: CoachingTipCardProps) {
  const [current, setCurrent] = useState<CoachingTip>(() => getTipsByCategory(category)[0]);

  useEffect(() => {
    setCurrent(getRandomTipByCategory(category));
  }, [category]);

  const handleRefresh = () => {
    setCurrent((prev) => getRandomTipByCategory(category, prev.id));
  };

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              {current.category}
            </Badge>
            <p className="text-sm font-medium text-slate-800">{current.text}</p>
            {current.detail && <p className="text-xs text-slate-600">{current.detail}</p>}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            別のTip 🎲
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
