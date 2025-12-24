/**
 * 🇿🇼 Ubuntu Philosophy Messages
 * "I am because we are"
 *
 * IMPORTANT: "Ubuntu" is the PHILOSOPHY, not the brand.
 * Brand is always "Nyuchi" or "Nyuchi Africa"
 */

import { UbuntuMessage } from './types';

/**
 * Core Ubuntu philosophy principle
 */
export const UBUNTU_PRINCIPLE = "I am because we are";

/**
 * Ubuntu messages for different contexts
 */
export const ubuntuMessages: Record<string, UbuntuMessage> = {
  // Welcome messages
  welcome: {
    type: 'welcome',
    message: 'Welcome to the Nyuchi community',
    philosophy: 'Ubuntu: I am because we are',
  },

  welcomeBack: {
    type: 'welcome',
    message: 'Welcome back! Our community grows stronger with your return',
    philosophy: 'Ubuntu: Your presence enriches us all',
  },

  // Contribution messages
  contentPublished: {
    type: 'contribution',
    message: 'Your contribution strengthens our entire community',
    philosophy: 'Ubuntu: Every voice matters',
  },

  listingCreated: {
    type: 'contribution',
    message: 'Thank you for adding to our collective knowledge',
    philosophy: 'Ubuntu: We grow together',
  },

  communityHelp: {
    type: 'contribution',
    message: 'Your help creates ripples of positive change',
    philosophy: 'Ubuntu: Together we rise',
  },

  // Success messages
  achievementUnlocked: {
    type: 'success',
    message: 'Your success is our collective celebration',
    philosophy: 'Ubuntu: We celebrate together',
  },

  levelUp: {
    type: 'success',
    message: 'Your growth inspires us all to reach higher',
    philosophy: 'Ubuntu: Individual success strengthens the whole',
  },

  // Collaboration messages
  collaboration: {
    type: 'collaboration',
    message: 'Together we achieve what alone would be impossible',
    philosophy: 'Ubuntu: Collective strength overcomes all challenges',
  },

  teamwork: {
    type: 'collaboration',
    message: 'Our diversity is our strength, our unity is our power',
    philosophy: 'Ubuntu: Many hands make light work',
  },

  // Loading states
  loading: {
    type: 'loading',
    message: 'Gathering community wisdom...',
    philosophy: 'Ubuntu: Patience brings understanding',
  },

  processing: {
    type: 'loading',
    message: 'Working together to bring you results...',
    philosophy: 'Ubuntu: Good things take time',
  },

  // Error states
  error: {
    type: 'error',
    message: 'Even in challenges, we face them together',
    philosophy: 'Ubuntu: Community support overcomes obstacles',
  },

  notFound: {
    type: 'error',
    message: 'Let us help you find what you seek',
    philosophy: 'Ubuntu: Ask and the community will guide you',
  },

  // Action prompts
  shareKnowledge: {
    type: 'contribution',
    message: 'Share your knowledge and watch our community flourish',
    philosophy: 'Ubuntu: Teaching one teaches many',
  },

  helpOthers: {
    type: 'collaboration',
    message: 'Your experience can light the path for others',
    philosophy: 'Ubuntu: We learn from each other',
  },

  // Verification
  verificationPending: {
    type: 'loading',
    message: 'Our community is reviewing your submission',
    philosophy: 'Ubuntu: Quality matters because we all benefit',
  },

  verificationApproved: {
    type: 'success',
    message: 'Welcome to the verified community',
    philosophy: 'Ubuntu: Trust is earned together',
  },
};

/**
 * Get Ubuntu message for a specific context
 */
export function getUbuntuMessage(context: keyof typeof ubuntuMessages): UbuntuMessage {
  return ubuntuMessages[context] || ubuntuMessages.welcome;
}

/**
 * Get random Ubuntu message for motivation
 */
export function getRandomUbuntuMessage(): UbuntuMessage {
  const messages = Object.values(ubuntuMessages).filter(
    (msg) => msg.type === 'contribution' || msg.type === 'collaboration'
  );
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Format Ubuntu message for display
 */
export function formatUbuntuMessage(message: UbuntuMessage): string {
  return `${message.message}\n\n${message.philosophy || UBUNTU_PRINCIPLE}`;
}

/**
 * Get Ubuntu principle with context
 */
export function getUbuntuPrinciple(context?: string): string {
  if (!context) {
    return UBUNTU_PRINCIPLE;
  }
  return `Ubuntu: ${context} - ${UBUNTU_PRINCIPLE}`;
}
