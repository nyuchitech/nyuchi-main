/**
 * Student Contributors Program Page
 * Students submit content through the content hub
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  Edit as WriteIcon,
  Camera as PhotoIcon,
  Schedule as TimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

const BENEFITS = [
  { icon: WriteIcon, title: 'Professional Credentials', description: 'Your name and university affiliation displayed as author' },
  { icon: StarIcon, title: 'Portfolio Building', description: 'Published work on a premier travel platform' },
  { icon: SchoolIcon, title: 'Mentorship', description: 'Guidance from experienced travel writers and editors' },
  { icon: ArrowIcon, title: 'Industry Connections', description: 'Network with Zimbabwe tourism professionals' },
];

const REQUIREMENTS = [
  'Enrolled at a Zimbabwean university or college',
  'Strong English writing abilities',
  'Knowledge of at least one Zimbabwean destination',
  'Access to quality photography equipment',
  'Commitment of 4-6 weeks for editorial process',
  'Travel permission to chosen location',
];

const CONTENT_FOCUS = [
  'Lesser-known destinations',
  'Secondary cities',
  'Border regions',
  'Cultural heritage sites',
  'Community-based tourism',
  'Seasonal attractions',
  'Adventure activities',
];

export default function StudentProgramPage() {
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
            <SchoolIcon sx={{ fontSize: 40, color: nyuchiColors.sunsetOrange }} />
            <Box>
              <Typography variant="h3" fontFamily="Playfair Display" fontWeight={700}>
                Student Contributors Program
              </Typography>
              <Chip label="Q3 2025 Cohort - Applications Open" color="warning" size="small" sx={{ mt: 1 }} />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
            University students passionate about Zimbabwe can contribute travel content
            and build their portfolio with published work.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          {/* Main Content */}
          <Box>
            {/* Benefits */}
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              What You&apos;ll Gain
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: `${nyuchiColors.sunsetOrange}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ color: nyuchiColors.sunsetOrange }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{benefit.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{benefit.description}</Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Box>

            {/* How It Works */}
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              How It Works
            </Typography>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: nyuchiColors.sunsetOrange, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>1</Box>
                    <Box>
                      <Typography fontWeight={600}>Submit Your Application</Typography>
                      <Typography variant="body2" color="text.secondary">Apply through our content submission portal with your writing sample and destination pitch.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: nyuchiColors.sunsetOrange, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>2</Box>
                    <Box>
                      <Typography fontWeight={600}>Editorial Review</Typography>
                      <Typography variant="body2" color="text.secondary">Our team reviews your submission and provides feedback.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: nyuchiColors.sunsetOrange, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>3</Box>
                    <Box>
                      <Typography fontWeight={600}>Orientation & Training</Typography>
                      <Typography variant="body2" color="text.secondary">Selected contributors receive writing guidelines and mentorship.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: nyuchiColors.sunsetOrange, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>4</Box>
                    <Box>
                      <Typography fontWeight={600}>Content Development</Typography>
                      <Typography variant="body2" color="text.secondary">Write your destination guide with ongoing mentor feedback.</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: nyuchiColors.zimbabweGreen, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>5</Box>
                    <Box>
                      <Typography fontWeight={600}>Publication</Typography>
                      <Typography variant="body2" color="text.secondary">Your article gets published with full author attribution.</Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Content Specifications */}
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              Article Requirements
            </Typography>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WriteIcon color="action" />
                    <Typography>1,000-1,500 words</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoIcon color="action" />
                    <Typography>5-8 original photos</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon color="action" />
                    <Typography>4-6 weeks timeline</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Articles should cover introduction, logistics, accommodations, activities, local culture, and practical information.
                </Typography>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card sx={{ bgcolor: `${nyuchiColors.sunsetOrange}10`, border: `1px solid ${nyuchiColors.sunsetOrange}30` }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                  Ready to Start Your Writing Journey?
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Submit your content through our Content Hub to begin the application process.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    component={Link}
                    href="/dashboard/content/new"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowIcon />}
                    sx={{ bgcolor: nyuchiColors.sunsetOrange }}
                  >
                    Submit Content
                  </Button>
                  <Button
                    component={Link}
                    href="/community/content"
                    variant="outlined"
                  >
                    View Published Articles
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box>
            {/* Eligibility */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Eligibility Requirements
                </Typography>
                <List dense>
                  {REQUIREMENTS.map((req) => (
                    <ListItem key={req} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon sx={{ fontSize: 18, color: nyuchiColors.zimbabweGreen }} />
                      </ListItemIcon>
                      <ListItemText primary={req} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Content Focus */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Content We&apos;re Seeking
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {CONTENT_FOCUS.map((topic) => (
                    <Chip key={topic} label={topic} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card sx={{ bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Important Notes
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Initial contributions are unpaid. Strong performers receive paid opportunities for subsequent articles.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zimbabwe Travel Information retains publishing rights; contributors maintain portfolio usage rights.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
