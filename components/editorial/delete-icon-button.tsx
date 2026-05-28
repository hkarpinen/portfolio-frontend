import { cn } from "@/lib/utils";
import styles from "./delete-icon-button.module.css";
import { Icon } from "./icon";

interface DeleteIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function DeleteIconButton({ label, className, ...props }: DeleteIconButtonProps) {
  return (
    <button type="button" aria-label={label} className={cn(styles.btn, className)} {...props}>
      <Icon name="trash" size={14} strokeWidth={2} />
    </button>
  );
}
