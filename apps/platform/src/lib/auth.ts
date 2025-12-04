/**
 * 🇿🇼 Nyuchi Platform - Auth utilities
 * "I am because we are"
 *
 * Re-exports from @nyuchi/auth package for centralized authentication.
 */

// Re-export all auth functionality from the centralized package
export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  verifyToken,
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireAdmin,
  requireModerator,
  sessionAuthMiddleware,
} from '@nyuchi/auth';

export type { UserRole, AuthUser, AuthEnvBindings } from '@nyuchi/auth';
