/**
 * 🇿🇼 Nyuchi Travel Platform Dashboard
 * "I am because we are" - Discover African destinations and travel businesses
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FlightTakeoff as TravelIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

interface TravelBusiness {
  id: string;
  business_name: string;
  business_type: string;
  country: string;
  city: string | null;
  description: string;
  verification_status: string;
  image_url: string | null;
}

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image_url: string | null;
  highlights: string[];
}

const FEATURED_DESTINATIONS: Destination[] = [
  {
    id: 'victoria-falls',
    name: 'Victoria Falls',
    country: 'Zimbabwe',
    description: 'One of the Seven Natural Wonders of the World, known locally as "Mosi-oa-Tunya" - The Smoke That Thunders.',
    image_url: '/images/destinations/victoria-falls.jpg',
    highlights: ['Bungee jumping', 'White water rafting', 'Safari tours', 'Helicopter flights'],
  },
  {
    id: 'great-zimbabwe',
    name: 'Great Zimbabwe',
    country: 'Zimbabwe',
    description: 'Ancient stone city and UNESCO World Heritage Site, showcasing remarkable African architectural achievements.',
    image_url: '/images/destinations/great-zimbabwe.jpg',
    highlights: ['Historical tours', 'Archaeological sites', 'Cultural experiences', 'Bird watching'],
  },
  {
    id: 'hwange',
    name: 'Hwange National Park',
    country: 'Zimbabwe',
    description: "Zimbabwe's largest game reserve, home to one of Africa's largest elephant populations.",
    image_url: '/images/destinations/hwange.jpg',
    highlights: ['Big Five safaris', 'Night drives', 'Walking safaris', 'Bird watching'],
  },
  {
    id: 'cape-town',
    name: 'Cape Town',
    country: 'South Africa',
    description: 'Mother City at the foot of Table Mountain, blending natural beauty with urban sophistication.',
    image_url: '/images/destinations/cape-town.jpg',
    highlights: ['Table Mountain', 'Wine tours', 'Beaches', 'Cultural experiences'],
  },
];

export default function TravelDashboardPage() {
  const [tabValue, setTabValue] = useState(0);
  const [businesses, setBusinesses] = useState<TravelBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTravelBusinesses() {
      try {
        const response = await fetch('/api/travel/businesses?limit=12');
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
        }
      } catch (error) {
        console.error('Failed to fetch travel businesses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTravelBusinesses();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TravelIcon sx={{ color: nyuchiColors.sunsetOrange }} />
            Travel Platform
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover African destinations and connect with verified travel businesses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/dashboard/travel/new"
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          List Your Business
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab label="Destinations" />
        <Tab label="Travel Businesses" />
        <Tab label="My Listings" />
      </Tabs>

      {/* Tab 0: Destinations */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Featured Destinations
          </Typography>
          <Grid container spacing={3}>
            {FEATURED_DESTINATIONS.map((destination) => (
              <Grid item xs={12} sm={6} md={3} key={destination.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                  }}
                >
                  <CardMedia
                    sx={{
                      height: 160,
                      bgcolor: nyuchiColors.gray200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 48, color: nyuchiColors.gray400 }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {destination.name}
                    </Typography>
                    <Chip
                      label={destination.country}
                      size="small"
                      sx={{ mb: 1, mt: 0.5 }}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {destination.description.slice(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {destination.highlights.slice(0, 2).map((highlight) => (
                        <Chip key={highlight} label={highlight} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Explore More */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" component={Link} href="/community/travel-directory">
              Explore All Destinations
            </Button>
          </Box>
        </Box>
      )}

      {/* Tab 1: Travel Businesses */}
      {tabValue === 1 && (
        <Box>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search travel businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Business Grid */}
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
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
              <BusinessIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No travel businesses listed yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Be the first to list your travel business!
              </Typography>
              <Button variant="contained" component={Link} href="/dashboard/travel/new">
                List Your Business
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {businesses
                .filter((b) => b.business_name.toLowerCase().includes(search.toLowerCase()))
                .map((business) => (
                  <Grid item xs={12} sm={6} md={4} key={business.id}>
                    <Card sx={{ borderRadius: 2, '&:hover': { boxShadow: 3 } }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {business.business_name}
                          </Typography>
                          {business.verification_status === 'approved' && (
                            <VerifiedIcon color="primary" fontSize="small" />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip label={business.business_type} size="small" color="primary" variant="outlined" />
                          <Chip
                            icon={<LocationIcon fontSize="small" />}
                            label={business.city ? `${business.city}, ${business.country}` : business.country}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {business.description?.slice(0, 100)}...
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 2: My Listings */}
      {tabValue === 2 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <TravelIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            You haven't listed any travel businesses yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            List your tour company, guide services, or accommodation to reach travelers
          </Typography>
          <Button variant="contained" component={Link} href="/dashboard/travel/new" startIcon={<AddIcon />}>
            Create Your First Listing
          </Button>
        </Box>
      )}

      {/* Ubuntu Philosophy */}
      <Card
        sx={{
          mt: 4,
          borderRadius: 2,
          bgcolor: `${nyuchiColors.zimbabweGreen}08`,
          border: `1px solid ${nyuchiColors.zimbabweGreen}30`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            Ubuntu Travel Philosophy
          </Typography>
          <Typography variant="body2" color="text.secondary">
            "I am because we are" - Our travel platform connects verified African tourism businesses
            with travelers seeking authentic experiences. By listing your business, you contribute to
            sustainable tourism and help showcase Africa's incredible destinations to the world.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
