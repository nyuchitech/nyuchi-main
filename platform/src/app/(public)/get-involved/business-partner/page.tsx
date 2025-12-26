/**
 * Business Partner Network Page
 * List your business in the community directory
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const BUSINESS_CATEGORIES = [
  'accommodation',
  'activities',
  'dining',
  'transport',
  'shopping',
  'services',
  'attractions',
  'wellness',
]

const LISTING_TYPES = [
  {
    id: 'free',
    name: 'Free Listing',
    price: 'Free Forever',
    features: ['Business name & contact', 'Map location', 'Basic description', 'Category listing', 'Search visibility', 'Unlimited updates'],
  },
  {
    id: 'verified',
    name: 'Verified Listing',
    price: 'Free',
    features: ['Everything in Free', 'Verification badge', 'Priority in search', 'Enhanced credibility', 'Trust signals'],
  },
  {
    id: 'premium',
    name: 'Business Promotion',
    price: '$100 One-time',
    features: ['Everything in Verified', 'Custom social content', 'Destination guide placement', 'Professional imagery', 'Long-term visibility'],
  },
]

const steps = ['Business Details', 'Contact Info', 'Listing Type', 'Review']

export default function BusinessPartnerPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    subcategory: '',
    location: '',
    description: '',
    target_travelers: '',
    listing_type: 'free',
    promotion_interest: false,
    amenities: [] as string[],
    price_range: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setError('')
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.business_name || !formData.category || !formData.location || !formData.description) {
        setError('Please fill in all required fields')
        return
      }
    } else if (activeStep === 1) {
      if (!formData.contact_person || !formData.email || !formData.phone) {
        setError('Please fill in all contact information')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address')
        return
      }
    }

    setError('')
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/get-involved/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-md mx-auto px-6">
          <Card className="text-center p-8">
            <CheckCircle className="h-16 w-16 mx-auto text-mineral-malachite mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Application Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Your business listing has been submitted for review. We&apos;ll notify you once it&apos;s published.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/community/directory">View Directory</Link>
              </Button>
              <Button asChild>
                <Link href="/get-involved">Explore More</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-foreground text-background py-8 md:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-10 w-10 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Business Partner Network
            </h1>
          </div>
          <p className="opacity-90 max-w-xl">
            List your tourism business and connect with travelers seeking authentic Zimbabwe experiences.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Listing Types Overview */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Listing Options</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {LISTING_TYPES.map((type) => (
              <Card
                key={type.id}
                className={cn(
                  'p-4 cursor-pointer transition-colors',
                  formData.listing_type === type.id
                    ? 'border-primary border-2 bg-primary/5'
                    : 'hover:border-muted-foreground/50'
                )}
                onClick={() => activeStep === 2 && handleChange('listing_type', type.id)}
              >
                <p className="font-semibold">{type.name}</p>
                <p className="text-primary font-medium mb-2">{type.price}</p>
                <div className="space-y-1">
                  {type.features.slice(0, 3).map((feature) => (
                    <p key={feature} className="text-xs text-muted-foreground">
                      {feature}
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index <= activeStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </div>
              <span className="ml-2 text-sm hidden sm:inline">{label}</span>
              {index < steps.length - 1 && (
                <div className="w-8 sm:w-16 h-px bg-muted mx-2" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-6">
            {/* Step 0: Business Details */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Business Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Business Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (City, Region) *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g., Victoria Falls, Matabeleland North"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    placeholder="Describe your business, services, and what makes you unique..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_travelers">Target Travelers (Optional)</Label>
                  <Input
                    id="target_travelers"
                    value={formData.target_travelers}
                    onChange={(e) => handleChange('target_travelers', e.target.value)}
                    placeholder="e.g., Adventure seekers, Families, Luxury travelers"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Contact Info */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => handleChange('contact_person', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+263..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Listing Type */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Choose Your Listing Type</h3>
                <p className="text-muted-foreground">
                  Select the listing option that best fits your needs. You can always upgrade later.
                </p>
                <div className="space-y-3">
                  {LISTING_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      className={cn(
                        'p-4 cursor-pointer transition-colors',
                        formData.listing_type === type.id
                          ? 'border-primary border-2 bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      )}
                      onClick={() => handleChange('listing_type', type.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-lg">{type.name}</p>
                          <p className="text-primary text-xl font-medium">{type.price}</p>
                        </div>
                        {formData.listing_type === type.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {type.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Review Your Application</h3>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Business</p>
                  <p className="font-semibold text-lg">{formData.business_name}</p>
                  <p className="text-muted-foreground">{formData.category} - {formData.location}</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contact</p>
                  <p className="font-medium">{formData.contact_person}</p>
                  <p className="text-muted-foreground">{formData.email} | {formData.phone}</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Listing Type</p>
                  <p className="font-semibold text-lg">
                    {LISTING_TYPES.find(t => t.id === formData.listing_type)?.name}
                  </p>
                </div>

                <Alert>
                  <AlertDescription>
                    Your listing will appear in the community directory after review. Most listings are approved within 24-48 hours.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Already listed?{' '}
            <Link href="/community/directory" className="text-primary hover:underline">
              View the directory
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
