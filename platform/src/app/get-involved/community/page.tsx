/**
 * Travel Enthusiast Community Page
 * Connect with fellow travelers
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
  People as CommunityIcon,
  Facebook as FacebookIcon,
  Forum as DiscordIcon,
  Flight as TravelIcon,
  LocalActivity as LocalIcon,
  Business as ProIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

const MEMBER_BENEFITS = [
  {
    title: 'First-Time Visitors',
    icon: TravelIcon,
    benefits: [
      'Personalized itinerary feedback',
      'Cost and logistics guidance',
      'Cultural norms education',
      'Connect with experienced guides',
    ],
  },
  {
    title: 'Repeat Visitors',
    icon: LocalIcon,
    benefits: [
      'Discover hidden gems',
      'Share your expertise',
      'Organize group trips',
      'Deep local connections',
    ],
  },
  {
    title: 'Local Zimbabweans',
    icon: CommunityIcon,
    benefits: [
      'Share insider knowledge',
      'Offer authentic experiences',
      'Network with tourism pros',
      'Promote your region',
    ],
  },
  {
    title: 'Tourism Professionals',
    icon: ProIcon,
    benefits: [
      'Connect with partners',
      'Understand traveler needs',
      'Get service feedback',
      'Authentic engagement',
    ],
  },
];

export default function CommunityPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${nyuchiColors.charcoal} 0%, ${nyuchiColors.charcoal}dd 100%)`,
          color: 'white',
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CommunityIcon sx={{ fontSize: 40, color: nyuchiColors.sunsetOrange }} />
            <Box>
              <Typography variant="h3" fontFamily="Playfair Display" fontWeight={700}>
                Travel Enthusiast Community
              </Typography>
              <Chip label="5,000+ Members" size="small" sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Connect with fellow travelers, share experiences, and discover hidden gems across Zimbabwe and Africa.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Platform Cards */}
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Join Our Community
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 6 }}>
          {/* Facebook */}
          <Card sx={{ border: `2px solid #1877F2` }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: '#1877F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FacebookIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={600}>Facebook Group</Typography>
                  <Typography color="text.secondary">5,000+ active members</Typography>
                </Box>
              </Box>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Join our vibrant Facebook community for trip reports, stunning photos, travel recommendations, and weekly &quot;Travel Tuesday&quot; photo sharing sessions.
              </Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Chip label="Trip Reports" size="small" variant="outlined" />
                <Chip label="Photo Sharing" size="small" variant="outlined" />
                <Chip label="Recommendations" size="small" variant="outlined" />
                <Chip label="Community Discussions" size="small" variant="outlined" />
              </Stack>
              <Button
                variant="contained"
                fullWidth
                href="https://facebook.com/groups/zimbabwetravelinfo"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: '#1877F2', '&:hover': { bgcolor: '#166FE5' } }}
              >
                Join Facebook Group
              </Button>
            </CardContent>
          </Card>

          {/* Discord */}
          <Card sx={{ border: `2px solid #5865F2` }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: '#5865F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DiscordIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={600}>Discord Server</Typography>
                  <Typography color="text.secondary">Real-time chat</Typography>
                </Box>
              </Box>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Connect in real-time with organized channels by destination and activity type. Join voice channels for group calls and expert Q&A sessions.
              </Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Chip label="Destination Channels" size="small" variant="outlined" />
                <Chip label="Voice Chats" size="small" variant="outlined" />
                <Chip label="Expert Q&A" size="small" variant="outlined" />
                <Chip label="Real-time Help" size="small" variant="outlined" />
              </Stack>
              <Button
                variant="contained"
                fullWidth
                href="https://discord.gg/dzHWFB44yw"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ bgcolor: '#5865F2', '&:hover': { bgcolor: '#4752C4' } }}
              >
                Join Discord Server
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* Member Benefits */}
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Benefits for Every Member
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 6 }}>
          {MEMBER_BENEFITS.map((member) => {
            const Icon = member.icon;
            return (
              <Card key={member.title}>
                <CardContent>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: `${nyuchiColors.sunsetOrange}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Icon sx={{ color: nyuchiColors.sunsetOrange }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    {member.title}
                  </Typography>
                  <Stack spacing={0.5}>
                    {member.benefits.map((benefit) => (
                      <Typography key={benefit} variant="body2" color="text.secondary">
                        {benefit}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Community Impact */}
        <Card sx={{ bgcolor: `${nyuchiColors.zimbabweGreen}08`, border: `1px solid ${nyuchiColors.zimbabweGreen}30` }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              Community Impact
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Our members actively contribute to Zimbabwe&apos;s tourism ecosystem:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Chip label="Conservation Fundraisers" />
              <Chip label="Responsible Tourism Advocacy" />
              <Chip label="Collaborative Travel Guides" />
              <Chip label="Local Tourism Support" />
              <Chip label="Word-of-Mouth Promotion" />
            </Box>
          </CardContent>
        </Card>

        {/* Nyuchi Community Link */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Also Join Our Nyuchi Platform Community
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Access the forum, directory, leaderboard, and more features on our platform.
          </Typography>
          <Button
            component={Link}
            href="/community"
            variant="contained"
            size="large"
            endIcon={<ArrowIcon />}
            sx={{ bgcolor: nyuchiColors.sunsetOrange }}
          >
            Explore Nyuchi Community
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
