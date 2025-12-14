/**
 * Common validation utilities
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Validate email format
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * Sanitize string for SQL LIKE queries
 */
export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[%_]/g, '\\$&');
}

/**
 * Validate and parse pagination params
 */
export function parsePagination(
  limit?: string | number,
  offset?: string | number
): { limit: number; offset: number } {
  const parsedLimit = Math.min(
    Math.max(1, parseInt(String(limit || '50'), 10) || 50),
    100
  );
  const parsedOffset = Math.max(0, parseInt(String(offset || '0'), 10) || 0);

  return { limit: parsedLimit, offset: parsedOffset };
}

/**
 * Check required fields
 */
export function checkRequiredFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === ''
  );

  return {
    valid: missing.length === 0,
    missing: missing.map(String),
  };
}

/**
 * Validate status enum
 */
export function isValidStatus(
  status: string,
  allowedStatuses: readonly string[]
): boolean {
  return allowedStatuses.includes(status);
}

/**
 * Content statuses
 */
export const CONTENT_STATUSES = [
  'draft',
  'submitted',
  'in_review',
  'needs_changes',
  'approved',
  'rejected',
  'published',
] as const;

/**
 * Listing statuses
 */
export const LISTING_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'published',
  'suspended',
] as const;

/**
 * Verification statuses
 */
export const VERIFICATION_STATUSES = [
  'pending',
  'payment_pending',
  'payment_completed',
  'in_review',
  'approved',
  'rejected',
] as const;
