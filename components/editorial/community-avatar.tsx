import { getInitials } from "@/lib/utils";

interface CommunityAvatarProps {
  community: {
    image?: string | null;
    imageUrl?: string | null;
    color?: string | null;
    icon?: string | null;
    name: string;
  };
  size?: number;
}

export function CommunityAvatar({ community, size = 44 }: CommunityAvatarProps) {
  const img = community.image ?? community.imageUrl;
  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt=""
        className="shrink-0 border-ink object-cover"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  const color = community.color ?? null;
  const initial = getInitials(community.name);
  const fontSize = Math.round(size * 0.5);

  return (
    <span
      className="flex shrink-0 items-center justify-center border-ink font-serif font-normal italic"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: color ? `${color}1a` : "var(--paper-3)",
        fontSize: `${fontSize}px`,
        color: color ?? "var(--ink)",
      }}
    >
      {initial}
    </span>
  );
}
