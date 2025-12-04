/**
 * 🇿🇼 Nyuchi Platform - Database utilities
 * "I am because we are"
 *
 * Re-exports from @nyuchi/database package with platform-specific wrappers.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Re-export client functions
export {
  createSupabaseClient,
  createSupabaseAdminClient,
  createSupabaseClientWithAuth,
} from '@nyuchi/database';

// Re-export directory queries
export {
  getPublishedListings,
  getDirectoryListing,
  createDirectoryListing,
  updateDirectoryListing,
  deleteDirectoryListing,
  approveDirectoryListing,
  rejectDirectoryListing,
  getPendingListings,
  getUserListings,
  searchDirectoryListings,
} from '@nyuchi/database';

// Re-export content queries
export {
  getPublishedContent,
  getContentSubmission,
  getContentBySlug,
  createContentSubmission,
  updateContentSubmission,
  deleteContentSubmission,
  approveContentSubmission,
  rejectContentSubmission,
  getSubmissionsForReview,
  getUserContentSubmissions,
  addAIAnalysis,
  searchContent,
} from '@nyuchi/database';

// Re-export ubuntu queries
export {
  recordUbuntuContribution,
  getUserContributions,
  getContributionsByType,
  getTotalPointsByType,
  getRecentContributions,
  getUserContributionStats,
  getTopContributors,
  getUbuntuLeaderboard,
} from '@nyuchi/database';

// Alias for backward compatibility
export { getUserContributions as getUserUbuntuContributions } from '@nyuchi/database';

// Re-export types
export type { EnvBindings } from '@nyuchi/database';

/**
 * Publish content submission with custom points
 * Wrapper for approveContentSubmission with explicit points parameter
 */
export async function publishContentSubmission(
  client: SupabaseClient,
  id: string,
  reviewerId: string,
  points: number
) {
  const { data } = await client
    .from('content_submissions')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      ubuntu_points_awarded: points,
    })
    .eq('id', id)
    .select()
    .single();
  return data;
}
