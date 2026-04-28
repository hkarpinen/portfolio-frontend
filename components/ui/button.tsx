import { cn } from "@/lib/utils";
import styles from "./button.module.css";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(styles.btn, styles[variant], fullWidth && styles.fullWidth, className)}
      {...props}
    >
      {children}
    </button>
  );
}
