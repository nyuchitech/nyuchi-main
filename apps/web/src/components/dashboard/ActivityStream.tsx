/**
 * 🇿🇼 Ubuntu Activity Stream Component
 * Real-time community activity feed with Ubuntu philosophy
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Favorite as HeartIcon,
  TrendingUp as TrendingIcon,
  Business as BusinessIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { nyuchiColors } from '../../theme/zimbabwe-theme';

interface Activity {
  id: string;
  type: 'member_joined' | 'content_published' | 'business_listed' | 'collaboration' | 'ubuntu_points';
  action: string;
  actor: string;
  timestamp: string;
  ubuntuPoints?: number;
}

interface ActivityStreamProps {
  maxItems?: number;
  showPhilosophy?: boolean;
}

const activityIcons = {
  member_joined: PeopleIcon,
  content_published: ArticleIcon,
  business_listed: BusinessIcon,
  collaboration: TrendingIcon,
  ubuntu_points: HeartIcon,
};

const activityColors = {
  member_joined: nyuchiColors.zimbabweGreen,
  content_published: nyuchiColors.charcoal,
  business_listed: nyuchiColors.sunsetOrange,
  collaboration: nyuchiColors.zimbabweYellow,
  ubuntu_points: '#E91E63',
};

export function ActivityStream({ maxItems = 5, showPhilosophy = true }: ActivityStreamProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(`/api/community/activity?limit=${maxItems}`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        } else {
          // Fallback demo data
          setActivities([
            {
              id: '1',
              type: 'member_joined',
              action: 'Joined Ubuntu Business Network',
              actor: 'New community member',
              timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
              ubuntuPoints: 50,
            },
            {
              id: '2',
              type: 'content_published',
              action: 'Shared success story',
              actor: 'Tech Startup Zimbabwe',
              timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
              ubuntuPoints: 100,
            },
            {
              id: '3',
              type: 'business_listed',
              action: 'Listed new business',
              actor: 'Harare Consulting',
              timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
              ubuntuPoints: 75,
            },
            {
              id: '4',
              type: 'collaboration',
              action: 'Started cross-industry collaboration',
              actor: 'Kenya Agri & SA Fintech',
              timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
              ubuntuPoints: 200,
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        // Use fallback data on error
        setActivities([
          {
            id: '1',
            type: 'member_joined',
            action: 'Joined the community',
            actor: 'New member',
            timestamp: new Date().toISOString(),
            ubuntuPoints: 50,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [maxItems]);

  function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Community Activity
          </Typography>
          <Chip
            label="Live"
            size="small"
            color="success"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        </Box>

        {showPhilosophy && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 2, fontStyle: 'italic' }}
          >
            "I am because we are" - Celebrating community contributions
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            [...Array(maxItems)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))
          ) : activities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No recent activity
            </Typography>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const color = activityColors[activity.type];

              return (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                    p: 1.5,
                    borderRadius: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: `${color}15`,
                    }}
                  >
                    <Icon sx={{ fontSize: 16, color }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.actor}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    {activity.ubuntuPoints && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: nyuchiColors.sunsetOrange,
                          fontWeight: 600,
                          display: 'block',
                        }}
                      >
                        +{activity.ubuntuPoints} pts
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatTimeAgo(activity.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
