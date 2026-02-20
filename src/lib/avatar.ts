const AVATAR_GRADIENTS: readonly (readonly [string, string])[] = [
  ["#D97706", "#C27549"],
  ["#6B8F71", "#8FAF85"],
  ["#B45309", "#D97706"],
  ["#C27549", "#D4A37A"],
  ["#7B8F6B", "#6B8F71"],
  ["#A67B5B", "#C49A6C"],
  ["#8B6F47", "#B8956A"],
  ["#5F8A6B", "#7DA88A"],
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
