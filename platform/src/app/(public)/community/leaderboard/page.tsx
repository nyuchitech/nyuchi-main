/**
 * Nyuchi Community Leaderboard
 * "I am because we are" - Public Ubuntu leaderboard (no auth required)
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  id: string
  full_name: string
  avatar_url: string | null
  company: string | null
  country: string | null
  ubuntu_score: number
  contribution_count: number
}

function getUbuntuLevel(score: number): { level: string; color: string } {
  if (score >= 5000) return { level: 'Ubuntu Champion', color: '#FFD700' }
  if (score >= 2000) return { level: 'Community Leader', color: '#C0C0C0' }
  if (score >= 500) return { level: 'Active Contributor', color: '#CD7F32' }
  return { level: 'Community Member', color: 'var(--zimbabwe-green)' }
}

export default function CommunityLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/community/leaderboard?limit=50')
        if (response.ok) {
          const data = await response.json()
          setLeaderboard(data.leaderboard || [])
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 md:py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-10 w-10 text-mineral-gold" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Ubuntu Leaderboard
            </h1>
          </div>
          <p className="opacity-90">
            Celebrating those who embody &quot;I am because we are&quot;
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Level Guide */}
        <Card className="mb-6 bg-muted/50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Ubuntu Levels</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3" style={{ color: '#FFD700' }} />
                Champion (5000+)
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3" style={{ color: '#C0C0C0' }} />
                Leader (2000+)
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3" style={{ color: '#CD7F32' }} />
                Contributor (500+)
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 text-mineral-malachite" />
                Member
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-2/5 mb-1" />
                    <Skeleton className="h-3 w-1/5" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No contributors yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Be the first to contribute to the community!
            </p>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const { level, color } = getUbuntuLevel(entry.ubuntu_score)
              const isTopThree = index < 3

              return (
                <Card
                  key={entry.id}
                  className={cn(
                    isTopThree && 'border-2'
                  )}
                  style={{
                    borderColor: isTopThree ? color : undefined,
                    backgroundColor: isTopThree ? `${color}08` : undefined,
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    {/* Rank */}
                    <span
                      className={cn(
                        'w-8 text-center text-lg font-bold',
                        isTopThree ? 'font-bold' : 'text-muted-foreground'
                      )}
                      style={{ color: isTopThree ? color : undefined }}
                    >
                      {index + 1}
                    </span>

                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {entry.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{entry.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[entry.company, entry.country].filter(Boolean).join(' • ')}
                      </p>
                    </div>

                    {/* Score & Level */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {entry.ubuntu_score.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs font-medium"
                        style={{
                          backgroundColor: `${color}20`,
                          color: color,
                          borderColor: color,
                        }}
                      >
                        {level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/community">Back to Community</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
