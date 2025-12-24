/**
 * 🇿🇼 Ubuntu Scoring System
 * Calculate and manage Ubuntu points and levels
 */

import {
  UbuntuScore,
  UbuntuContribution,
  UbuntuLevel,
  ContributionType,
  UBUNTU_POINTS,
  UBUNTU_LEVELS,
} from './types';

/**
 * Calculate Ubuntu level based on total points
 */
export function calculateUbuntuLevel(points: number): UbuntuLevel {
  if (points >= 10000) return 'Ubuntu Champion';
  if (points >= 5000) return 'Community Leader';
  if (points >= 1000) return 'Contributor';
  return 'Newcomer';
}

/**
 * Get next level and points needed
 */
export function getNextLevel(currentPoints: number): {
  nextLevel: UbuntuLevel | null;
  pointsNeeded: number;
} {
  const currentLevel = calculateUbuntuLevel(currentPoints);

  switch (currentLevel) {
    case 'Newcomer':
      return { nextLevel: 'Contributor', pointsNeeded: 1000 - currentPoints };
    case 'Contributor':
      return { nextLevel: 'Community Leader', pointsNeeded: 5000 - currentPoints };
    case 'Community Leader':
      return { nextLevel: 'Ubuntu Champion', pointsNeeded: 10000 - currentPoints };
    case 'Ubuntu Champion':
      return { nextLevel: null, pointsNeeded: 0 };
    default:
      return { nextLevel: 'Contributor', pointsNeeded: 1000 };
  }
}

/**
 * Calculate total Ubuntu score from contributions
 */
export function calculateUbuntuScore(
  userId: string,
  contributions: UbuntuContribution[]
): UbuntuScore {
  // Calculate total points
  const totalPoints = contributions.reduce((sum, c) => sum + c.points, 0);

  // Count contributions by type
  const contributionCounts = {
    contentPublished: contributions.filter((c) => c.type === 'content_published').length,
    listingsCreated: contributions.filter((c) => c.type === 'listing_created').length,
    listingsVerified: contributions.filter((c) => c.type === 'listing_verified').length,
    communityHelp: contributions.filter((c) => c.type === 'community_help').length,
    reviewsCompleted: contributions.filter((c) => c.type === 'review_completed').length,
    collaborations: contributions.filter((c) => c.type === 'collaboration').length,
    knowledgeSharing: contributions.filter((c) => c.type === 'knowledge_sharing').length,
  };

  // Calculate level
  const level = calculateUbuntuLevel(totalPoints);
  const { nextLevel, pointsNeeded } = getNextLevel(totalPoints);

  // Get timestamps
  const sortedContributions = [...contributions].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );
  const createdAt = sortedContributions[0]?.createdAt || new Date();
  const updatedAt = sortedContributions[sortedContributions.length - 1]?.createdAt || new Date();

  return {
    userId,
    points: totalPoints,
    level,
    nextLevel,
    pointsToNextLevel: pointsNeeded,
    contributions: contributionCounts,
    createdAt,
    updatedAt,
  };
}

/**
 * Award points for a contribution
 */
export function awardPoints(type: ContributionType): number {
  return UBUNTU_POINTS[type] || 0;
}

/**
 * Check if user leveled up
 */
export function checkLevelUp(previousPoints: number, newPoints: number): {
  leveledUp: boolean;
  newLevel?: UbuntuLevel;
  previousLevel?: UbuntuLevel;
} {
  const previousLevel = calculateUbuntuLevel(previousPoints);
  const newLevel = calculateUbuntuLevel(newPoints);

  if (previousLevel !== newLevel) {
    return {
      leveledUp: true,
      newLevel,
      previousLevel,
    };
  }

  return { leveledUp: false };
}

/**
 * Get level description
 */
export function getLevelDescription(level: UbuntuLevel): string {
  const descriptions: Record<UbuntuLevel, string> = {
    Newcomer: 'Welcome to the community! Every journey begins with a single step.',
    Contributor: 'Your contributions are making a difference. Keep sharing!',
    'Community Leader': 'You inspire others through your dedication and support.',
    'Ubuntu Champion': 'You embody Ubuntu philosophy - a true community pillar.',
  };

  return descriptions[level];
}

/**
 * Get level badge color (Zimbabwe flag colors)
 */
export function getLevelColor(level: UbuntuLevel): string {
  const colors: Record<UbuntuLevel, string> = {
    Newcomer: '#FDD116', // Zimbabwe Yellow
    Contributor: '#00A651', // Zimbabwe Green
    'Community Leader': '#EF3340', // Zimbabwe Red
    'Ubuntu Champion': '#000000', // Zimbabwe Black
  };

  return colors[level];
}

/**
 * Calculate contribution streak (days)
 */
export function calculateStreak(contributions: UbuntuContribution[]): number {
  if (contributions.length === 0) return 0;

  const sortedDates = contributions
    .map((c) => c.createdAt)
    .sort((a, b) => b.getTime() - a.getTime())
    .map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());

  let streak = 1;
  let currentDate = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const dayDiff = (currentDate - sortedDates[i]) / (1000 * 60 * 60 * 24);

    if (dayDiff === 1) {
      streak++;
      currentDate = sortedDates[i];
    } else if (dayDiff > 1) {
      break;
    }
  }

  return streak;
}

/**
 * Get contribution velocity (points per week)
 */
export function getContributionVelocity(contributions: UbuntuContribution[]): number {
  if (contributions.length === 0) return 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentContributions = contributions.filter((c) => c.createdAt >= thirtyDaysAgo);

  const totalPoints = recentContributions.reduce((sum, c) => sum + c.points, 0);

  // Convert to points per week
  return Math.round((totalPoints / 30) * 7);
}
