"use client";

import { MOOD_OPTIONS } from "@/lib/mood";

type Props = {
  value: number | null;
  onChange: (mood: number | null) => void;
};

export function MoodSelector({ value, onChange }: Props) {
  const handleSelect = (moodValue: number) => {
    onChange(value === moodValue ? null : moodValue);
  };

  return (
    <div className="flex items-center gap-1">
      {MOOD_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          aria-label={option.label}
          aria-pressed={value === option.value}
          onClick={() => handleSelect(option.value)}
          className={`text-2xl rounded-lg p-1.5 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary ${
            value === option.value
              ? "bg-primary/15 ring-2 ring-primary scale-110"
              : "opacity-50 hover:opacity-100"
          }`}
        >
          {option.emoji}
        </button>
      ))}
    </div>
  );
}
