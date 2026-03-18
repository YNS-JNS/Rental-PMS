import { Badge } from '@/components/ui/badge';
import type { ExpenseCategoryType } from '@rental/shared';

interface ExpenseCategoryBadgeProps {
  category: ExpenseCategoryType;
}

// ─── Visual config ────────────────────────────────────────────────────────────

/**
 * Category-to-colour mapping — all 19 categories.
 *
 * Apartment-specific  → blues / greens / ambers
 * Agency-wide         → purples / indigos
 * Catch-all           → neutral grey
 */
const CATEGORY_STYLES: Record<ExpenseCategoryType, string> = {
  // Apartment-specific
  WATER:          'bg-blue-100 text-blue-800 border-blue-200',
  ELECTRICITY:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  GAS:            'bg-orange-100 text-orange-800 border-orange-200',
  INTERNET:       'bg-sky-100 text-sky-800 border-sky-200',
  CLEANING:       'bg-green-100 text-green-800 border-green-200',
  MAINTENANCE:    'bg-amber-100 text-amber-800 border-amber-200',
  RENOVATION:     'bg-red-100 text-red-800 border-red-200',
  FURNITURE:      'bg-lime-100 text-lime-800 border-lime-200',
  // Agency-wide (structural)
  SOFTWARE:       'bg-violet-100 text-violet-800 border-violet-200',
  MARKETING:      'bg-pink-100 text-pink-800 border-pink-200',
  INSURANCE:      'bg-indigo-100 text-indigo-800 border-indigo-200',
  ACCOUNTING:     'bg-purple-100 text-purple-800 border-purple-200',
  LEGAL:          'bg-rose-100 text-rose-800 border-rose-200',
  OFFICE_SUPPLIES:'bg-teal-100 text-teal-800 border-teal-200',
  SALARIES:       'bg-cyan-100 text-cyan-800 border-cyan-200',
  TRAVEL:         'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  EQUIPMENT:      'bg-slate-100 text-slate-800 border-slate-200',
  TAXES:          'bg-zinc-100 text-zinc-800 border-zinc-200',
  // Catch-all
  OTHER:          'bg-gray-100 text-gray-700 border-gray-200',
};

const CATEGORY_LABELS: Record<ExpenseCategoryType, string> = {
  // Apartment-specific
  WATER:          'Eau',
  ELECTRICITY:    'Électricité',
  GAS:            'Gaz',
  INTERNET:       'Internet',
  CLEANING:       'Nettoyage',
  MAINTENANCE:    'Maintenance',
  RENOVATION:     'Rénovation',
  FURNITURE:      'Mobilier',
  // Agency-wide (structural)
  SOFTWARE:       'Logiciel',
  MARKETING:      'Marketing',
  INSURANCE:      'Assurance',
  ACCOUNTING:     'Comptabilité',
  LEGAL:          'Juridique',
  OFFICE_SUPPLIES:'Fournitures',
  SALARIES:       'Salaires',
  TRAVEL:         'Déplacements',
  EQUIPMENT:      'Équipement',
  TAXES:          'Taxes',
  // Catch-all
  OTHER:          'Autre',
};

/**
 * ExpenseCategoryBadge
 * SRP: renders a styled, localised badge for any of the 19 expense categories.
 */
export function ExpenseCategoryBadge({ category }: ExpenseCategoryBadgeProps) {
  return (
    <Badge variant="outline" className={CATEGORY_STYLES[category]}>
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
