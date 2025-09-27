/**
 * Direct D1 Database Connections for Remix SSR
 * 
 * This file handles direct database connections for server-side rendering,
 * bypassing API calls for better performance and real-time data.
 * 
 * Ubuntu Philosophy: Direct database access for community features remains free,
 * while business features require authentication but still serve collective prosperity.
 */

import type { D1Database, D1Result } from '@cloudflare/workers-types';

// Environment interface for Cloudflare D1 bindings
interface CloudflareEnv {
  NY_PLATFORM_DB: D1Database;
  NY_AUTH_DB: D1Database;
  NY_SHARED_RESOURCES: KVNamespace;
  UBUNTU_PHILOSOPHY: string;
  COMMUNITY_ALWAYS_FREE: string;
}

// Ubuntu-themed error handling
interface UbuntuDatabaseError {
  code: string;
  ubuntu_message: string;
  philosophy: 'I am because we are';
  community_support: string;
  technical_details?: string;
}

function createUbuntuDatabaseError(message: string, code: string = 'DB_ERROR'): UbuntuDatabaseError {
  return {
    code,
    ubuntu_message: `Ubuntu community database challenge: ${message}`,
    philosophy: 'I am because we are',
    community_support: 'Our collective strength helps overcome technical challenges',
  };
}

// Database connection utility
class UbuntuDatabase {
  private platformDb: D1Database;
  private authDb: D1Database;
  private sharedKv: KVNamespace;

  constructor(env: CloudflareEnv) {
    this.platformDb = env.NY_PLATFORM_DB;
    this.authDb = env.NY_AUTH_DB;
    this.sharedKv = env.NY_SHARED_RESOURCES;
  }

  // Community Operations (Always accessible - Ubuntu principle)
  async getCommunityMembers(): Promise<any[]> {
    try {
      const result = await this.platformDb
        .prepare(`
          SELECT 
            id, name, email, location, joined_date, 
            ubuntu_contributions, bio, skills, active
          FROM community_members 
          WHERE active = 1 
          ORDER BY ubuntu_contributions DESC, joined_date DESC
        `)
        .all();

      return result.results || [];
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch community members', 'COMMUNITY_FETCH_ERROR');
    }
  }

  async getCommunityPosts(limit: number = 10): Promise<any[]> {
    try {
      const result = await this.platformDb
        .prepare(`
          SELECT 
            id, title, content, author_name, ubuntu_principle,
            tags, likes, created_at, updated_at
          FROM community_posts 
          ORDER BY created_at DESC 
          LIMIT ?
        `)
        .bind(limit)
        .all();

      return result.results || [];
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch community posts', 'POSTS_FETCH_ERROR');
    }
  }

