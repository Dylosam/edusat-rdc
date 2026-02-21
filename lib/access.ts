import { mockGetCurrentUser } from '@/lib/mock-api/auth';
import type { User } from '@/lib/types';

// pages protégées (MVP)
export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/calendar',
  '/subjects',
  '/chapters',
  '/lessons',
  '/quiz',
  '/subscription',
];

// pages d’auth
export const AUTH_PREFIXES = ['/auth/login', '/auth/register'];

export async function getCurrentUser(): Promise<User | null> {
  return mockGetCurrentUser();
}

/**
 * Petit helper client : si user null => redirige.
 * (utile dans certaines pages si tu veux double sécurité)
 */
export async function requireAuthOrRedirect(routerPush: (path: string) => void) {
  const user = await getCurrentUser();
  if (!user) routerPush('/auth/login');
  return user;
}
