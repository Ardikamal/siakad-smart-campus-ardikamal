import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names safely, resolving conflicting utility
 * classes (e.g. "p-2 p-4" -> "p-4"). Used by every UI primitive below.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
