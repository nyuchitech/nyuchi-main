/**
 * Unified Pipeline Management Page
 * Role-based view of all submissions across the platform
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Badge,
} from '@mui/material';
import {
  Assignment as PipelineIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as ReviewIcon,
  Refresh as RefreshIcon,
  Article as ContentIcon,
  Person as ExpertIcon,
  Business as BusinessIcon,
  Store as DirectoryIcon,
  FlightTakeoff as TravelIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../lib/auth-context';
import { nyuchiColors } from '../../../theme/zimbabwe-theme';

interface Submission {
  id: string;
  user_id: string;
  submission_type: string;
  reference_id: string;
  title: string;
  description: string | null;
  status: string;
  assigned_to: string | null;
  reviewer_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PipelineStats {
  [key: string]: {
    submitted: number;
    in_review: number;
    needs_changes: number;
    approved: number;
    rejected: number;
    published: number;
  };
}

const PIPELINE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  content: { label: 'Content', icon: ContentIcon },
  expert_application: { label: 'Expert Applications', icon: ExpertIcon },
  business_application: { label: 'Business Applications', icon: BusinessIcon },
  directory_listing: { label: 'Directory Listings', icon: DirectoryIcon },
  travel_business: { label: 'Travel Businesses', icon: TravelIcon },
};

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  submitted: 'info',
  in_review: 'warning',
  needs_changes: 'warning',
  approved: 'success',
  rejected: 'error',
  published: 'success',
};

export default function PipelinePage() {
  const { user, token } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<PipelineStats>({});
  const [pipelines, setPipelines] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      // Fetch stats and submissions in parallel
      const [statsRes, submissionsRes] = await Promise.all([
        fetch('/api/pipeline/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/pipeline/submissions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || {});
        setPipelines(statsData.pipelines || []);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData.submissions || []);
      }
    } catch {
      setError('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, fetchData]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, submission: Submission) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubmission(submission);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedSubmission || !token) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/pipeline/submissions/${selectedSubmission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          reviewer_notes: reviewNotes || undefined,
        }),
      });

      if (response.ok) {
        fetchData();
        setReviewDialogOpen(false);
        setReviewNotes('');
      }
    } catch {
      setError('Failed to update status');
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };

  const openReviewDialog = (_action: 'approve' | 'reject') => {
    setReviewDialogOpen(true);
    handleMenuClose();
  };

  const currentPipeline = pipelines[activeTab] || 'all';
  const filteredSubmissions = currentPipeline === 'all'
    ? submissions
    : submissions.filter(s => s.submission_type === currentPipeline);

  // Count pending items for badges
  const getPendingCount = (pipelineType: string) => {
    return submissions.filter(
      s => s.submission_type === pipelineType && (s.status === 'submitted' || s.status === 'in_review')
    ).length;
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to access the pipeline.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PipelineIcon sx={{ fontSize: 32, color: nyuchiColors.sunsetOrange }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Pipeline
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage submissions across all platforms
            </Typography>
          </Box>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        {pipelines.map((pipeline) => {
          const pipelineStats = stats[pipeline] || {};
          const pending = (pipelineStats.submitted || 0) + (pipelineStats.in_review || 0);
          const PipelineIcon = PIPELINE_LABELS[pipeline]?.icon || ContentIcon;

          return (
            <Card key={pipeline} sx={{ cursor: 'pointer' }} onClick={() => setActiveTab(pipelines.indexOf(pipeline))}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PipelineIcon sx={{ fontSize: 20, color: nyuchiColors.sunsetOrange }} />
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {PIPELINE_LABELS[pipeline]?.label || pipeline}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {pending > 0 && (
                    <Chip label={`${pending} pending`} size="small" color="warning" />
                  )}
                  <Chip label={`${pipelineStats.published || 0} published`} size="small" color="success" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {pipelines.map((pipeline) => {
            const pending = getPendingCount(pipeline);
            return (
              <Tab
                key={pipeline}
                label={
                  <Badge badgeContent={pending} color="error" max={99}>
                    <Box sx={{ px: 1 }}>{PIPELINE_LABELS[pipeline]?.label || pipeline}</Box>
                  </Badge>
                }
              />
            );
          })}
        </Tabs>
      </Card>

      {/* Submissions Table */}
      <Card>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredSubmissions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No submissions in this pipeline</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {submission.title}
                      </Typography>
                      {submission.description && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                          {submission.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PIPELINE_LABELS[submission.submission_type]?.label || submission.submission_type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status.replace('_', ' ')}
                        size="small"
                        color={STATUS_COLORS[submission.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleDateString()
                        : new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {submission.assigned_to ? (
                        <Typography variant="body2">Assigned</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, submission)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusUpdate('in_review')}>
          <ReviewIcon sx={{ mr: 1 }} fontSize="small" />
          Take for Review
        </MenuItem>
        <MenuItem onClick={() => openReviewDialog('approve')}>
          <ApproveIcon sx={{ mr: 1, color: 'success.main' }} fontSize="small" />
          Approve
        </MenuItem>
        <MenuItem onClick={() => openReviewDialog('reject')}>
          <RejectIcon sx={{ mr: 1, color: 'error.main' }} fontSize="small" />
          Reject
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('needs_changes')}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          Request Changes
        </MenuItem>
      </Menu>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSubmission?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Reviewer Notes"
            multiline
            rows={4}
            fullWidth
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add notes for the submitter..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleStatusUpdate('rejected')}
            disabled={actionLoading}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleStatusUpdate('approved')}
            disabled={actionLoading}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
