/**
 * Global Layout Component - Brand V5
 * Wraps pages with header, footer, mobile nav, and Zimbabwe flag strip
 */

'use client';

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useThemeMode } from '@/components/PaperProvider';
import { ZimbabweFlagStrip } from '@/components/ZimbabweFlagStrip';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNavBar } from '@/components/MobileNavBar';
import { MobileMenu } from '@/components/MobileMenu';
import { nyuchiColors } from '@/theme/nyuchi-theme';

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

interface GlobalLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideMobileNav?: boolean;
  hideZimbabweStrip?: boolean;
}

export function GlobalLayout({
  children,
  hideHeader = false,
  hideFooter = false,
  hideMobileNav = false,
  hideZimbabweStrip = false,
}: GlobalLayoutProps) {
  const { isDark } = useThemeMode();
  const width = useWindowWidth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isMobile = width < 768;
  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Zimbabwe Flag Strip */}
      {!hideZimbabweStrip && !isMobile && <ZimbabweFlagStrip />}

      {/* Mobile Menu Modal */}
      <MobileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Header */}
      {!hideHeader && (
        <Header isMobile={isMobile} onMenuOpen={() => setMenuOpen(true)} />
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isMobile && !hideMobileNav && { paddingBottom: 80 }, // Space for mobile nav
        ]}
        showsVerticalScrollIndicator={false}
      >
        {children}

        {/* Footer */}
        {!hideFooter && <Footer />}
      </ScrollView>

      {/* Mobile Navigation Bar */}
      {isMobile && !hideMobileNav && <MobileNavBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
