/**
 * Nyuchi Platform - Landing Page
 * Community-focused platform for African entrepreneurship
 * "I am because we are" - Ubuntu Philosophy
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/auth-context'
import {
  Building2, Plane, FileText, Trophy, Globe, Compass,
  GraduationCap, Heart, Users, TrendingUp, Check,
  ArrowRight, Sparkles
} from 'lucide-react'

interface CommunityStats {
  total_members: number
  total_businesses: number
  total_articles: number
  top_ubuntu_score: number
  total_travel_businesses?: number
}

const coreFeatures = [
  {
    icon: Building2,
    title: 'Business Directory',
    description: 'List your business and connect with the African entrepreneurial community.',
    features: ['Free Forever', 'Verification Badges', 'Engagement Metrics'],
    href: '/community/directory',
  },
  {
    icon: Plane,
    title: 'Travel Directory',
    description: 'Discover authentic African travel experiences and verified guides.',
    features: ['Local Experts', 'Verified Guides', 'Authentic Experiences'],
    href: '/community/travel-directory',
  },
  {
    icon: FileText,
    title: 'Community Content',
    description: 'Share knowledge through articles, guides, and success stories.',
    features: ['AI Assistance', 'Editorial Review', 'Earn Ubuntu Points'],
    href: '/community/content',
  },
  {
    icon: Trophy,
    title: 'Ubuntu Leaderboard',
    description: 'Celebrate contributors who embody the Ubuntu spirit.',
    features: ['4 Achievement Levels', '7 Contribution Types', 'Recognition'],
    href: '/community/leaderboard',
  },
]

const ubuntuLevels = [
  { name: 'Newcomer', points: '0-499', color: 'text-[var(--mineral-gold)]' },
  { name: 'Contributor', points: '500-1,999', color: 'text-[var(--zimbabwe-green)]' },
  { name: 'Community Leader', points: '2,000-4,999', color: 'text-[var(--zimbabwe-red)]' },
  { name: 'Ubuntu Champion', points: '5,000+', color: 'text-foreground' },
]

const getInvolvedOptions = [
  {
    icon: Users,
    title: 'Business Partner',
    description: 'List your tourism or business venture with perpetual free listing.',
    badge: 'Free Forever',
    href: '/get-involved/business-partner',
  },
  {
    icon: Compass,
    title: 'Local Expert',
    description: 'Join as a verified safari guide, cultural specialist, or adventure guide.',
    badge: 'Get Verified',
    href: '/get-involved/local-expert',
  },
  {
    icon: GraduationCap,
    title: 'Student Program',
    description: 'Contribute travel content and build your portfolio with published work.',
    badge: 'Mentorship',
    href: '/get-involved/student-program',
  },
  {
    icon: Heart,
    title: 'Volunteer',
    description: 'Contribute your skills to sustainable tourism and community development.',
    badge: 'Make Impact',
    href: '/get-involved/volunteer',
  },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

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
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <span className="font-bold text-lg">
              Nyuchi<span className="text-slate-500 font-normal"> Platform</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/community" className="text-sm text-slate-400 hover:text-white transition">
              Community
            </Link>
            <Link href="/community/directory" className="text-sm text-slate-400 hover:text-white transition">
              Directory
            </Link>
            <Link href="/get-involved" className="text-sm text-slate-400 hover:text-white transition">
              Get Involved
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-slate-400 hover:text-white transition hidden sm:block">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/sign-up">Join Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-900/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                African Entrepreneurship
              </Badge>

              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Grow Together.{' '}
                <span className="text-primary">Succeed Together.</span>
              </h1>

              <p className="text-lg text-slate-400 mb-4 max-w-lg">
                The community platform for African entrepreneurs, businesses, and travel experiences.
                Connect, collaborate, and thrive with free tools built on Ubuntu philosophy.
              </p>

              <p className="text-primary italic mb-8 font-serif">
                &quot;I am because we are&quot;
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/community">
                    Explore Community
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-slate-700 hover:bg-slate-800">
                  <Link href="/sign-up">Join for Free</Link>
                </Button>
              </div>
            </div>

            {/* Stats Panel */}
            <Card className="bg-slate-900/50 border-slate-800 hidden lg:block">
              <div className="bg-slate-950 px-5 py-4 border-b border-slate-800">
                <h3 className="font-semibold text-sm">Community at a Glance</h3>
              </div>
              <CardContent className="p-5 space-y-5">
                <StatRow
                  icon={<Users className="w-5 h-5" />}
                  label="Community Members"
                  value={stats?.total_members}
                  loading={statsLoading}
                />
                <StatRow
                  icon={<Building2 className="w-5 h-5" />}
                  label="Listed Businesses"
                  value={stats?.total_businesses}
                  loading={statsLoading}
                />
                <StatRow
                  icon={<Plane className="w-5 h-5" />}
                  label="Travel Partners"
                  value={stats?.total_travel_businesses}
                  loading={statsLoading}
                />
                <StatRow
                  icon={<FileText className="w-5 h-5" />}
                  label="Community Articles"
                  value={stats?.total_articles}
                  loading={statsLoading}
                />
              </CardContent>
              <Badge variant="success" className="absolute -bottom-3 -right-3 rotate-[-3deg]">
                <Sparkles className="w-3 h-3 mr-1" />
                Free Forever
              </Badge>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-900 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              What We Offer
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-4">
              Community Features
            </h2>
            <p className="text-slate-400 max-w-xl">
              Everything you need to connect with the African business community.
              Always free, because we believe in Ubuntu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className="bg-slate-800/50 border-slate-700 h-full transition-all hover:border-primary/50 hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center mb-6">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                      <p className="text-slate-400 text-sm mb-6">{feature.description}</p>
                      <div className="space-y-2">
                        {feature.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-sm text-slate-500">
                            <Check className="w-3.5 h-3.5 text-[var(--zimbabwe-green)]" />
                            {feat}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ubuntu Scoring */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Ubuntu Philosophy
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-4">
              Earn Recognition for Your Contributions
            </h2>
            <p className="text-slate-400 max-w-xl">
              Every action strengthens the community. Earn Ubuntu points and rise through levels.
            </p>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-8">
              <h3 className="font-semibold mb-6">Achievement Levels</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {ubuntuLevels.map((level) => (
                  <div key={level.name} className="text-center p-4 rounded-lg bg-slate-950 border border-slate-800">
                    <p className={`font-bold text-lg ${level.color}`}>{level.name}</p>
                    <p className="text-xs text-slate-500">{level.points} points</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-20 px-6 bg-slate-900 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              Get Involved
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-slate-400 max-w-xl">
              Multiple ways to contribute and benefit from the Nyuchi ecosystem.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getInvolvedOptions.map((option) => {
              const Icon = option.icon
              return (
                <Link key={option.title} href={option.href}>
                  <Card className="bg-slate-800/50 border-slate-700 h-full text-center transition-all hover:border-primary/50 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{option.title}</h3>
                      <p className="text-sm text-slate-400 mb-4">{option.description}</p>
                      <Badge variant="cobalt" className="text-xs">
                        {option.badge}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ubuntu Philosophy Quote */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8">
            The Ubuntu Philosophy
          </h2>
          <blockquote className="font-serif text-lg md:text-xl italic text-slate-400 mb-4">
            &quot;Ubuntu does not mean that people should not enrich themselves.
            The question therefore is: Are you going to do so in order to enable
            the community around you to be able to improve?&quot;
          </blockquote>
          <cite className="text-primary not-italic">— Nelson Mandela</cite>
          <p className="text-slate-500 mt-8 max-w-2xl mx-auto">
            At Nyuchi, we believe that individual success and community growth go hand in hand.
            Every business listing, every connection made, and every piece of content shared
            strengthens the entire African entrepreneurial ecosystem.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to join the community?
          </h2>
          <p className="text-slate-400 mb-8">
            Connect with African entrepreneurs, list your business, and grow together.
            Free forever, because we believe in Ubuntu.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-slate-700 hover:bg-slate-800">
              <Link href="/community/directory">Browse Directory</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-950 border-t border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">N</span>
            </div>
            <span className="font-bold">Nyuchi Platform</span>
          </div>
          <p className="text-sm text-slate-500 mb-2">
            Part of the Nyuchi Africa Ecosystem. Harare, Zimbabwe.
          </p>
          <p className="text-primary italic font-serif text-sm mb-6">
            &quot;I am because we are&quot;
          </p>

          <div className="flex flex-wrap gap-6 py-6 border-t border-slate-800 text-sm text-slate-500">
            <Link href="/community" className="hover:text-white transition">Community</Link>
            <Link href="/community/directory" className="hover:text-white transition">Business Directory</Link>
            <Link href="/community/travel-directory" className="hover:text-white transition">Travel Directory</Link>
            <Link href="/community/leaderboard" className="hover:text-white transition">Ubuntu Leaderboard</Link>
            <Link href="/get-involved" className="hover:text-white transition">Get Involved</Link>
          </div>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Nyuchi Africa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatRow({
  icon,
  label,
  value,
  loading
}: {
  icon: React.ReactNode
  label: string
  value?: number
  loading: boolean
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-primary">{icon}</div>
      <div className="flex-1">
        {loading ? (
          <Skeleton className="h-6 w-16 mb-1" />
        ) : (
          <p className="text-2xl font-bold">{(value || 0).toLocaleString()}</p>
        )}
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}
