/**
 * 🇿🇼 Nyuchi Platform - Ubuntu Contribution Queries
 * "I am because we are" - Ubuntu scoring operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { ContributionType } from '@nyuchi/ubuntu';

type UbuntuContribution = Database['public']['Tables']['ubuntu_contributions']['Row'];
type UbuntuContributionInsert = Database['public']['Tables']['ubuntu_contributions']['Insert'];

/**
 * Record Ubuntu contribution
 */
export async function recordUbuntuContribution(
  client: SupabaseClient<Database>,
  userId: string,
  contributionType: ContributionType,
  points: number,
  details?: string,
  metadata?: Record<string, any>
): Promise<UbuntuContribution | null> {
  const { data, error } = await client
    .from('ubuntu_contributions')
    .insert({
      user_id: userId,
      contribution_type: contributionType,
      contribution_details: details || null,
      ubuntu_points_earned: points,
      metadata: metadata || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording Ubuntu contribution:', error);
    return null;
  }

  return data;
}

/**
 * Get user's contributions
 */
export async function getUserContributions(
  client: SupabaseClient<Database>,
  userId: string
): Promise<UbuntuContribution[]> {
  const { data, error } = await client
    .from('ubuntu_contributions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user contributions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get contributions by type
 */
export async function getContributionsByType(
  client: SupabaseClient<Database>,
  userId: string,
  contributionType: ContributionType
): Promise<UbuntuContribution[]> {
  const { data, error } = await client
    .from('ubuntu_contributions')
    .select('*')
    .eq('user_id', userId)
    .eq('contribution_type', contributionType)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contributions by type:', error);
    return [];
  }

  return data || [];
}

/**
 * Get total points by type for a user
 */
export async function getTotalPointsByType(
  client: SupabaseClient<Database>,
  userId: string
): Promise<Record<string, number>> {
  const contributions = await getUserContributions(client, userId);

  const pointsByType: Record<string, number> = {};

  contributions.forEach((contrib) => {
    const type = contrib.contribution_type;
    pointsByType[type] = (pointsByType[type] || 0) + contrib.ubuntu_points_earned;
  });

  return pointsByType;
}

/**
 * Get recent contributions across all users
 */
export async function getRecentContributions(
  client: SupabaseClient<Database>,
  limit = 50
): Promise<UbuntuContribution[]> {
  const { data, error } = await client
    .from('ubuntu_contributions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent contributions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get contribution statistics for a user
 */
export async function getUserContributionStats(
  client: SupabaseClient<Database>,
  userId: string
): Promise<{
  totalContributions: number;
  totalPoints: number;
  contributionsByType: Record<string, number>;
  recentStreak: number;
}> {
  const contributions = await getUserContributions(client, userId);

  const totalContributions = contributions.length;
  const totalPoints = contributions.reduce((sum, c) => sum + c.ubuntu_points_earned, 0);

  // Count by type
  const contributionsByType: Record<string, number> = {};
  contributions.forEach((contrib) => {
    const type = contrib.contribution_type;
    contributionsByType[type] = (contributionsByType[type] || 0) + 1;
  });

  // Calculate streak (consecutive days with contributions)
  const recentStreak = calculateStreak(contributions);

  return {
    totalContributions,
    totalPoints,
    contributionsByType,
    recentStreak,
  };
}

/**
 * Calculate contribution streak (consecutive days)
 */
function calculateStreak(contributions: UbuntuContribution[]): number {
  if (contributions.length === 0) return 0;

  const dates = contributions
    .map((c) => new Date(c.created_at).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  const today = new Date().toDateString();

  if (dates[0] !== today && dates[0] !== new Date(Date.now() - 86400000).toDateString()) {
    return 0; // Streak broken if no contribution today or yesterday
  }

  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const previousDate = new Date(dates[i - 1]);
    const dayDiff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get top contributors (leaderboard)
 */
export async function getTopContributors(
  client: SupabaseClient<Database>,
  limit = 50
): Promise<Array<{ userId: string; totalPoints: number; contributionCount: number }>> {
  const { data, error } = await client.rpc('get_top_contributors', {
    row_limit: limit,
  });

  if (error) {
    console.error('Error fetching top contributors:', error);
    // Fallback: aggregate manually
    return [];
  }

  return data || [];
}
