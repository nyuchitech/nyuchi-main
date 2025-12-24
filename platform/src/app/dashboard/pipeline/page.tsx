/**
 * Unified Pipeline Management Page
 * Role-based view of all submissions across the platform
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ClipboardList,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Edit,
  RefreshCw,
  FileText,
  User,
  Building2,
  Store,
  Plane,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Submission {
  id: string
  user_id: string
  submission_type: string
  reference_id: string
  title: string
  description: string | null
  status: string
  assigned_to: string | null
  reviewer_notes: string | null
  submitted_at: string | null
  reviewed_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

interface PipelineStats {
  [key: string]: {
    submitted: number
    in_review: number
    needs_changes: number
    approved: number
    rejected: number
    published: number
  }
}

const PIPELINE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  content: { label: 'Content', icon: FileText },
  expert_application: { label: 'Expert Applications', icon: User },
  business_application: { label: 'Business Applications', icon: Building2 },
  directory_listing: { label: 'Directory Listings', icon: Store },
  travel_business: { label: 'Travel Businesses', icon: Plane },
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  submitted: 'default',
  in_review: 'warning',
  needs_changes: 'warning',
  approved: 'success',
  rejected: 'destructive',
  published: 'success',
}

export default function PipelinePage() {
  const { user, token } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState<PipelineStats>({})
  const [pipelines, setPipelines] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const [statsRes, submissionsRes] = await Promise.all([
        fetch('/api/pipeline/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/pipeline/submissions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || {})
        const pipelineList = statsData.pipelines || []
        setPipelines(pipelineList)
        if (pipelineList.length > 0 && !activeTab) {
          setActiveTab(pipelineList[0])
        }
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData.submissions || [])
      }
    } catch {
      setError('Failed to load pipeline data')
    } finally {
      setLoading(false)
    }
  }, [token, activeTab])

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token, fetchData])

  const handleStatusUpdate = async (status: string) => {
    if (!selectedSubmission || !token) return

    setActionLoading(true)
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
      })

      if (response.ok) {
        fetchData()
        setReviewDialogOpen(false)
        setReviewNotes('')
      }
    } catch {
      setError('Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const openReviewDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setReviewDialogOpen(true)
  }

  const filteredSubmissions = activeTab
    ? submissions.filter(s => s.submission_type === activeTab)
    : submissions

  const getPendingCount = (pipelineType: string) => {
    return submissions.filter(
      s => s.submission_type === pipelineType && (s.status === 'submitted' || s.status === 'in_review')
    ).length
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to access the pipeline.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Pipeline</h1>
            <p className="text-sm text-muted-foreground">
              Manage submissions across all platforms
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {pipelines.map((pipeline) => {
          const pipelineStats = stats[pipeline] || {}
          const pending = (pipelineStats.submitted || 0) + (pipelineStats.in_review || 0)
          const PipelineIcon = PIPELINE_LABELS[pipeline]?.icon || FileText

          return (
            <Card
              key={pipeline}
              className={cn(
                'cursor-pointer transition-colors hover:bg-muted/50',
                activeTab === pipeline && 'ring-2 ring-primary'
              )}
              onClick={() => setActiveTab(pipeline)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <PipelineIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium truncate">
                    {PIPELINE_LABELS[pipeline]?.label || pipeline}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {pending > 0 && (
                    <Badge variant="warning" className="text-xs">
                      {pending} pending
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {pipelineStats.published || 0} published
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              {pipelines.map((pipeline) => {
                const pending = getPendingCount(pipeline)
                return (
                  <TabsTrigger
                    key={pipeline}
                    value={pipeline}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    <span className="flex items-center gap-2">
                      {PIPELINE_LABELS[pipeline]?.label || pipeline}
                      {pending > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 min-w-[20px] px-1.5">
                          {pending}
                        </Badge>
                      )}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </Tabs>
      </Card>

      {/* Submissions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No submissions in this pipeline
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <p className="font-medium">{submission.title}</p>
                    {submission.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {submission.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {PIPELINE_LABELS[submission.submission_type]?.label || submission.submission_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[submission.status] || 'default'}>
                      {submission.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.submitted_at
                      ? new Date(submission.submitted_at).toLocaleDateString()
                      : new Date(submission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {submission.assigned_to ? (
                      <span className="text-sm">Assigned</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusUpdate('in_review')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Take for Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openReviewDialog(submission)}>
                          <CheckCircle className="h-4 w-4 mr-2 text-mineral-malachite" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openReviewDialog(submission)}>
                          <XCircle className="h-4 w-4 mr-2 text-destructive" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate('needs_changes')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Request Changes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSubmission?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add notes for the submitter..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={actionLoading}
            >
              Reject
            </Button>
            <Button
              className="bg-mineral-malachite hover:bg-mineral-malachite/90"
              onClick={() => handleStatusUpdate('approved')}
              disabled={actionLoading}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
