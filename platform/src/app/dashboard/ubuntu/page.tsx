/**
 * Nyuchi Platform - Ubuntu Leaderboard
 * Community contribution rankings
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trophy, TrendingUp, Users, Star, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contributor {
  id: string
  name: string
  email: string
  ubuntu_score: number
  rank?: number
  contributions?: number
}

export default function UbuntuPage() {
  const { user, token } = useAuth()
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ubuntu/leaderboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      setContributors(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const topThree = contributors.slice(0, 3)
  const userRank = contributors.findIndex((c) => c.id === user?.id) + 1
  const userScore = user?.ubuntu_score || 0

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'
      case 2: return '#C0C0C0'
      case 3: return '#CD7F32'
      default: return 'var(--muted-foreground)'
    }
  }

  const stats = [
    {
      title: 'Your Rank',
      value: userRank > 0 ? `#${userRank}` : 'N/A',
      icon: Trophy,
      colorClass: 'text-mineral-gold bg-mineral-gold/10',
    },
    {
      title: 'Your Score',
      value: userScore.toString(),
      icon: Star,
      colorClass: 'text-primary bg-primary/10',
    },
    {
      title: 'Total Contributors',
      value: contributors.length.toString(),
      icon: Users,
      colorClass: 'text-mineral-malachite bg-mineral-malachite/10',
    },
    {
      title: 'Average Score',
      value: contributors.length > 0
        ? Math.round(contributors.reduce((sum, c) => sum + c.ubuntu_score, 0) / contributors.length).toString()
        : '0',
      icon: TrendingUp,
      colorClass: 'text-foreground bg-muted',
    },
  ]

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Ubuntu Leaderboard</h1>
        <p className="text-muted-foreground">
          &quot;I am because we are&quot; - Community contribution rankings
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-base">Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3 max-w-2xl mx-auto">
              {topThree.map((contributor, index) => {
                const rank = index + 1
                return (
                  <div key={contributor.id} className="text-center">
                    <div className="relative inline-block mb-3">
                      <Avatar className={cn(
                        'bg-primary text-primary-foreground font-bold',
                        rank === 1 ? 'h-20 w-20 text-2xl' : 'h-16 w-16 text-xl'
                      )}>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {contributor.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-background"
                        style={{ backgroundColor: getRankColor(rank) }}
                      >
                        {rank}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-0.5">
                      {contributor.name || contributor.email.split('@')[0]}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      {contributor.ubuntu_score}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ubuntu Points
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <div className="p-4 bg-muted/50 border-b">
          <h3 className="font-semibold">Full Leaderboard</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Rank</TableHead>
              <TableHead className="font-semibold">Contributor</TableHead>
              <TableHead className="font-semibold">Ubuntu Score</TableHead>
              <TableHead className="font-semibold w-[30%]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading leaderboard...
                </TableCell>
              </TableRow>
            ) : contributors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No contributors yet
                </TableCell>
              </TableRow>
            ) : (
              contributors.map((contributor, index) => {
                const rank = index + 1
                const isCurrentUser = contributor.id === user?.id
                const maxScore = contributors[0]?.ubuntu_score || 1
                const progress = (contributor.ubuntu_score / maxScore) * 100

                return (
                  <TableRow
                    key={contributor.id}
                    className={cn(isCurrentUser && 'bg-primary/5')}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-semibold"
                        style={{
                          backgroundColor: rank <= 3 ? `${getRankColor(rank)}20` : 'transparent',
                          color: rank <= 3 ? getRankColor(rank) : undefined,
                        }}
                      >
                        #{rank}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 text-sm bg-primary text-primary-foreground">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {contributor.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {contributor.name || contributor.email.split('@')[0]}
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contributor.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-lg font-semibold">{contributor.ubuntu_score}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground min-w-[40px]">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
