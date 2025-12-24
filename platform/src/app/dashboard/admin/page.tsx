/**
 * Nyuchi Platform - Admin Dashboard
 * Administrative controls and moderation
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertTriangle,
  Users,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContentAPIItem {
  id: string
  title: string
  author_email?: string
  created_at: string
  status: string
}

interface DirectoryAPIItem {
  id: string
  name: string
  contact_email?: string
  created_at: string
  status: string
}

interface PendingItem {
  id: string
  type: 'content' | 'directory'
  title: string
  author: string
  created_at: string
  status: string
}

export default function AdminPage() {
  const { user, token } = useAuth()
  const [tab, setTab] = useState('content')
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPendingItems = useCallback(async () => {
    try {
      const [contentRes, directoryRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/directory?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const contentData = await contentRes.json()
      const directoryData = await directoryRes.json()

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
      ]

      setPendingItems(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin privileges required.')
      setLoading(false)
      return
    }
    fetchPendingItems()
  }, [user, fetchPendingItems])

  const handleApprove = async (id: string, type: string) => {
    try {
      const endpoint = type === 'content' ? 'content' : 'directory'
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchPendingItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    }
  }

  const handleReject = async (id: string, type: string) => {
    try {
      const endpoint = type === 'content' ? 'content' : 'directory'
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}/${id}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchPendingItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need admin privileges to view this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const stats = [
    {
      title: 'Pending Reviews',
      value: pendingItems.length.toString(),
      icon: AlertTriangle,
      colorClass: 'text-mineral-gold bg-mineral-gold/10',
    },
    {
      title: 'Total Users',
      value: '1',
      icon: Users,
      colorClass: 'text-mineral-malachite bg-mineral-malachite/10',
    },
    {
      title: 'Total Content',
      value: '0',
      icon: FileText,
      colorClass: 'text-primary bg-primary/10',
    },
    {
      title: 'Total Listings',
      value: '0',
      icon: Building2,
      colorClass: 'text-foreground bg-muted',
    },
  ]

  const contentItems = pendingItems.filter((item) => item.type === 'content')
  const directoryItems = pendingItems.filter((item) => item.type === 'directory')

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage platform content, users, and settings
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <button onClick={() => setError('')}>
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pending Items */}
      <Card>
        <Tabs value={tab} onValueChange={setTab}>
          <div className="px-4 pt-4 border-b">
            <TabsList className="bg-transparent gap-4 p-0 h-auto">
              <TabsTrigger
                value="content"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
              >
                Content ({contentItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="directory"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
              >
                Directory ({directoryItems.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="m-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Author</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : contentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No pending content to review
                    </TableCell>
                  </TableRow>
                ) : (
                  contentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        <Badge variant="warning" className="capitalize">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-mineral-malachite hover:text-mineral-malachite"
                            title="Approve"
                            onClick={() => handleApprove(item.id, item.type)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            title="Reject"
                            onClick={() => handleReject(item.id, item.type)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="directory" className="m-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : directoryItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No pending listings to review
                    </TableCell>
                  </TableRow>
                ) : (
                  directoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.author}</TableCell>
                      <TableCell>
                        <Badge variant="warning" className="capitalize">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-mineral-malachite hover:text-mineral-malachite"
                            title="Approve"
                            onClick={() => handleApprove(item.id, item.type)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            title="Reject"
                            onClick={() => handleReject(item.id, item.type)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
