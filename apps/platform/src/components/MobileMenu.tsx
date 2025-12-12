/**
 * Mobile Menu Modal Component - Brand V5
 * Slide-down menu for mobile navigation
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useThemeMode } from '@/components/PaperProvider';
import { nyuchiColors, borderRadius } from '@/theme/nyuchi-theme';

interface MenuLink {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
}

const menuLinks: MenuLink[] = [
  { label: 'Home', href: 'https://www.nyuchi.com', external: true },
  { label: 'Platform', href: '/' },
  { label: 'Community', href: '/community' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'Sign In', href: '/sign-in' },
  { label: 'Get Started', href: '/sign-up', primary: true },
];

interface MobileMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function MobileMenu({ visible, onClose }: MobileMenuProps) {
  const router = useRouter();
  const { isDark } = useThemeMode();

  const colors = isDark ? nyuchiColors.dark : nyuchiColors.light;
  const logoSrc = isDark
    ? 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_dark.svg'
    : 'https://assets.nyuchi.com/logos/nyuchi/Nyuchi_Africa_Logo_light.svg';

  const handleLinkPress = (link: MenuLink) => {
    onClose();
    if (link.external) {
      window.open(link.href, '_blank');
    } else {
      router.push(link.href);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.menuOverlay}>
        <Pressable style={styles.overlayBackground} onPress={onClose} />
        <View style={[styles.menuPanel, { backgroundColor: colors.card }]}>
          <View style={styles.menuHeader}>
            <Image
              src={logoSrc}
              alt="Nyuchi Africa"
              width={140}
              height={36}
              style={{ objectFit: 'contain' }}
            />
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
            </Pressable>
          </View>
          <Divider style={{ backgroundColor: colors.border }} />
          <View style={styles.menuLinks}>
            {menuLinks.map((link) => (
              <Pressable
                key={link.label}
                onPress={() => handleLinkPress(link)}
                style={({ pressed }) => [
                  styles.menuLink,
                  link.primary && { backgroundColor: nyuchiColors.sunsetDeep },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.menuLinkText,
                    { color: link.primary ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {link.label}
                </Text>
                {link.external && (
                  <Text style={[styles.externalIcon, { color: colors.textSecondary }]}>↗</Text>
                )}
              </Pressable>
            ))}
          </View>
          <View style={styles.menuFooter}>
            <Text style={[styles.ubuntuText, { color: nyuchiColors.sunsetDeep }]}>
              &quot;I am because we are&quot;
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuPanel: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 22,
  },
  menuLinks: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  menuLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: borderRadius.button,
  },
  menuLinkText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: '500',
  },
  externalIcon: {
    fontSize: 14,
  },
  menuFooter: {
    paddingTop: 24,
    alignItems: 'center',
  },
  ubuntuText: {
    fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
