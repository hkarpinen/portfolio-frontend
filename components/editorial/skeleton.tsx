import React from "react";

export function Skeleton({
  width,
  height,
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) {
  return <span className={`skeleton block ${className}`} style={{ width, height }} />;
}
