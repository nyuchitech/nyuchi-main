/**
 * 🇿🇼 Nyuchi Community Directory
 * "I am because we are" - Public business directory (no auth required)
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ZimbabweFlagStrip } from '../../../components/ZimbabweFlagStrip';

interface Listing {
  id: string;
  business_name: string;
  business_type: string;
  category: string;
  country: string;
  city: string | null;
  description: string;
  website: string | null;
  verification_status: string;
  created_at: string;
}

interface Categories {
  directory_categories: string[];
  countries: string[];
}

export default function CommunityDirectoryPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Categories | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (country) params.set('country', country);
      params.set('limit', '20');

      const response = await fetch(`/api/community/directory?${params}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, country]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/community/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchListings]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <ZimbabweFlagStrip />

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, ml: '8px' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontFamily: 'Playfair Display, serif' }}
          >
            Business Directory
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Discover African businesses and entrepreneurs
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, ml: { xs: 2, md: 'auto' } }}>
        {/* Filters */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap',
          }}
        >
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
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories?.directory_categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
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
              {categories?.countries.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
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
                    <Skeleton variant="text" width="80%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : listings.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BusinessIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No businesses found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filters
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearch('');
                setCategory('');
                setCountry('');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {listings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 3 },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                        {listing.business_name}
                      </Typography>
                      {listing.verification_status === 'approved' && (
                        <VerifiedIcon color="primary" fontSize="small" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={listing.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<LocationIcon fontSize="small" />}
                        label={listing.city ? `${listing.city}, ${listing.country}` : listing.country}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {listing.description}
                    </Typography>
                  </CardContent>
                  {listing.website && (
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        component="a"
                        href={listing.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="text"
                        size="small"
                      >
                        Visit Website
                      </Button>
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
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
