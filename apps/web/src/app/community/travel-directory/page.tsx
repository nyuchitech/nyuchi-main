/**
 * 🇿🇼 Nyuchi Community Travel Directory
 * "I am because we are" - Public travel business directory (no auth required)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Skeleton,
  Button,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FlightTakeoff as TravelIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  Explore as ExploreIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ZimbabweFlagStrip } from '../../../components/ZimbabweFlagStrip';

interface TravelBusiness {
  id: string;
  business_name: string;
  business_type: string;
  country: string;
  city: string | null;
  description: string;
  website: string | null;
  verification_status: string;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  highlights: string[];
}

const FEATURED_DESTINATIONS: Destination[] = [
  {
    id: 'victoria-falls',
    name: 'Victoria Falls',
    country: 'Zimbabwe',
    description: 'One of the Seven Natural Wonders of the World.',
    highlights: ['Adventure sports', 'Safari tours', 'Cultural experiences'],
  },
  {
    id: 'serengeti',
    name: 'Serengeti',
    country: 'Tanzania',
    description: 'World-famous for the great wildebeest migration.',
    highlights: ['Wildlife safaris', 'Hot air balloons', 'Luxury camps'],
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    description: 'Mother City with stunning natural beauty.',
    highlights: ['Table Mountain', 'Wine tours', 'Beaches'],
  },
  {
    id: 'masai-mara',
    name: 'Masai Mara',
    country: 'Kenya',
    description: 'Africa\'s most famous wildlife reserve.',
    highlights: ['Big Five', 'Cultural visits', 'Balloon safaris'],
  },
];

const BUSINESS_TYPES = [
  'Tour Operator',
  'Safari Guide',
  'Accommodation',
  'Transport',
  'Activity Provider',
];

const COUNTRIES = ['Zimbabwe', 'South Africa', 'Kenya', 'Tanzania', 'Botswana', 'Zambia'];

export default function CommunityTravelDirectoryPage() {
  const [tabValue, setTabValue] = useState(0);
  const [businesses, setBusinesses] = useState<TravelBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [country, setCountry] = useState('');

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (businessType) params.set('type', businessType);
      if (country) params.set('country', country);
      params.set('limit', '20');

      const response = await fetch(`/api/community/travel?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setLoading(false);
    }
  }, [search, businessType, country]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchBusinesses();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchBusinesses]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ZimbabweFlagStrip />

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, ml: '8px' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TravelIcon sx={{ fontSize: 48 }} />
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontFamily: 'Playfair Display, serif' }}
            >
              Travel Directory
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Discover verified African travel businesses and experiences
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, ml: { xs: 2, md: 'auto' } }}>
        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab icon={<ExploreIcon />} label="Destinations" iconPosition="start" />
          <Tab icon={<TravelIcon />} label="Travel Businesses" iconPosition="start" />
        </Tabs>

        {/* Tab 0: Destinations */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              Featured African Destinations
            </Typography>
            <Grid container spacing={3}>
              {FEATURED_DESTINATIONS.map((destination) => (
                <Grid item xs={12} sm={6} md={3} key={destination.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                    }}
                  >
                    <Box
                      sx={{
                        height: 120,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LocationIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                    </Box>
                    <CardContent>
                      <Typography variant="h6">{destination.name}</Typography>
                      <Chip
                        label={destination.country}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {destination.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {destination.highlights.slice(0, 2).map((h) => (
                          <Chip key={h} label={h} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 1: Travel Businesses */}
        {tabValue === 1 && (
          <Box>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={businessType}
                  label="Type"
                  onChange={(e) => setBusinessType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {BUSINESS_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={country}
                  label="Country"
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <MenuItem value="">All Countries</MenuItem>
                  {COUNTRIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Results */}
            {loading ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card>
                      <CardContent>
                        <Skeleton variant="text" width="60%" height={32} />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="100%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : businesses.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <TravelIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No travel businesses found
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search or filters
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearch('');
                    setBusinessType('');
                    setCountry('');
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {businesses.map((business) => (
                  <Grid item xs={12} sm={6} md={4} key={business.id}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        '&:hover': { boxShadow: 3 },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {business.business_name}
                          </Typography>
                          {business.verification_status === 'approved' && (
                            <VerifiedIcon color="primary" fontSize="small" />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={business.business_type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            icon={<LocationIcon fontSize="small" />}
                            label={
                              business.city
                                ? `${business.city}, ${business.country}`
                                : business.country
                            }
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          {business.description?.slice(0, 120)}
                          {business.description?.length > 120 ? '...' : ''}
                        </Typography>
                        {business.website && (
                          <Button
                            component="a"
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="text"
                            size="small"
                          >
                            Visit Website
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Back Link */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button component={Link} href="/community" variant="outlined">
            Back to Community
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
