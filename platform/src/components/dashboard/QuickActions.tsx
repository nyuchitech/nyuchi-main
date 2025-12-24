/**
 * Quick Actions Component
 * Actionable cards for common dashboard tasks
 */

'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plane, Building2, FileText, ArrowRight } from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  href: string
  badge?: string
  badgeVariant?: 'success' | 'warning' | 'default' | 'cobalt'
}

const quickActions: QuickAction[] = [
  {
    title: 'Join Community Forum',
    description: 'Connect with fellow entrepreneurs',
    icon: Users,
    href: '/community',
    badge: 'Free Forever',
    badgeVariant: 'success',
  },
  {
    title: 'Add Your Business',
    description: 'List in the community directory',
    icon: Building2,
    href: '/dashboard/directory/new',
    badge: 'Ubuntu Points',
    badgeVariant: 'cobalt',
  },
  {
    title: 'Travel Platform',
    description: 'Discover African destinations',
    icon: Plane,
    href: '/dashboard/travel',
    badge: 'New',
    badgeVariant: 'warning',
  },
  {
    title: 'Submit Content',
    description: 'Share your knowledge & stories',
    icon: FileText,
    href: '/dashboard/content/new',
    badge: 'Earn Points',
    badgeVariant: 'cobalt',
  },
]

export function QuickActions() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card
              key={action.title}
              className="transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  {action.badge && (
                    <Badge variant={action.badgeVariant}>
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  {action.description}
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Link href={action.href}>
                    Get Started
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
