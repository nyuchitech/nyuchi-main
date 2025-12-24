/**
 * 🇿🇼 Page Layout
 * "I am because we are" - Main page layout with flag strip
 */

'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { ZimbabweFlagStrip } from './ZimbabweFlagStrip';

interface PageLayoutProps {
  children: ReactNode;
  showFlagStrip?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export function PageLayout({
  children,
  showFlagStrip = true,
  maxWidth = 'lg',
}: PageLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        paddingLeft: showFlagStrip ? '8px' : 0,
      }}
    >
      {showFlagStrip && <ZimbabweFlagStrip />}
      <Container maxWidth={maxWidth} sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
