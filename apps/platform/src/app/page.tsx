/**
 * Nyuchi Platform - Landing Page
 * Built with React Native Paper + Brand V5
 * "I am because we are" - Ubuntu Philosophy
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { View, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { Text, Button, Card, IconButton, Avatar, Divider } from 'react-native-paper';
import { useAuth } from '@/lib/auth-context';
import { useThemeMode } from '@/components/PaperProvider';
import { ZimbabweFlagStrip } from '@/components/ZimbabweFlagStrip';
import { nyuchiColors, borderRadius } from '@/theme/nyuchi-theme';

const menuLinks = [
  { label: 'Home', href: 'https://www.nyuchi.com', external: true },
  { label: 'Community', href: '/community', external: false },
  { label: 'Get Involved', href: '/get-involved', external: false },
  { label: 'Sign In', href: '/sign-in', external: false },
  { label: 'Get Started', href: '/sign-up', external: false, primary: true },
];

const communityFeatures = [
  {
    emoji: '👥',
    title: 'Community Directory',
    description: 'Discover and connect with African entrepreneurs and businesses.',
    href: '/community/directory',
  },
  {
    emoji: '✈️',
    title: 'Travel Directory',
    description: 'Explore travel businesses and destinations across Africa.',
    href: '/community/travel-directory',
  },
  {
    emoji: '🏆',
    title: 'Ubuntu Leaderboard',
    description: 'Celebrate community contributors and their impact.',
    href: '/community/leaderboard',
  },
  {
    emoji: '🤝',
    title: 'Get Involved',
    description: 'Join our community as a volunteer, partner, or contributor.',
    href: '/get-involved',
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

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isDark } = useThemeMode();
  const width = useWindowWidth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDesktop = width >= 768;
  const isMobile = width < 768;

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;
  const logoSrc = isDark
    ? 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_dark.svg'
    : 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_light.svg';

  const userInitials = user?.email ? user.email.charAt(0).toUpperCase() : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isMobile && <ZimbabweFlagStrip />}

      {/* Mobile Menu Modal */}
      <Modal
        visible={menuOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={[styles.menuPanel, { backgroundColor: colors.card }]}>
            <View style={styles.menuHeader}>
              <Image
                src={logoSrc}
                alt="Nyuchi Africa"
                width={140}
                height={36}
                style={{ objectFit: 'contain' }}
              />
              <IconButton
                icon="close"
                size={24}
                iconColor={colors.text}
                onPress={() => setMenuOpen(false)}
              />
            </View>
            <Divider style={{ backgroundColor: colors.border }} />
            <View style={styles.menuLinks}>
              {menuLinks.map((link) => (
                <Pressable
                  key={link.label}
                  onPress={() => {
                    setMenuOpen(false);
                    if (link.external) {
                      window.open(link.href, '_blank');
                    } else {
                      router.push(link.href);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.menuLink,
                    link.primary && { backgroundColor: nyuchiColors.sunsetDeep },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={[
                    styles.menuLinkText,
                    { color: link.primary ? '#FFFFFF' : colors.text }
                  ]}>
                    {link.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Image
              src={logoSrc}
              alt="Nyuchi Africa"
              width={isMobile ? 140 : 180}
              height={isMobile ? 36 : 48}
              style={{ objectFit: 'contain' }}
              priority
            />

            {/* Desktop Navigation */}
            {!isMobile && (
              <View style={styles.headerButtons}>
                <Link href="/sign-in" style={{ textDecoration: 'none' }}>
                  <Button
                    mode="outlined"
                    style={[styles.buttonOutline, { borderColor: colors.border }]}
                    labelStyle={[styles.buttonLabelSmall, { color: colors.text }]}
                    contentStyle={styles.buttonContentSmall}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" style={{ textDecoration: 'none' }}>
                  <Button
                    mode="contained"
                    style={[styles.buttonPrimary, { backgroundColor: nyuchiColors.sunsetDeep }]}
                    labelStyle={[styles.buttonLabelSmall, { color: '#FFFFFF' }]}
                    contentStyle={styles.buttonContentSmall}
                  >
                    Get Started
                  </Button>
                </Link>
              </View>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <View style={styles.mobileNav}>
                {user ? (
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <Avatar.Text
                      size={32}
                      label={userInitials || 'U'}
                      style={{ backgroundColor: nyuchiColors.sunsetDeep }}
                      labelStyle={{ fontSize: 14, fontWeight: '600' }}
                    />
                  </Link>
                ) : (
                  <Link href="/sign-in" style={{ textDecoration: 'none' }}>
                    <IconButton
                      icon="account-circle-outline"
                      size={28}
                      iconColor={colors.text}
                      style={{ margin: 0 }}
                    />
                  </Link>
                )}
                <IconButton
                  icon="menu"
                  size={28}
                  iconColor={colors.text}
                  onPress={() => setMenuOpen(true)}
                  style={{ margin: 0 }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.background }]}>
          <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
            <View style={[styles.heroText, isDesktop && styles.heroTextDesktop]}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Platform for African{'\n'}Entrepreneurs
              </Text>

              <Text style={[styles.ubuntuTagline, { color: nyuchiColors.sunsetDeep }]}>
                "I am because we are"
              </Text>

              <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                Join a thriving community of African entrepreneurs. Connect, collaborate,
                and grow together with Ubuntu philosophy at our core.
              </Text>

              <View style={styles.heroButtons}>
                <Link href="/sign-up" style={{ textDecoration: 'none' }}>
                  <Button
                    mode="contained"
                    style={[styles.buttonPrimary, { backgroundColor: nyuchiColors.sunsetDeep }]}
                    labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
                    contentStyle={styles.buttonContent}
                  >
                    Join the Community
                  </Button>
                </Link>
                <Link href="/community" style={{ textDecoration: 'none' }}>
                  <Button
                    mode="contained"
                    style={[styles.buttonSecondary, { backgroundColor: nyuchiColors.purple }]}
                    labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
                    contentStyle={styles.buttonContent}
                  >
                    Explore
                  </Button>
                </Link>
                <Link href="/sign-in" style={{ textDecoration: 'none' }}>
                  <Button
                    mode="outlined"
                    style={[styles.buttonOutline, { borderColor: colors.border }]}
                    labelStyle={[styles.buttonLabel, { color: colors.text }]}
                    contentStyle={styles.buttonContent}
                  >
                    Sign In
                  </Button>
                </Link>
              </View>
            </View>

            {isDesktop && (
              <View style={styles.heroImageContainer}>
                <Image
                  src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=600"
                  alt="Victoria Falls"
                  width={480}
                  height={320}
                  style={{ objectFit: 'cover', borderRadius: borderRadius.card }}
                  priority
                />
                <Text style={[styles.imageCaption, { color: colors.textSecondary }]}>
                  Victoria Falls - Mosi-oa-Tunya
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Features Section */}
        <View style={[styles.featuresSection, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: nyuchiColors.green }]}>
              UBUNTU PHILOSOPHY
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
              <Link key={feature.title} href={feature.href} style={{ textDecoration: 'none', flex: isDesktop ? 1 : undefined }}>
                <Pressable>
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
                        <View style={[styles.freeBadge, { backgroundColor: nyuchiColors.green + '15' }]}>
                          <Text style={[styles.freeBadgeText, { color: nyuchiColors.green }]}>
                            Always Free
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
                  )}
                </Pressable>
              </Link>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.ctaSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.ctaTitle, { color: colors.text }]}>
            Ready to grow with us?
          </Text>
          <Text style={[styles.ctaDescription, { color: colors.textSecondary }]}>
            Create your free account and connect with the community.
          </Text>
          <Link href="/sign-up" style={{ textDecoration: 'none' }}>
            <Button
              mode="contained"
              style={[styles.buttonPrimary, { backgroundColor: nyuchiColors.sunsetDeep }]}
              labelStyle={[styles.buttonLabel, { color: '#FFFFFF' }]}
              contentStyle={styles.buttonContent}
            >
              Create Free Account
            </Button>
          </Link>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © {new Date().getFullYear()} Nyuchi Africa
          </Text>
          <Text style={[styles.footerTagline, { color: nyuchiColors.sunsetDeep }]}>
            "I am because we are"
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Header
  header: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  // Buttons
  buttonPrimary: {
    borderRadius: borderRadius.button,
  },
  buttonSecondary: {
    borderRadius: borderRadius.button,
  },
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
  buttonLabelSmall: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600',
    fontSize: 13,
    marginVertical: 0,
  },
  buttonContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  buttonContentSmall: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  // Hero
  heroSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  heroContent: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  heroContentDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  heroText: {
    flex: 1,
  },
  heroTextDesktop: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontFamily: 'Noto Serif, Georgia, serif',
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    marginBottom: 12,
  },
  ubuntuTagline: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  heroDescription: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 480,
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroImageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  imageCaption: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 12,
    marginTop: 8,
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
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  freeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  freeBadgeText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: '600',
  },

  // CTA
  ctaSection: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: 'Noto Serif, Georgia, serif',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 13,
    marginBottom: 4,
  },
  footerTagline: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Mobile Navigation
  mobileNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Mobile Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuPanel: {
    marginTop: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuLinks: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  menuLink: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: borderRadius.button,
  },
  menuLinkText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: '500',
  },
});
