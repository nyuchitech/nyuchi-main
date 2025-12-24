/**
 * Nyuchi Platform - Add Directory Listing
 * Shopify-style form layout
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, CheckCircle, AlertCircle } from 'lucide-react'

const CATEGORIES = [
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
]

export default function NewDirectoryPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    website: '',
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/directory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create listing')
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/directory'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/directory">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold mb-1">Add New Listing</h1>
        <p className="text-muted-foreground">
          Create a new business directory listing
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
            Listing created successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter business name"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your business, products, or services..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    required
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="contact@business.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="+263 77 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://"
                  />
                </div>
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
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Create Listing'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                asChild
              >
                <Link href="/dashboard/directory">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
