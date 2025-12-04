/**
 * 🇿🇼 Nyuchi Platform - Settings & Profile
 * User preferences and account management
 */

'use client';

import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { useTheme } from '../../../components/ThemeProvider';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  company: string | null;
  country: string | null;
  role: string;
  ubuntu_score: number;
  contribution_count: number;
  created_at: string;
}

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth();
  const { mode, setMode } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || !token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profiles/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFullName(data.full_name || '');
          setCompany(data.company || '');
          setCountry(data.country || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, token]);

  const handleSave = async () => {
    if (!user?.id || !token) return;

    setSuccess('');
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          company: company || null,
          country: country || null,
          avatar_url: avatarUrl || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const updated = await res.json();
      setProfile(updated);

      // Refresh user in global auth context
      await refreshUser();

      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account and preferences
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Profile Information
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                  <Avatar
                    src={avatarUrl || undefined}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: nyuchiColors.sunsetOrange,
                      fontSize: '2rem',
                      fontWeight: 700,
                    }}
                  >
                    {fullName?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {fullName || profile?.email?.split('@')[0]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile?.role || 'User'}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile?.email || ''}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Your company name"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Zimbabwe"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Avatar URL"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      helperText="URL to your profile picture"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={profile?.role || 'user'}
                      disabled
                      helperText="Contact admin to change your role"
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>

          {/* Appearance */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Appearance
            </Typography>

            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 2 }}>
                Theme
              </FormLabel>
              <RadioGroup
                value={mode}
                onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}
              >
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label="Light"
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label="Dark"
                />
                <FormControlLabel
                  value="system"
                  control={<Radio />}
                  label="System (Auto)"
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Account Stats
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Ubuntu Score
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {profile?.ubuntu_score || 0}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Contributions
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {profile?.contribution_count || 0}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="body2">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'Recently'}
              </Typography>
            </Box>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            size="large"
            disabled={saving || loading}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
