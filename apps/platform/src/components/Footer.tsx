/**
 * Global Footer Component - Brand V5
 * Shared footer for all pages
 */

'use client';

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useThemeMode } from '@/components/PaperProvider';
import { nyuchiColors } from '@/theme/nyuchi-theme';

export function Footer() {
  const { isDark } = useThemeMode();
  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;

  return (
    <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
        © {new Date().getFullYear()} Nyuchi Africa
      </Text>
      <Text style={[styles.footerTagline, { color: nyuchiColors.sunsetDeep }]}>
        &quot;I am because we are&quot;
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
