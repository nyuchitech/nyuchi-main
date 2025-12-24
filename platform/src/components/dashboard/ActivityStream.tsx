/**
 * Ubuntu Activity Stream Component
 * Real-time community activity feed with Ubuntu philosophy
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Heart, TrendingUp, Building2, FileText } from 'lucide-react'

interface Activity {
  id: string
  type: 'member_joined' | 'content_published' | 'business_listed' | 'collaboration' | 'ubuntu_points'
  action: string
  actor: string
  timestamp: string
  ubuntuPoints?: number
}

interface ActivityStreamProps {
  maxItems?: number
  showPhilosophy?: boolean
}

const activityIcons = {
  member_joined: Users,
  content_published: FileText,
  business_listed: Building2,
  collaboration: TrendingUp,
  ubuntu_points: Heart,
}

const activityColors = {
  member_joined: 'bg-[var(--zimbabwe-green)]/10 text-[var(--zimbabwe-green)]',
  content_published: 'bg-foreground/10 text-foreground',
  business_listed: 'bg-primary/10 text-primary',
  collaboration: 'bg-[var(--zimbabwe-yellow)]/20 text-[var(--mineral-gold)]',
  ubuntu_points: 'bg-pink-500/10 text-pink-500',
}

export function ActivityStream({ maxItems = 5, showPhilosophy = true }: ActivityStreamProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch(`/api/community/activity?limit=${maxItems}`)
        if (response.ok) {
          const data = await response.json()
          setActivities(data.activities || [])
        } else {
          // Fallback demo data
          setActivities([
            {
              id: '1',
              type: 'member_joined',
              action: 'Joined Ubuntu Business Network',
              actor: 'New community member',
              timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
              ubuntuPoints: 50,
            },
            {
              id: '2',
              type: 'content_published',
              action: 'Shared success story',
              actor: 'Tech Startup Zimbabwe',
              timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
              ubuntuPoints: 100,
            },
            {
              id: '3',
              type: 'business_listed',
              action: 'Listed new business',
              actor: 'Harare Consulting',
              timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
              ubuntuPoints: 75,
            },
            {
              id: '4',
              type: 'collaboration',
              action: 'Started cross-industry collaboration',
              actor: 'Kenya Agri & SA Fintech',
              timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
              ubuntuPoints: 200,
            },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error)
        // Use fallback data on error
        setActivities([
          {
            id: '1',
            type: 'member_joined',
            action: 'Joined the community',
            actor: 'New member',
            timestamp: new Date().toISOString(),
            ubuntuPoints: 50,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchActivities, 30000)
    return () => clearInterval(interval)
  }, [maxItems])

  function formatTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Community Activity</CardTitle>
          <Badge variant="success" className="text-[10px] h-5">
            Live
          </Badge>
        </div>
        {showPhilosophy && (
          <p className="text-xs text-muted-foreground italic">
            &quot;I am because we are&quot; - Celebrating community contributions
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          {loading ? (
            [...Array(maxItems)].map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-4/5 mb-1" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const colorClass = activityColors[activity.type]

              return (
                <div
                  key={activity.id}
                  className="flex gap-3 items-start p-3 rounded-lg transition-colors hover:bg-muted/50"
                >
                  <Avatar className={`w-8 h-8 ${colorClass}`}>
                    <AvatarFallback className={colorClass}>
                      <Icon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.actor}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {activity.ubuntuPoints && (
                      <p className="text-xs font-semibold text-primary">
                        +{activity.ubuntuPoints} pts
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
