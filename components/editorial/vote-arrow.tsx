export function VoteArrow({
  direction,
  active,
  size = 10,
}: {
  direction: "up" | "down";
  active: boolean;
  size?: number;
}) {
  // Handoff "Terminus" fat-arrow vote glyph (handoff 9/ms-icons.js
  // upvote/downvote): a thick arrow with a stem, outlined by default and
  // filled when the user's vote is active.
  const d = direction === "up" ? "M11 4 4 12h5v6h4v-6h5Z" : "M11 18 4 10h5V4h4v6h5Z";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
