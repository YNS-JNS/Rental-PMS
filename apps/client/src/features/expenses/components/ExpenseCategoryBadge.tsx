import { Badge } from '@/components/ui/badge';
import type { ExpenseCategoryType } from '@rental/shared';

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategoryType;
}

/** Category-to-colour mapping — centralised here to avoid duplication. */
const CATEGORY_STYLES: Record<ExpenseCategoryType, string> = {
  WATER:       'bg-blue-100 text-blue-800 border-blue-200',
  ELECTRICITY: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CLEANING:    'bg-green-100 text-green-800 border-green-200',
  MAINTENANCE: 'bg-orange-100 text-orange-800 border-orange-200',
  OTHER:       'bg-gray-100 text-gray-700 border-gray-200',
};

const CATEGORY_LABELS: Record<ExpenseCategoryType, string> = {
  WATER:       'Water',
  ELECTRICITY: 'Electricity',
  CLEANING:    'Cleaning',
  MAINTENANCE: 'Maintenance',
  OTHER:       'Other',
};

/**
 * ExpenseCategoryBadge
 * SRP: one job — render a styled badge for a given expense category.
 */
export function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={CATEGORY_STYLES[category]}
    >
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
