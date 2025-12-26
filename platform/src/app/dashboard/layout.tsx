/**
 * Nyuchi Platform - Dashboard Layout
 * Shopify-inspired admin interface with Nyuchi Brand System v6
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  FileText,
  Award,
  Shield,
  ClipboardList,
  Menu,
  Settings,
  Sun,
  Moon,
  LogOut,
  Plane,
  LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const DRAWER_WIDTH = 240

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Directory', href: '/dashboard/directory', icon: Building2 },
  { name: 'Travel', href: '/dashboard/travel', icon: Plane },
  { name: 'Content', href: '/dashboard/content', icon: FileText },
  { name: 'Ubuntu', href: '/dashboard/ubuntu', icon: Award },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: ClipboardList, staffOnly: true },
  { name: 'Admin', href: '/dashboard/admin', icon: Shield, adminOnly: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

function FlagStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn('w-1 rounded-sm', className)}
      style={{
        background: `linear-gradient(to bottom,
          var(--zimbabwe-green) 0%,
          var(--zimbabwe-green) 14.28%,
          var(--zimbabwe-yellow) 14.28%,
          var(--zimbabwe-yellow) 28.56%,
          var(--zimbabwe-red) 28.56%,
          var(--zimbabwe-red) 42.84%,
          var(--zimbabwe-black) 42.84%,
          var(--zimbabwe-black) 57.12%,
          var(--zimbabwe-red) 57.12%,
          var(--zimbabwe-red) 71.4%,
          var(--zimbabwe-yellow) 71.4%,
          var(--zimbabwe-yellow) 85.68%,
          var(--zimbabwe-green) 85.68%,
          var(--zimbabwe-green) 100%
        )`,
      }}
    />
  )
}

interface SidebarProps {
  user: {
    role?: string
    ubuntu_score?: number
  }
  pathname: string
}

function Sidebar({ user, pathname }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-zinc-900">
      {/* Logo Section */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 p-6 hover:opacity-90 transition-opacity"
      >
        <FlagStrip className="h-8" />
        <span className="font-serif text-xl font-bold text-white tracking-wide">
          Nyuchi
        </span>
      </Link>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            // Admin only items
            if (item.adminOnly && user.role !== 'admin') {
              return null
            }
            // Staff only (moderator, reviewer, admin)
            if (item.staffOnly && !['admin', 'moderator', 'reviewer'].includes(user.role || '')) {
              return null
            }

            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Ubuntu Score Card */}
      {user.ubuntu_score !== undefined && (
        <div className="m-4 rounded-card border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/60 mb-1">Ubuntu Score</p>
          <p className="text-2xl font-bold text-white">{user.ubuntu_score}</p>
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    // Check for dark class on document
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    document.documentElement.classList.toggle('dark', newIsDark)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:block"
        style={{ width: DRAWER_WIDTH }}
      >
        <Sidebar user={user} pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-[240px]">
          <Sidebar user={user} pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Main Area */}
      <div className="flex flex-1 flex-col md:pl-[240px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-tight">
                {user.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.role || 'User'}
              </p>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.role || 'User'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
