export function VoteArrow({
  direction,
  active,
  size = 10,
}: {
  direction: "up" | "down";
  active: boolean;
  size?: number;
}) {
  const d = direction === "up" ? "M12 4l8 8H4l8-8z" : "M12 20l-8-8h16l-8 8z";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path d={d} />
    </svg>
  );
}
