import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function remToPx(rem: number) {
  const fontSize = getComputedStyle(document.documentElement).fontSize;
  return rem * Number.parseFloat(fontSize);
}