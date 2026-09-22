/**
 * Safe guard helpers — never crash on undefined
 */

export function safeArray<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

export function safeString(s: string | undefined | null): string {
  return typeof s === 'string' ? s : '';
}

export function safeNumber(n: number | undefined | null): number {
  return typeof n === 'number' && !isNaN(n) ? n : 0;
}

export function safeIncludes<T>(arr: T[] | undefined | null, value: T): boolean {
  return safeArray(arr).includes(value);
}

export function safeFind<T>(arr: T[] | undefined | null, fn: (item: T) => boolean): T | undefined {
  return safeArray(arr).find(fn);
}

export function safeFilter<T>(arr: T[] | undefined | null, fn: (item: T) => boolean): T[] {
  return safeArray(arr).filter(fn);
}

export function safeMap<T, R>(arr: T[] | undefined | null, fn: (item: T) => R): R[] {
  return safeArray(arr).map(fn);
}
