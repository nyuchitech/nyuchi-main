/**
 * Get Involved Hub Page
 * Main entry point for all involvement opportunities
 */

'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Explore as ExploreIcon,
  School as SchoolIcon,
  People as CommunityIcon,
  VolunteerActivism as VolunteerIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '@/theme/zimbabwe-theme';

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://platform.nyuchi.com';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'primary' | 'default';
  benefits: string[];
  cta: string;
}

const opportunities: Opportunity[] = [
  {
    id: 'business-partner',
    title: 'Business Partner Network',
    description: 'List your tourism business and connect with travelers seeking authentic Zimbabwe experiences.',
    icon: BusinessIcon,
    href: `${PLATFORM_URL}/get-involved/business-partner`,
    badge: 'Free Forever',
    badgeColor: 'success',
    benefits: ['Perpetual free listing', 'Targeted audience', 'Quality traffic', 'Platform authority'],
    cta: 'List Your Business',
  },
  {
    id: 'local-expert',
    title: 'Local Expert Program',
    description: 'Join our verified expert network as a safari guide, cultural specialist, or adventure expert.',
    icon: ExploreIcon,
    href: `${PLATFORM_URL}/get-involved/local-expert`,
    badge: 'Get Verified',
    badgeColor: 'primary',
    benefits: ['Professional profile', 'Traveler connections', 'Verification badge', 'Community support'],
    cta: 'Apply as Expert',
  },
  {
    id: 'student-contributor',
    title: 'Student Contributors',
    description: 'University students can contribute travel content and build their portfolio with published work.',
    icon: SchoolIcon,
    href: `${PLATFORM_URL}/get-involved/student-program`,
    badge: 'Q3 2025 Cohort',
    badgeColor: 'warning',
    benefits: ['Published portfolio', 'Mentorship', 'Industry connections', 'Paid opportunities'],
    cta: 'Apply Now',
  },
  {
    id: 'travel-community',
    title: 'Travel Enthusiast Community',
    description: 'Connect with fellow travelers, share experiences, and discover hidden gems.',
    icon: CommunityIcon,
    href: `${PLATFORM_URL}/community`,
    badge: '5,000+ Members',
    badgeColor: 'default',
    benefits: ['Trip planning support', 'Local insights', 'Community events', 'Exclusive content'],
    cta: 'Join Community',
  },
  {
    id: 'volunteer',
    title: 'Volunteer Opportunities',
    description: 'Contribute your skills to sustainable tourism and community development initiatives.',
    icon: VolunteerIcon,
    href: `${PLATFORM_URL}/get-involved/volunteer`,
    badge: 'Make Impact',
    badgeColor: 'primary',
    benefits: ['Meaningful contribution', 'Gain experience', 'Meet locals', 'Support conservation'],
    cta: 'Explore Roles',
  },
];

export default function GetInvolvedPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
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
        <Link href="/" style={{ textDecoration: 'none' }}>
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
        </Link>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component="a"
            href={`${PLATFORM_URL}/sign-in`}
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            Sign In
          </Button>
          <Button
            component="a"
            href={`${PLATFORM_URL}/sign-up`}
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
          background: `linear-gradient(135deg, ${nyuchiColors.charcoal} 0%, ${nyuchiColors.charcoal}dd 100%)`,
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 700 }}>
            <Typography
              variant="overline"
              sx={{
                color: nyuchiColors.sunsetOrange,
                fontWeight: 600,
                letterSpacing: 2,
                mb: 1,
                display: 'block',
              }}
            >
              Join Our Community
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Playfair Display',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Get Involved with Nyuchi Africa
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 3 }}>
              Whether you&apos;re a business owner, local expert, student, or travel enthusiast -
              there&apos;s a place for you in our community.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.7, fontStyle: 'italic' }}>
              &quot;I am because we are&quot; - Ubuntu Philosophy
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Opportunities Grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={4}>
          {opportunities.map((opportunity) => {
            const Icon = opportunity.icon;
            return (
              <Card
                key={opportunity.id}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    {/* Icon and Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          bgcolor: `${nyuchiColors.sunsetOrange}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ fontSize: 32, color: nyuchiColors.sunsetOrange }} />
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h5" fontWeight={600}>
                          {opportunity.title}
                        </Typography>
                        {opportunity.badge && (
                          <Chip
                            label={opportunity.badge}
                            size="small"
                            color={opportunity.badgeColor}
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>

                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {opportunity.description}
                      </Typography>

                      {/* Benefits */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {opportunity.benefits.map((benefit) => (
                          <Chip
                            key={benefit}
                            label={benefit}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>

                      <Button
                        component="a"
                        href={opportunity.href}
                        variant="contained"
                        endIcon={<ArrowIcon />}
                        sx={{
                          bgcolor: nyuchiColors.sunsetOrange,
                          '&:hover': { bgcolor: nyuchiColors.sunsetOrange, opacity: 0.9 },
                        }}
                      >
                        {opportunity.cta}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {/* Ubuntu Quote */}
        <Box
          sx={{
            mt: 8,
            p: 4,
            borderRadius: 2,
            bgcolor: `${nyuchiColors.zimbabweGreen}10`,
            border: `1px solid ${nyuchiColors.zimbabweGreen}30`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontFamily: 'Playfair Display', fontStyle: 'italic', mb: 2 }}
          >
            &quot;Ubuntu does not mean that people should not enrich themselves.
            The question therefore is: Are you going to do so in order to enable
            the community around you to be able to improve?&quot;
          </Typography>
          <Typography variant="body2" color="text.secondary">
            - Nelson Mandela
          </Typography>
        </Box>
      </Container>

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
          &copy; {new Date().getFullYear()} Nyuchi Africa. Built with Ubuntu philosophy.
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
