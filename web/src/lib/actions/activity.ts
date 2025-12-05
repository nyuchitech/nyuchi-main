/**
 * Activity Logging Actions
 * Server actions for logging user activity
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import type { ActivityType } from '@nyuchi/database';

/**
 * Log user activity
 * Call this from server actions to track user actions
 */
export async function logActivity(
  userId: string,
  activity: ActivityType,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();
  const headersList = await headers();

  // Get IP and user agent from headers
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                    headersList.get('x-real-ip') ||
                    null;
  const userAgent = headersList.get('user-agent') || null;

  const { error } = await supabase.from('activity_logs').insert({
    user_id: userId,
    activity,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: metadata || null,
  });

  if (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get user's recent activity
 */
export async function getUserActivity(userId: string, limit = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get user activity:', error);
    return [];
  }

  return data;
}

/**
 * Get all activity (admin only)
 */
export async function getAllActivity(limit = 50) {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, capabilities')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin' || profile?.capabilities?.includes('admin');
  if (!isAdmin) return [];

  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to get all activity:', error);
    return [];
  }

  return data;
}
