/**
 * 🇿🇼 Nyuchi Platform - Create Content
 * Shopify-style content editor
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  MenuItem,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../../lib/auth-context';
import Link from 'next/link';

const CONTENT_TYPES = [
  'Article',
  'Guide',
  'Tutorial',
  'Case Study',
  'News',
  'Opinion',
  'Success Story',
  'Travel Guide',
  'Business Spotlight',
];

const CATEGORIES = [
  'Business',
  'Technology',
  'Travel & Tourism',
  'Finance',
  'Agriculture',
  'Culture',
  'Entrepreneurship',
  'Pan-African',
];

export default function NewContentPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saveType, setSaveType] = useState<'draft' | 'publish'>('draft');

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'Article',
    category: 'Business',
    content: '',
    excerpt: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        status: saveType === 'publish' ? 'pending' : 'draft',
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create content');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard/content'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/dashboard/content"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Content
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          Create Content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share knowledge and insights with the community
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Content created successfully! Redirecting...
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Main Editor */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <TextField
                fullWidth
                required
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                sx={{ mb: 3 }}
                placeholder="Enter a compelling title..."
              />

              <TextField
                fullWidth
                required
                multiline
                rows={2}
                label="Excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                sx={{ mb: 3 }}
                placeholder="Brief summary (shown in previews)"
                helperText="Keep it under 200 characters"
              />

              <TextField
                fullWidth
                required
                multiline
                rows={16}
                label="Content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your content here... (Markdown supported)"
              />
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Metadata */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Metadata
              </Typography>

              <TextField
                fullWidth
                required
                select
                label="Content Type"
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                sx={{ mb: 2 }}
              >
                {CONTENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                required
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                sx={{ mb: 2 }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="entrepreneurship, tech, africa"
                helperText="Comma-separated tags"
              />
            </Paper>

            {/* Ubuntu Points Info */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Ubuntu Points Reward
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Published content earns <strong>+100 Ubuntu Points</strong>.
                High-quality content may be featured on the community page!
              </Typography>
            </Paper>

            {/* Publish Options */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ mb: 2 }}>
                  Save As
                </FormLabel>
                <RadioGroup
                  value={saveType}
                  onChange={(e) => setSaveType(e.target.value as 'draft' | 'publish')}
                >
                  <FormControlLabel
                    value="draft"
                    control={<Radio />}
                    label="Draft"
                  />
                  <FormControlLabel
                    value="publish"
                    control={<Radio />}
                    label="Submit for Review"
                  />
                </RadioGroup>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Content is reviewed before publishing to maintain community quality.
              </Typography>
            </Paper>

            {/* Actions */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={saveType === 'publish' ? <PublishIcon /> : <SaveIcon />}
            >
              {loading
                ? 'Saving...'
                : saveType === 'publish'
                ? 'Submit for Review'
                : 'Save Draft'}
            </Button>
            <Button
              fullWidth
              component={Link}
              href="/dashboard/content"
              sx={{ mt: 1 }}
              disabled={loading}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
