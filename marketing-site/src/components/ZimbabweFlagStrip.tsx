/**
 * Zimbabwe Flag Strip
 * "I am because we are" - Vertical flag strip component
 */

'use client';

import { Box } from '@mui/material';
import { zimbabweColors } from '../theme/zimbabwe-theme';

interface ZimbabweFlagStripProps {
  hideMobile?: boolean;
  position?: 'fixed' | 'absolute';
}

export function ZimbabweFlagStrip({
  hideMobile = false,
  position = 'fixed'
}: ZimbabweFlagStripProps) {
  return (
    <Box
      sx={{
        position,
        left: 0,
        top: 0,
        width: '8px',
        height: '100vh',
        display: hideMobile ? { xs: 'none', md: 'flex' } : 'flex',
        flexDirection: 'column',
        zIndex: 9999,
      }}
    >
      <Box sx={{ flex: 1, backgroundColor: zimbabweColors.green }} />
      <Box sx={{ flex: 1, backgroundColor: zimbabweColors.yellow }} />
      <Box sx={{ flex: 1, backgroundColor: zimbabweColors.red }} />
      <Box sx={{ flex: 1, backgroundColor: zimbabweColors.black }} />
    </Box>
  );
}
