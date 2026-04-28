import { cn } from "@/lib/utils";
import styles from "./alert.module.css";

type AlertVariant = "info" | "success" | "warning" | "danger";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  icon,
  onClose,
  children,
  className,
}: AlertProps) {
  return (
    <div className={cn(styles.alert, styles[variant], className)} role="alert">
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.body}>{children}</div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