  async createCommunityPost(postData: {
    title: string;
    content: string;
    author_name: string;
    tags?: string[];
  }): Promise<any> {
    try {
      const result = await this.platformDb
        .prepare(`
          INSERT INTO community_posts 
          (title, content, author_name, ubuntu_principle, tags, created_at) 
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(
          postData.title,
          postData.content,
          postData.author_name,
          'I am because we are',
          JSON.stringify(postData.tags || []),
          new Date().toISOString()
        )
        .run();

      return {
        success: true,
        id: result.meta?.last_row_id,
        ubuntu_message: 'Your story strengthens our entire community',
      };
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to create community post', 'POST_CREATE_ERROR');
    }
  }

  async getCommunityDiscussions(activeOnly: boolean = true): Promise<any[]> {
    try {
      const whereClause = activeOnly ? "WHERE status = 'active'" : '';
      const result = await this.platformDb
        .prepare(`
          SELECT 
            id, topic, description, starter_name, participant_count,
            last_activity, ubuntu_focus, status
          FROM community_discussions 
          ${whereClause}
          ORDER BY last_activity DESC
        `)
        .all();

      return result.results || [];
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch community discussions', 'DISCUSSIONS_FETCH_ERROR');
    }
  }

  // Business Operations (Require authentication)
  async getUserProfile(userId: string): Promise<any> {
    try {
      const result = await this.platformDb
        .prepare(`
          SELECT 
            id, user_id, name, business_name, business_type,
            location, email, phone, description, website,
            created_at, updated_at
          FROM business_profiles 
          WHERE user_id = ?
        `)
        .bind(userId)
        .first();

      return result;
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch user profile', 'PROFILE_FETCH_ERROR');
    }
  }

  async getBusinessMetrics(userId: string): Promise<any> {
    try {
      const result = await this.platformDb
        .prepare(`
          SELECT 
            revenue, currency, customers, projects, employees,
            ubuntu_impact_score, month_year, created_at
          FROM business_metrics 
          WHERE user_id = ? 
          ORDER BY created_at DESC 
          LIMIT 12
        `)
        .bind(userId)
        .all();

      return result.results || [];
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch business metrics', 'METRICS_FETCH_ERROR');
    }
  }

  async updateUserProfile(userId: string, profileData: {
    name: string;
    business_name?: string;
    business_type?: string;
    location?: string;
    description?: string;
  }): Promise<any> {
    try {
      const result = await this.platformDb
        .prepare(`
          INSERT OR REPLACE INTO business_profiles 
          (user_id, name, business_name, business_type, location, description, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          userId,
          profileData.name,
          profileData.business_name || null,
          profileData.business_type || null,
          profileData.location || null,
          profileData.description || null,
          new Date().toISOString()
        )
        .run();

      return {
        success: true,
        updated: result.changes > 0,
        ubuntu_message: 'Your growth contributes to our collective strength',
      };
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to update profile', 'PROFILE_UPDATE_ERROR');
    }
  }

  // Success Stories (Community feature)
  async getSuccessStories(limit: number = 10): Promise<any[]> {
    try {
      const result = await this.platformDb
        .prepare(`
          SELECT 
            id, user_id, title, story, business_impact, community_impact,
            media_urls, featured, ubuntu_principle_demonstrated, created_at
          FROM success_stories 
          ORDER BY featured DESC, created_at DESC 
          LIMIT ?
        `)
        .bind(limit)
        .all();

      return result.results || [];
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch success stories', 'STORIES_FETCH_ERROR');
    }
  }

  // Real-time data for SSE
  async getRealtimeCommunityActivity(): Promise<any> {
    try {
      const [recentPosts, activeDiscussions, newMembers] = await Promise.all([
        this.platformDb.prepare('SELECT COUNT(*) as count FROM community_posts WHERE created_at > datetime("now", "-1 hour")').first(),
        this.platformDb.prepare('SELECT COUNT(*) as count FROM community_discussions WHERE status = "active"').first(),
        this.platformDb.prepare('SELECT COUNT(*) as count FROM community_members WHERE joined_date > datetime("now", "-24 hours")').first(),
      ]);

      return {
        recent_posts: recentPosts?.count || 0,
        active_discussions: activeDiscussions?.count || 0,
        new_members: newMembers?.count || 0,
        ubuntu_pulse: 'Community growing stronger together',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch real-time activity', 'REALTIME_FETCH_ERROR');
    }
  }

  // AI Context for Ubuntu AI integration
  async getUbuntuAIContext(): Promise<any> {
    try {
      // Get community context for AI
      const [memberCount, postCount, discussionCount] = await Promise.all([
        this.platformDb.prepare('SELECT COUNT(*) as count FROM community_members WHERE active = 1').first(),
        this.platformDb.prepare('SELECT COUNT(*) as count FROM community_posts').first(),
        this.platformDb.prepare('SELECT COUNT(*) as count FROM community_discussions WHERE status = "active"').first(),
      ]);

      return {
        community_context: {
          active_members: memberCount?.count || 0,
          total_posts: postCount?.count || 0,
          active_discussions: discussionCount?.count || 0,
          ubuntu_philosophy: 'I am because we are',
          african_context: true,
          community_always_free: true,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw createUbuntuDatabaseError('Failed to fetch AI context', 'AI_CONTEXT_ERROR');
    }
  }
}

// Factory function for creating database instance
export function createUbuntuDatabase(env: CloudflareEnv): UbuntuDatabase {
  return new UbuntuDatabase(env);
}

// Type exports
export type { UbuntuDatabase, UbuntuDatabaseError, CloudflareEnv };