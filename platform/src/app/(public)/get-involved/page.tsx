/**
 * Get Involved Hub Page
 * Main entry point for all involvement opportunities
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Compass, GraduationCap, Users, Heart, ArrowRight } from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  badge?: string
  badgeVariant?: 'success' | 'warning' | 'default' | 'cobalt'
  benefits: string[]
  cta: string
}

const opportunities: Opportunity[] = [
  {
    id: 'business-partner',
    title: 'Business Partner Network',
    description: 'List your tourism business and connect with travelers seeking authentic Zimbabwe experiences.',
    icon: Building2,
    href: '/get-involved/business-partner',
    badge: 'Free Forever',
    badgeVariant: 'success',
    benefits: ['Perpetual free listing', 'Targeted audience', 'Quality traffic', 'Platform authority'],
    cta: 'List Your Business',
  },
  {
    id: 'local-expert',
    title: 'Local Expert Program',
    description: 'Join our verified expert network as a safari guide, cultural specialist, or adventure expert.',
    icon: Compass,
    href: '/get-involved/local-expert',
    badge: 'Get Verified',
    badgeVariant: 'cobalt',
    benefits: ['Professional profile', 'Traveler connections', 'Verification badge', 'Community support'],
    cta: 'Apply as Expert',
  },
  {
    id: 'student-contributor',
    title: 'Student Contributors',
    description: 'University students can contribute travel content and build their portfolio with published work.',
    icon: GraduationCap,
    href: '/get-involved/student-program',
    badge: 'Q3 2025 Cohort',
    badgeVariant: 'warning',
    benefits: ['Published portfolio', 'Mentorship', 'Industry connections', 'Paid opportunities'],
    cta: 'Apply Now',
  },
  {
    id: 'travel-community',
    title: 'Travel Enthusiast Community',
    description: 'Connect with fellow travelers, share experiences, and discover hidden gems.',
    icon: Users,
    href: '/get-involved/community',
    badge: '5,000+ Members',
    badgeVariant: 'default',
    benefits: ['Trip planning support', 'Local insights', 'Community events', 'Exclusive content'],
    cta: 'Join Community',
  },
  {
    id: 'volunteer',
    title: 'Volunteer Opportunities',
    description: 'Contribute your skills to sustainable tourism and community development initiatives.',
    icon: Heart,
    href: '/get-involved/volunteer',
    badge: 'Make Impact',
    badgeVariant: 'cobalt',
    benefits: ['Meaningful contribution', 'Gain experience', 'Meet locals', 'Support conservation'],
    cta: 'Explore Roles',
  },
]

export default function GetInvolvedPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-foreground text-background py-12 md:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase block mb-2">
            Join Our Community
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            Get Involved with Zimbabwe Travel
          </h1>
          <p className="text-lg text-background/90 mb-4 max-w-2xl">
            Whether you&apos;re a business owner, local expert, student, or travel enthusiast -
            there&apos;s a place for you in our community.
          </p>
          <p className="text-background/70 italic">
            &quot;I am because we are&quot; - Ubuntu Philosophy
          </p>
        </div>
      </section>

      {/* Opportunities Grid */}
      <section className="py-8 md:py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {opportunities.map((opportunity) => {
            const Icon = opportunity.icon
            return (
              <Card
                key={opportunity.id}
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-xl font-semibold">{opportunity.title}</h2>
                        {opportunity.badge && (
                          <Badge variant={opportunity.badgeVariant}>
                            {opportunity.badge}
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {opportunity.description}
                      </p>

                      {/* Benefits */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.benefits.map((benefit) => (
                          <Badge key={benefit} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>

                      <Button asChild>
                        <Link href={opportunity.href}>
                          {opportunity.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Ubuntu Quote */}
        <div className="max-w-4xl mx-auto mt-12 p-6 md:p-8 rounded-[var(--radius-card)] bg-[var(--zimbabwe-green)]/10 border border-[var(--zimbabwe-green)]/30 text-center">
          <blockquote className="font-serif text-lg md:text-xl italic mb-3">
            &quot;Ubuntu does not mean that people should not enrich themselves.
            The question therefore is: Are you going to do so in order to enable
            the community around you to be able to improve?&quot;
          </blockquote>
          <cite className="text-sm text-muted-foreground not-italic">- Nelson Mandela</cite>
        </div>
      </section>
    </>
  )
}
