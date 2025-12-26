/**
 * Common database queries used across workers
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get user profile by ID
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, capabilities, ubuntu_score, avatar_url')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user email by ID (for notifications)
 */
export async function getUserEmail(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data?.email;
}

/**
 * Update content submission status
 */
export async function updateContentStatus(
  supabase: SupabaseClient,
  contentId: string,
  status: string,
  additionalFields?: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('content_submissions')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...additionalFields,
    })
    .eq('id', contentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update directory listing status
 */
export async function updateListingStatus(
  supabase: SupabaseClient,
  listingId: string,
  status: string,
  additionalFields?: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('directory_listings')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...additionalFields,
    })
    .eq('id', listingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Award Ubuntu points to a user
 */
export async function awardUbuntuPoints(
  supabase: SupabaseClient,
  userId: string,
  contributionType: string,
  points: number,
  details?: string,
  metadata?: Record<string, unknown>
) {
  // Insert contribution record
  const { error: contributionError } = await supabase
    .from('ubuntu_contributions')
    .insert({
      user_id: userId,
      contribution_type: contributionType,
      points_earned: points,
      details,
      metadata,
    });

  if (contributionError) throw contributionError;

  // Update user's total score
  const { data: profile } = await supabase
    .from('profiles')
    .select('ubuntu_score')
    .eq('id', userId)
    .single();

  const newScore = (profile?.ubuntu_score || 0) + points;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ ubuntu_score: newScore })
    .eq('id', userId);

  if (updateError) throw updateError;

  return newScore;
}

/**
 * Log user activity
 */
export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  activityType: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
) {
  const { error } = await supabase.from('activity_logs').insert({
    user_id: userId,
    activity_type: activityType,
    metadata,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  if (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Increment view count (fire-and-forget safe)
 */
export async function incrementViewCount(
  supabase: SupabaseClient,
  table: 'directory_listings' | 'content_submissions' | 'travel_businesses',
  id: string
) {
  const { data } = await supabase
    .from(table)
    .select('view_count')
    .eq('id', id)
    .single();

  if (data) {
    await supabase
      .from(table)
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);
  }
}

/**
 * Create or update unified submission
 */
export async function upsertUnifiedSubmission(
  supabase: SupabaseClient,
  data: {
    referenceId: string;
    submissionType: string;
    userId: string;
    title: string;
    status: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from('unified_submissions').upsert(
    {
      reference_id: data.referenceId,
      submission_type: data.submissionType,
      user_id: data.userId,
      title: data.title,
      status: data.status,
      metadata: data.metadata,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'reference_id,submission_type',
    }
  );

  if (error) throw error;
}

/**
 * Get verification request by ID
 */
export async function getVerificationRequest(supabase: SupabaseClient, verificationId: string) {
  const { data, error } = await supabase
    .from('verification_requests')
    .select('*, directory_listings(*)')
    .eq('id', verificationId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update verification request
 */
export async function updateVerificationRequest(
  supabase: SupabaseClient,
  verificationId: string,
  updates: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('verification_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', verificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
