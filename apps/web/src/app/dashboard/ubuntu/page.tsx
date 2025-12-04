/**
 * 🇿🇼 Nyuchi Platform - Ubuntu Leaderboard
 * Community contribution rankings
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../lib/auth-context';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

interface Contributor {
  id: string;
  name: string;
  email: string;
  ubuntu_score: number;
  rank?: number;
  contributions?: number;
}

export default function UbuntuPage() {
  const { user, token } = useAuth();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [token]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ubuntu/leaderboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setContributors(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const topThree = contributors.slice(0, 3);
  const userRank = contributors.findIndex((c) => c.id === user?.id) + 1;
  const userScore = user?.ubuntu_score || 0;

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return nyuchiColors.gray400;
    }
  };

  const stats = [
    {
      title: 'Your Rank',
      value: userRank > 0 ? `#${userRank}` : 'N/A',
      icon: TrophyIcon,
      color: nyuchiColors.zimbabweYellow,
    },
    {
      title: 'Your Score',
      value: userScore.toString(),
      icon: StarIcon,
      color: nyuchiColors.sunsetOrange,
    },
    {
      title: 'Total Contributors',
      value: contributors.length.toString(),
      icon: PeopleIcon,
      color: nyuchiColors.zimbabweGreen,
    },
    {
      title: 'Average Score',
      value: contributors.length > 0
        ? Math.round(contributors.reduce((sum, c) => sum + c.ubuntu_score, 0) / contributors.length).toString()
        : '0',
      icon: TrendingIcon,
      color: nyuchiColors.charcoal,
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          Ubuntu Leaderboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          "I am because we are" - Community contribution rankings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <Card elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {stat.title}
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color: stat.color, fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Top Contributors
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {topThree.map((contributor, index) => {
              const rank = index + 1;
              return (
                <Grid item xs={12} sm={4} key={contributor.id}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: rank === 1 ? 80 : 64,
                          height: rank === 1 ? 80 : 64,
                          bgcolor: nyuchiColors.sunsetOrange,
                          fontSize: rank === 1 ? '2rem' : '1.5rem',
                          fontWeight: 700,
                        }}
                      >
                        {contributor.email[0].toUpperCase()}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -8,
                          right: -8,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: getRankColor(rank),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid white',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>
                          {rank}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {contributor.name || contributor.email.split('@')[0]}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: nyuchiColors.sunsetOrange }}>
                      {contributor.ubuntu_score}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ubuntu Points
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Full Leaderboard */}
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Full Leaderboard
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contributor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ubuntu Score</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Loading leaderboard...</Typography>
                  </TableCell>
                </TableRow>
              ) : contributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No contributors yet</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contributors.map((contributor, index) => {
                  const rank = index + 1;
                  const isCurrentUser = contributor.id === user?.id;
                  const maxScore = contributors[0]?.ubuntu_score || 1;
                  const progress = (contributor.ubuntu_score / maxScore) * 100;

                  return (
                    <TableRow
                      key={contributor.id}
                      hover
                      sx={{
                        bgcolor: isCurrentUser ? `${nyuchiColors.sunsetOrange}08` : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={`#${rank}`}
                          size="small"
                          sx={{
                            bgcolor: rank <= 3 ? `${getRankColor(rank)}20` : 'transparent',
                            color: rank <= 3 ? getRankColor(rank) : 'text.secondary',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: nyuchiColors.sunsetOrange,
                              fontSize: '0.875rem',
                            }}
                          >
                            {contributor.email[0].toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {contributor.name || contributor.email.split('@')[0]}
                              {isCurrentUser && (
                                <Chip label="You" size="small" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {contributor.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {contributor.ubuntu_score}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: '30%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: `${nyuchiColors.sunsetOrange}15`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: nyuchiColors.sunsetOrange,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                            {Math.round(progress)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
