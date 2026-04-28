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
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: radius,
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid var(--border)",
        }}
      />
    );
  }

  const color = community.color ?? null;
  const initial = community.name[0]?.toUpperCase() ?? "?";
  const fontSize = Math.round(size * 0.5);

  return (
    <span
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: radius,
        background: color ? `${color}33` : "var(--accent-subtle)",
        border: color ? `1px solid ${color}66` : "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "var(--ff-display)",
        fontWeight: 700,
        fontSize: `${fontSize}px`,
        color: color ?? "var(--accent)",
      }}
    >
      {initial}
    </span>
  );
}
