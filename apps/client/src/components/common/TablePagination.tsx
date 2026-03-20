import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────

interface TablePaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when the user selects a new page */
  onPageChange: (page: number) => void;
  /** Optional: current page size (for display/future API binding) */
  pageSize?: number;
  /** Optional: total item count (for "Showing X–Y of Z" label) */
  totalItems?: number;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * buildPageRange
 *
 * Generates the list of page numbers and ellipsis markers to display.
 * Always shows: first page, last page, current±1 neighbours.
 * Gaps wider than 1 are represented by the string `'…'`.
 *
 * Example for page 5 of 10:
 *   [1, '…', 4, 5, 6, '…', 10]
 */
function buildPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    // Enough space — show all pages without ellipsis
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | '…')[] = [1];

  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2)       range.push('…');

  for (let i = left; i <= right; i++) range.push(i);

  if (right < total - 1) range.push('…');

  range.push(total);
  return range;
}

// ── Component ─────────────────────────────────────────────────────────────

/**
 * TablePagination
 *
 * Standard SaaS pagination bar: Previous | 1 2 … 5 6 … 10 | Next.
 *
 * State ownership:
 *   This component is a PURE PRESENTER — it does not own page state.
 *   The parent (e.g. ExpensesPage) owns `page` and passes `onPageChange`.
 *   This keeps pagination reusable across ALL data tables in the app.
 *
 * Future API pagination:
 *   When the backend supports cursor/offset pagination, add `pageSize` and
 *   `totalItems` to the query params in the parent's RTK Query hook, then
 *   pass `totalItems` here to show the "Showing X–Y of Z" label.
 *
 * Accessibility:
 *   - `aria-label` on the nav element identifies the control to screen readers.
 *   - `aria-current="page"` marks the active page button.
 *   - `aria-disabled` on Previous/Next prevents interaction without hiding.
 */
export function TablePagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  className,
}: TablePaginationProps) {
  // Don't render if there's only one page — no navigation needed
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  // Optional "Showing X–Y of Z" label when totalItems is provided
  const showingLabel = totalItems != null && pageSize != null
    ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalItems)} of ${totalItems}`
    : null;

  return (
    <nav
      aria-label="Table pagination"
      className={cn(
        'flex items-center justify-between gap-4 pt-4 border-t border-border',
        className
      )}
    >
      {/* ── Left: item count label ─────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground shrink-0">
        {showingLabel ? (
          <>Showing <span className="font-medium text-foreground">{showingLabel}</span></>
        ) : (
          <>Page <span className="font-medium text-foreground">{page}</span> of {totalPages}</>
        )}
      </p>

      {/* ── Right: page buttons ────────────────────────────────────────── */}
      <div className="flex items-center gap-1">

        {/* Previous */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
          aria-disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number buttons */}
        {pages.map((p, i) =>
          p === '…' ? (
            // Non-interactive ellipsis separator
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground select-none"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-sm"
              onClick={() => onPageChange(p as number)}
              aria-label={`Go to page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </Button>
          )
        )}

        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Go to next page"
          aria-disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

      </div>
    </nav>
  );
}
