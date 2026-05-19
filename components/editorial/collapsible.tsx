"use client";

import * as RadixCollapsible from "@radix-ui/react-collapsible";

interface CollapsibleProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Collapsible({
  title,
  description,
  children,
  defaultOpen = false,
  onOpenChange,
  className = "bg-paper-2 border-ink p-5",
}: CollapsibleProps) {
  return (
    <RadixCollapsible.Root
      className={className}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixCollapsible.Trigger asChild>
        <button
          type="button"
          className="group w-full flex items-center justify-between bg-transparent border-none cursor-pointer p-0"
        >
          <div>
            <p className="text-[10px] font-bold text-ink-3 uppercase tracking-widest">{title}</p>
            {description && <p className="text-sm mt-1 text-ink-2">{description}</p>}
          </div>
          <span className="text-lg leading-none text-ink-3" aria-hidden>
            <span className="inline group-data-[state=open]:hidden">+</span>
            <span className="hidden group-data-[state=open]:inline">−</span>
          </span>
        </button>
      </RadixCollapsible.Trigger>

      <RadixCollapsible.Content>{children}</RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
}
