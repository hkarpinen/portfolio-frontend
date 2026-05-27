"use client";
import { ReactNode } from "react";
import { EmptyState } from "@/components/editorial/empty-state";
import type { EmptyStateProps } from "./empty-state";

export function ListWithLoadingAndEmpty<T>({
  items,
  isLoading,
  empty,
  loadingHint = "Loading…",
  children,
  className,
}: {
  items: T[];
  isLoading: boolean;
  empty: EmptyStateProps;
  loadingHint?: string;
  children: (item: T, index: number) => ReactNode;
  className?: string;
}) {
  if (isLoading && items.length === 0) {
    return <p className="ed-hint">{loadingHint}</p>;
  }
  if (items.length === 0) {
    return <EmptyState {...empty} />;
  }
  return <div className={className}>{items.map((item, i) => children(item, i))}</div>;
}
