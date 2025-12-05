/**
 * Local Expert Program Page
 * Apply to become a verified local expert
 */

'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Stack,
} from '@mui/material';
import {
  Explore as ExploreIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as BackIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

const EXPERT_CATEGORIES = [
  { id: 'safari_guide', name: 'Safari Guide', description: 'ZPGA certified wildlife guides' },
  { id: 'cultural_specialist', name: 'Cultural Specialist', description: 'Traditional culture and heritage' },
  { id: 'adventure_guide', name: 'Adventure Guide', description: 'Outdoor and adventure activities' },
  { id: 'urban_guide', name: 'Urban & Food Guide', description: 'City tours and culinary experiences' },
  { id: 'photography_guide', name: 'Photography Guide', description: 'Wildlife and landscape photography' },
  { id: 'bird_guide', name: 'Bird Guide', description: 'Ornithology and birdwatching' },
];

const steps = ['Personal Info', 'Expertise', 'Experience', 'Review'];

export default function LocalExpertPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    category: '',
    years_experience: '',
    certifications: '',
    languages: '',
    services: '',
    bio: '',
    motivation: '',
    website: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.full_name || !formData.email || !formData.phone || !formData.location) {
        setError('Please fill in all required fields');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.category || !formData.services) {
        setError('Please select your expertise and list your services');
        return;
      }
    } else if (activeStep === 2) {
      if (!formData.years_experience || !formData.certifications || !formData.languages) {
        setError('Please fill in your experience details');
        return;
      }
    }

    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/get-involved/experts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="sm">
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <CheckIcon sx={{ fontSize: 64, color: nyuchiColors.zimbabweGreen, mb: 2 }} />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Application Submitted!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Thank you for applying to the Local Expert Program!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              We&apos;ll review your application and contact you within 5-7 business days
              for a video verification interview.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button component={Link} href="/community/directory" variant="outlined">
                View Expert Directory
              </Button>
              <Button component={Link} href="/get-involved" variant="contained">
                Explore More
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>
    );
  }

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
            <ExploreIcon sx={{ fontSize: 40, color: nyuchiColors.sunsetOrange }} />
            <Typography variant="h3" fontFamily="Playfair Display" fontWeight={700}>
              Local Expert Program
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Share your knowledge and connect with travelers seeking authentic Zimbabwe experiences.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Expert Categories */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Expert Categories We&apos;re Looking For
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {EXPERT_CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                sx={{
                  p: 2,
                  cursor: activeStep === 1 ? 'pointer' : 'default',
                  border: formData.category === cat.id ? `2px solid ${nyuchiColors.sunsetOrange}` : '1px solid',
                  borderColor: formData.category === cat.id ? nyuchiColors.sunsetOrange : 'divider',
                }}
                onClick={() => activeStep === 1 && setFormData({ ...formData, category: cat.id })}
              >
                <Typography variant="subtitle2" fontWeight={600}>{cat.name}</Typography>
                <Typography variant="caption" color="text.secondary">{cat.description}</Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Benefits */}
        <Card sx={{ mb: 4, bgcolor: `${nyuchiColors.zimbabweGreen}08`, border: `1px solid ${nyuchiColors.zimbabweGreen}30` }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VerifiedIcon sx={{ color: nyuchiColors.zimbabweGreen }} />
              <Typography variant="h6" fontWeight={600}>Expert Benefits</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Professional Profile" size="small" />
              <Chip label="Verification Badge" size="small" />
              <Chip label="Traveler Connections" size="small" />
              <Chip label="Community Support" size="small" />
              <Chip label="Directory Listing" size="small" />
            </Box>
          </CardContent>
        </Card>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Step 0: Personal Info */}
            {activeStep === 0 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
                <TextField
                  label="Full Name"
                  value={formData.full_name}
                  onChange={handleChange('full_name')}
                  fullWidth
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  fullWidth
                  required
                />
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  fullWidth
                  required
                  placeholder="+263..."
                />
                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={handleChange('location')}
                  fullWidth
                  required
                  placeholder="e.g., Victoria Falls, Harare"
                />
                <TextField
                  label="Website (Optional)"
                  value={formData.website}
                  onChange={handleChange('website')}
                  fullWidth
                  placeholder="https://..."
                />
              </Stack>
            )}

            {/* Step 1: Expertise */}
            {activeStep === 1 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Your Expertise</Typography>
                <TextField
                  label="Expert Category"
                  value={formData.category}
                  onChange={handleChange('category')}
                  select
                  fullWidth
                  required
                >
                  {EXPERT_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name} - {cat.description}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Services Offered"
                  value={formData.services}
                  onChange={handleChange('services')}
                  multiline
                  rows={3}
                  fullWidth
                  required
                  placeholder="List the services you offer (e.g., day safaris, multi-day tours, photography workshops)"
                />
                <TextField
                  label="Bio"
                  value={formData.bio}
                  onChange={handleChange('bio')}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Tell travelers about yourself and what makes your experiences unique..."
                />
              </Stack>
            )}

            {/* Step 2: Experience */}
            {activeStep === 2 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Experience & Qualifications</Typography>
                <TextField
                  label="Years of Experience"
                  value={formData.years_experience}
                  onChange={handleChange('years_experience')}
                  fullWidth
                  required
                  placeholder="e.g., 5 years"
                />
                <TextField
                  label="Certifications"
                  value={formData.certifications}
                  onChange={handleChange('certifications')}
                  multiline
                  rows={2}
                  fullWidth
                  required
                  placeholder="e.g., ZPGA Level 2, First Aid, CPR"
                />
                <TextField
                  label="Languages Spoken"
                  value={formData.languages}
                  onChange={handleChange('languages')}
                  fullWidth
                  required
                  placeholder="e.g., English, Shona, Ndebele"
                />
                <TextField
                  label="Why do you want to join?"
                  value={formData.motivation}
                  onChange={handleChange('motivation')}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Share your motivation for joining the expert network..."
                />
              </Stack>
            )}

            {/* Step 3: Review */}
            {activeStep === 3 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Review Your Application</Typography>

                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Personal Info</Typography>
                  <Typography variant="h6">{formData.full_name}</Typography>
                  <Typography color="text.secondary">{formData.email} | {formData.phone}</Typography>
                  <Typography color="text.secondary">{formData.location}</Typography>
                </Box>

                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Expertise</Typography>
                  <Typography variant="h6">
                    {EXPERT_CATEGORIES.find(c => c.id === formData.category)?.name}
                  </Typography>
                  <Typography color="text.secondary">{formData.services}</Typography>
                </Box>

                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Experience</Typography>
                  <Typography>{formData.years_experience} experience</Typography>
                  <Typography color="text.secondary">Languages: {formData.languages}</Typography>
                </Box>

                <Alert severity="info">
                  After submission, we&apos;ll review your application and schedule a video verification interview within 5-7 business days.
                </Alert>
              </Stack>
            )}

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<BackIcon />}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ bgcolor: nyuchiColors.sunsetOrange }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowIcon />}
                  sx={{ bgcolor: nyuchiColors.sunsetOrange }}
                >
                  Continue
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Links */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Looking for a local expert?{' '}
            <Link href="/community/directory" style={{ color: nyuchiColors.sunsetOrange }}>
              Browse our expert directory
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
