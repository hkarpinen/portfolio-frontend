interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-sm)",
        gap: "12px",
        textAlign: "center",
      }}
    >
      {icon && (
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--r-lg)",
            background: "var(--accent-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--ts-card-h)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <p
        style={{
          fontFamily: "var(--ff-display)",
          fontWeight: 700,
          fontSize: "var(--ts-body)",
          color: "var(--text)",
          margin: 0,
        }}
      >
        {title}
      </p>
      {description && (
        <p style={{ fontSize: "var(--ts-body)", color: "var(--text-3)", margin: 0, maxWidth: "320px" }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
