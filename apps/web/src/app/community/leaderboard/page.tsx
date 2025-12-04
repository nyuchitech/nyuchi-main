/**
 * 🇿🇼 Nyuchi Community Leaderboard
 * "I am because we are" - Public Ubuntu leaderboard (no auth required)
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Skeleton,
  Button,
  Chip,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ZimbabweFlagStrip } from '../../../components/ZimbabweFlagStrip';

interface LeaderboardEntry {
  id: string;
  full_name: string;
  avatar_url: string | null;
  company: string | null;
  country: string | null;
  ubuntu_score: number;
  contribution_count: number;
}

function getUbuntuLevel(score: number): { level: string; color: string } {
  if (score >= 5000) return { level: 'Ubuntu Champion', color: '#FFD700' };
  if (score >= 2000) return { level: 'Community Leader', color: '#C0C0C0' };
  if (score >= 500) return { level: 'Active Contributor', color: '#CD7F32' };
  return { level: 'Community Member', color: '#00A651' };
}

export default function CommunityLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/community/leaderboard?limit=50');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ZimbabweFlagStrip />

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, ml: '8px' }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TrophyIcon sx={{ fontSize: 48, color: '#FDD116' }} />
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontFamily: 'Playfair Display, serif' }}
            >
              Ubuntu Leaderboard
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Celebrating those who embody &quot;I am because we are&quot;
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4, ml: { xs: 2, md: 'auto' } }}>
        {/* Level Guide */}
        <Card sx={{ mb: 4, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ubuntu Levels
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<StarIcon sx={{ color: '#FFD700 !important' }} />}
                label="Champion (5000+)"
                variant="outlined"
              />
              <Chip
                icon={<StarIcon sx={{ color: '#C0C0C0 !important' }} />}
                label="Leader (2000+)"
                variant="outlined"
              />
              <Chip
                icon={<StarIcon sx={{ color: '#CD7F32 !important' }} />}
                label="Contributor (500+)"
                variant="outlined"
              />
              <Chip
                icon={<StarIcon sx={{ color: '#00A651 !important' }} />}
                label="Member"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                  <Skeleton variant="text" width={60} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : leaderboard.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <TrophyIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No contributors yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Be the first to contribute to the community!
            </Typography>
            <Button component={Link} href="/dashboard" variant="contained">
              Get Started
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {leaderboard.map((entry, index) => {
              const { level, color } = getUbuntuLevel(entry.ubuntu_score);
              const isTopThree = index < 3;

              return (
                <Card
                  key={entry.id}
                  sx={{
                    border: isTopThree ? `2px solid ${color}` : undefined,
                    bgcolor: isTopThree ? `${color}08` : undefined,
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Rank */}
                    <Typography
                      variant="h5"
                      sx={{
                        width: 40,
                        textAlign: 'center',
                        fontWeight: isTopThree ? 700 : 400,
                        color: isTopThree ? color : 'text.secondary',
                      }}
                    >
                      {index + 1}
                    </Typography>

                    {/* Avatar */}
                    <Avatar
                      src={entry.avatar_url || undefined}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.main',
                      }}
                    >
                      {entry.full_name?.charAt(0) || '?'}
                    </Avatar>

                    {/* Info */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {entry.full_name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {entry.company && (
                          <Typography variant="caption" color="text.secondary">
                            {entry.company}
                          </Typography>
                        )}
                        {entry.country && (
                          <Typography variant="caption" color="text.secondary">
                            {entry.company ? '•' : ''} {entry.country}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Score & Level */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary" fontWeight={700}>
                        {entry.ubuntu_score.toLocaleString()}
                      </Typography>
                      <Chip
                        label={level}
                        size="small"
                        sx={{
                          bgcolor: `${color}20`,
                          color: color,
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Back Link */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button component={Link} href="/community" variant="outlined">
            Back to Community
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
