/**
 * Floating Mobile Navigation Bar - Brand V5
 * Bottom navigation bar for mobile devices
 */

'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useAuth } from '@/lib/auth-context';
import { useThemeMode } from '@/components/PaperProvider';
import { nyuchiColors } from '@/theme/nyuchi-theme';

interface NavItem {
  label: string;
  emoji: string;
  emojiActive: string;
  href: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', emoji: '🏠', emojiActive: '🏠', href: '/' },
  { label: 'Community', emoji: '👥', emojiActive: '👥', href: '/community' },
  { label: 'Get Involved', emoji: '🤝', emojiActive: '🤝', href: '/get-involved' },
  { label: 'Dashboard', emoji: '📊', emojiActive: '📊', href: '/dashboard', requiresAuth: true },
];

export function MobileNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { isDark } = useThemeMode();

  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;
  const userInitials = user?.email ? user.email.charAt(0).toUpperCase() : null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const filteredItems = navItems.filter(item => {
    if (item.requiresAuth && !user) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      {filteredItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Pressable
            key={item.label}
            style={styles.navItem}
            onPress={() => router.push(item.href)}
          >
            <Text style={styles.navEmoji}>{active ? item.emojiActive : item.emoji}</Text>
            <Text
              style={[
                styles.navLabel,
                { color: active ? nyuchiColors.sunsetDeep : colors.textSecondary },
              ]}
            >
              {item.label}
            </Text>
            {active && <View style={[styles.activeIndicator, { backgroundColor: nyuchiColors.sunsetDeep }]} />}
          </Pressable>
        );
      })}

      {/* Profile/Sign In */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.push(user ? '/dashboard/settings' : '/sign-in')}
      >
        {user ? (
          <Avatar.Text
            size={28}
            label={userInitials || 'U'}
            style={{ backgroundColor: nyuchiColors.sunsetDeep }}
            labelStyle={{ fontSize: 12, fontWeight: '600' }}
          />
        ) : (
          <Text style={styles.navEmoji}>👤</Text>
        )}
        <Text
          style={[
            styles.navLabel,
            { color: pathname.includes('/settings') || pathname === '/sign-in' ? nyuchiColors.sunsetDeep : colors.textSecondary },
          ]}
        >
          {user ? 'Profile' : 'Sign In'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as unknown as undefined,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 24, // Safe area for notch devices
    borderTopWidth: 1,
    zIndex: 9998,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    minWidth: 64,
    position: 'relative',
  },
  navEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  navLabel: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 10,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
