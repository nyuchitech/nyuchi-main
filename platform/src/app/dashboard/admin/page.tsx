/**
 * 🇿🇼 Nyuchi Platform - Admin Dashboard
 * Administrative controls and moderation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../lib/auth-context';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

interface ContentAPIItem {
  id: string;
  title: string;
  author_email?: string;
  created_at: string;
  status: string;
}

interface DirectoryAPIItem {
  id: string;
  name: string;
  contact_email?: string;
  created_at: string;
  status: string;
}

interface PendingItem {
  id: string;
  type: 'content' | 'directory';
  title: string;
  author: string;
  created_at: string;
  status: string;
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState(0);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingItems = useCallback(async () => {
    try {
      // Fetch pending content and directory listings
      const [contentRes, directoryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/directory?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const contentData = await contentRes.json();
      const directoryData = await directoryRes.json();

      const items: PendingItem[] = [
        ...((contentData.data || []) as ContentAPIItem[]).map((item) => ({
          id: item.id,
          type: 'content' as const,
          title: item.title,
          author: item.author_email || 'Unknown',
          created_at: item.created_at,
          status: item.status,
        })),
        ...((directoryData.data || []) as DirectoryAPIItem[]).map((item) => ({
          id: item.id,
          type: 'directory' as const,
          title: item.name,
          author: item.contact_email || 'Unknown',
          created_at: item.created_at,
          status: item.status,
        })),
      ];

      setPendingItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    fetchPendingItems();
  }, [user, fetchPendingItems]);

  const handleApprove = async (id: string, type: string) => {
    try {
      const endpoint = type === 'content' ? 'content' : 'directory';
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPendingItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    }
  };

  const handleReject = async (id: string, type: string) => {
    try {
      const endpoint = type === 'content' ? 'content' : 'directory';
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPendingItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Access denied. You need admin privileges to view this page.
        </Alert>
      </Box>
    );
  }

  const stats = [
    {
      title: 'Pending Reviews',
      value: pendingItems.length.toString(),
      icon: WarningIcon,
      color: nyuchiColors.zimbabweYellow,
    },
    {
      title: 'Total Users',
      value: '1',
      icon: PeopleIcon,
      color: nyuchiColors.zimbabweGreen,
    },
    {
      title: 'Total Content',
      value: '0',
      icon: ArticleIcon,
      color: nyuchiColors.sunsetOrange,
    },
    {
      title: 'Total Listings',
      value: '0',
      icon: BusinessIcon,
      color: nyuchiColors.charcoal,
    },
  ];

  const contentItems = pendingItems.filter((item) => item.type === 'content');
  const directoryItems = pendingItems.filter((item) => item.type === 'directory');

  return (
    <Box sx={{ p: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage platform content, users, and settings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <Card elevation={0}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {stat.title}
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color: stat.color, fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Pending Items */}
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{
            px: 3,
            pt: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab label={`Content (${contentItems.length})`} />
          <Tab label={`Directory (${directoryItems.length})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">Loading...</Typography>
                  </TableCell>
                </TableRow>
              ) : (tab === 0 ? contentItems : directoryItems).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      No pending {tab === 0 ? 'content' : 'listings'} to review
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (tab === 0 ? contentItems : directoryItems).map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{item.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.type}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color="warning"
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="View">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Approve"
                        color="success"
                        onClick={() => handleApprove(item.id, item.type)}
                      >
                        <ApproveIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Reject"
                        color="error"
                        onClick={() => handleReject(item.id, item.type)}
                      >
                        <RejectIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
