/**
 * Volunteer Opportunities Page
 * Contribute to sustainable tourism
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
  VolunteerActivism as VolunteerIcon,
  Park as ConservationIcon,
  School as EducationIcon,
  Translate as TranslationIcon,
  CameraAlt as ContentIcon,
  Groups as CommunityIcon,
  ArrowForward as ArrowIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

const VOLUNTEER_ROLES = [
  {
    id: 'conservation',
    title: 'Conservation Support',
    icon: ConservationIcon,
    description: 'Help document and promote conservation efforts across Zimbabwe wildlife areas.',
    commitment: 'Flexible',
    location: 'Remote / On-site',
    skills: ['Writing', 'Photography', 'Research'],
  },
  {
    id: 'education',
    title: 'Tourism Education',
    icon: EducationIcon,
    description: 'Create educational content about responsible tourism and cultural preservation.',
    commitment: '5-10 hrs/week',
    location: 'Remote',
    skills: ['Teaching', 'Content Creation', 'Tourism Knowledge'],
  },
  {
    id: 'translation',
    title: 'Translation Services',
    icon: TranslationIcon,
    description: 'Help translate content into local languages (Shona, Ndebele) and other languages.',
    commitment: 'Per project',
    location: 'Remote',
    skills: ['Shona', 'Ndebele', 'French', 'Portuguese'],
  },
  {
    id: 'content',
    title: 'Content Creation',
    icon: ContentIcon,
    description: 'Contribute photography, videos, and written content about Zimbabwe destinations.',
    commitment: 'Per project',
    location: 'Remote / Travel',
    skills: ['Photography', 'Videography', 'Writing'],
  },
  {
    id: 'community',
    title: 'Community Moderation',
    icon: CommunityIcon,
    description: 'Help moderate our community forums and social media groups.',
    commitment: '3-5 hrs/week',
    location: 'Remote',
    skills: ['Communication', 'Conflict Resolution', 'Social Media'],
  },
];

export default function VolunteerPage() {
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
            <VolunteerIcon sx={{ fontSize: 40, color: nyuchiColors.sunsetOrange }} />
            <Typography variant="h3" fontFamily="Playfair Display" fontWeight={700}>
              Volunteer Opportunities
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Contribute your skills to sustainable tourism and community development
            initiatives across Zimbabwe.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Impact Statement */}
        <Card sx={{ mb: 4, bgcolor: `${nyuchiColors.zimbabweGreen}08`, border: `1px solid ${nyuchiColors.zimbabweGreen}30` }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              Make a Meaningful Impact
            </Typography>
            <Typography color="text.secondary">
              Our volunteers help promote sustainable tourism, preserve cultural heritage,
              support conservation efforts, and connect travelers with authentic Zimbabwean experiences.
              Whether you have a few hours a week or want to contribute to specific projects,
              there&apos;s a role for you.
            </Typography>
          </CardContent>
        </Card>

        {/* Volunteer Roles */}
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Current Opportunities
        </Typography>
        <Stack spacing={3} sx={{ mb: 6 }}>
          {VOLUNTEER_ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
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
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        {role.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {role.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip label={`Time: ${role.commitment}`} size="small" variant="outlined" />
                        <Chip label={role.location} size="small" variant="outlined" />
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {role.skills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            sx={{ bgcolor: `${nyuchiColors.sunsetOrange}15`, fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="outlined"
                        href={`mailto:volunteer@nyuchi.com?subject=Volunteer Application: ${role.title}`}
                      >
                        Apply
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {/* Benefits */}
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Volunteer Benefits
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 6 }}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} color="primary">Meaningful Impact</Typography>
            <Typography variant="body2" color="text.secondary">Contribute to sustainable tourism</Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} color="primary">Skill Development</Typography>
            <Typography variant="body2" color="text.secondary">Gain valuable experience</Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} color="primary">Community</Typography>
            <Typography variant="body2" color="text.secondary">Connect with like-minded people</Typography>
          </Card>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} color="primary">Recognition</Typography>
            <Typography variant="body2" color="text.secondary">Ubuntu points and certificates</Typography>
          </Card>
        </Box>

        {/* Contact */}
        <Card sx={{ bgcolor: `${nyuchiColors.sunsetOrange}08`, border: `1px solid ${nyuchiColors.sunsetOrange}30` }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
              Ready to Make a Difference?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Contact us to discuss volunteer opportunities that match your skills and availability.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                startIcon={<EmailIcon />}
                href="mailto:volunteer@nyuchi.com?subject=Volunteer Inquiry"
                sx={{ bgcolor: nyuchiColors.sunsetOrange }}
              >
                Contact Us
              </Button>
              <Button
                component={Link}
                href="/get-involved"
                variant="outlined"
                endIcon={<ArrowIcon />}
              >
                Other Ways to Get Involved
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
