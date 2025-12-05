/**
 * 🇿🇼 Nyuchi Platform - Auth Package
 * "I am because we are" - Authentication utilities
 */

// Client exports
export {
  createAuthClient,
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  refreshSession,
  verifyToken,
  resetPassword,
  updatePassword,
} from './client';

// Middleware exports
export {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireAdmin,
  requireModerator,
  sessionAuthMiddleware,
} from './middleware';

export type { AuthUser, AuthEnvBindings } from './middleware';

// Role exports
export {
  hasPermission,
  hasRoleLevel,
  getRolePermissions,
  canManageContent,
  canManageListing,
  canManageUsers,
  isAdmin,
  isModerator,
  isContributor,
  getRoleDisplayName,
  getRoleDescription,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
} from './roles';

export type { UserRole, RolePermissions } from './roles';

// Session exports
export {
  getCurrentSession,
  isSessionValid,
  isSessionExpiring,
  refreshSessionIfNeeded,
  getSessionUserId,
  getSessionUserRole,
  hasSessionRole,
  isSessionAdmin,
  isSessionModerator,
  getSessionToken,
  getAuthHeader,
  onAuthStateChange,
  storeSessionLocally,
  getLocalSession,
  clearLocalSession,
} from './session';

export type { SessionUser, SessionData } from './session';
