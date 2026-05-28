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
          className="group flex w-full cursor-pointer items-center justify-between border-none bg-transparent p-0"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-3">{title}</p>
            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
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
