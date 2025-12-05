/**
 * 🇿🇼 Nyuchi Platform - Login/Signup Page
 * Clean, professional authentication with Nyuchi branding
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  Paper,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useAuth } from '../lib/auth-context';
import { nyuchiColors } from '../theme/zimbabwe-theme';

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 0) {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: nyuchiColors.gray50,
        position: 'relative',
      }}
    >
      {/* Zimbabwe Flag Strip - Vertical on left edge */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '6px',
          height: '100%',
          background: `linear-gradient(to bottom,
            ${nyuchiColors.zimbabweGreen} 0%,
            ${nyuchiColors.zimbabweGreen} 14.28%,
            ${nyuchiColors.zimbabweYellow} 14.28%,
            ${nyuchiColors.zimbabweYellow} 28.56%,
            ${nyuchiColors.zimbabweRed} 28.56%,
            ${nyuchiColors.zimbabweRed} 42.84%,
            ${nyuchiColors.zimbabweBlack} 42.84%,
            ${nyuchiColors.zimbabweBlack} 57.12%,
            ${nyuchiColors.zimbabweRed} 57.12%,
            ${nyuchiColors.zimbabweRed} 71.4%,
            ${nyuchiColors.zimbabweYellow} 71.4%,
            ${nyuchiColors.zimbabweYellow} 85.68%,
            ${nyuchiColors.zimbabweGreen} 85.68%,
            ${nyuchiColors.zimbabweGreen} 100%
          )`,
        }}
      />

      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Playfair Display',
                fontWeight: 700,
                mb: 1,
                color: nyuchiColors.charcoal,
              }}
            >
              Nyuchi Africa
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Platform for African Entrepreneurs
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '0.9375rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {tab === 1 && (
              <TextField
                label="Name"
                type="text"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
                size="medium"
              />
            )}
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              size="medium"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              size="medium"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? 'Please wait...' : tab === 0 ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              "I am because we are"
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
