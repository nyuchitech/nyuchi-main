/**
 * Ubuntu points configuration and utilities
 */

export const UBUNTU_POINTS = {
  // Content
  content_submitted: 10,
  content_published: 100,
  content_featured: 200,

  // Directory
  listing_created: 25,
  listing_approved: 50,
  listing_verified: 75,
  listing_featured: 100,

  // Community
  community_help: 25,
  review_completed: 50,
  collaboration: 150,
  knowledge_sharing: 75,
  referral: 100,

  // Engagement
  first_login: 10,
  profile_completed: 25,
  first_contribution: 50,
} as const;

export type UbuntuContributionType = keyof typeof UBUNTU_POINTS;

/**
 * Ubuntu level thresholds
 */
export const UBUNTU_LEVELS = {
  newcomer: { min: 0, max: 499, name: 'Newcomer' },
  contributor: { min: 500, max: 1999, name: 'Contributor' },
  community_leader: { min: 2000, max: 4999, name: 'Community Leader' },
  ubuntu_champion: { min: 5000, max: Infinity, name: 'Ubuntu Champion' },
} as const;

export type UbuntuLevel = keyof typeof UBUNTU_LEVELS;

/**
 * Get Ubuntu level from score
 */
export function getUbuntuLevel(score: number): { level: UbuntuLevel; name: string } {
  if (score >= UBUNTU_LEVELS.ubuntu_champion.min) {
    return { level: 'ubuntu_champion', name: UBUNTU_LEVELS.ubuntu_champion.name };
  }
  if (score >= UBUNTU_LEVELS.community_leader.min) {
    return { level: 'community_leader', name: UBUNTU_LEVELS.community_leader.name };
  }
  if (score >= UBUNTU_LEVELS.contributor.min) {
    return { level: 'contributor', name: UBUNTU_LEVELS.contributor.name };
  }
  return { level: 'newcomer', name: UBUNTU_LEVELS.newcomer.name };
}

/**
 * Check if user leveled up
 */
export function checkLevelUp(
  oldScore: number,
  newScore: number
): { leveledUp: boolean; newLevel?: UbuntuLevel; newLevelName?: string } {
  const oldLevel = getUbuntuLevel(oldScore);
  const newLevel = getUbuntuLevel(newScore);

  if (newLevel.level !== oldLevel.level) {
    return {
      leveledUp: true,
      newLevel: newLevel.level,
      newLevelName: newLevel.name,
    };
  }

  return { leveledUp: false };
}

/**
 * Get points for contribution type
 */
export function getPointsForContribution(type: UbuntuContributionType): number {
  return UBUNTU_POINTS[type] || 0;
}
