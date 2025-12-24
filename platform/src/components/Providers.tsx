/**
 * 🇿🇼 Providers
 * "I am because we are" - Client-side providers wrapper
 */

'use client';

import { AuthProvider } from '../lib/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
