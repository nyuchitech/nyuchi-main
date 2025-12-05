/**
 * Server Action Middleware
 * Validation and authentication utilities for Next.js Server Actions
 * Inspired by Next.js SaaS Starter patterns
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Action state type for form submissions
 */
export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: unknown;
};

/**
 * Validated action wrapper
 * Wraps server actions with Zod schema validation
 */
export function validatedAction<T extends z.ZodSchema, R>(
  schema: T,
  action: (data: z.infer<T>, formData: FormData) => Promise<R>
) {
  return async (prevState: ActionState, formData: FormData): Promise<ActionState & R> => {
    const rawData = Object.fromEntries(formData.entries());
    const result = schema.safeParse(rawData);

    if (!result.success) {
      return {
        error: result.error.errors.map((e) => e.message).join(', '),
      } as ActionState & R;
    }

    return action(result.data, formData) as Promise<ActionState & R>;
  };
}

/**
 * Validated action with user authentication
 * Extends validatedAction by requiring authenticated user
 */
export function validatedActionWithUser<T extends z.ZodSchema, R>(
  schema: T,
  action: (data: z.infer<T>, formData: FormData, user: { id: string; email: string }) => Promise<R>
) {
  return async (prevState: ActionState, formData: FormData): Promise<ActionState & R> => {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        error: 'You must be signed in to perform this action',
      } as ActionState & R;
    }

    const rawData = Object.fromEntries(formData.entries());
    const result = schema.safeParse(rawData);

    if (!result.success) {
      return {
        error: result.error.errors.map((e) => e.message).join(', '),
      } as ActionState & R;
    }

    return action(result.data, formData, { id: user.id, email: user.email! }) as Promise<ActionState & R>;
  };
}

/**
 * Get current authenticated user
 * Redirects to sign-in if not authenticated
 */
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return user;
}

/**
 * Get current user with profile data
 * Redirects to sign-in if not authenticated
 */
export async function getUserWithProfile() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile };
}

/**
 * Require specific capability
 * Throws error if user doesn't have required capability
 */
export async function requireCapability(capability: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, capabilities')
    .eq('id', user.id)
    .single();

  const hasCapability =
    profile?.role === 'admin' ||
    profile?.capabilities?.includes('admin') ||
    profile?.capabilities?.includes(capability);

  if (!hasCapability) {
    throw new Error(`You don't have permission to perform this action. Required: ${capability}`);
  }

  return { user, profile };
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireCapability('admin');
}

/**
 * Require moderator role
 */
export async function requireModerator() {
  return requireCapability('moderator');
}

/**
 * Require reviewer role
 */
export async function requireReviewer() {
  return requireCapability('reviewer');
}
