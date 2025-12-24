/**
 * 🇿🇼 Ubuntu Philosophy Types
 * "I am because we are"
 */

/**
 * Ubuntu contribution types
 */
export type ContributionType =
  | 'content_published'
  | 'listing_created'
  | 'listing_verified'
  | 'community_help'
  | 'review_completed'
  | 'collaboration'
  | 'knowledge_sharing';

/**
 * Ubuntu level tiers
 */
export type UbuntuLevel =
  | 'Newcomer'
  | 'Contributor'
  | 'Community Leader'
  | 'Ubuntu Champion';

/**
 * Ubuntu contribution record
 */
export interface UbuntuContribution {
  id: string;
  userId: string;
  type: ContributionType;
  points: number;
  details?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * Ubuntu score calculation result
 */
export interface UbuntuScore {
  userId: string;
  points: number;
  level: UbuntuLevel;
  nextLevel: UbuntuLevel | null;
  pointsToNextLevel: number;
  contributions: {
    contentPublished: number;
    listingsCreated: number;
    listingsVerified: number;
    communityHelp: number;
    reviewsCompleted: number;
    collaborations: number;
    knowledgeSharing: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ubuntu leaderboard entry
 */
export interface UbuntuLeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  level: UbuntuLevel;
  rank: number;
  country?: string;
  recentContributions: number;
}

/**
 * Ubuntu message types for UI
 */
export interface UbuntuMessage {
  type: 'principle' | 'welcome' | 'contribution' | 'success' | 'collaboration' | 'loading' | 'error';
  message: string;
  philosophy?: string;
}

/**
 * Point values for different contribution types
 */
export const UBUNTU_POINTS: Record<ContributionType, number> = {
  content_published: 100,
  listing_created: 50,
  listing_verified: 75,
  community_help: 25,
  review_completed: 50,
  collaboration: 150,
  knowledge_sharing: 75,
};

/**
 * Level thresholds
 */
export const UBUNTU_LEVELS: Record<UbuntuLevel, { min: number; max: number | null }> = {
  'Newcomer': { min: 0, max: 999 },
  'Contributor': { min: 1000, max: 4999 },
  'Community Leader': { min: 5000, max: 9999 },
  'Ubuntu Champion': { min: 10000, max: null },
};
