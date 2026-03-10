import { Sparkles } from 'lucide-react';

interface CleaningEmptyStateProps {
  /** Custom message for the empty state */
  message?: string;
}

/**
 * CleaningEmptyState
 * Zero-state illustration when no cleaning tasks exist.
 */
export function CleaningEmptyState({
  message = 'No apartments need cleaning right now.',
}: CleaningEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Sparkles className="h-16 w-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900">All clean! ✨</h2>
      <p className="text-muted-foreground mt-2">{message}</p>
    </div>
  );
}
