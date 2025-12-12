/**
 * Nyuchi Platform - Landing Page
 * Community-focused platform for African entrepreneurship
 * "I am because we are" - Ubuntu Philosophy
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/lib/auth-context';
import { nyuchiColors, borderRadius } from '@/theme/nyuchi-theme';

const platformColors = nyuchiColors.platform;

interface CommunityStats {
  total_members: number;
  total_businesses: number;
  total_articles: number;
  top_ubuntu_score: number;
  total_travel_businesses?: number;
}

// Actual platform features based on codebase
const coreFeatures = [
  {
    icon: '🏢',
    title: 'Business Directory',
    description: 'List your business and connect with the African entrepreneurial community. Create verified profiles, track engagement, and grow your network.',
    features: ['Free Forever', 'Verification Badges', 'Engagement Metrics'],
    href: '/community/directory',
  },
  {
    icon: '✈️',
    title: 'Travel Directory',
    description: 'Discover authentic African travel experiences. Connect with verified safari guides, cultural specialists, tour operators, and accommodation providers.',
    features: ['Local Experts', 'Verified Guides', 'Authentic Experiences'],
    href: '/community/travel-directory',
  },
  {
    icon: '📝',
    title: 'Community Content',
    description: 'Share knowledge through articles, guides, and success stories. Get AI-powered suggestions to improve your content before publication.',
    features: ['AI Assistance', 'Editorial Review', 'Earn Ubuntu Points'],
    href: '/community/content',
  },
  {
    icon: '🏆',
    title: 'Ubuntu Leaderboard',
    description: 'Celebrate community contributors who embody the Ubuntu spirit. Rise through 4 levels from Newcomer to Ubuntu Champion as you contribute.',
    features: ['4 Achievement Levels', '7 Contribution Types', 'Community Recognition'],
    href: '/community/leaderboard',
  },
];

// Ubuntu scoring system - actual values from packages/ubuntu/src/scoring.ts
const ubuntuLevels = [
  { name: 'Newcomer', points: '0-499', color: nyuchiColors.gold, emoji: '🌱' },
  { name: 'Contributor', points: '500-1,999', color: nyuchiColors.green, emoji: '🌿' },
  { name: 'Community Leader', points: '2,000-4,999', color: '#EF3340', emoji: '🌳' },
  { name: 'Ubuntu Champion', points: '5,000+', color: '#2B2B2B', emoji: '🏆' },
];

// Actual get involved programs from /get-involved pages
const getInvolvedOptions = [
  {
    icon: '🤝',
    title: 'Business Partner',
    description: 'List your tourism or business venture. Get perpetual free listing with targeted audience reach.',
    badge: 'Free Forever',
    href: '/get-involved/business-partner',
  },
  {
    icon: '🧭',
    title: 'Local Expert',
    description: 'Join as a verified safari guide, cultural specialist, adventure guide, or photography expert.',
    badge: 'Get Verified',
    href: '/get-involved/local-expert',
  },
  {
    icon: '🎓',
    title: 'Student Program',
    description: 'University students can contribute travel content and build their portfolio with published work.',
    badge: 'Mentorship',
    href: '/get-involved/student-program',
  },
  {
    icon: '💚',
    title: 'Volunteer',
    description: 'Contribute your skills to sustainable tourism and community development initiatives.',
    badge: 'Make Impact',
    href: '/get-involved/volunteer',
  },
];

// Contribution types that earn Ubuntu points
const contributionTypes = [
  { action: 'Publish Content', points: 100, icon: '📝' },
  { action: 'Create Listing', points: 50, icon: '🏢' },
  { action: 'Get Verified', points: 75, icon: '✓' },
  { action: 'Complete Review', points: 50, icon: '📋' },
  { action: 'Collaborate', points: 150, icon: '🤝' },
  { action: 'Share Knowledge', points: 75, icon: '💡' },
  { action: 'Help Community', points: 25, icon: '👥' },
];

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const width = useWindowWidth();
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const isDesktop = width >= 768;
  const isMobile = width < 768;

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/community/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch community stats:', error);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusBarContent}>
          <View style={styles.statusLeft}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Community Open</Text>
            </View>
            <Text style={styles.statusDivider}>|</Text>
            <Text style={styles.versionText}>Ubuntu Philosophy</Text>
          </View>
          {!isMobile && (
            <View style={styles.statusRight}>
              <Pressable onPress={() => router.push('/community')}>
                <Text style={styles.statusLink}>Explore Community</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/get-involved')}>
                <Text style={[styles.statusLink, { color: nyuchiColors.sunsetDeep }]}>Get Involved</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Glass Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable style={styles.logoContainer} onPress={() => router.push('/')}>
            <View style={[styles.logoIcon, { backgroundColor: nyuchiColors.sunsetDeep }]}>
              <Text style={styles.logoIconText}>N</Text>
            </View>
            <Text style={styles.logoText}>
              Nyuchi<Text style={styles.logoTextDim}> Platform</Text>
            </Text>
          </Pressable>

          {!isMobile && (
            <View style={styles.navLinks}>
              <Pressable onPress={() => router.push('/community')}>
                <Text style={styles.navLink}>Community</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/community/directory')}>
                <Text style={styles.navLink}>Directory</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/get-involved')}>
                <Text style={styles.navLink}>Get Involved</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.headerButtons}>
            {!isMobile && (
              <Pressable onPress={() => router.push('/sign-in')}>
                <Text style={styles.navLink}>Sign In</Text>
              </Pressable>
            )}
            <Button
              mode="contained"
              style={[styles.ctaButton, { backgroundColor: nyuchiColors.sunsetDeep }]}
              labelStyle={[styles.ctaButtonLabel, { color: '#FFFFFF' }]}
              contentStyle={styles.ctaButtonContent}
              onPress={() => router.push('/sign-up')}
            >
              Join Free
            </Button>
          </View>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Background Glow Effects */}
        <View style={styles.glowEffect1} />
        <View style={styles.glowEffect2} />

        <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
          {/* Text Content */}
          <View style={[styles.heroText, isDesktop && { flex: 1 }]}>
            <View style={styles.apiBadge}>
              <Text style={styles.apiBadgeIcon}>🌍</Text>
              <Text style={styles.apiBadgeText}>African Entrepreneurship</Text>
            </View>

            <Text style={styles.heroTitle}>
              Grow Together.{'\n'}
              <Text style={styles.heroTitleAccent}>Succeed Together.</Text>
            </Text>

            <Text style={styles.heroDescription}>
              The community platform for African entrepreneurs, businesses, and travel experiences.
              Connect, collaborate, and thrive with free tools built on Ubuntu philosophy.
            </Text>

            <Text style={[styles.ubuntuQuote, { color: nyuchiColors.sunsetDeep }]}>
              "I am because we are"
            </Text>

            <View style={styles.heroButtons}>
              <Button
                mode="contained"
                style={[styles.primaryButton, { backgroundColor: nyuchiColors.sunsetDeep }]}
                labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
                contentStyle={styles.buttonContent}
                onPress={() => router.push('/community')}
              >
                Explore Community
              </Button>
              <Button
                mode="outlined"
                style={[styles.outlineButton, { borderColor: platformColors.border }]}
                labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
                contentStyle={styles.buttonContent}
                onPress={() => router.push('/sign-up')}
              >
                Join for Free
              </Button>
            </View>
          </View>

          {/* Stats Panel */}
          {isDesktop && (
            <View style={styles.statsPanel}>
              <View style={styles.statsPanelHeader}>
                <Text style={styles.statsPanelTitle}>Community at a Glance</Text>
              </View>
              <View style={styles.statsPanelContent}>
                <View style={styles.statsPanelRow}>
                  <Text style={styles.statsPanelEmoji}>👥</Text>
                  <View style={styles.statsPanelInfo}>
                    {statsLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.statsPanelValue}>
                        {(stats?.total_members || 0).toLocaleString()}
                      </Text>
                    )}
                    <Text style={styles.statsPanelLabel}>Community Members</Text>
                  </View>
                </View>
                <View style={styles.statsPanelRow}>
                  <Text style={styles.statsPanelEmoji}>🏢</Text>
                  <View style={styles.statsPanelInfo}>
                    {statsLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.statsPanelValue}>
                        {(stats?.total_businesses || 0).toLocaleString()}
                      </Text>
                    )}
                    <Text style={styles.statsPanelLabel}>Listed Businesses</Text>
                  </View>
                </View>
                <View style={styles.statsPanelRow}>
                  <Text style={styles.statsPanelEmoji}>✈️</Text>
                  <View style={styles.statsPanelInfo}>
                    {statsLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.statsPanelValue}>
                        {(stats?.total_travel_businesses || 0).toLocaleString()}
                      </Text>
                    )}
                    <Text style={styles.statsPanelLabel}>Travel Partners</Text>
                  </View>
                </View>
                <View style={styles.statsPanelRow}>
                  <Text style={styles.statsPanelEmoji}>📝</Text>
                  <View style={styles.statsPanelInfo}>
                    {statsLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.statsPanelValue}>
                        {(stats?.total_articles || 0).toLocaleString()}
                      </Text>
                    )}
                    <Text style={styles.statsPanelLabel}>Community Articles</Text>
                  </View>
                </View>
              </View>
              {/* Ubuntu Badge */}
              <View style={styles.ubuntuBadge}>
                <Text style={styles.ubuntuBadgeText}>💚 Free Forever</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Core Features */}
      <View style={styles.servicesSection}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>WHAT WE OFFER</Text>
            <Text style={styles.sectionTitle}>Community Features</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need to connect with the African business community. Always free, because we believe in Ubuntu.
            </Text>
          </View>

          <View style={[styles.servicesGrid, isDesktop && styles.servicesGridDesktop]}>
            {coreFeatures.map((feature) => (
              <Pressable
                key={feature.title}
                onPress={() => router.push(feature.href)}
                style={{ flex: isDesktop ? 1 : undefined }}
              >
                {({ pressed }) => (
                  <Card
                    style={[styles.serviceCard, { opacity: pressed ? 0.9 : 1 }]}
                    mode="outlined"
                  >
                    <Card.Content style={styles.serviceCardContent}>
                      <View style={styles.serviceIconContainer}>
                        <Text style={styles.serviceIcon}>{feature.icon}</Text>
                      </View>
                      <Text style={styles.serviceTitle}>{feature.title}</Text>
                      <Text style={styles.serviceDescription}>{feature.description}</Text>
                      <View style={styles.serviceFeatures}>
                        {feature.features.map((feat) => (
                          <View key={feat} style={styles.serviceFeatureRow}>
                            <Text style={styles.serviceFeatureCheck}>✓</Text>
                            <Text style={styles.serviceFeatureText}>{feat}</Text>
                          </View>
                        ))}
                      </View>
                    </Card.Content>
                  </Card>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Ubuntu Scoring Section */}
      <View style={styles.ubuntuScoreSection}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>UBUNTU PHILOSOPHY</Text>
            <Text style={styles.sectionTitle}>Earn Recognition for Your Contributions</Text>
            <Text style={styles.sectionSubtitle}>
              Every action strengthens the community. Earn Ubuntu points and rise through levels as you contribute.
            </Text>
          </View>

          <View style={[styles.ubuntuContentGrid, isDesktop && styles.ubuntuContentGridDesktop]}>
            {/* Ubuntu Levels */}
            <View style={styles.ubuntuLevelsCard}>
              <Text style={styles.ubuntuCardTitle}>Achievement Levels</Text>
              {ubuntuLevels.map((level, index) => (
                <View key={level.name} style={styles.levelRow}>
                  <Text style={styles.levelEmoji}>{level.emoji}</Text>
                  <View style={styles.levelInfo}>
                    <Text style={[styles.levelName, { color: level.color }]}>{level.name}</Text>
                    <Text style={styles.levelPoints}>{level.points} points</Text>
                  </View>
                  {index < ubuntuLevels.length - 1 && <View style={styles.levelArrow}><Text style={styles.levelArrowText}>↓</Text></View>}
                </View>
              ))}
            </View>

            {/* Contribution Types */}
            <View style={styles.contributionsCard}>
              <Text style={styles.ubuntuCardTitle}>Ways to Earn Points</Text>
              <View style={styles.contributionsGrid}>
                {contributionTypes.map((contrib) => (
                  <View key={contrib.action} style={styles.contributionItem}>
                    <Text style={styles.contributionIcon}>{contrib.icon}</Text>
                    <Text style={styles.contributionAction}>{contrib.action}</Text>
                    <Text style={[styles.contributionPoints, { color: nyuchiColors.sunsetDeep }]}>
                      +{contrib.points}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Get Involved Section */}
      <View style={styles.getInvolvedSection}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>GET INVOLVED</Text>
            <Text style={styles.sectionTitle}>Join Our Growing Community</Text>
            <Text style={styles.sectionSubtitle}>
              Multiple ways to contribute and benefit from the Nyuchi ecosystem.
            </Text>
          </View>

          <View style={[styles.involvedGrid, isDesktop && styles.involvedGridDesktop]}>
            {getInvolvedOptions.map((option) => (
              <Pressable
                key={option.title}
                onPress={() => router.push(option.href)}
                style={[styles.involvedCard, isDesktop && { flex: 1 }]}
              >
                {({ pressed }) => (
                  <View style={[styles.involvedCardInner, { opacity: pressed ? 0.9 : 1 }]}>
                    <Text style={styles.involvedIcon}>{option.icon}</Text>
                    <Text style={styles.involvedTitle}>{option.title}</Text>
                    <Text style={styles.involvedDescription}>{option.description}</Text>
                    <View style={[styles.involvedBadge, { backgroundColor: `${nyuchiColors.sunsetDeep}20` }]}>
                      <Text style={[styles.involvedBadgeText, { color: nyuchiColors.sunsetDeep }]}>
                        {option.badge}
                      </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Ubuntu Philosophy Section */}
      <View style={styles.ubuntuSection}>
        <View style={styles.sectionContainer}>
          <View style={styles.ubuntuContent}>
            <Text style={styles.ubuntuSectionTitle}>The Ubuntu Philosophy</Text>
            <Text style={styles.ubuntuSectionQuote}>
              "Ubuntu does not mean that people should not enrich themselves.
              The question therefore is: Are you going to do so in order to enable
              the community around you to be able to improve?"
            </Text>
            <Text style={styles.ubuntuAuthor}>— Nelson Mandela</Text>
            <Text style={styles.ubuntuExplanation}>
              At Nyuchi, we believe that individual success and community growth go hand in hand.
              Every business listing, every connection made, and every piece of content shared
              strengthens the entire African entrepreneurial ecosystem.
            </Text>
          </View>
        </View>
      </View>

      {/* Ecosystem Section */}
      <View style={styles.ecosystemSection}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionLabel}>NYUCHI ECOSYSTEM</Text>
            <Text style={styles.sectionTitle}>Part of Something Bigger</Text>
            <Text style={[styles.sectionSubtitle, { textAlign: 'center', maxWidth: 600, marginHorizontal: 'auto' }]}>
              Nyuchi Platform is part of the Nyuchi Africa ecosystem, providing community tools that connect to our broader mission of empowering African entrepreneurship.
            </Text>
          </View>

          <View style={[styles.ecosystemGrid, isDesktop && styles.ecosystemGridDesktop]}>
            <View style={styles.ecosystemCard}>
              <Text style={styles.ecosystemIcon}>🏠</Text>
              <Text style={styles.ecosystemName}>Platform</Text>
              <Text style={styles.ecosystemDesc}>Community hub for businesses and travel</Text>
            </View>
            <View style={styles.ecosystemCard}>
              <Text style={styles.ecosystemIcon}>🌐</Text>
              <Text style={styles.ecosystemName}>Main Site</Text>
              <Text style={styles.ecosystemDesc}>Learn about Nyuchi Africa's mission</Text>
            </View>
            <View style={styles.ecosystemCard}>
              <Text style={styles.ecosystemIcon}>🎨</Text>
              <Text style={styles.ecosystemName}>Brand Hub</Text>
              <Text style={styles.ecosystemDesc}>Design system and brand assets</Text>
            </View>
            <View style={styles.ecosystemCard}>
              <Text style={styles.ecosystemIcon}>🤖</Text>
              <Text style={styles.ecosystemName}>AI Assistant</Text>
              <Text style={styles.ecosystemDesc}>Claude AI helps improve your content</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaSectionTitle}>Ready to join the community?</Text>
        <Text style={styles.ctaSectionDescription}>
          Connect with African entrepreneurs, list your business, and grow together.
          Free forever, because we believe in Ubuntu.
        </Text>
        <View style={styles.ctaSectionButtons}>
          <Button
            mode="contained"
            style={[styles.primaryButton, { backgroundColor: nyuchiColors.sunsetDeep }]}
            labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
            contentStyle={styles.buttonContent}
            onPress={() => router.push('/sign-up')}
          >
            Create Free Account
          </Button>
          <Button
            mode="outlined"
            style={[styles.outlineButton, { borderColor: platformColors.border }]}
            labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
            contentStyle={styles.buttonContent}
            onPress={() => router.push('/community/directory')}
          >
            Browse Directory
          </Button>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerBrand}>
            <View style={styles.footerLogoRow}>
              <View style={[styles.logoIcon, { width: 24, height: 24, backgroundColor: nyuchiColors.sunsetDeep }]}>
                <Text style={[styles.logoIconText, { fontSize: 12 }]}>N</Text>
              </View>
              <Text style={styles.footerLogoText}>Nyuchi Platform</Text>
            </View>
            <Text style={styles.footerLocation}>Part of the Nyuchi Africa Ecosystem.{'\n'}Harare, Zimbabwe.</Text>
            <Text style={[styles.footerTagline, { color: nyuchiColors.sunsetDeep }]}>
              "I am because we are"
            </Text>
          </View>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => router.push('/community')}>
              <Text style={styles.footerLink}>Community</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/community/directory')}>
              <Text style={styles.footerLink}>Business Directory</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/community/travel-directory')}>
              <Text style={styles.footerLink}>Travel Directory</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/community/leaderboard')}>
              <Text style={styles.footerLink}>Ubuntu Leaderboard</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/get-involved')}>
              <Text style={styles.footerLink}>Get Involved</Text>
            </Pressable>
          </View>
          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} Nyuchi Africa. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: platformColors.navy,
  },

  // Status Bar
  statusBar: {
    backgroundColor: '#020617',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statusBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: nyuchiColors.green,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 11,
    color: nyuchiColors.green,
    fontWeight: '500',
  },
  statusDivider: {
    color: '#475569',
    fontSize: 11,
  },
  versionText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 11,
    color: '#64748b',
  },
  statusRight: {
    flexDirection: 'row',
    gap: 16,
  },
  statusLink: {
    fontSize: 12,
    color: '#64748b',
  },

  // Header
  header: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoText: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoTextDim: {
    fontWeight: '400',
    color: '#64748b',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 32,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctaButton: {
    borderRadius: borderRadius.button,
  },
  ctaButtonLabel: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontWeight: '700',
    fontSize: 14,
  },
  ctaButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  // Hero
  heroSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect1: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: 384,
    height: 384,
    backgroundColor: 'rgba(212, 99, 74, 0.1)',
    borderRadius: 192,
  },
  glowEffect2: {
    position: 'absolute',
    bottom: 0,
    right: '25%',
    width: 256,
    height: 256,
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: 128,
  },
  heroContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    zIndex: 10,
  },
  heroContentDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 64,
  },
  heroText: {
    marginBottom: 48,
  },
  apiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(212, 99, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 99, 74, 0.3)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  apiBadgeIcon: {
    fontSize: 14,
  },
  apiBadgeText: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 12,
    color: nyuchiColors.sunsetDeep,
    fontWeight: '600',
  },
  heroTitle: {
    fontFamily: 'Noto Serif, serif',
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 56,
    marginBottom: 24,
  },
  heroTitleAccent: {
    color: nyuchiColors.sunsetDeep,
  },
  heroDescription: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 18,
    color: '#94a3b8',
    lineHeight: 28,
    marginBottom: 16,
    maxWidth: 560,
  },
  ubuntuQuote: {
    fontFamily: 'Noto Serif, serif',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  primaryButton: {
    borderRadius: borderRadius.button,
  },
  outlineButton: {
    borderRadius: borderRadius.button,
    borderWidth: 1,
  },
  buttonLabel: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },

  // Stats Panel
  statsPanel: {
    flex: 1,
    backgroundColor: platformColors.surface,
    borderWidth: 1,
    borderColor: platformColors.border,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  statsPanelHeader: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: platformColors.border,
  },
  statsPanelTitle: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsPanelContent: {
    padding: 20,
    gap: 20,
  },
  statsPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsPanelEmoji: {
    fontSize: 24,
  },
  statsPanelInfo: {
    flex: 1,
  },
  statsPanelValue: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsPanelLabel: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 12,
    color: '#64748b',
  },
  ubuntuBadge: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    backgroundColor: nyuchiColors.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    transform: [{ rotate: '-3deg' }],
  },
  ubuntuBadgeText: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Services Section
  servicesSection: {
    paddingVertical: 96,
    paddingHorizontal: 24,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionContainer: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  sectionHeader: {
    marginBottom: 64,
  },
  sectionHeaderCentered: {
    marginBottom: 64,
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: nyuchiColors.sunsetDeep,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Noto Serif, serif',
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    color: '#94a3b8',
    maxWidth: 560,
  },
  servicesGrid: {
    gap: 24,
  },
  servicesGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceCard: {
    flex: 1,
    minWidth: 280,
    backgroundColor: platformColors.surface,
    borderColor: platformColors.border,
    borderRadius: 12,
    marginBottom: 24,
  },
  serviceCardContent: {
    padding: 32,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: platformColors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceTitle: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  serviceDescription: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    marginBottom: 24,
  },
  serviceFeatures: {
    gap: 8,
  },
  serviceFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceFeatureCheck: {
    fontSize: 12,
    color: nyuchiColors.green,
    marginRight: 8,
  },
  serviceFeatureText: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 13,
    color: '#64748b',
  },

  // Ubuntu Score Section
  ubuntuScoreSection: {
    paddingVertical: 96,
    paddingHorizontal: 24,
    backgroundColor: platformColors.navy,
  },
  ubuntuContentGrid: {
    gap: 24,
  },
  ubuntuContentGridDesktop: {
    flexDirection: 'row',
  },
  ubuntuLevelsCard: {
    flex: 1,
    backgroundColor: platformColors.surface,
    borderWidth: 1,
    borderColor: platformColors.border,
    borderRadius: 12,
    padding: 24,
  },
  ubuntuCardTitle: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    position: 'relative',
  },
  levelEmoji: {
    fontSize: 24,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    fontWeight: '700',
  },
  levelPoints: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 12,
    color: '#64748b',
  },
  levelArrow: {
    position: 'absolute',
    left: 10,
    bottom: -16,
  },
  levelArrowText: {
    color: '#475569',
    fontSize: 12,
  },
  contributionsCard: {
    flex: 2,
    backgroundColor: platformColors.surface,
    borderWidth: 1,
    borderColor: platformColors.border,
    borderRadius: 12,
    padding: 24,
  },
  contributionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contributionItem: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: platformColors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
  },
  contributionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contributionAction: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
  },
  contributionPoints: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    fontWeight: '700',
  },

  // Get Involved Section
  getInvolvedSection: {
    paddingVertical: 96,
    paddingHorizontal: 24,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  involvedGrid: {
    gap: 16,
  },
  involvedGridDesktop: {
    flexDirection: 'row',
  },
  involvedCard: {
    flex: 1,
  },
  involvedCardInner: {
    backgroundColor: platformColors.surface,
    borderWidth: 1,
    borderColor: platformColors.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  involvedIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  involvedTitle: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  involvedDescription: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  involvedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  involvedBadgeText: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 11,
    fontWeight: '600',
  },

  // Ubuntu Philosophy Section
  ubuntuSection: {
    paddingVertical: 96,
    paddingHorizontal: 24,
    backgroundColor: platformColors.navy,
  },
  ubuntuContent: {
    maxWidth: 700,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  ubuntuSectionTitle: {
    fontFamily: 'Noto Serif, serif',
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  ubuntuSectionQuote: {
    fontFamily: 'Noto Serif, serif',
    fontSize: 18,
    fontStyle: 'italic',
    color: '#94a3b8',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 16,
  },
  ubuntuAuthor: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 14,
    color: nyuchiColors.sunsetDeep,
    marginBottom: 32,
  },
  ubuntuExplanation: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 15,
    color: '#64748b',
    lineHeight: 24,
    textAlign: 'center',
  },

  // Ecosystem Section
  ecosystemSection: {
    paddingVertical: 96,
    paddingHorizontal: 24,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ecosystemGrid: {
    gap: 16,
  },
  ecosystemGridDesktop: {
    flexDirection: 'row',
  },
  ecosystemCard: {
    flex: 1,
    backgroundColor: platformColors.surface,
    borderWidth: 1,
    borderColor: platformColors.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  ecosystemIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  ecosystemName: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  ecosystemDesc: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },

  // CTA Section
  ctaSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ctaSectionTitle: {
    fontFamily: 'Noto Serif, serif',
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaSectionDescription: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
    textAlign: 'center',
    maxWidth: 480,
  },
  ctaSectionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },

  // Footer
  footer: {
    backgroundColor: '#020617',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderColor: '#0f172a',
  },
  footerContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  footerBrand: {
    marginBottom: 24,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  footerLogoText: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerLocation: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  footerTagline: {
    fontFamily: 'Noto Serif, serif',
    fontSize: 14,
    fontStyle: 'italic',
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderColor: '#1e293b',
  },
  footerLink: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 13,
    color: '#64748b',
  },
  footerCopyright: {
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: 12,
    color: '#475569',
  },
});
