import React from "react";
import * as RadixAvatar from "@radix-ui/react-avatar";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  url?: string | null;
  size?: number;
  online?: boolean;
}

export function Avatar({ name, url, size = 36, online }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <RadixAvatar.Root
        className="border-ink bg-paper-3 flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {url && (
          <RadixAvatar.Image
            src={url}
            alt={name ?? ""}
            className="w-full h-full object-cover block"
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
          className="absolute bg-red"
          style={{
            bottom: -2,
            right: -2,
            width: 8,
            height: 8,
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
  const initial = getInitials(name);

  return (
    <div
      className="shrink-0 flex items-center justify-center border-ink overflow-hidden bg-paper-2"
      style={{ width: size, height: size }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="w-full h-full object-cover" />
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
