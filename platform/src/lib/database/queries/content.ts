/**
 * 🇿🇼 Nyuchi Platform - Content Queries
 * "I am because we are" - Content submission operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

type ContentSubmission = Database['public']['Tables']['content_submissions']['Row'];
type ContentSubmissionInsert = Database['public']['Tables']['content_submissions']['Insert'];
type ContentSubmissionUpdate = Database['public']['Tables']['content_submissions']['Update'];

/**
 * Filters for content submissions
 */
export interface ContentFilters {
  category?: string;
  content_type?: string;
  status?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Get published content
 */
export async function getPublishedContent(
  client: SupabaseClient<Database>,
  filters: ContentFilters = {}
): Promise<{ data: ContentSubmission[]; count: number }> {
  let query = client
    .from('content_submissions')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.content_type) {
    query = query.eq('content_type', filters.content_type);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  query = query
    .order('published_at', { ascending: false })
    .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching published content:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Get single content submission by ID
 */
export async function getContentSubmission(
  client: SupabaseClient<Database>,
  submissionId: string
): Promise<ContentSubmission | null> {
  const { data, error } = await client
    .from('content_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error) {
    console.error('Error fetching content submission:', error);
    return null;
  }

  // Increment view count
  await client
    .from('content_submissions')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', submissionId);

  return data;
}

/**
 * Get content by slug
 */
export async function getContentBySlug(
  client: SupabaseClient<Database>,
  slug: string
): Promise<ContentSubmission | null> {
  const { data, error } = await client
    .from('content_submissions')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching content by slug:', error);
    return null;
  }

  // Increment view count
  await client
    .from('content_submissions')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', data.id);

  return data;
}

/**
 * Create content submission
 */
export async function createContentSubmission(
  client: SupabaseClient<Database>,
  submission: ContentSubmissionInsert
): Promise<ContentSubmission | null> {
  // Generate slug from title if not provided
  const slug = submission.slug || generateSlug(submission.title);

  const { data, error } = await client
    .from('content_submissions')
    .insert({
      ...submission,
      slug,
      status: 'submitted',
      ubuntu_points_awarded: 0,
      view_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating content submission:', error);
    return null;
  }

  return data;
}

/**
 * Update content submission
 */
export async function updateContentSubmission(
  client: SupabaseClient<Database>,
  submissionId: string,
  updates: ContentSubmissionUpdate
): Promise<ContentSubmission | null> {
  const { data, error } = await client
    .from('content_submissions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating content submission:', error);
    return null;
  }

  return data;
}

/**
 * Get submissions for review
 */
export async function getSubmissionsForReview(
  client: SupabaseClient<Database>,
  limit = 50
): Promise<ContentSubmission[]> {
  const { data, error } = await client
    .from('content_submissions')
    .select('*')
    .in('status', ['submitted', 'reviewing'])
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching submissions for review:', error);
    return [];
  }

  return data || [];
}

/**
 * Approve content submission
 */
export async function approveContentSubmission(
  client: SupabaseClient<Database>,
  submissionId: string,
  reviewerId: string,
  ubuntuPoints = 100
): Promise<ContentSubmission | null> {
  return updateContentSubmission(client, submissionId, {
    status: 'published',
    reviewed_by: reviewerId,
    published_at: new Date().toISOString(),
    ubuntu_points_awarded: ubuntuPoints,
  });
}

/**
 * Reject content submission
 */
export async function rejectContentSubmission(
  client: SupabaseClient<Database>,
  submissionId: string,
  reviewerId: string
): Promise<ContentSubmission | null> {
  return updateContentSubmission(client, submissionId, {
    status: 'rejected',
    reviewed_by: reviewerId,
  });
}

/**
 * Delete content submission
 */
export async function deleteContentSubmission(
  client: SupabaseClient<Database>,
  submissionId: string
): Promise<boolean> {
  const { error } = await client
    .from('content_submissions')
    .delete()
    .eq('id', submissionId);

  if (error) {
    console.error('Error deleting content submission:', error);
    return false;
  }

  return true;
}

/**
 * Get user's content submissions
 */
export async function getUserContentSubmissions(
  client: SupabaseClient<Database>,
  userId: string
): Promise<ContentSubmission[]> {
  const { data, error } = await client
    .from('content_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user content submissions:', error);
    return [];
  }

  return data || [];
}

/**
 * Add AI analysis to content
 */
export async function addAIAnalysis(
  client: SupabaseClient<Database>,
  submissionId: string,
  analysis: Record<string, any>
): Promise<ContentSubmission | null> {
  return updateContentSubmission(client, submissionId, {
    ai_analysis: analysis,
  });
}

/**
 * Search content
 */
export async function searchContent(
  client: SupabaseClient<Database>,
  searchQuery: string,
  filters: ContentFilters = {}
): Promise<ContentSubmission[]> {
  let query = client
    .from('content_submissions')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  query = query
    .order('view_count', { ascending: false })
    .limit(filters.limit || 20);

  const { data, error } = await query;

  if (error) {
    console.error('Error searching content:', error);
    return [];
  }

  return data || [];
}

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}
