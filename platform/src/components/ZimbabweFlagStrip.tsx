/**
 * Zimbabwe Flag Strip - Brand V5
 * 4px vertical stripe on LEFT edge
 * Colors: Green -> Yellow -> Red -> Black (25% each)
 * Hidden on mobile (< 480px)
 */

'use client';

import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { nyuchiColors } from '@/theme/nyuchi-theme';

interface ZimbabweFlagStripProps {
  hideMobile?: boolean;
}

export function ZimbabweFlagStrip({ hideMobile = true }: ZimbabweFlagStripProps) {
  const { width } = useWindowDimensions();

  // Hide on mobile (< 480px) per brand guidelines
  if (hideMobile && width < 480) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.stripe, { backgroundColor: nyuchiColors.flagGreen }]} />
      <View style={[styles.stripe, { backgroundColor: nyuchiColors.flagYellow }]} />
      <View style={[styles.stripe, { backgroundColor: nyuchiColors.flagRed }]} />
      <View style={[styles.stripe, { backgroundColor: nyuchiColors.flagBlack }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 4,
    height: '100%',
    flexDirection: 'column',
    zIndex: 9999,
  },
  stripe: {
    flex: 1,
  },
});
