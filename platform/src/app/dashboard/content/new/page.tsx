/**
 * Nyuchi Platform - Create Content
 * Shopify-style content editor
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Send, CheckCircle, AlertCircle } from 'lucide-react'

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
]

const CATEGORIES = [
  'Business',
  'Technology',
  'Travel & Tourism',
  'Finance',
  'Agriculture',
  'Culture',
  'Entrepreneurship',
  'Pan-African',
]

export default function NewContentPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saveType, setSaveType] = useState<'draft' | 'publish'>('draft')

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'Article',
    category: 'Business',
    content: '',
    excerpt: '',
    tags: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const payload = {
        ...formData,
        status: saveType === 'publish' ? 'pending' : 'draft',
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create content')
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/content'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/content">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold mb-1">Create Content</h1>
        <p className="text-muted-foreground">
          Share knowledge and insights with the community
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-mineral-malachite bg-mineral-malachite/10">
          <CheckCircle className="h-4 w-4 text-mineral-malachite" />
          <AlertDescription className="text-mineral-malachite">
            Content created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter a compelling title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    required
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => handleChange('excerpt', e.target.value)}
                    placeholder="Brief summary (shown in previews)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep it under 200 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    required
                    rows={16}
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Write your content here... (Markdown supported)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content_type">Content Type</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value) => handleChange('content_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="entrepreneurship, tech, africa"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated tags
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ubuntu Points Info */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-1">
                  Ubuntu Points Reward
                </h4>
                <p className="text-sm opacity-90">
                  Published content earns <strong>+100 Ubuntu Points</strong>.
                  High-quality content may be featured on the community page!
                </p>
              </CardContent>
            </Card>

            {/* Publish Options */}
            <Card>
              <CardContent className="p-4">
                <Label className="mb-3 block">Save As</Label>
                <RadioGroup
                  value={saveType}
                  onValueChange={(value) => setSaveType(value as 'draft' | 'publish')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="draft" id="draft" />
                    <Label htmlFor="draft" className="font-normal cursor-pointer">
                      Draft
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="publish" id="publish" />
                    <Label htmlFor="publish" className="font-normal cursor-pointer">
                      Submit for Review
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-3">
                  Content is reviewed before publishing to maintain community quality.
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {saveType === 'publish' ? (
                  <Send className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading
                  ? 'Saving...'
                  : saveType === 'publish'
                  ? 'Submit for Review'
                  : 'Save Draft'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                asChild
              >
                <Link href="/dashboard/content">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
