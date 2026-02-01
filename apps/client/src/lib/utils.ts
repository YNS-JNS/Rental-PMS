import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes conditionally and resolves conflicts.
 * Essential for building reusable UI components.
 * * @param inputs - List of classes or conditional objects
 * @returns Clean merged string of classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
