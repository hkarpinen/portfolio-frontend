import React from "react";
import * as RadixAvatar from "@radix-ui/react-avatar";

interface AvatarProps {
  name?: string | null;
  url?: string | null;
  size?: number;
  online?: boolean;
}

export function Avatar({ name, url, size = 36, online }: AvatarProps) {
  const initials = name
    ? name.split(/\s+/).map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <RadixAvatar.Root
        style={{ width: size, height: size, border: "1.5px solid var(--ink)", background: "var(--paper-3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        {url && (
          <RadixAvatar.Image
            src={url}
            alt={name ?? ""}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        <RadixAvatar.Fallback
          className="font-mono font-bold text-ink"
          style={{ fontSize: size * 0.36, letterSpacing: "0.04em" }}
        >
          {initials}
        </RadixAvatar.Fallback>
      </RadixAvatar.Root>
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 8,
            height: 8,
            background: "var(--red)",
            border: "1.5px solid var(--paper)",
          }}
        />
      )}
    </div>
  );
}

/* ── CommunityAvatar ────────────────────────────────────────────────────────*/
interface CommunityAvatarProps {
  name: string;
  image?: string | null;
  size?: number;
}

export function CommunityAvatar({ name, image, size = 48 }: CommunityAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className="shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "var(--paper-2)",
        border: "1.5px solid var(--ink)",
        overflow: "hidden",
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span
          className="font-serif italic text-ink"
          style={{ fontSize: size * 0.5 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
