/**
 * 🇿🇼 Nyuchi Platform - User Queries
 * "I am because we are" - User management operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserRole } from '../types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Get user profile by ID
 */
export async function getUserProfile(
  client: SupabaseClient<Database>,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Get user profile by email
 */
export async function getUserByEmail(
  client: SupabaseClient<Database>,
  email: string
): Promise<Profile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data;
}

/**
 * Create user profile
 */
export async function createUserProfile(
  client: SupabaseClient<Database>,
  profile: ProfileInsert
): Promise<Profile | null> {
  const { data, error } = await client
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  client: SupabaseClient<Database>,
  userId: string,
  updates: ProfileUpdate
): Promise<Profile | null> {
  const { data, error} = await client
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

/**
 * Update Ubuntu score
 */
export async function updateUbuntuScore(
  client: SupabaseClient<Database>,
  userId: string,
  pointsToAdd: number
): Promise<Profile | null> {
  const { data, error } = await client.rpc('increment_ubuntu_score', {
    user_id: userId,
    points: pointsToAdd,
  });

  if (error) {
    console.error('Error updating Ubuntu score:', error);
    // Fallback to manual update
    const profile = await getUserProfile(client, userId);
    if (profile) {
      return updateUserProfile(client, userId, {
        ubuntu_score: (profile.ubuntu_score || 0) + pointsToAdd,
        contribution_count: (profile.contribution_count || 0) + 1,
      });
    }
    return null;
  }

  return data;
}

/**
 * Get Ubuntu leaderboard
 */
export async function getUbuntuLeaderboard(
  client: SupabaseClient<Database>,
  limit = 50
): Promise<Profile[]> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .order('ubuntu_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data;
}

/**
 * Search users by name or email
 */
export async function searchUsers(
  client: SupabaseClient<Database>,
  query: string,
  limit = 20
): Promise<Profile[]> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching users:', error);
    return [];
  }

  return data;
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  client: SupabaseClient<Database>,
  role: UserRole
): Promise<Profile[]> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('role', role);

  if (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }

  return data;
}
