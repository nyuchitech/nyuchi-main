/**
 * Student Contributors Program Page
 * Students submit content through the content hub
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  CheckCircle,
  ArrowRight,
  PenLine,
  Camera,
  Clock,
  Star,
} from 'lucide-react'

const BENEFITS = [
  { icon: PenLine, title: 'Professional Credentials', description: 'Your name and university affiliation displayed as author' },
  { icon: Star, title: 'Portfolio Building', description: 'Published work on a premier travel platform' },
  { icon: GraduationCap, title: 'Mentorship', description: 'Guidance from experienced travel writers and editors' },
  { icon: ArrowRight, title: 'Industry Connections', description: 'Network with Zimbabwe tourism professionals' },
]

const REQUIREMENTS = [
  'Enrolled at a Zimbabwean university or college',
  'Strong English writing abilities',
  'Knowledge of at least one Zimbabwean destination',
  'Access to quality photography equipment',
  'Commitment of 4-6 weeks for editorial process',
  'Travel permission to chosen location',
]

const CONTENT_FOCUS = [
  'Lesser-known destinations',
  'Secondary cities',
  'Border regions',
  'Cultural heritage sites',
  'Community-based tourism',
  'Seasonal attractions',
  'Adventure activities',
]

export default function StudentProgramPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-foreground text-background py-8 md:py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">
                Student Contributors Program
              </h1>
              <Badge className="mt-2 bg-amber-500/80 hover:bg-amber-500">Q3 2025 Cohort - Applications Open</Badge>
            </div>
          </div>
          <p className="opacity-90 max-w-xl mt-2">
            University students passionate about Zimbabwe can contribute travel content and build their portfolio with published work.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-8 px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Benefits */}
            <div>
              <h2 className="text-xl font-semibold mb-4">What You&apos;ll Gain</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon
                  return (
                    <Card key={benefit.title} className="p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{benefit.title}</p>
                          <p className="text-xs text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* How It Works */}
            <div>
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <Card>
                <CardContent className="p-6 space-y-4">
                  {[
                    { num: 1, title: 'Submit Your Application', desc: 'Apply through our content submission portal with your writing sample and destination pitch.' },
                    { num: 2, title: 'Editorial Review', desc: 'Our team reviews your submission and provides feedback.' },
                    { num: 3, title: 'Orientation & Training', desc: 'Selected contributors receive writing guidelines and mentorship.' },
                    { num: 4, title: 'Content Development', desc: 'Write your destination guide with ongoing mentor feedback.' },
                    { num: 5, title: 'Publication', desc: 'Your article gets published with full author attribution.', highlight: true },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                          step.highlight
                            ? 'bg-mineral-malachite text-white'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {step.num}
                      </div>
                      <div>
                        <p className="font-semibold">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Article Requirements */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Article Requirements</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <PenLine className="h-5 w-5 text-muted-foreground" />
                      <span>1,000-1,500 words</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span>5-8 original photos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span>4-6 weeks timeline</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Articles should cover introduction, logistics, accommodations, activities, local culture, and practical information.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Ready to Start Your Writing Journey?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Submit your content through our Content Hub to begin the application process.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button size="lg" asChild>
                    <Link href="/dashboard/content/new">
                      Submit Content
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/community/content">View Published Articles</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Eligibility */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Eligibility Requirements</h3>
                <ul className="space-y-2">
                  {REQUIREMENTS.map((req) => (
                    <li key={req} className="flex gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-mineral-malachite flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Content Focus */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Content We&apos;re Seeking</h3>
                <div className="flex flex-wrap gap-1">
                  {CONTENT_FOCUS.map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">Important Notes</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Initial contributions are unpaid. Strong performers receive paid opportunities for subsequent articles.
                </p>
                <p className="text-xs text-muted-foreground">
                  Zimbabwe Travel Information retains publishing rights; contributors maintain portfolio usage rights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
