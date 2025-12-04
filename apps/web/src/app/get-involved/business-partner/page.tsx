/**
 * Business Partner Network Page
 * List your business in the community directory
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
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

const BUSINESS_CATEGORIES = [
  'accommodation',
  'activities',
  'dining',
  'transport',
  'shopping',
  'services',
  'attractions',
  'wellness',
];

const LISTING_TYPES = [
  {
    id: 'free',
    name: 'Free Listing',
    price: 'Free Forever',
    features: ['Business name & contact', 'Map location', 'Basic description', 'Category listing', 'Search visibility', 'Unlimited updates'],
  },
  {
    id: 'verified',
    name: 'Verified Listing',
    price: 'Free',
    features: ['Everything in Free', 'Verification badge', 'Priority in search', 'Enhanced credibility', 'Trust signals'],
  },
  {
    id: 'premium',
    name: 'Business Promotion',
    price: '$100 One-time',
    features: ['Everything in Verified', 'Custom social content', 'Destination guide placement', 'Professional imagery', 'Long-term visibility'],
  },
];

const steps = ['Business Details', 'Contact Info', 'Listing Type', 'Review'];

export default function BusinessPartnerPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    subcategory: '',
    location: '',
    description: '',
    target_travelers: '',
    listing_type: 'free',
    promotion_interest: false,
    amenities: [] as string[],
    price_range: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    // Validation for each step
    if (activeStep === 0) {
      if (!formData.business_name || !formData.category || !formData.location || !formData.description) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.contact_person || !formData.email || !formData.phone) {
        setError('Please fill in all contact information');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
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
      const response = await fetch('/api/get-involved/businesses', {
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
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your business listing has been submitted for review. We&apos;ll notify you once it&apos;s published.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button component={Link} href="/community/directory" variant="outlined">
                View Directory
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
            <BusinessIcon sx={{ fontSize: 40, color: nyuchiColors.sunsetOrange }} />
            <Typography variant="h3" fontFamily="Playfair Display" fontWeight={700}>
              Business Partner Network
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
            List your tourism business and connect with travelers seeking authentic Zimbabwe experiences.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Listing Types Overview */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Listing Options
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {LISTING_TYPES.map((type) => (
              <Card
                key={type.id}
                sx={{
                  p: 2,
                  border: formData.listing_type === type.id ? `2px solid ${nyuchiColors.sunsetOrange}` : '1px solid',
                  borderColor: formData.listing_type === type.id ? nyuchiColors.sunsetOrange : 'divider',
                  cursor: activeStep === 2 ? 'pointer' : 'default',
                }}
                onClick={() => activeStep === 2 && setFormData({ ...formData, listing_type: type.id })}
              >
                <Typography variant="subtitle1" fontWeight={600}>{type.name}</Typography>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>{type.price}</Typography>
                <Stack spacing={0.5}>
                  {type.features.slice(0, 3).map((feature) => (
                    <Typography key={feature} variant="caption" color="text.secondary">
                      {feature}
                    </Typography>
                  ))}
                </Stack>
              </Card>
            ))}
          </Box>
        </Box>

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
            {/* Step 0: Business Details */}
            {activeStep === 0 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Business Details</Typography>
                <TextField
                  label="Business Name"
                  value={formData.business_name}
                  onChange={handleChange('business_name')}
                  fullWidth
                  required
                />
                <TextField
                  label="Business Category"
                  value={formData.category}
                  onChange={handleChange('category')}
                  select
                  fullWidth
                  required
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Location (City, Region)"
                  value={formData.location}
                  onChange={handleChange('location')}
                  fullWidth
                  required
                  placeholder="e.g., Victoria Falls, Matabeleland North"
                />
                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={4}
                  fullWidth
                  required
                  placeholder="Describe your business, services, and what makes you unique..."
                />
                <TextField
                  label="Target Travelers (Optional)"
                  value={formData.target_travelers}
                  onChange={handleChange('target_travelers')}
                  fullWidth
                  placeholder="e.g., Adventure seekers, Families, Luxury travelers"
                />
              </Stack>
            )}

            {/* Step 1: Contact Info */}
            {activeStep === 1 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Contact Information</Typography>
                <TextField
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={handleChange('contact_person')}
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
                  label="Website (Optional)"
                  value={formData.website}
                  onChange={handleChange('website')}
                  fullWidth
                  placeholder="https://..."
                />
              </Stack>
            )}

            {/* Step 2: Listing Type */}
            {activeStep === 2 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Choose Your Listing Type</Typography>
                <Typography color="text.secondary">
                  Select the listing option that best fits your needs. You can always upgrade later.
                </Typography>
                <Stack spacing={2}>
                  {LISTING_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: formData.listing_type === type.id ? `2px solid ${nyuchiColors.sunsetOrange}` : '1px solid',
                        borderColor: formData.listing_type === type.id ? nyuchiColors.sunsetOrange : 'divider',
                        bgcolor: formData.listing_type === type.id ? `${nyuchiColors.sunsetOrange}08` : 'background.paper',
                      }}
                      onClick={() => setFormData({ ...formData, listing_type: type.id })}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>{type.name}</Typography>
                          <Typography variant="h5" color="primary">{type.price}</Typography>
                        </Box>
                        {formData.listing_type === type.id && (
                          <CheckIcon sx={{ color: nyuchiColors.sunsetOrange }} />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {type.features.map((feature) => (
                          <Chip key={feature} label={feature} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Step 3: Review */}
            {activeStep === 3 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600}>Review Your Application</Typography>

                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Business</Typography>
                  <Typography variant="h6">{formData.business_name}</Typography>
                  <Typography color="text.secondary">{formData.category} - {formData.location}</Typography>
                </Box>

                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                  <Typography>{formData.contact_person}</Typography>
                  <Typography color="text.secondary">{formData.email} | {formData.phone}</Typography>
                </Box>

                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Listing Type</Typography>
                  <Typography variant="h6">
                    {LISTING_TYPES.find(t => t.id === formData.listing_type)?.name}
                  </Typography>
                </Box>

                <Alert severity="info">
                  Your listing will appear in the community directory after review. Most listings are approved within 24-48 hours.
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
            Already listed?{' '}
            <Link href="/community/directory" style={{ color: nyuchiColors.sunsetOrange }}>
              View the directory
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
