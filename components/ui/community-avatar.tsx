interface CommunityAvatarProps {
  community: {
    image?: string | null;
    imageUrl?: string | null;
    color?: string | null;
    icon?: string | null;
    name: string;
  };
  size?: number;
  radius?: string;
}

export function CommunityAvatar({
  community,
  size = 44,
  radius = "var(--r-lg)",
}: CommunityAvatarProps) {
  const img = community.image ?? community.imageUrl;
  if (img) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={img}
        alt=""
        className="object-cover shrink-0" style={{ width: `${size}px`, height: `${size}px`, border: "1.5px solid var(--ink)" }}
      />
    );
  }

  const color = community.color ?? null;
  const initial = community.name[0]?.toUpperCase() ?? "?";
  const fontSize = Math.round(size * 0.5);

  return (
    <span
      className="flex items-center justify-center shrink-0 font-serif italic font-normal" style={{ width: `${size}px`, height: `${size}px`, background: color ? `${color}1a` : "var(--paper-3)", border: "1.5px solid var(--ink)", fontSize: `${fontSize}px`, color: color ?? "var(--ink)" }}
    >
      {initial}
    </span>
  );
}
