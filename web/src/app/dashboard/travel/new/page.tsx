/**
 * 🇿🇼 Nyuchi Travel - New Business Listing
 * "I am because we are" - List your travel business
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  FlightTakeoff as TravelIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../../../theme/zimbabwe-theme';

const BUSINESS_TYPES = [
  'Tour Operator',
  'Safari Guide',
  'Accommodation',
  'Restaurant',
  'Transport',
  'Activity Provider',
  'Travel Agency',
  'Cultural Experience',
];

const COUNTRIES = [
  'Zimbabwe',
  'South Africa',
  'Kenya',
  'Tanzania',
  'Botswana',
  'Zambia',
  'Namibia',
  'Mozambique',
  'Ghana',
  'Nigeria',
  'Other',
];

const steps = ['Business Details', 'Location', 'Services', 'Review'];

export default function NewTravelBusinessPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    description: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    services: '',
    specialties: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.business_name || !formData.business_type)) {
      setError('Please fill in business name and type');
      return;
    }
    if (activeStep === 1 && !formData.country) {
      setError('Please select a country');
      return;
    }
    setActiveStep((prev) => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/travel/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/travel');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Card sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', p: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: `${nyuchiColors.zimbabweGreen}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckIcon sx={{ fontSize: 40, color: nyuchiColors.zimbabweGreen }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Listing Submitted!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Your travel business listing has been submitted for review.
            You'll earn Ubuntu points once approved!
          </Typography>
          <Typography variant="body2" color="primary">
            +75 Ubuntu Points (pending approval)
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button component={Link} href="/dashboard/travel" startIcon={<BackIcon />} color="inherit">
          Back
        </Button>
        <Box>
          <Typography variant="h5" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TravelIcon sx={{ color: nyuchiColors.sunsetOrange }} />
            List Your Travel Business
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join our verified travel directory
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step 0: Business Details */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Business Details
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={formData.business_name}
                  onChange={handleChange('business_name')}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Business Type"
                  value={formData.business_type}
                  onChange={handleChange('business_type')}
                  required
                >
                  {BUSINESS_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  placeholder="Describe your business, what makes it unique, and why travelers should choose you..."
                />
              </Grid>
            </Grid>
          )}

          {/* Step 1: Location */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Country"
                  value={formData.country}
                  onChange={handleChange('country')}
                  required
                >
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={handleChange('city')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={handleChange('address')}
                  placeholder="Street address or landmark"
                />
              </Grid>
            </Grid>
          )}

          {/* Step 2: Services */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Services & Contact
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="+263 77 123 4567"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={handleChange('website')}
                  placeholder="https://yourbusiness.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Services Offered"
                  value={formData.services}
                  onChange={handleChange('services')}
                  placeholder="Safari tours, Airport transfers, Accommodation booking..."
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3: Review */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Listing
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Business Name
                  </Typography>
                  <Typography>{formData.business_name || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Business Type
                  </Typography>
                  <Typography>{formData.business_type || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography>{formData.description || '-'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Location
                  </Typography>
                  <Typography>
                    {[formData.city, formData.country].filter(Boolean).join(', ') || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography>{formData.email || formData.phone || '-'}</Typography>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                Your listing will be reviewed by our team. Once approved, you'll earn{' '}
                <strong>+75 Ubuntu Points</strong> and your business will appear in the travel directory.
              </Alert>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button onClick={handleBack} disabled={activeStep === 0} startIcon={<BackIcon />}>
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext} endIcon={<NextIcon />}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<CheckIcon />}
              >
                {loading ? 'Submitting...' : 'Submit Listing'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
