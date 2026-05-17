interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-32 px-12 bg-paper shadow-card gap-6 text-center" style={{ border: "1.5px solid var(--ink)" }}
    >
      {icon && (
        <div
          className="w-[56px] h-[56px] bg-[rgba(178,42,26,0.10)] flex items-center justify-center text-2xl shrink-0"
        >
          {icon}
        </div>
      )}
      <p
        className="font-serif font-bold text-md text-ink m-0"
      >
        {title}
      </p>
      {description && (
        <p className="text-md text-ink-3 m-0 max-w-[320px]">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
