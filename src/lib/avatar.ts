const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
  ["oklch(0.55 0.15 260)", "oklch(0.65 0.12 260)"],
  ["oklch(0.50 0.18 270)", "oklch(0.62 0.15 270)"],
  ["oklch(0.52 0.12 200)", "oklch(0.65 0.10 200)"],
  ["oklch(0.48 0.10 280)", "oklch(0.60 0.08 280)"],
  ["oklch(0.55 0.08 240)", "oklch(0.68 0.06 240)"],
  ["oklch(0.50 0.15 250)", "oklch(0.62 0.12 250)"],
  ["oklch(0.53 0.10 220)", "oklch(0.65 0.08 220)"],
  ["oklch(0.48 0.14 290)", "oklch(0.60 0.11 290)"],
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  if (!name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[parts.length - 1][0];
}

export function getAvatarGradient(name: string): readonly [string, string] {
  const index = hashString(name) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}
