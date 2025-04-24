import { type ClassValue, clsx } from "clsx"
import { nanoid } from 'nanoid'
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, using clsx for conditional logic and twMerge to handle Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Base URL for the application, used for SEO and generating absolute URLs
 */
export const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000"

/**
 * Ensures a string starts with a given prefix.
 */
export function ensureStartsWith(str: string, prefix: string) {
  return str.startsWith(prefix) ? str : `${prefix}${str}`
}

/**
 * Creates a URL with search params.
 */
export function createUrl(pathname: string, params: URLSearchParams | Record<string, string> = {}) {
  const paramsString = params instanceof URLSearchParams 
    ? params.toString()
    : new URLSearchParams(params).toString()
  
  return `${pathname}${paramsString ? `?${paramsString}` : ''}`
}

/**
 * Generates a unique ID for temporary carts
 * This is used for the Polar metadata workaround
 */
export function generateTempCartId(): string {
  return `tc_${nanoid(12)}`;
}
