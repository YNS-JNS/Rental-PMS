import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState
 *
 * Generic empty-content placeholder used throughout the app.
 * Displays an icon, title, description, and an optional CTA button.
 *
 * Design decisions:
 * - Icon container uses `bg-primary/5 ring-1 ring-primary/10` for a subtle
 *   on-brand tint without competing with actionable elements.
 * - Dashed border uses `border-border` token (not a raw color) so it adapts
 *   to dark mode automatically.
 * - `role="img"` on the icon container + `aria-label` improves screen-reader
 *   context so assistive tech announces the icon's purpose.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border-2 border-dashed border-border">

      {/* ── Icon container — primary-tinted ring ───────────────────────── */}
      <div
        role="img"
        aria-label={title}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10"
      >
        <Icon className="h-8 w-8 text-primary/50" strokeWidth={1.5} />
      </div>

      {/* ── Copy ───────────────────────────────────────────────────────── */}
      <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-xs leading-relaxed">
        {description}
      </p>

      {/* ── CTA (optional) ─────────────────────────────────────────────── */}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
