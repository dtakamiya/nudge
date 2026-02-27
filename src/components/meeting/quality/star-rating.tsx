"use client";

import { Star } from "lucide-react";
import { useState } from "react";

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
};

export function StarRating({ value, onChange, label }: Props) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value ?? 0;

  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value !== null && star <= value}
          aria-label={`${star}点`}
          className="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => onChange(value === star ? null : star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= displayValue
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
