/**
 * 🇿🇼 Nyuchi Platform - Directory Queries
 * "I am because we are" - Community directory operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

type DirectoryListing = Database['public']['Tables']['directory_listings']['Row'];
type DirectoryListingInsert = Database['public']['Tables']['directory_listings']['Insert'];
type DirectoryListingUpdate = Database['public']['Tables']['directory_listings']['Update'];

/**
 * Filters for directory listings
 */
export interface DirectoryFilters {
  category?: string;
  country?: string;
  city?: string;
  status?: string;
  verified_only?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Get all published directory listings
 */
export async function getPublishedListings(
  client: SupabaseClient<Database>,
  filters: DirectoryFilters = {}
): Promise<{ data: DirectoryListing[]; count: number }> {
  let query = client
    .from('directory_listings')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.country) {
    query = query.eq('country', filters.country);
  }

  if (filters.city) {
    query = query.eq('city', filters.city);
  }

  if (filters.verified_only) {
    query = query.eq('verification_status', 'approved');
  }

  query = query
    .order('created_at', { ascending: false })
    .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching directory listings:', error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Get single directory listing by ID
 */
export async function getDirectoryListing(
  client: SupabaseClient<Database>,
  listingId: string
): Promise<DirectoryListing | null> {
  const { data, error } = await client
    .from('directory_listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (error) {
    console.error('Error fetching directory listing:', error);
    return null;
  }

  // Increment view count
  await client
    .from('directory_listings')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', listingId);

  return data;
}

/**
 * Create directory listing
 */
export async function createDirectoryListing(
  client: SupabaseClient<Database>,
  listing: DirectoryListingInsert
): Promise<DirectoryListing | null> {
  const { data, error } = await client
    .from('directory_listings')
    .insert({
      ...listing,
      status: 'pending', // Always start as pending
      verification_status: 'none',
      verification_fee_paid: false,
      view_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating directory listing:', error);
    return null;
  }

  return data;
}

/**
 * Update directory listing
 */
export async function updateDirectoryListing(
  client: SupabaseClient<Database>,
  listingId: string,
  updates: DirectoryListingUpdate
): Promise<DirectoryListing | null> {
  const { data, error } = await client
    .from('directory_listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating directory listing:', error);
    return null;
  }

  return data;
}

/**
 * Get listings for moderation (pending approval)
 */
export async function getPendingListings(
  client: SupabaseClient<Database>,
  limit = 50
): Promise<DirectoryListing[]> {
  const { data, error } = await client
    .from('directory_listings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching pending listings:', error);
    return [];
  }

  return data || [];
}

/**
 * Approve directory listing
 */
export async function approveDirectoryListing(
  client: SupabaseClient<Database>,
  listingId: string,
  reviewerId: string
): Promise<DirectoryListing | null> {
  return updateDirectoryListing(client, listingId, {
    status: 'published',
    reviewed_by: reviewerId,
  });
}

/**
 * Reject directory listing
 */
export async function rejectDirectoryListing(
  client: SupabaseClient<Database>,
  listingId: string,
  reviewerId: string
): Promise<DirectoryListing | null> {
  return updateDirectoryListing(client, listingId, {
    status: 'rejected',
    reviewed_by: reviewerId,
  });
}

/**
 * Delete directory listing
 */
export async function deleteDirectoryListing(
  client: SupabaseClient<Database>,
  listingId: string
): Promise<boolean> {
  const { error } = await client
    .from('directory_listings')
    .delete()
    .eq('id', listingId);

  if (error) {
    console.error('Error deleting directory listing:', error);
    return false;
  }

  return true;
}

/**
 * Get user's listings
 */
export async function getUserListings(
  client: SupabaseClient<Database>,
  userId: string
): Promise<DirectoryListing[]> {
  const { data, error } = await client
    .from('directory_listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user listings:', error);
    return [];
  }

  return data || [];
}

/**
 * Search directory listings
 */
export async function searchDirectoryListings(
  client: SupabaseClient<Database>,
  searchQuery: string,
  filters: DirectoryFilters = {}
): Promise<DirectoryListing[]> {
  let query = client
    .from('directory_listings')
    .select('*')
    .eq('status', 'published')
    .or(`business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.country) {
    query = query.eq('country', filters.country);
  }

  query = query
    .order('view_count', { ascending: false })
    .limit(filters.limit || 20);

  const { data, error } = await query;

  if (error) {
    console.error('Error searching directory listings:', error);
    return [];
  }

  return data || [];
}
