/**
 * Nyuchi Platform - Unified Dashboard
 * "I am because we are" - Dashboard with Ubuntu AI, activity streams, and quick actions
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  TrendingUp,
  Heart,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DashboardStats {
  directory_listings: number
  published_content: number
  community_members: number
  ubuntu_score: number
  monthly_growth: number
  total_ubuntu_points: number
}

const statCards = [
  {
    title: 'Ubuntu Score',
    key: 'ubuntu_score' as const,
    icon: Heart,
    colorClass: 'text-primary bg-primary/10',
    description: 'Community impact',
  },
  {
    title: 'Connections',
    key: 'community_members' as const,
    icon: Users,
    colorClass: 'text-mineral-malachite bg-mineral-malachite/10',
    description: 'Network members',
  },
  {
    title: 'Directory',
    key: 'directory_listings' as const,
    icon: Building2,
    colorClass: 'text-foreground bg-muted',
    description: 'Active listings',
  },
  {
    title: 'Growth',
    key: 'monthly_growth' as const,
    icon: TrendingUp,
    colorClass: 'text-mineral-malachite bg-mineral-malachite/10',
    description: "This month's progress",
    isPercentage: true,
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        } else {
          // Fallback stats
          setStats({
            directory_listings: 0,
            published_content: 0,
            community_members: 1,
            ubuntu_score: user?.ubuntu_score || 0,
            monthly_growth: 0,
            total_ubuntu_points: 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        setStats({
          directory_listings: 0,
          published_content: 0,
          community_members: 1,
          ubuntu_score: user?.ubuntu_score || 0,
          monthly_growth: 0,
          total_ubuntu_points: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.ubuntu_score])

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-1">
          Welcome back, {user?.full_name || user?.email?.split('@')[0]}
        </h1>
        <p className="text-muted-foreground">
          &quot;I am because we are&quot; - Let&apos;s strengthen our community together
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const value = stat.key === 'ubuntu_score'
            ? (stats?.ubuntu_score ?? user?.ubuntu_score ?? 0)
            : (stats?.[stat.key] ?? 0)
          const displayValue = stat.isPercentage ? `+${value}%` : value.toLocaleString()

          return (
            <Card key={stat.title}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', stat.colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                {loading ? (
                  <Skeleton className="h-9 w-16 mb-1" />
                ) : (
                  <p className="text-2xl md:text-3xl font-bold mb-1">
                    {displayValue}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Quick actions will appear here
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Ubuntu AI Chat */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Ubuntu AI Assistant</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Ubuntu AI chat will appear here
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity Stream */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Activity</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Recent activity will appear here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ubuntu Philosophy Footer */}
      <Card className="mt-8 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Ubuntu Philosophy in Action</h3>
          </div>
          <p className="text-sm text-white/90 max-w-2xl">
            &quot;I am because we are&quot; - Every action on this platform strengthens our collective success.
            Your {stats?.ubuntu_score ?? user?.ubuntu_score ?? 0} Ubuntu points represent your contribution
            to lifting up the entire African business community.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
