import { Badge } from '@/components/ui/badge';
import type { ExpenseCategoryType } from '@rental/shared';

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategoryType;
}

// ─── Visual Config ─────────────────────────────────────────────────────────

/**
 * Category-to-colour mapping — all 19 categories.
 *
 * Design note:
 * - Apartment-specific  → blues / greens / ambers (property-grounded)
 * - Agency-wide         → `agency` semantic token (violet hue, no raw class)
 * - Catch-all           → neutral slate
 *
 * Agency categories use the `bg-agency/10 text-agency border-agency/20` pattern
 * rather than hardcoded `violet-*` classes, so hue changes in `index.css`
 * propagate automatically to all 10 agency badges.
 */
const CATEGORY_STYLES: Record<ExpenseCategoryType, string> = {
  // ── Apartment-specific ────────────────────────────────────────────────────
  WATER:           'bg-blue-50 text-blue-700 border-blue-200',
  ELECTRICITY:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  GAS:             'bg-orange-50 text-orange-700 border-orange-200',
  INTERNET:        'bg-sky-50 text-sky-700 border-sky-200',
  CLEANING:        'bg-emerald-50 text-emerald-700 border-emerald-200',
  MAINTENANCE:     'bg-amber-50 text-amber-700 border-amber-200',
  RENOVATION:      'bg-red-50 text-red-700 border-red-200',
  FURNITURE:       'bg-lime-50 text-lime-700 border-lime-200',
  // ── Agency-wide (structural) — use semantic agency token ─────────────────
  SOFTWARE:        'bg-agency/10 text-agency border-agency/20',
  MARKETING:       'bg-agency/10 text-agency border-agency/20',
  INSURANCE:       'bg-agency/10 text-agency border-agency/20',
  ACCOUNTING:      'bg-agency/10 text-agency border-agency/20',
  LEGAL:           'bg-agency/10 text-agency border-agency/20',
  OFFICE_SUPPLIES: 'bg-agency/10 text-agency border-agency/20',
  SALARIES:        'bg-agency/10 text-agency border-agency/20',
  TRAVEL:          'bg-agency/10 text-agency border-agency/20',
  EQUIPMENT:       'bg-agency/10 text-agency border-agency/20',
  TAXES:           'bg-agency/10 text-agency border-agency/20',
  // ── Catch-all ─────────────────────────────────────────────────────────────
  OTHER:           'bg-muted text-muted-foreground border-border',
};

const CATEGORY_LABELS: Record<ExpenseCategoryType, string> = {
  // Apartment-specific
  WATER:           'Water',
  ELECTRICITY:     'Electricity',
  GAS:             'Gas',
  INTERNET:        'Internet',
  CLEANING:        'Cleaning',
  MAINTENANCE:     'Maintenance',
  RENOVATION:      'Renovation',
  FURNITURE:       'Furniture',
  // Agency-wide
  SOFTWARE:        'Software',
  MARKETING:       'Marketing',
  INSURANCE:       'Insurance',
  ACCOUNTING:      'Accounting',
  LEGAL:           'Legal',
  OFFICE_SUPPLIES: 'Office Supplies',
  SALARIES:        'Salaries',
  TRAVEL:          'Travel',
  EQUIPMENT:       'Equipment',
  TAXES:           'Taxes',
  // Catch-all
  OTHER:           'Other',
};

/**
 * ExpenseCategoryBadge
 *
 * SRP: renders a styled badge for any of the 19 expense categories.
 * Agency-wide categories share the `agency` semantic token — a hue change
 * in `index.css` automatically updates all 10 agency badges.
 */
export function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  return (
    <Badge variant="outline" className={CATEGORY_STYLES[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
