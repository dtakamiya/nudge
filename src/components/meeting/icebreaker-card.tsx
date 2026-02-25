"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomIcebreaker, type Icebreaker } from "@/lib/icebreakers";

interface IcebreakerCardProps {
  className?: string;
}

export function IcebreakerCard({ className }: IcebreakerCardProps) {
  const [current, setCurrent] = useState<Icebreaker | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Math.random() を使うため SSR Hydration エラーを避けてマウント後に初期化する
    setCurrent(getRandomIcebreaker());
  }, []);

  const handleRefresh = () => {
    setCurrent((prev) => getRandomIcebreaker(prev?.id));
  };

  return (
    <Card className={className}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            {current && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {current.category}
                </Badge>
                <p className="text-sm font-medium text-slate-800">{current.question}</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            別の話題 🎲
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
