/**
 * 🇿🇼 Quick Actions Component
 * Actionable cards for common dashboard tasks
 */

'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  FlightTakeoff as TravelIcon,
  Business as BusinessIcon,
  Article as ArticleIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../theme/zimbabwe-theme';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'default' | 'primary';
}

const quickActions: QuickAction[] = [
  {
    title: 'Join Community Forum',
    description: 'Connect with fellow entrepreneurs',
    icon: PeopleIcon,
    href: '/community',
    badge: 'Free Forever',
    badgeColor: 'success',
  },
  {
    title: 'Add Your Business',
    description: 'List in the community directory',
    icon: BusinessIcon,
    href: '/dashboard/directory/new',
    badge: 'Ubuntu Points',
    badgeColor: 'primary',
  },
  {
    title: 'Travel Platform',
    description: 'Discover African destinations',
    icon: TravelIcon,
    href: '/dashboard/travel',
    badge: 'New',
    badgeColor: 'warning',
  },
  {
    title: 'Submit Content',
    description: 'Share your knowledge & stories',
    icon: ArticleIcon,
    href: '/dashboard/content/new',
    badge: 'Earn Points',
    badgeColor: 'primary',
  },
];

export function QuickActions() {
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              sx={{
                borderRadius: 2,
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: `${nyuchiColors.sunsetOrange}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ color: nyuchiColors.sunsetOrange }} />
                  </Box>
                  {action.badge && (
                    <Chip
                      label={action.badge}
                      size="small"
                      color={action.badgeColor}
                      sx={{ fontSize: '0.7rem', height: 22 }}
                    />
                  )}
                </Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {action.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  {action.description}
                </Typography>
                <Button
                  component={Link}
                  href={action.href}
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowIcon sx={{ fontSize: '1rem !important' }} />}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
