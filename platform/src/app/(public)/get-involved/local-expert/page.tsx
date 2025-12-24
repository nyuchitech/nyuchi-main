/**
 * Local Expert Program Page
 * Apply to become a verified local expert
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
import { Compass, CheckCircle, ArrowRight, ArrowLeft, AlertCircle, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXPERT_CATEGORIES = [
  { id: 'safari_guide', name: 'Safari Guide', description: 'ZPGA certified wildlife guides' },
  { id: 'cultural_specialist', name: 'Cultural Specialist', description: 'Traditional culture and heritage' },
  { id: 'adventure_guide', name: 'Adventure Guide', description: 'Outdoor and adventure activities' },
  { id: 'urban_guide', name: 'Urban & Food Guide', description: 'City tours and culinary experiences' },
  { id: 'photography_guide', name: 'Photography Guide', description: 'Wildlife and landscape photography' },
  { id: 'bird_guide', name: 'Bird Guide', description: 'Ornithology and birdwatching' },
]

const steps = ['Personal Info', 'Expertise', 'Experience', 'Review']

export default function LocalExpertPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    category: '',
    years_experience: '',
    certifications: '',
    languages: '',
    services: '',
    bio: '',
    motivation: '',
    website: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setError('')
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.full_name || !formData.email || !formData.phone || !formData.location) {
        setError('Please fill in all required fields')
        return
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address')
        return
      }
    } else if (activeStep === 1) {
      if (!formData.category || !formData.services) {
        setError('Please select your expertise and list your services')
        return
      }
    } else if (activeStep === 2) {
      if (!formData.years_experience || !formData.certifications || !formData.languages) {
        setError('Please fill in your experience details')
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
      const response = await fetch('/api/get-involved/experts', {
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
            <p className="text-muted-foreground mb-2">
              Thank you for applying to the Local Expert Program!
            </p>
            <p className="text-muted-foreground mb-6">
              We&apos;ll review your application and contact you within 5-7 business days for a video verification interview.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/community/directory">View Expert Directory</Link>
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
            <Compass className="h-10 w-10 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Local Expert Program
            </h1>
          </div>
          <p className="opacity-90 max-w-xl">
            Share your knowledge and connect with travelers seeking authentic Zimbabwe experiences.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Expert Categories */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">Expert Categories We&apos;re Looking For</h2>
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
            {EXPERT_CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                className={cn(
                  'p-3 cursor-pointer transition-colors',
                  formData.category === cat.id
                    ? 'border-primary border-2 bg-primary/5'
                    : 'hover:border-muted-foreground/50'
                )}
                onClick={() => activeStep === 1 && handleChange('category', cat.id)}
              >
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <Card className="mb-6 bg-mineral-malachite/5 border-mineral-malachite/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="h-5 w-5 text-mineral-malachite" />
              <h3 className="font-semibold">Expert Benefits</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary">Professional Profile</Badge>
              <Badge variant="secondary">Verification Badge</Badge>
              <Badge variant="secondary">Traveler Connections</Badge>
              <Badge variant="secondary">Community Support</Badge>
              <Badge variant="secondary">Directory Listing</Badge>
            </div>
          </CardContent>
        </Card>

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
            {/* Step 0: Personal Info */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
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
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="e.g., Victoria Falls, Harare"
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

            {/* Step 1: Expertise */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Your Expertise</h3>
                <div className="space-y-2">
                  <Label htmlFor="category">Expert Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} - {cat.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="services">Services Offered *</Label>
                  <Textarea
                    id="services"
                    value={formData.services}
                    onChange={(e) => handleChange('services', e.target.value)}
                    rows={3}
                    placeholder="List the services you offer (e.g., day safaris, multi-day tours, photography workshops)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows={4}
                    placeholder="Tell travelers about yourself and what makes your experiences unique..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Experience & Qualifications</h3>
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience *</Label>
                  <Input
                    id="years_experience"
                    value={formData.years_experience}
                    onChange={(e) => handleChange('years_experience', e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications *</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => handleChange('certifications', e.target.value)}
                    rows={2}
                    placeholder="e.g., ZPGA Level 2, First Aid, CPR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages Spoken *</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => handleChange('languages', e.target.value)}
                    placeholder="e.g., English, Shona, Ndebele"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivation">Why do you want to join?</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => handleChange('motivation', e.target.value)}
                    rows={3}
                    placeholder="Share your motivation for joining the expert network..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Review Your Application</h3>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Personal Info</p>
                  <p className="font-semibold text-lg">{formData.full_name}</p>
                  <p className="text-muted-foreground">{formData.email} | {formData.phone}</p>
                  <p className="text-muted-foreground">{formData.location}</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Expertise</p>
                  <p className="font-semibold text-lg">
                    {EXPERT_CATEGORIES.find(c => c.id === formData.category)?.name}
                  </p>
                  <p className="text-muted-foreground">{formData.services}</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Experience</p>
                  <p className="font-medium">{formData.years_experience} experience</p>
                  <p className="text-muted-foreground">Languages: {formData.languages}</p>
                </div>

                <Alert>
                  <AlertDescription>
                    After submission, we&apos;ll review your application and schedule a video verification interview within 5-7 business days.
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
            Looking for a local expert?{' '}
            <Link href="/community/directory" className="text-primary hover:underline">
              Browse our expert directory
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
