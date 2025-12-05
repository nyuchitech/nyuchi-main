/**
 * 🇿🇼 Nyuchi Community Hub
 * "I am because we are" - Public community page (no auth required)
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Skeleton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  EmojiEvents as TrophyIcon,
  Article as ArticleIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  FlightTakeoff as TravelIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ZimbabweFlagStrip } from '../../components/ZimbabweFlagStrip';

interface CommunityStats {
  total_members: number;
  total_businesses: number;
  total_articles: number;
  top_ubuntu_score: number;
  total_travel_businesses?: number;
}

export default function CommunityPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/community/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch community stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const features = [
    {
      title: 'Business Directory',
      description: 'Discover African businesses and entrepreneurs building the future.',
      icon: <BusinessIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      href: '/community/directory',
      stat: stats?.total_businesses,
      statLabel: 'Businesses',
    },
    {
      title: 'Travel Directory',
      description: 'Explore verified African travel businesses and destinations.',
      icon: <TravelIcon sx={{ fontSize: 48, color: '#2196F3' }} />,
      href: '/community/travel-directory',
      stat: stats?.total_travel_businesses,
      statLabel: 'Travel Partners',
    },
    {
      title: 'Ubuntu Leaderboard',
      description: 'Celebrate community contributors who embody the Ubuntu spirit.',
      icon: <TrophyIcon sx={{ fontSize: 48, color: '#FDD116' }} />,
      href: '/community/leaderboard',
      stat: stats?.top_ubuntu_score,
      statLabel: 'Top Score',
    },
    {
      title: 'Community Content',
      description: 'Read articles, guides, and success stories from the community.',
      icon: <ArticleIcon sx={{ fontSize: 48, color: '#00A651' }} />,
      href: '/community/content',
      stat: stats?.total_articles,
      statLabel: 'Articles',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ZimbabweFlagStrip />

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          pl: { xs: 2, md: 4 },
          ml: '8px', // Account for flag strip
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}
          >
            Nyuchi Community
          </Typography>
          <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
            &quot;I am because we are&quot; - Ubuntu Philosophy
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 600, opacity: 0.85 }}>
            Welcome to the Nyuchi Africa community. Here, we celebrate African entrepreneurship,
            share knowledge, and support each other in building a stronger future together.
          </Typography>

          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 4, mt: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon />
              {loading ? (
                <Skeleton width={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              ) : (
                <Typography variant="h6">{stats?.total_members || 0} Members</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingIcon />
              {loading ? (
                <Skeleton width={80} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              ) : (
                <Typography variant="h6">Growing Together</Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 6, ml: { xs: 2, md: 'auto' }, pl: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>
                  {loading ? (
                    <Skeleton width={80} sx={{ mx: 'auto', mb: 2 }} />
                  ) : (
                    <Typography variant="h4" color="primary" sx={{ mb: 1 }}>
                      {feature.stat?.toLocaleString() || '0'}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {feature.statLabel}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    component={Link}
                    href={feature.href}
                    variant="contained"
                    fullWidth
                  >
                    Explore
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Ubuntu Philosophy Section */}
        <Box
          sx={{
            mt: 8,
            p: 4,
            bgcolor: 'grey.50',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontFamily: 'Playfair Display, serif' }}
          >
            The Ubuntu Philosophy
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 3 }}>
            Ubuntu is an ancient African philosophy that emphasizes our interconnectedness.
            &quot;I am because we are&quot; reminds us that our success is tied to the success
            of our community. At Nyuchi, we believe that by supporting each other, we can
            build a stronger, more prosperous Africa.
          </Typography>
          <Button
            component={Link}
            href="/dashboard"
            variant="outlined"
            size="large"
          >
            Join the Community
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
