"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getRandomCheckinMessage } from "@/lib/checkin-messages";

import { IcebreakerCard } from "../prepare/icebreaker-card";
import { type ConditionField, ConditionSelector } from "./condition-selector";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <p id="checkin-condition-label" className="text-sm font-medium text-slate-700">
            コンディション
          </p>
          <div aria-labelledby="checkin-condition-label">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkin-note" className="text-sm font-medium text-slate-700">
            メモ
          </Label>
          <Textarea
            id="checkin-note"
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
