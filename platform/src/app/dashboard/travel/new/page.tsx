/**
 * Nyuchi Travel - New Business Listing
 * "I am because we are" - List your travel business
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plane,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const BUSINESS_TYPES = [
  'Tour Operator',
  'Safari Guide',
  'Accommodation',
  'Restaurant',
  'Transport',
  'Activity Provider',
  'Travel Agency',
  'Cultural Experience',
]

const COUNTRIES = [
  'Zimbabwe',
  'South Africa',
  'Kenya',
  'Tanzania',
  'Botswana',
  'Zambia',
  'Namibia',
  'Mozambique',
  'Ghana',
  'Nigeria',
  'Other',
]

const steps = ['Business Details', 'Location', 'Services', 'Review']

export default function NewTravelBusinessPage() {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    description: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    services: '',
    specialties: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleNext = () => {
    if (activeStep === 0 && (!formData.business_name || !formData.business_type)) {
      setError('Please fill in business name and type')
      return
    }
    if (activeStep === 1 && !formData.country) {
      setError('Please select a country')
      return
    }
    setActiveStep((prev) => prev + 1)
    setError('')
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/travel/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create listing')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/travel')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 md:p-8">
        <Card className="max-w-lg mx-auto text-center p-8">
          <div className="w-20 h-20 rounded-full bg-mineral-malachite/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-mineral-malachite" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Listing Submitted!</h2>
          <p className="text-muted-foreground mb-4">
            Your travel business listing has been submitted for review.
            You&apos;ll earn Ubuntu points once approved!
          </p>
          <p className="text-sm text-primary font-medium">
            +75 Ubuntu Points (pending approval)
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/travel">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            List Your Travel Business
          </h1>
          <p className="text-sm text-muted-foreground">
            Join our verified travel directory
          </p>
        </div>
      </div>

      {/* Stepper */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
                      index < activeStep
                        ? 'bg-primary border-primary text-primary-foreground'
                        : index === activeStep
                        ? 'border-primary text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    {index < activeStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={cn(
                    'text-xs mt-1 hidden sm:block',
                    index <= activeStep ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2',
                      index < activeStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 0: Business Details */}
          {activeStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Business Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                    placeholder="Your business name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => handleChange('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your business, what makes it unique, and why travelers should choose you..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Location</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Street address or landmark"
                />
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Services & Contact</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+263 77 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@business.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourbusiness.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="services">Services Offered</Label>
                <Textarea
                  id="services"
                  value={formData.services}
                  onChange={(e) => handleChange('services', e.target.value)}
                  placeholder="Safari tours, Airport transfers, Accommodation booking..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Review Your Listing</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Business Name
                  </p>
                  <p className="font-medium">{formData.business_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Business Type
                  </p>
                  <p className="font-medium">{formData.business_type || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p>{formData.description || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Location
                  </p>
                  <p className="font-medium">
                    {[formData.city, formData.country].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Contact
                  </p>
                  <p className="font-medium">{formData.email || formData.phone || '-'}</p>
                </div>
              </div>

              <Alert className="mt-4 border-mineral-cobalt/30 bg-mineral-cobalt/5">
                <AlertCircle className="h-4 w-4 text-mineral-cobalt" />
                <AlertDescription className="text-mineral-cobalt">
                  Your listing will be reviewed by our team. Once approved, you&apos;ll earn{' '}
                  <strong>+75 Ubuntu Points</strong> and your business will appear in the travel directory.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                <Check className="h-4 w-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Listing'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
