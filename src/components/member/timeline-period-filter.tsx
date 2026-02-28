"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimelinePeriod = "1month" | "3months" | "all";

const PERIOD_OPTIONS: { value: TimelinePeriod; label: string }[] = [
  { value: "all", label: "全期間" },
  { value: "3months", label: "直近3ヶ月" },
  { value: "1month", label: "直近1ヶ月" },
];

type Props = {
  readonly value: TimelinePeriod;
  readonly onChange: (value: TimelinePeriod) => void;
};

export function TimelinePeriodFilter({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TimelinePeriod)}>
      <SelectTrigger className="w-[140px]" aria-label="期間フィルタ">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
