/**
 * 🇿🇼 Nyuchi Platform - Unified Dashboard
 * "I am because we are" - Dashboard with Ubuntu AI, activity streams, and quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  Business as DirectoryIcon,
  People as PeopleIcon,
  TrendingUp as TrendingIcon,
  Favorite as HeartIcon,
} from '@mui/icons-material';
import { useAuth } from '../../lib/auth-context';
import { nyuchiColors } from '../../theme/zimbabwe-theme';
import { UbuntuAIChat, ActivityStream, QuickActions } from '../../components/dashboard';

interface DashboardStats {
  directory_listings: number;
  published_content: number;
  community_members: number;
  ubuntu_score: number;
  monthly_growth: number;
  total_ubuntu_points: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          // Fallback stats
          setStats({
            directory_listings: 0,
            published_content: 0,
            community_members: 1,
            ubuntu_score: user?.ubuntu_score || 0,
            monthly_growth: 0,
            total_ubuntu_points: 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          directory_listings: 0,
          published_content: 0,
          community_members: 1,
          ubuntu_score: user?.ubuntu_score || 0,
          monthly_growth: 0,
          total_ubuntu_points: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.ubuntu_score]);

  const statCards = [
    {
      title: 'Ubuntu Score',
      value: stats?.ubuntu_score ?? user?.ubuntu_score ?? 0,
      icon: HeartIcon,
      color: nyuchiColors.sunsetOrange,
      description: 'Community impact',
    },
    {
      title: 'Connections',
      value: stats?.community_members ?? 0,
      icon: PeopleIcon,
      color: nyuchiColors.zimbabweGreen,
      description: 'Network members',
    },
    {
      title: 'Directory',
      value: stats?.directory_listings ?? 0,
      icon: DirectoryIcon,
      color: nyuchiColors.charcoal,
      description: 'Active listings',
    },
    {
      title: 'Growth',
      value: `+${stats?.monthly_growth ?? 0}%`,
      icon: TrendingIcon,
      color: '#4CAF50',
      description: "This month's progress",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            color: 'text.primary',
          }}
        >
          Welcome back, {user?.full_name || user?.email?.split('@')[0]}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          "I am because we are" - Let's strengthen our community together
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={6} lg={3} key={stat.title}>
              <Card elevation={0} sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.7rem',
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: `${stat.color}12`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color: stat.color, fontSize: 18 }} />
                    </Box>
                  </Box>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={40} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {stat.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Quick Actions */}
        <Grid item xs={12} lg={4}>
          <QuickActions />
        </Grid>

        {/* Center Column - Ubuntu AI Chat */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Ubuntu AI Assistant
          </Typography>
          <UbuntuAIChat
            communityId="platform-dashboard"
            onUbuntuAction={(action, data) => {
              console.log('Ubuntu AI Action:', action, data);
            }}
          />
        </Grid>

        {/* Right Column - Activity Stream */}
        <Grid item xs={12} lg={4}>
          <ActivityStream maxItems={5} showPhilosophy />
        </Grid>
      </Grid>

      {/* Ubuntu Philosophy Footer */}
      <Card
        sx={{
          mt: 4,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${nyuchiColors.charcoal} 0%, ${nyuchiColors.sunsetOrange}30 100%)`,
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <HeartIcon sx={{ color: nyuchiColors.sunsetOrange }} />
            <Typography variant="h6" fontWeight={600}>
              Ubuntu Philosophy in Action
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 700 }}>
            "I am because we are" - Every action on this platform strengthens our collective success.
            Your {stats?.ubuntu_score ?? user?.ubuntu_score ?? 0} Ubuntu points represent your contribution
            to lifting up the entire African business community.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
