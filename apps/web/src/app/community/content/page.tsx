/**
 * 🇿🇼 Nyuchi Community Content
 * "I am because we are" - Public articles and guides (no auth required)
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
  CardMedia,
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
  Article as ArticleIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { ZimbabweFlagStrip } from '../../../components/ZimbabweFlagStrip';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  view_count: number;
  published_at: string;
}

interface Categories {
  content_categories: string[];
}

export default function CommunityContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Categories | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [contentType, setContentType] = useState('');

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (contentType) params.set('type', contentType);
      params.set('limit', '20');

      const response = await fetch(`/api/community/content?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  }, [category, contentType]);

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
    fetchContent();
  }, [fetchContent]);

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

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
            Community Content
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Articles, guides, and success stories from the community
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4, ml: { xs: 2, md: 'auto' } }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories?.content_categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={contentType}
              label="Type"
              onChange={(e) => setContentType(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="article">Articles</MenuItem>
              <MenuItem value="guide">Guides</MenuItem>
              <MenuItem value="story">Stories</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Results */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={28} />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="100%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : content.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ArticleIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No content found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filters or check back later
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setCategory('');
                setContentType('');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {content.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 3 },
                  }}
                >
                  {item.featured_image_url && (
                    <CardMedia
                      component="div"
                      sx={{
                        height: 160,
                        bgcolor: 'grey.200',
                        backgroundImage: `url(${item.featured_image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={item.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={item.content_type}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.published_at)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ViewIcon fontSize="small" color="disabled" />
                        <Typography variant="caption" color="text.secondary">
                          {item.view_count}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
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
