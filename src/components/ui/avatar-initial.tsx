import { getAvatarGradient, getInitials } from "@/lib/avatar";

type Props = {
  readonly name: string;
  readonly size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

export function AvatarInitial({ name, size = "md" }: Props) {
  const [from, to] = getAvatarGradient(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shrink-0`}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  );
}
