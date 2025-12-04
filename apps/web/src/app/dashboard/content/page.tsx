/**
 * 🇿🇼 Nyuchi Platform - Content Management
 * Notion-style content management with inline editing
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../../../lib/auth-context';
import { useRouter } from 'next/navigation';
import { DataTable, Column, CellValue } from '../../../components/DataTable';

interface Content {
  id: string;
  title: string;
  content_type: string;
  status: 'draft' | 'pending' | 'published';
  excerpt?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export default function ContentPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setContent(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleUpdate = async (id: string, field: string, value: CellValue) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error('Failed to update');

      // Update local state
      setContent((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setContent((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const columns: Column<Content>[] = [
    {
      id: 'title',
      label: 'Title',
      type: 'text',
      editable: true,
      sortable: true,
      width: 300,
    },
    {
      id: 'content_type',
      label: 'Type',
      type: 'select',
      editable: true,
      options: ['Article', 'Guide', 'Tutorial', 'Case Study', 'News', 'Opinion'],
    },
    {
      id: 'excerpt',
      label: 'Excerpt',
      type: 'text',
      editable: true,
      width: 250,
    },
    {
      id: 'tags',
      label: 'Tags',
      type: 'multiselect',
      editable: true,
      options: [
        'entrepreneurship',
        'technology',
        'agriculture',
        'finance',
        'education',
        'healthcare',
        'innovation',
        'africa',
        'zimbabwe',
        'business',
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      editable: true,
      options: ['draft', 'pending', 'published'],
    },
    {
      id: 'created_at',
      label: 'Created',
      type: 'date',
      editable: false,
    },
    {
      id: 'updated_at',
      label: 'Updated',
      type: 'date',
      editable: false,
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
          Content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage articles and guides with inline editing, kanban, and card views
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* DataTable */}
      <DataTable
        data={content}
        columns={columns}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCreate={() => router.push('/dashboard/content/new')}
        loading={loading}
        searchable
        groupByColumn="status"
        emptyMessage="No content yet"
        emptyAction={{
          label: 'Create Your First Content',
          onClick: () => router.push('/dashboard/content/new'),
        }}
      />
    </Box>
  );
}
