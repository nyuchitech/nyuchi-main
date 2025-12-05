/**
 * 🇿🇼 Nyuchi Platform - Landing Page
 * "I am because we are"
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  People as PeopleIcon,
  TravelExplore as TravelIcon,
  Leaderboard as LeaderboardIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '@/lib/auth-context';
import { nyuchiColors } from '@/theme/zimbabwe-theme';

const communityFeatures = [
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: 'Community Directory',
    description: 'Discover and connect with African entrepreneurs and businesses.',
    href: '/community/directory',
    free: true,
  },
  {
    icon: <TravelIcon sx={{ fontSize: 40 }} />,
    title: 'Travel Directory',
    description: 'Explore travel businesses and destinations across Africa.',
    href: '/community/travel-directory',
    free: true,
  },
  {
    icon: <LeaderboardIcon sx={{ fontSize: 40 }} />,
    title: 'Ubuntu Leaderboard',
    description: 'Celebrate community contributors and their impact.',
    href: '/community/leaderboard',
    free: true,
  },
  {
    icon: <BusinessIcon sx={{ fontSize: 40 }} />,
    title: 'Get Involved',
    description: 'Join our community as a volunteer, partner, or contributor.',
    href: '/get-involved',
    free: true,
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: nyuchiColors.gray50 }}>
      {/* Zimbabwe Flag Strip */}
      <Box
        sx={{
          position: 'fixed',
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
          zIndex: 1000,
        }}
      />

      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            color: nyuchiColors.charcoal,
          }}
        >
          Nyuchi Africa
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            href="/sign-in"
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            Sign In
          </Button>
          <Button
            component={Link}
            href="/sign-up"
            variant="contained"
            sx={{
              borderRadius: '20px',
              bgcolor: nyuchiColors.sunsetOrange,
              '&:hover': { bgcolor: nyuchiColors.sunsetOrange + 'dd' },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          textAlign: 'center',
          background: `linear-gradient(135deg, ${nyuchiColors.charcoal} 0%, ${nyuchiColors.charcoal}ee 100%)`,
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Platform for African Entrepreneurs
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 1,
              opacity: 0.9,
              fontStyle: 'italic',
              color: nyuchiColors.sunsetOrange,
            }}
          >
            &quot;I am because we are&quot;
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, opacity: 0.8, maxWidth: 600, mx: 'auto' }}
          >
            Join a thriving community of African entrepreneurs. Connect, collaborate,
            and grow together with Ubuntu philosophy at our core.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/sign-up"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: '25px',
                px: 4,
                bgcolor: nyuchiColors.zimbabweGreen,
                '&:hover': { bgcolor: nyuchiColors.zimbabweGreen + 'dd' },
              }}
            >
              Join the Community
            </Button>
            <Button
              component={Link}
              href="/community"
              variant="outlined"
              size="large"
              sx={{
                borderRadius: '25px',
                px: 4,
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              Explore Community
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Community Features - Always Free */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: nyuchiColors.zimbabweGreen, fontWeight: 600 }}
          >
            Ubuntu Philosophy
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              color: nyuchiColors.charcoal,
              mb: 1,
            }}
          >
            Community Features - Always Free
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore our community without any barriers. Because we believe in collective growth.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {communityFeatures.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                component={Link}
                href={feature.href}
                sx={{
                  height: '100%',
                  textDecoration: 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ color: nyuchiColors.zimbabweGreen, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: nyuchiColors.charcoal, mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                  {feature.free && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'inline-block',
                        mt: 2,
                        px: 2,
                        py: 0.5,
                        bgcolor: nyuchiColors.zimbabweGreen + '20',
                        color: nyuchiColors.zimbabweGreen,
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Always Free
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: nyuchiColors.charcoal, color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Ready to grow with us?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
            Create your free account and start connecting with the African entrepreneur community.
          </Typography>
          <Button
            component={Link}
            href="/sign-up"
            variant="contained"
            size="large"
            sx={{
              borderRadius: '25px',
              px: 5,
              bgcolor: nyuchiColors.sunsetOrange,
              '&:hover': { bgcolor: nyuchiColors.sunsetOrange + 'dd' },
            }}
          >
            Create Free Account
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Nyuchi Africa. Built with Ubuntu philosophy.
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1, fontStyle: 'italic', color: nyuchiColors.sunsetOrange }}
        >
          &quot;I am because we are&quot;
        </Typography>
      </Box>
    </Box>
  );
}
