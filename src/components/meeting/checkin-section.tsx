"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getRandomCheckinMessage } from "@/lib/checkin-messages";

import { type ConditionField, ConditionSelector } from "./condition-selector";
import { IcebreakerCard } from "./icebreaker-card";

interface CheckinSectionProps {
  conditionHealth: number | null;
  conditionMood: number | null;
  conditionWorkload: number | null;
  checkinNote: string;
  previousConditionHealth?: number | null;
  previousConditionMood?: number | null;
  previousConditionWorkload?: number | null;
  onConditionChange: (field: ConditionField, value: number | null) => void;
  onCheckinNoteChange: (note: string) => void;
}

export function CheckinSection({
  conditionHealth,
  conditionMood,
  conditionWorkload,
  checkinNote,
  previousConditionHealth,
  previousConditionMood,
  previousConditionWorkload,
  onConditionChange,
  onCheckinNoteChange,
}: CheckinSectionProps) {
  const [safetyMessage, setSafetyMessage] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Math.random() を使うため SSR Hydration エラーを避けてマウント後に初期化する
    setSafetyMessage(getRandomCheckinMessage());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight text-slate-800">
          チェックイン
        </CardTitle>
        <p className="text-xs text-slate-400">{safetyMessage}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <IcebreakerCard />

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">コンディション</p>
          <ConditionSelector
            conditionHealth={conditionHealth}
            conditionMood={conditionMood}
            conditionWorkload={conditionWorkload}
            previousConditionHealth={previousConditionHealth}
            previousConditionMood={previousConditionMood}
            previousConditionWorkload={previousConditionWorkload}
            onConditionChange={onConditionChange}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">メモ</p>
          <Textarea
            value={checkinNote}
            onChange={(e) => onCheckinNoteChange(e.target.value)}
            placeholder="気になることや共有したいことを入力..."
            maxLength={500}
            className="resize-none text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
