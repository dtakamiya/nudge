"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { StarRating } from "./star-rating";

type QualityScores = {
  qualityScore: number | null;
  usefulnessScore: number | null;
};

type Props = {
  open: boolean;
  onSubmit: (scores: QualityScores) => void;
  onSkip: () => void;
};

export function QualityScoreDialog({ open, onSubmit, onSkip }: Props) {
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [usefulnessScore, setUsefulnessScore] = useState<number | null>(null);

  function handleSubmit() {
    onSubmit({ qualityScore, usefulnessScore });
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>ミーティングの振り返り</DialogTitle>
          <DialogDescription>今回のミーティングを評価してください（任意）</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">満足度</label>
            <StarRating value={qualityScore} onChange={setQualityScore} label="満足度" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">有用度</label>
            <StarRating value={usefulnessScore} onChange={setUsefulnessScore} label="有用度" />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onSkip}>
            スキップ
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
