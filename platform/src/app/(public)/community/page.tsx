/**
 * Nyuchi Community Hub
 * "I am because we are" - Public community page (no auth required)
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Plane, Trophy, FileText, TrendingUp } from 'lucide-react'

interface CommunityStats {
  total_members: number
  total_businesses: number
  total_articles: number
  top_ubuntu_score: number
  total_travel_businesses?: number
}

const communityFeatures = [
  {
    icon: Users,
    title: 'Business Directory',
    description: 'Discover African businesses and entrepreneurs building the future.',
    href: '/community/directory',
    statKey: 'total_businesses' as const,
    statLabel: 'Businesses',
  },
  {
    icon: Plane,
    title: 'Travel Directory',
    description: 'Explore verified African travel businesses and destinations.',
    href: '/community/travel-directory',
    statKey: 'total_travel_businesses' as const,
    statLabel: 'Travel Partners',
  },
  {
    icon: Trophy,
    title: 'Ubuntu Leaderboard',
    description: 'Celebrate community contributors who embody the Ubuntu spirit.',
    href: '/community/leaderboard',
    statKey: 'top_ubuntu_score' as const,
    statLabel: 'Top Score',
  },
  {
    icon: FileText,
    title: 'Community Content',
    description: 'Read articles, guides, and success stories from the community.',
    href: '/community/content',
    statKey: 'total_articles' as const,
    statLabel: 'Articles',
  },
]

export default function CommunityPage() {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/community/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch community stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-12 md:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            Nyuchi Community
          </h1>
          <p className="text-lg text-primary-foreground/90 mb-4">
            &quot;I am because we are&quot; - Ubuntu Philosophy
          </p>
          <p className="text-primary-foreground/85 max-w-xl leading-relaxed">
            Welcome to the Nyuchi Africa community. Here, we celebrate African entrepreneurship,
            share knowledge, and support each other in building a stronger future together.
          </p>

          {/* Quick Stats */}
          <div className="flex gap-8 mt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-foreground/80" />
              {loading ? (
                <Skeleton className="h-5 w-24 bg-primary-foreground/20" />
              ) : (
                <span className="font-semibold text-primary-foreground">
                  {stats?.total_members || 0} Members
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-foreground/80" />
              <span className="font-semibold text-primary-foreground">Growing Together</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-6 bg-card">
        <div className="max-w-lg mx-auto text-center mb-8">
          <span className="text-xs font-semibold tracking-widest text-[var(--zimbabwe-green)] uppercase">
            Explore
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mt-2 mb-2">
            Community Features
          </h2>
          <p className="text-muted-foreground">
            Always free. Because we believe in collective growth.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {communityFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.title} href={feature.href}>
                <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mx-auto mb-1" />
                    ) : (
                      <p className="text-3xl font-bold text-primary mb-1">
                        {stats?.[feature.statKey]?.toLocaleString() || '0'}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{feature.statLabel}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Ubuntu Philosophy Section */}
      <section className="py-12 md:py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
            The Ubuntu Philosophy
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Ubuntu is an ancient African philosophy that emphasizes our interconnectedness.
            &quot;I am because we are&quot; reminds us that our success is tied to the success
            of our community. At Nyuchi, we believe that by supporting each other, we can
            build a stronger, more prosperous Africa.
          </p>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Join the Community</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
