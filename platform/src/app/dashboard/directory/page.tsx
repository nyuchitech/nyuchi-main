/**
 * Nyuchi Platform - Directory Listings
 * Notion-style directory management with inline editing
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { DataTable, Column, CellValue } from '@/components/DataTable'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, X } from 'lucide-react'

interface DirectoryListing {
  id: string
  name: string
  category: string
  location: string
  contact_email: string
  contact_phone?: string
  website?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function DirectoryPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [listings, setListings] = useState<DirectoryListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/directory`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setListings(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleUpdate = async (id: string, field: string, value: CellValue) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/directory/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, [field]: value } : listing
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
      throw err
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/directory/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete')

      setListings((prev) => prev.filter((listing) => listing.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const columns: Column<DirectoryListing>[] = [
    {
      id: 'name',
      label: 'Business Name',
      type: 'text',
      editable: true,
      sortable: true,
      width: 250,
    },
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      editable: true,
      options: [
        'Technology',
        'Agriculture',
        'Manufacturing',
        'Services',
        'Retail',
        'Healthcare',
        'Education',
        'Finance',
        'Construction',
        'Other',
      ],
    },
    {
      id: 'location',
      label: 'Location',
      type: 'text',
      editable: true,
    },
    {
      id: 'contact_email',
      label: 'Email',
      type: 'email',
      editable: true,
      width: 200,
    },
    {
      id: 'contact_phone',
      label: 'Phone',
      type: 'text',
      editable: true,
    },
    {
      id: 'website',
      label: 'Website',
      type: 'url',
      editable: true,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      editable: true,
      options: ['pending', 'approved', 'rejected'],
    },
    {
      id: 'created_at',
      label: 'Created',
      type: 'date',
      editable: false,
    },
  ]

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Directory</h1>
        <p className="text-muted-foreground">
          Manage business listings with inline editing, kanban, and card views
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="ml-2">
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* DataTable */}
      <DataTable
        data={listings}
        columns={columns}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCreate={() => router.push('/dashboard/directory/new')}
        loading={loading}
        searchable
        groupByColumn="status"
        emptyMessage="No directory listings yet"
        emptyAction={{
          label: 'Add Your First Listing',
          onClick: () => router.push('/dashboard/directory/new'),
        }}
      />
    </div>
  )
}
