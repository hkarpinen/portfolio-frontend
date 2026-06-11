import type { IconName } from "@/components/editorial";
import { ExpenseCategory } from "@/types/expense";

/** Map an expense category to its editorial glyph. Unknown/null → a neutral tag. */
export function categoryIcon(category?: ExpenseCategory | string | null): IconName {
  switch (category) {
    case ExpenseCategory.Rent:
      return "rent";
    case ExpenseCategory.Utilities:
      return "utilities";
    case ExpenseCategory.Groceries:
      return "groceries";
    case ExpenseCategory.Transportation:
      return "transportation";
    case ExpenseCategory.Entertainment:
      return "entertainment";
    case ExpenseCategory.Healthcare:
      return "healthcare";
    case ExpenseCategory.Insurance:
      return "insurance";
    case ExpenseCategory.Subscriptions:
      return "subscriptions";
    case ExpenseCategory.Internet:
      return "internet";
    case ExpenseCategory.Phone:
      return "phone";
    default:
      return "tag";
  }
}
