/**
 * Nyuchi Community Hub - Brand V5
 * "I am because we are" - Public community page (no auth required)
 * Built with React Native Paper
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useThemeMode } from '@/components/PaperProvider';
import { GlobalLayout } from '@/components/GlobalLayout';
import { nyuchiColors, borderRadius } from '@/theme/nyuchi-theme';

interface CommunityStats {
  total_members: number;
  total_businesses: number;
  total_articles: number;
  top_ubuntu_score: number;
  total_travel_businesses?: number;
}

const communityFeatures = [
  {
    emoji: '👥',
    title: 'Business Directory',
    description: 'Discover African businesses and entrepreneurs building the future.',
    href: '/community/directory',
    statKey: 'total_businesses' as const,
    statLabel: 'Businesses',
  },
  {
    emoji: '✈️',
    title: 'Travel Directory',
    description: 'Explore verified African travel businesses and destinations.',
    href: '/community/travel-directory',
    statKey: 'total_travel_businesses' as const,
    statLabel: 'Travel Partners',
  },
  {
    emoji: '🏆',
    title: 'Ubuntu Leaderboard',
    description: 'Celebrate community contributors who embody the Ubuntu spirit.',
    href: '/community/leaderboard',
    statKey: 'top_ubuntu_score' as const,
    statLabel: 'Top Score',
  },
  {
    emoji: '📝',
    title: 'Community Content',
    description: 'Read articles, guides, and success stories from the community.',
    href: '/community/content',
    statKey: 'total_articles' as const,
    statLabel: 'Articles',
  },
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

export default function CommunityPage() {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const width = useWindowWidth();
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isDesktop = width >= 768;
  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;

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
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <GlobalLayout>
      {/* Hero Section */}
      <View style={[styles.heroSection, { backgroundColor: nyuchiColors.sunsetDeep }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Nyuchi Community</Text>
          <Text style={styles.heroSubtitle}>&quot;I am because we are&quot; - Ubuntu Philosophy</Text>
          <Text style={styles.heroDescription}>
            Welcome to the Nyuchi Africa community. Here, we celebrate African entrepreneurship,
            share knowledge, and support each other in building a stronger future together.
          </Text>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>👥</Text>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.statValue}>{stats?.total_members || 0} Members</Text>
              )}
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📈</Text>
              <Text style={styles.statValue}>Growing Together</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={[styles.featuresSection, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: nyuchiColors.green }]}>
            EXPLORE
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Community Features
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Always free. Because we believe in collective growth.
          </Text>
        </View>

        <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
          {communityFeatures.map((feature) => (
            <Pressable
              key={feature.title}
              onPress={() => router.push(feature.href)}
              style={{ flex: isDesktop ? 1 : undefined }}
            >
              {({ pressed }) => (
                <Card
                  style={[
                    styles.featureCard,
                    { backgroundColor: colors.background, opacity: pressed ? 0.9 : 1 },
                  ]}
                  mode="outlined"
                >
                  <Card.Content style={styles.featureCardContent}>
                    <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                      {feature.description}
                    </Text>
                    {loading ? (
                      <ActivityIndicator size="small" color={nyuchiColors.sunsetDeep} style={{ marginVertical: 8 }} />
                    ) : (
                      <Text style={[styles.featureStat, { color: nyuchiColors.sunsetDeep }]}>
                        {stats?.[feature.statKey]?.toLocaleString() || '0'}
                      </Text>
                    )}
                    <Text style={[styles.featureStatLabel, { color: colors.textSecondary }]}>
                      {feature.statLabel}
                    </Text>
                  </Card.Content>
                </Card>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Ubuntu Philosophy Section */}
      <View style={[styles.ubuntuSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.ubuntuTitle, { color: colors.text }]}>
          The Ubuntu Philosophy
        </Text>
        <Text style={[styles.ubuntuDescription, { color: colors.textSecondary }]}>
          Ubuntu is an ancient African philosophy that emphasizes our interconnectedness.
          &quot;I am because we are&quot; reminds us that our success is tied to the success
          of our community. At Nyuchi, we believe that by supporting each other, we can
          build a stronger, more prosperous Africa.
        </Text>
        <Button
          mode="outlined"
          style={[styles.buttonOutline, { borderColor: colors.border }]}
          labelStyle={[styles.buttonLabel, { color: colors.text }]}
          contentStyle={styles.buttonContent}
          onPress={() => router.push('/sign-up')}
        >
          Join the Community
        </Button>
      </View>
    </GlobalLayout>
  );
}

const styles = StyleSheet.create({
  // Buttons
  buttonOutline: {
    borderRadius: borderRadius.button,
    borderWidth: 1,
  },
  buttonLabel: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600',
    fontSize: 14,
    marginVertical: 0,
  },
  buttonContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  // Hero
  heroSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  heroContent: {
    maxWidth: 800,
    marginHorizontal: 'auto',
  },
  heroTitle: {
    fontFamily: 'Noto Serif, Georgia, serif',
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  heroDescription: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.85)',
    maxWidth: 600,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Features
  featuresSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    marginBottom: 32,
    maxWidth: 480,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: 'Noto Serif, Georgia, serif',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 15,
    textAlign: 'center',
  },
  featuresGrid: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    gap: 16,
  },
  featuresGridDesktop: {
    flexDirection: 'row',
  },
  featureCard: {
    borderRadius: borderRadius.card,
    marginBottom: 12,
  },
  featureCardContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  featureEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  featureStat: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureStatLabel: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 12,
  },

  // Ubuntu Section
  ubuntuSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ubuntuTitle: {
    fontFamily: 'Noto Serif, Georgia, serif',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  ubuntuDescription: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 700,
    marginBottom: 24,
  },
});
