/**
 * Global Header Component - Brand V5
 * Shared header for all pages
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { View, StyleSheet, Pressable } from 'react-native';
import { Button, Avatar, Text } from 'react-native-paper';
import { useAuth } from '@/lib/auth-context';
import { useThemeMode } from '@/components/PaperProvider';
import { nyuchiColors, borderRadius } from '@/theme/nyuchi-theme';

interface HeaderProps {
  onMenuOpen?: () => void;
  isMobile?: boolean;
}

export function Header({ onMenuOpen, isMobile = false }: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useThemeMode();

  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;
  const logoSrc = isDark
    ? 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_dark.svg'
    : 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_light.svg';

  const userInitials = user?.email ? user.email.charAt(0).toUpperCase() : null;

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerContent}>
        <Pressable onPress={() => router.push('/')}>
          <Image
            src={logoSrc}
            alt="Nyuchi Africa"
            width={isMobile ? 180 : 240}
            height={isMobile ? 40 : 52}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Pressable>

        {/* Desktop Navigation */}
        {!isMobile && (
          <View style={styles.headerButtons}>
            {user ? (
              <Pressable onPress={() => router.push('/dashboard')}>
                <Avatar.Text
                  size={40}
                  label={userInitials || 'U'}
                  style={{ backgroundColor: nyuchiColors.sunsetDeep }}
                  labelStyle={{ fontSize: 16, fontWeight: '600' }}
                />
              </Pressable>
            ) : (
              <>
                <Button
                  mode="outlined"
                  style={[styles.buttonOutline, { borderColor: colors.border }]}
                  labelStyle={[styles.buttonLabelSmall, { color: colors.text }]}
                  contentStyle={styles.buttonContentSmall}
                  onPress={() => router.push('/sign-in')}
                >
                  Sign In
                </Button>
                <Button
                  mode="contained"
                  style={[styles.buttonPrimary, { backgroundColor: nyuchiColors.sunsetDeep }]}
                  labelStyle={[styles.buttonLabelSmall, { color: '#FFFFFF' }]}
                  contentStyle={styles.buttonContentSmall}
                  onPress={() => router.push('/sign-up')}
                >
                  Get Started
                </Button>
              </>
            )}
          </View>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <View style={styles.mobileNav}>
            {user ? (
              <Pressable onPress={() => router.push('/dashboard')}>
                <Avatar.Text
                  size={36}
                  label={userInitials || 'U'}
                  style={{ backgroundColor: nyuchiColors.sunsetDeep }}
                  labelStyle={{ fontSize: 15, fontWeight: '600' }}
                />
              </Pressable>
            ) : (
              <Pressable style={styles.iconButton} onPress={() => router.push('/sign-in')}>
                <Text style={[styles.iconText, { color: colors.text }]}>👤</Text>
              </Pressable>
            )}
            <Pressable style={styles.iconButton} onPress={onMenuOpen}>
              <Text style={[styles.iconText, { color: colors.text }]}>☰</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
  },
  buttonPrimary: {
    borderRadius: borderRadius.button,
  },
  buttonOutline: {
    borderRadius: borderRadius.button,
    borderWidth: 1,
  },
  buttonLabelSmall: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontWeight: '600',
    fontSize: 13,
    marginVertical: 0,
  },
  buttonContentSmall: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  mobileNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
});
