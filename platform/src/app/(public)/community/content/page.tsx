/**
 * Nyuchi Community Content
 * "I am because we are" - Public articles and guides (no auth required)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Eye } from 'lucide-react'

interface ContentItem {
  id: string
  title: string
  slug: string
  content_type: string
  category: string
  tags: string[]
  featured_image_url: string | null
  view_count: number
  published_at: string
}

interface Categories {
  content_categories: string[]
}

export default function CommunityContentPage() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [categories, setCategories] = useState<Categories | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [contentType, setContentType] = useState('')

  const fetchContent = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (contentType) params.set('type', contentType)
      params.set('limit', '20')

      const response = await fetch(`/api/community/content?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data.content || [])
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setLoading(false)
    }
  }, [category, contentType])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/community/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 md:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Community Content
          </h1>
          <p className="opacity-90">
            Articles, guides, and success stories from the community
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.content_categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
              <SelectItem value="guide">Guides</SelectItem>
              <SelectItem value="story">Stories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-40" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-4/5 mb-2" />
                  <Skeleton className="h-4 w-2/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No content found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or check back later
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCategory('')
                setContentType('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {item.featured_image_url && (
                  <div
                    className="h-40 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.featured_image_url})` }}
                  />
                )}
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{item.category}</Badge>
                    <Badge variant="secondary">{item.content_type}</Badge>
                  </div>
                  <h2 className="font-semibold text-lg mb-2">{item.title}</h2>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(item.published_at)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.view_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/community">Back to Community</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
