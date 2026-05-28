import { getInitials, cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
const SIZE_CLASS: Record<Size, string> = {
  sm: "w-7 h-7 text-[0.66rem]", // 14px × 14px (halved scale; verify against design)
  md: "w-9 h-9 text-xs", // 18px × 18px
  lg: "w-12 h-12 text-base", // 24px × 24px
};

export function UserInitials({
  name,
  avatarUrl,
  size = "md",
  className,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: Size;
  className?: string;
}) {
  const classes = cn(
    "flex items-center justify-center shrink-0 font-bold font-serif",
    SIZE_CLASS[size],
    className,
  );

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="" className={cn("object-cover", classes)} />;
  }

  return <div className={cn("bg-red-soft text-red", classes)}>{getInitials(name ?? "")}</div>;
}
