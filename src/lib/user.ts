// src/lib/user.ts
// Central "who is this user" helper — NEVER returns the email as a display name.
import type { AppUser } from '@/types';

export function displayNameOf(user: AppUser | null | undefined): string {
  if (!user) return '';
  const raw = user as unknown as Record<string, unknown>;
  const candidates: unknown[] = [
    raw.realName,
    raw.fullName,
    raw.name,
    raw.displayName,
    raw.username,
  ];
  for (const c of candidates) {
    if (typeof c === 'string') {
      const v = c.trim();
      if (v && !v.includes('@')) return v;
    }
  }
  // Fall back to the local part of the email, prettified — never the full email.
  const email = typeof raw.email === 'string' ? raw.email : '';
  if (email && email.includes('@')) {
    const local = email.split('@')[0];
    return local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }
  return 'Member';
}
