import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes cleanly.
 * It resolves conflicts (e.g., 'bg-red-500' overrides 'bg-blue-500').
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
