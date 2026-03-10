import { useState, useCallback } from 'react';
import type { CleaningTaskFilters } from '../cleaningApiSlice';

/**
 * useCleaningFilters
 * Manages transient filter state for the Admin cleaning dashboard.
 * Not persisted to global state — filters reset on unmount.
 */
export function useCleaningFilters() {
  const [filters, setFilters] = useState<CleaningTaskFilters>({});

  const setFilter = useCallback(
    <K extends keyof CleaningTaskFilters>(key: K, value: CleaningTaskFilters[K]) => {
      setFilters((prev) => {
        // Remove the key entirely if the value is empty/undefined
        if (!value) {
          const { [key]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [key]: value };
      });
    },
    [],
  );

  const resetFilters = useCallback(() => setFilters({}), []);

  return { filters, setFilter, resetFilters } as const;
}
