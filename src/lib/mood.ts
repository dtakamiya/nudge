export const MOOD_OPTIONS = [
  { value: 1, emoji: "😞", label: "とても悪い" },
  { value: 2, emoji: "😕", label: "悪い" },
  { value: 3, emoji: "😐", label: "普通" },
  { value: 4, emoji: "🙂", label: "良い" },
  { value: 5, emoji: "😊", label: "とても良い" },
] as const;

export type MoodOption = (typeof MOOD_OPTIONS)[number];

export function getMoodOption(mood: number | null | undefined): MoodOption | null {
  if (mood == null) return null;
  return MOOD_OPTIONS.find((o) => o.value === mood) ?? null;
}
